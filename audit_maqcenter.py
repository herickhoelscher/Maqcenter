"""
Site audit and content extraction crawler.

Crawls a single domain (BFS from the home page, plus URLs found in robots.txt
and sitemap.xml), collects structure, SEO, assets and forms, and extracts the
page content needed to migrate the site.

Outputs:
  audit_report.md   human readable audit
  audit_data.json   raw crawl data
  content/<slug>.json  main content of each page
  assets/           images from /image/catalog/ and /image/cache/catalog/
  redirects.csv     url_antiga,slug_novo
  inventory.md      categories, subcategories and equipment found

Requires: requests, beautifulsoup4
"""

import argparse
import csv
import hashlib
import json
import re
import sys
import time
import xml.etree.ElementTree as ET
from collections import Counter, deque
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path
from urllib.parse import parse_qs, unquote, urljoin, urlparse, urlunparse

import requests
from bs4 import BeautifulSoup

DEFAULT_URL = "https://www.maqcentercascavel.com.br"
USER_AGENT = "Mozilla/5.0 (compatible; MaqcenterAudit/2.0)"
TIMEOUT = 20

SKIP_EXT = re.compile(
    r"\.(jpe?g|png|gif|webp|svg|ico|bmp|tiff?|pdf|zip|rar|7z|gz|mp4|mp3|avi|mov|wmv|"
    r"docx?|xlsx?|pptx?|css|js|woff2?|ttf|eot|xml|txt)$",
    re.I,
)

# OpenCart transactional routes. Without this the crawler gets lost in
# thousands of URLs with no content.
NOISE_PATTERNS = [
    r"route=account/",
    r"route=checkout/",
    r"route=affiliate/",
    r"route=product/compare",
    r"route=common/currency",
    r"route=common/language",
    r"route=common/home",
    r"/cart",
    r"wishlist",
    r"logout",
    r"[?&](sort|order|limit|filter|page)=",
]

TECH_SIGNATURES = {
    "OpenCart": r"catalog/view/(theme|javascript)|route=common/home|route=product/",
    "jQuery": r"jquery[.-][\d.]*(min\.)?js|jquery\.min\.js",
    "Bootstrap": r"bootstrap(\.min)?\.(css|js)",
    "Font Awesome": r"font-awesome",
    "Owl Carousel": r"owl\.carousel",
    "SweetAlert2": r"sweetalert2",
    "Google Analytics / GTM": r"googletagmanager\.com|google-analytics\.com|gtag\(",
    "Facebook Pixel": r"connect\.facebook\.net|fbq\(",
    "Elfsight": r"elfsight",
    "Google Fonts": r"fonts\.googleapis\.com|fonts\.gstatic\.com",
    "reCAPTCHA": r"recaptcha",
    "WhatsApp link": r"wa\.me/|api\.whatsapp\.com",
    "PagSeguro": r"pagseguro",
    "Mercado Pago": r"mercadopago",
}

# Blocks stripped before extracting the main content of a page.
CHROME_SELECTORS = [
    "header", "footer", "nav", "#menu", "#top", "#cart", "#cart-window",
    ".breadcrumb", "#column-left", "#column-right", ".filter-mobile",
    "#cookie", ".cookie", "[class*=cookie]", ".buttons", "form#smart-filter",
]

IMAGE_PATH = re.compile(r"/image/(cache/)?catalog/", re.I)
CACHE_SUFFIX = re.compile(r"-\d+x\d+(\.\w+)$")
EMPTY_CATEGORY = "Não há produtos neste departamento"

# Old URL path -> path on the new site. Anything not listed here is mapped
# by map_new_slug() rules.
SLUG_MAP = {
    "": "",
    "locacoes-de-equipamentos": "locacoes",
    "assistencia-tecnica": "assistencia-tecnica",
    "venda-de-maquinas-e-acessorios": "venda-de-maquinas",
    "perfuracao-em-concreto": "perfuracao-em-concreto",
    "sobre-br": "sobre",
    "politica-privacidade-br": "politica-de-privacidade",
    "termos-condicoes-br": "termos-e-condicoes",
    "politica-entrega-br": "termos-e-condicoes",
    "monte-seu-kit": "locacoes",
    # Categories hidden from the old menu: product lines for sale.
    "furadeiras": "venda-de-maquinas",
    "serra-marmore": "venda-de-maquinas",
    "esmerilhadeira": "venda-de-maquinas",
    "serra-circular": "venda-de-maquinas",
    "parafusadeira": "venda-de-maquinas",
    "rompedor": "venda-de-maquinas",
    "broca": "venda-de-maquinas",
    "disco-diamantado": "venda-de-maquinas",
    "baterias": "venda-de-maquinas",
    "escova-de-carvao": "venda-de-maquinas",
    "serra-copo-diamantada": "venda-de-maquinas",
    "disco-de-corte-de-madeira": "venda-de-maquinas",
    "obrigado-por-comprar-conosco": "",
    "route:information/contact": "contato",
    "route:information/sitemap": "",
    "route:product/search": "locacoes",
    "route:product/manufacturer": "",
    "route:product/special": "locacoes",
}

# Cleanup of legacy slugs (e.g. OpenCart duplicate suffixes).
SLUG_FIXES = {
    "serra-circular1": "serra-circular",
}


# --------------------------------------------------------------------------
# URL helpers
# --------------------------------------------------------------------------

def norm(url):
    """Drop fragment and trailing slash so the same page is not queued twice."""
    p = urlparse(url)
    path = p.path.rstrip("/") or "/"
    return urlunparse((p.scheme, p.netloc.lower(), path, "", p.query, ""))


def host(url):
    h = urlparse(url).netloc.lower()
    return h[4:] if h.startswith("www.") else h


def same_host(a, b):
    return host(a) == host(b)


def is_noise(url):
    return any(re.search(p, url) for p in NOISE_PATTERNS)


def old_key(url):
    """Stable identifier of an old URL: its path, or route:<route> for index.php URLs."""
    p = urlparse(url)
    path = unquote(p.path).strip("/")
    if path in ("", "index.php"):
        route = parse_qs(p.query).get("route", [""])[0]
        if route and route != "common/home":
            return "route:" + route
        return ""
    return path


def slugify(text):
    text = text.lower().replace("route:", "").replace("/", "-")
    text = re.sub(r"[^a-z0-9-]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-") or "home"


def map_new_slug(key, page_type=None, breadcrumb=None):
    """Return the path (without leading slash) the old URL should 301 to."""
    if key in SLUG_MAP:
        return SLUG_MAP[key]
    last = SLUG_FIXES.get(key.split("/")[-1], key.split("/")[-1])
    if key.startswith("locacoes-de-equipamentos/"):
        return "locacoes/" + last
    # OpenCart also serves categories and products at the root slug
    # (e.g. /compactador-de-solo). Use the breadcrumb to place them.
    crumbs = [c["url"] for c in (breadcrumb or [])]
    if any(old_key(c) == "locacoes-de-equipamentos" for c in crumbs):
        return "locacoes/" + last
    if page_type == "product":
        return "locacoes/" + last
    return key


# --------------------------------------------------------------------------
# HTTP
# --------------------------------------------------------------------------

def make_session():
    s = requests.Session()
    s.headers["User-Agent"] = USER_AGENT
    s.headers["Accept-Language"] = "pt-BR,pt;q=0.9"
    return s


def fetch(session, url, **kw):
    t0 = time.time()
    r = session.get(url, timeout=TIMEOUT, allow_redirects=True, **kw)
    return r, round(time.time() - t0, 3)


# --------------------------------------------------------------------------
# robots.txt and sitemap.xml
# --------------------------------------------------------------------------

def read_robots(session, base):
    """Return (sitemap_urls, path_urls) declared in robots.txt."""
    sitemaps, paths = [], []
    try:
        r, _ = fetch(session, urljoin(base, "/robots.txt"))
    except requests.RequestException:
        return sitemaps, paths
    if r.status_code != 200 or "html" in r.headers.get("Content-Type", ""):
        return sitemaps, paths
    for line in r.text.splitlines():
        line = line.split("#", 1)[0].strip()
        if ":" not in line:
            continue
        field, value = (x.strip() for x in line.split(":", 1))
        field = field.lower()
        if field == "sitemap":
            sitemaps.append(value)
        elif field in ("allow", "disallow") and value and not re.search(r"[*$]", value):
            paths.append(urljoin(base, value))
    return sitemaps, paths


def read_sitemap(session, url, seen=None):
    """Return page URLs from a sitemap, following sitemap indexes."""
    seen = seen if seen is not None else set()
    if url in seen:
        return []
    seen.add(url)
    try:
        r, _ = fetch(session, url)
    except requests.RequestException:
        return []
    if r.status_code != 200 or "xml" not in r.headers.get("Content-Type", "") and not r.text.lstrip().startswith("<?xml"):
        return []
    try:
        root = ET.fromstring(r.content)
    except ET.ParseError:
        return []
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = []
    if root.tag.endswith("sitemapindex"):
        for loc in root.findall("sm:sitemap/sm:loc", ns):
            urls += read_sitemap(session, loc.text.strip(), seen)
    else:
        for loc in root.findall("sm:url/sm:loc", ns):
            urls.append(loc.text.strip())
    return urls


# --------------------------------------------------------------------------
# Content extraction
# --------------------------------------------------------------------------

def clean_text(node):
    return " ".join(node.get_text(" ").split()) if node else ""


def page_type_of(soup, key):
    if soup.select_one("#product-product"):
        return "product"
    if soup.select_one("#product-category"):
        return "category"
    if soup.select_one("#information-information"):
        return "information"
    if soup.select_one("#information-contact") or key == "route:information/contact":
        return "contact"
    if key == "":
        return "home"
    return "other"


def image_entries(node, base):
    out, seen = [], set()
    for img in node.find_all("img"):
        src = img.get("data-src") or img.get("src")
        if not src or src.startswith("data:"):
            continue
        u = urljoin(base, src)
        if u in seen:
            continue
        seen.add(u)
        out.append({"url": u, "alt": (img.get("alt") or "").strip(), "title": (img.get("title") or "").strip()})
    return out


def all_image_urls(soup, raw_html, base):
    """Every catalog image referenced by the page, wherever it appears."""
    urls = set()
    for img in soup.find_all(["img", "source"]):
        for attr in ("src", "data-src"):
            if img.get(attr):
                urls.add(urljoin(base, img[attr]))
        for attr in ("srcset", "data-srcset"):
            for part in (img.get(attr) or "").split(","):
                if part.strip():
                    urls.add(urljoin(base, part.strip().split()[0]))
    for a in soup.find_all(["a", "link"], href=True):
        urls.add(urljoin(base, a["href"]))
    for m in soup.find_all("meta", content=True):
        urls.add(urljoin(base, m["content"]))
    for m in re.finditer(r"url\(['\"]?([^'\")]+)['\"]?\)", raw_html):
        urls.add(urljoin(base, m.group(1)))
    return {u.split("?")[0] for u in urls if IMAGE_PATH.search(urlparse(u).path)
            and re.search(r"\.(jpe?g|png|gif|webp|svg|bmp|ico)$", urlparse(u).path, re.I)}


def extract_breadcrumb(soup, base):
    crumbs = []
    for a in soup.select(".breadcrumb a"):
        crumbs.append({"name": clean_text(a), "url": norm(urljoin(base, a["href"]))})
    return crumbs


def extract_product(soup, base):
    p = {}
    h1 = soup.select_one("#product-product h1, #content h1")
    p["name"] = clean_text(h1)
    price = soup.select_one("#product-product .price, #product-product .list-unstyled h2")
    p["price_text"] = clean_text(price)
    p["description"] = clean_text(soup.select_one("#tab-description"))
    specs = []
    for row in soup.select("#tab-specification tr"):
        cells = [clean_text(c) for c in row.find_all(["td", "th"])]
        if len(cells) == 2:
            specs.append({"name": cells[0], "value": cells[1]})
    p["specifications"] = specs
    p["images"] = []
    for a in soup.select("#product-product .thumbnails a, #product-product a.thumbnail"):
        if a.get("href"):
            img = a.find("img")
            p["images"].append({"url": urljoin(base, a["href"]), "alt": (img.get("alt") if img else "") or ""})
    meta = {}
    for li in soup.select("#product-product ul.list-unstyled li"):
        t = clean_text(li)
        if ":" in t:
            k, v = t.split(":", 1)
            meta[k.strip()] = v.strip()
    p["attributes"] = meta
    return p


def extract_category(soup, base):
    c = {"subcategories": [], "products": [], "empty": False}
    content = soup.select_one("#content")
    if not content:
        return c
    c["empty"] = EMPTY_CATEGORY in clean_text(content)
    c["description"] = clean_text(content.select_one("#category-description, .category-description"))
    # Subcategory links inside the content area ("Refinar busca")
    for a in content.select("ul a, .category-list a"):
        if a.get("href"):
            c["subcategories"].append({"name": clean_text(a), "url": norm(urljoin(base, a["href"]))})
    for thumb in content.select(".product-thumb, .product-layout"):
        a = thumb.select_one(".caption a, h4 a, a")
        img = thumb.find("img")
        c["products"].append({
            "name": clean_text(a),
            "url": norm(urljoin(base, a["href"])) if a and a.get("href") else "",
            "image": urljoin(base, img.get("data-src") or img.get("src")) if img else "",
            "price_text": clean_text(thumb.select_one(".price")),
        })
    return c


def extract_content(soup, raw_html, url, key, base=None):
    """Main content of the page: title, description, clean text, images."""
    base = base or url
    head_title = clean_text(soup.title)
    desc = soup.find("meta", attrs={"name": "description"})
    og = {m["property"]: m.get("content", "") for m in soup.find_all("meta", property=True)
          if m["property"].startswith("og:")}
    breadcrumb = extract_breadcrumb(soup, base)
    ptype = page_type_of(soup, key)

    main = BeautifulSoup(str(soup.body or soup), "html.parser")
    for t in main(["script", "style", "noscript", "template", "iframe"]):
        t.decompose()
    for sel in CHROME_SELECTORS:
        for t in main.select(sel):
            t.decompose()
    for c in main.find_all(string=lambda s: s.__class__.__name__ == "Comment"):
        c.extract()
    container = main.select_one("#content") or main

    h1 = container.find(["h1", "h2"])
    data = {
        "url": url,
        "old_key": key,
        "type": ptype,
        "title": clean_text(h1) or head_title,
        "head_title": head_title,
        "meta_description": (desc.get("content") or "").strip() if desc else "",
        "canonical": (soup.find("link", rel="canonical") or {}).get("href", ""),
        "open_graph": og,
        "breadcrumb": breadcrumb,
        "headings": [{"level": h.name, "text": clean_text(h)} for h in container.find_all(re.compile(r"^h[1-4]$"))],
        "text": clean_text(container),
        "images": image_entries(container, base),
    }
    if ptype == "product":
        data["product"] = extract_product(soup, base)
    elif ptype == "category":
        data["category"] = extract_category(soup, base)
    elif ptype == "home":
        data["home"] = extract_home(soup, base)
    elif ptype == "contact":
        data["contact"] = extract_contact(soup)
    return data


def extract_home(soup, base):
    """Home blocks that matter for the redesign: banners and brands."""
    banners, brands = [], []
    for img in soup.find_all("img"):
        src = urljoin(base, img.get("data-src") or img.get("src") or "")
        entry = {"url": src, "alt": (img.get("alt") or "").strip()}
        link = img.find_parent("a")
        if link and link.get("href"):
            entry["link"] = urljoin(base, link["href"])
        if "/banners/" in src or re.search(r"-(1920x\d+|767x\d+)\.", src):
            banners.append(entry)
        elif "/marcas/" in src:
            brands.append(entry)
    return {"banners": banners, "brands": brands}


def extract_contact(soup):
    content = soup.select_one("#content")
    text = clean_text(content)
    out = {"raw": text}
    m = re.search(r"Horário de funcionamento\s*(.+?)(?:Formulário|Comentários|$)", text)
    if m:
        out["opening_hours"] = m.group(1).strip()
    m = re.search(r"Telefone\s*([()\d\s-]+)", text)
    if m:
        out["phone"] = m.group(1).strip()
    m = re.search(r"Nossa localização\s*(.+?)\s*Telefone", text)
    if m:
        out["address"] = m.group(1).strip()
    return out


# --------------------------------------------------------------------------
# Hidden OpenCart content
# --------------------------------------------------------------------------

# OpenCart addresses every record by a numeric id. Categories, information
# pages and products removed from the menu (or never linked) are still
# served, so walking the ids finds content the link crawl cannot see.
PROBE_ROUTES = {
    "category": ("product/category", "path"),
    "information": ("information/information", "information_id"),
    "product": ("product/product", "product_id"),
    "manufacturer": ("product/manufacturer/info", "manufacturer_id"),
}
NOT_FOUND_TITLE = re.compile(r"n[aã]o encontrad|not found", re.I)


def probe_ids(start, limits, workers=4):
    """Return [(kind, id, title, url)] for every id that resolves to a page.
    url is the canonical SEO URL when the page declares one."""
    session = make_session()

    def check(job):
        kind, i = job
        route, param = PROBE_ROUTES[kind]
        url = urljoin(start, f"/index.php?route={route}&{param}={i}")
        try:
            r, _ = fetch(session, url)
        except requests.RequestException:
            return None
        if r.status_code != 200 or "html" not in r.headers.get("Content-Type", ""):
            return None
        soup = BeautifulSoup(r.text, "html.parser")
        title = clean_text(soup.title)
        if not title or NOT_FOUND_TITLE.search(title):
            return None
        canonical = soup.find("link", rel="canonical")
        target = canonical["href"] if canonical and canonical.get("href") else url
        return kind, i, title, target

    jobs = [(kind, i) for kind, n in limits.items() for i in range(1, n + 1)]
    with ThreadPoolExecutor(workers) as ex:
        found = [r for r in ex.map(check, jobs) if r]
    for kind, i, title, _ in found:
        print(f"  probe {kind} {i}: {title}", file=sys.stderr)
    return found


# --------------------------------------------------------------------------
# Crawl
# --------------------------------------------------------------------------

def crawl(start, max_pages=300, delay=0.4, probe_limits=None):
    session = make_session()
    start = norm(start)

    queue, queued, origin = deque(), set(), {}

    def enqueue(u, src):
        u = norm(u)
        if u in queued or not same_host(u, start) or SKIP_EXT.search(urlparse(u).path) or is_noise(u):
            return
        queued.add(u)
        origin[u] = src
        queue.append(u)

    enqueue(start, "start")

    robots_sitemaps, robots_paths = read_robots(session, start)
    sitemap_sources = robots_sitemaps or [urljoin(start, "/sitemap.xml")]
    sitemap_urls = []
    for sm in sitemap_sources:
        sitemap_urls += read_sitemap(session, sm)
    for u in robots_paths:
        enqueue(u, "robots")
    for u in sitemap_urls:
        enqueue(u, "sitemap")

    probed = probe_ids(start, probe_limits) if probe_limits else []
    for _, _, _, u in probed:
        enqueue(u, "probe")

    pages, broken, contents = [], [], []
    assets = {"css": set(), "js": set(), "img": set()}
    catalog_images = set()
    external, tech = Counter(), Counter()
    linked = set()

    while queue and len(pages) < max_pages:
        url = queue.popleft()
        try:
            r, elapsed = fetch(session, url)
        except requests.RequestException as e:
            broken.append({"url": url, "erro": str(e)})
            continue
        if r.status_code >= 400:
            broken.append({"url": url, "erro": f"HTTP {r.status_code}"})
            continue
        if "html" not in r.headers.get("Content-Type", ""):
            continue

        html = r.text
        soup = BeautifulSoup(html, "html.parser")
        final = norm(r.url)
        base_tag = soup.find("base", href=True)
        base = urljoin(final, base_tag["href"]) if base_tag else final

        for name, pattern in TECH_SIGNATURES.items():
            if re.search(pattern, html, re.I):
                tech[name] += 1

        title = clean_text(soup.title)
        desc = soup.find("meta", attrs={"name": "description"})
        canonical = soup.find("link", rel="canonical")
        body_text = BeautifulSoup(html, "html.parser")
        for t in body_text(["script", "style", "noscript"]):
            t.decompose()

        page = {
            "url": url,
            "final_url": final,
            "origem": origin.get(url, "link"),
            "status": r.status_code,
            "title": title,
            "description": (desc.get("content") or "").strip() if desc else "",
            "canonical": canonical.get("href", "") if canonical else "",
            "h1": [clean_text(h) for h in soup.find_all("h1")],
            "h2": [clean_text(h) for h in soup.find_all("h2")][:10],
            "palavras": len(clean_text(body_text.body or body_text).split()),
            "img_sem_alt": [urljoin(base, i.get("src") or i.get("data-src") or "")
                            for i in soup.find_all("img") if not (i.get("alt") or "").strip()],
            "forms": [{
                "action": urljoin(base, f.get("action") or ""),
                "method": (f.get("method") or "get").lower(),
                "campos": [i.get("name") for i in f.find_all(["input", "select", "textarea"]) if i.get("name")],
            } for f in soup.find_all("form")],
            "tempo_s": elapsed,
            "peso_kb": round(len(r.content) / 1024, 1),
        }
        pages.append(page)

        for l in soup.find_all("link", rel="stylesheet"):
            if l.get("href"):
                assets["css"].add(urljoin(base, l["href"]))
        for s in soup.find_all("script", src=True):
            assets["js"].add(urljoin(base, s["src"]))
        for i in soup.find_all("img"):
            src = i.get("data-src") or i.get("src")
            if src:
                assets["img"].add(urljoin(base, src))
        catalog_images |= all_image_urls(soup, html, base)

        key = old_key(final)
        content = extract_content(soup, html, final, key, base)
        content["origin"] = origin.get(url, "link")
        contents.append(content)

        for a in soup.find_all("a", href=True):
            href = a["href"].strip()
            if href.startswith(("mailto:", "tel:", "javascript:", "#")):
                continue
            target = urljoin(base, href)
            if not target.startswith("http"):
                continue
            if same_host(target, start):
                linked.add(norm(target))
                enqueue(target, "link")
            else:
                external[host(target)] += 1

        print(f"[{len(pages):>3}] {r.status_code} {url}", file=sys.stderr)
        time.sleep(delay)

    orphans = sorted(u for u, src in origin.items() if src in ("sitemap", "robots", "probe") and u not in linked)
    return {
        "start": start,
        "crawled_at": datetime.now().isoformat(timespec="seconds"),
        "pages": pages,
        "assets": {k: sorted(v) for k, v in assets.items()},
        "catalog_images": sorted(catalog_images),
        "external": dict(external.most_common()),
        "broken": broken,
        "tech": dict(tech.most_common()),
        "sitemap_urls": sitemap_urls,
        "robots": {"sitemaps": robots_sitemaps, "paths": robots_paths},
        "orphans": orphans,
        "probed": [{"kind": k, "id": i, "title": t, "url": u} for k, i, t, u in probed],
        "contents": contents,
    }


# --------------------------------------------------------------------------
# Migration outputs
# --------------------------------------------------------------------------

def dedupe_contents(contents):
    """OpenCart serves the same category at several URLs. Keep one per canonical
    content, but remember every alias for the redirect table."""
    by_sig, aliases = {}, {}
    for c in contents:
        # Aliases of one page share the canonical; different pages can share
        # title and text (e.g. two empty "Serra Circular" categories).
        sig = c["canonical"] or hashlib.sha1((c["title"] + "|" + c["text"]).encode()).hexdigest()
        if sig in by_sig:
            keep = by_sig[sig]
            # Prefer SEO URLs over index.php?route=..., then the URL nested
            # under its parent category.
            def rank(x):
                return (not x["old_key"].startswith("route:"), x["old_key"].count("/"))
            if rank(c) > rank(keep):
                by_sig[sig] = c
                aliases.setdefault(c["url"], []).extend([keep["url"]] + aliases.pop(keep["url"], []))
            else:
                aliases.setdefault(keep["url"], []).append(c["url"])
        else:
            by_sig[sig] = c
    out = list(by_sig.values())
    for c in out:
        c["aliases"] = aliases.get(c["url"], [])
    return out


def write_contents(contents, out_dir):
    out_dir.mkdir(parents=True, exist_ok=True)
    for c in contents:
        c["new_slug"] = map_new_slug(c["old_key"], c["type"], c["breadcrumb"])
        name = slugify(c["old_key"]) if c["old_key"] else "home"
        c["file"] = f"{out_dir.name}/{name}.json"
        (out_dir / f"{name}.json").write_text(json.dumps(c, ensure_ascii=False, indent=2), encoding="utf-8")


def write_redirects(data, contents, path):
    """One row per old URL seen (crawled pages, aliases and sitemap entries)."""
    by_url = {}
    for c in contents:
        for u in [c["url"]] + c.get("aliases", []):
            by_url[u] = c["new_slug"]
    for p in data["pages"]:
        for u in (p["url"], p["final_url"]):
            if u not in by_url:
                by_url[u] = map_new_slug(old_key(u))
        # The canonical (often a root alias like /compactador-de-solo) is the
        # URL search engines indexed, so it must redirect too.
        if p["canonical"] and same_host(p["canonical"], data["start"]):
            by_url.setdefault(norm(p["canonical"]), by_url[p["final_url"]])
    for u in data["sitemap_urls"]:
        u = norm(u)
        if u not in by_url:
            by_url[u] = map_new_slug(old_key(u))
    rows = []
    for u, slug in sorted(by_url.items()):
        p = urlparse(u)
        old = p.path + ("?" + p.query if p.query else "")
        if old == "/" and slug == "":
            continue
        rows.append((old, "/" + slug))
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["url_antiga", "slug_novo"])
        w.writerows(rows)
    return rows


def download_images(session, urls, out_dir, delay):
    """Download catalog images preserving their path under /image/.
    For resized cache copies, also try the original upload."""
    out_dir.mkdir(parents=True, exist_ok=True)
    candidates = []
    for u in sorted(urls):
        candidates.append(u)
        p = urlparse(u)
        if "/image/cache/catalog/" in p.path:
            original = CACHE_SUFFIX.sub(r"\1", p.path.replace("/image/cache/catalog/", "/image/catalog/"))
            candidates.append(urlunparse((p.scheme, p.netloc, original, "", "", "")))

    hashes, result = {}, {"downloaded": [], "skipped_existing": [], "duplicates": [], "failed": []}
    seen = set()
    for u in candidates:
        if u in seen:
            continue
        seen.add(u)
        rel = unquote(urlparse(u).path).split("/image/", 1)[1]
        dest = out_dir / rel
        if dest.exists():
            hashes.setdefault(hashlib.sha1(dest.read_bytes()).hexdigest(), rel)
            result["skipped_existing"].append(rel)
            continue
        try:
            r, _ = fetch(session, u)
        except requests.RequestException as e:
            result["failed"].append({"url": u, "erro": str(e)})
            continue
        if r.status_code != 200 or not r.headers.get("Content-Type", "").startswith("image/"):
            result["failed"].append({"url": u, "erro": f"HTTP {r.status_code}"})
            continue
        digest = hashlib.sha1(r.content).hexdigest()
        if digest in hashes:
            result["duplicates"].append({"file": rel, "same_as": hashes[digest]})
            continue
        hashes[digest] = rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(r.content)
        result["downloaded"].append(rel)
        print(f"  img {rel}", file=sys.stderr)
        time.sleep(delay / 4)
    return result


def write_inventory(contents, path, start):
    by_url = {c["url"]: c for c in contents}
    for c in contents:
        for a in c.get("aliases", []):
            by_url[a] = c

    categories = [c for c in contents if c["type"] == "category"]
    products = [c for c in contents if c["type"] == "product"]
    home = next((c for c in contents if c["type"] == "home"), None)
    contact = next((c for c in contents if c["type"] == "contact"), None)

    def parent_of(c):
        crumbs = [b for b in c["breadcrumb"] if old_key(b["url"]) not in ("", "route:common/home")]
        return crumbs[-2]["url"] if len(crumbs) >= 2 else None

    hidden = [c for c in categories if c.get("origin") == "probe"]
    tops = [c for c in categories if not parent_of(c) and c not in hidden]
    children = {}
    for c in categories:
        par = parent_of(c)
        if par:
            parent = by_url.get(par)
            children.setdefault(parent["url"] if parent else par, []).append(c)

    lines = [
        "# Inventario do site antigo",
        "",
        f"Fonte: {start}  ",
        f"Gerado em: {datetime.now():%Y-%m-%d %H:%M}",
        "",
        f"- Categorias de primeiro nivel: {len(tops)}",
        f"- Subcategorias: {sum(len(v) for v in children.values())}",
        f"- Categorias fora do menu (achadas por --probe-ids): {len(hidden)}",
        f"- Equipamentos/produtos: {len(products)}",
        "",
        "## Categorias e subcategorias",
        "",
    ]
    for t in tops:
        status = " (sem produtos)" if t.get("category", {}).get("empty") else ""
        lines.append(f"- **{t['title']}**{status} `{urlparse(t['url']).path}` -> `/{t['new_slug']}`")
        for ch in children.get(t["url"], []):
            st = " (sem produtos)" if ch.get("category", {}).get("empty") else ""
            lines.append(f"  - {ch['title']}{st} `{urlparse(ch['url']).path}` -> `/{ch['new_slug']}`")
    if hidden:
        lines += ["", "## Categorias fora do menu", "",
                  "Existem no OpenCart com URL propria, mas nenhuma pagina linka para elas.", ""]
        for h in hidden:
            st = " (sem produtos)" if h.get("category", {}).get("empty") else ""
            lines.append(f"- {h['title']}{st} `{urlparse(h['url']).path}` -> `/{h['new_slug']}`")
    lines += ["", "## Equipamentos / produtos", ""]
    if products:
        lines += ["| Nome | URL antiga | Slug novo | Preco | Imagens | Specs |", "|---|---|---|---|---|---|"]
        for p in products:
            pr = p["product"]
            lines.append(f"| {pr['name'] or p['title']} | `{urlparse(p['url']).path}` | `/{p['new_slug']}` | "
                         f"{pr['price_text'] or '-'} | {len(pr['images'])} | {len(pr['specifications'])} |")
    else:
        lines.append("Nenhum produto cadastrado. Todas as categorias exibem \"Nao ha produtos neste departamento\". "
                     "Os equipamentos de locacao existem apenas como nomes de categoria (lista acima).")

    if home:
        h = home["home"]
        lines += ["", "## Marcas (home)", ""]
        lines += [f"- {b['alt'] or '(sem alt)'}: `{urlparse(b['url']).path}`" for b in h["brands"]] or ["Nenhuma."]
        lines += ["", "## Banners (home)", ""]
        lines += [f"- {b['alt'] or '(sem alt)'}: `{urlparse(b['url']).path}`" for b in h["banners"]] or ["Nenhum."]

    if contact:
        ct = contact["contact"]
        lines += ["", "## Dados de contato publicados", ""]
        for k, label in (("address", "Endereco"), ("phone", "Telefone"), ("opening_hours", "Horario")):
            if ct.get(k):
                lines.append(f"- {label}: {ct[k]}")

    lines += ["", "## Paginas institucionais", "", "| Pagina | Palavras de conteudo | Slug novo |", "|---|---|---|"]
    for c in contents:
        if c["type"] in ("information", "other", "contact"):
            words = len(c["text"].split())
            lines.append(f"| {c['title']} | {words} | `/{c['new_slug']}` |")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


# --------------------------------------------------------------------------
# Audit report
# --------------------------------------------------------------------------

def rel_url(url):
    p = urlparse(url)
    return (p.path or "/") + ("?" + p.query if p.query else "")


def report(data, images=None):
    pages = data["pages"]
    L = [f"# Auditoria: {data['start']}", "", f"Gerado em {data['crawled_at']}", ""]
    L += ["## Resumo", "",
          f"- Paginas HTML rastreadas: {len(pages)}",
          f"- URLs no sitemap.xml: {len(data['sitemap_urls'])}",
          f"- robots.txt: {'encontrado' if data['robots']['sitemaps'] or data['robots']['paths'] else 'ausente ou vazio'}",
          f"- Paginas orfas (no sitemap/robots, sem link interno): {len(data['orphans'])}",
          f"- Erros: {len(data['broken'])}",
          f"- CSS: {len(data['assets']['css'])} | JS: {len(data['assets']['js'])} | IMG: {len(data['assets']['img'])}",
          f"- Imagens de catalogo: {len(data['catalog_images'])}", ""]
    if pages:
        avg = sum(p["tempo_s"] for p in pages) / len(pages)
        L.append(f"- Tempo medio de resposta HTML: {avg:.2f}s")
        L.append("")
    L += ["## Tecnologias", ""] + [f"- {k}: {v} paginas" for k, v in data["tech"].items()] + [""]
    L += ["## Mapa de paginas", "", "| URL | Origem | Title | H1 | Palavras | Tempo |", "|---|---|---|---|---|---|"]
    for p in pages:
        L.append(f"| {rel_url(p['url'])} "
                 f"| {p['origem']} | {p['title']} | {' / '.join(p['h1']) or '-'} | {p['palavras']} | {p['tempo_s']}s |")
    L += ["", "## Problemas de SEO", ""]
    titles = Counter(p["title"] for p in pages)
    for p in pages:
        issues = []
        if not p["title"]:
            issues.append("sem title")
        elif titles[p["title"]] > 1:
            issues.append("title duplicado")
        if not p["description"]:
            issues.append("sem meta description")
        if not p["h1"]:
            issues.append("sem H1")
        elif len(p["h1"]) > 1:
            issues.append(f"{len(p['h1'])} H1")
        if p["img_sem_alt"]:
            issues.append(f"{len(p['img_sem_alt'])} imagens sem alt")
        if issues:
            L.append(f"- `{rel_url(p['url'])}`: {', '.join(issues)}")
    if data["orphans"]:
        L += ["", "## Paginas orfas", ""] + [f"- {u}" for u in data["orphans"]]
    forms = {}
    for p in pages:
        for f in p["forms"]:
            forms.setdefault((f["action"], f["method"], tuple(f["campos"])), []).append(p["url"])
    L += ["", "## Formularios", ""]
    for (action, method, fields), urls in forms.items():
        L.append(f"- {method.upper()} `{action}` campos: {', '.join(fields) or '-'} ({len(urls)} paginas)")
    L += ["", "## Dominios externos", ""] + [f"- {k}: {v}" for k, v in data["external"].items()]
    L += ["", "## Erros", ""] + ([f"- {b['url']}: {b['erro']}" for b in data["broken"]] or ["Nenhum."])
    if images:
        L += ["", "## Download de imagens", "",
              f"- Baixadas: {len(images['downloaded'])}",
              f"- Ja existiam: {len(images['skipped_existing'])}",
              f"- Duplicadas (mesmo conteudo): {len(images['duplicates'])}",
              f"- Falharam: {len(images['failed'])}"]
    return "\n".join(L) + "\n"


# --------------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description="Audit and extract content from a site.")
    ap.add_argument("--url", default=DEFAULT_URL)
    ap.add_argument("--max-pages", type=int, default=300)
    ap.add_argument("--delay", type=float, default=0.4)
    ap.add_argument("--out", default=".", help="output directory")
    ap.add_argument("--skip-images", action="store_true", help="do not download images")
    ap.add_argument("--probe-ids", action="store_true",
                    help="walk OpenCart ids to find categories, pages and products with no links")
    ap.add_argument("--probe-max", type=int, default=400, help="highest product id probed (default 400)")
    args = ap.parse_args()

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    probe_limits = None
    if args.probe_ids:
        probe_limits = {"category": 200, "information": 50, "product": args.probe_max, "manufacturer": 50}
    data = crawl(args.url, args.max_pages, args.delay, probe_limits)

    contents = dedupe_contents(data.pop("contents"))
    write_contents(contents, out / "content")
    redirects = write_redirects(data, contents, out / "redirects.csv")
    write_inventory(contents, out / "inventory.md", data["start"])

    images = None
    if not args.skip_images:
        images = download_images(make_session(), data["catalog_images"], out / "assets", args.delay)
        data["images"] = images

    data["content_files"] = [c["file"] for c in contents]
    (out / "audit_data.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    (out / "audit_report.md").write_text(report(data, images), encoding="utf-8")

    print(f"\n{len(data['pages'])} paginas, {len(contents)} conteudos unicos, "
          f"{len(redirects)} redirects, {len(data['catalog_images'])} imagens de catalogo", file=sys.stderr)
    if images:
        print(f"imagens: {len(images['downloaded'])} baixadas, {len(images['duplicates'])} duplicadas, "
              f"{len(images['failed'])} falharam", file=sys.stderr)


if __name__ == "__main__":
    main()
