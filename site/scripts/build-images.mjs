// Builds the WebP images used by the site from the files extracted from the
// old site (../assets). Run with: npm run images
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = path.join(root, "..", "assets");
const out = path.join(root, "public", "images");

const banner = (name) => path.join(src, "cache", "catalog", "banners", name);
// Post images from the company Instagram (@maqcentercascavel), 640px wide.
const instagram = (code) => path.join(src, "instagram", `${code}.jpg`);

// Crops of the old home banners. Coordinates are on the 1920x650 originals.
// The banners have text baked in, so only photo areas are reused.
const crops = [
  // Equipment tiles from the "Locacao de ferramentas" banner (about 190px each).
  { file: banner("bannersite1-1920x650.jpg"), out: "equipamentos/compactador-de-solo.webp", box: [641, 141, 152, 154] },
  { file: banner("bannersite1-1920x650.jpg"), out: "equipamentos/rompedor-de-concreto.webp", box: [874, 141, 152, 154] },
  { file: banner("bannersite1-1920x650.jpg"), out: "equipamentos/vibrador-de-concreto.webp", box: [1106, 141, 152, 154] },
  // Photos behind the service banners.
  // Workshop photo; the team photo is cropped below the yellow post graphic;
  // the concrete mixer is cropped right of the logo overlaid on the post.
  { file: instagram("Dd9oyL9jBiO"), out: "servicos/assistencia-tecnica.webp", box: [0, 0, 640, 640] },
  { file: instagram("DdrnOjADHXQ"), out: "sobre/equipe.webp", box: [0, 184, 640, 436] },
  { file: instagram("DeRYQLeFwOr"), out: "equipamentos/betoneira.webp", box: [240, 15, 400, 300] },
  { file: banner("banner3-1920x650.jpg"), out: "servicos/perfuracao-em-concreto.webp", box: [930, 0, 410, 650] },
];

const brands = ["bosch-logo", "black-decker", "dewalt-logo-2", "makita-logo-6", "milwaukee-tool-logo", "download"];
const brandNames = { "download": "mirka", "bosch-logo": "bosch", "dewalt-logo-2": "dewalt", "makita-logo-6": "makita", "milwaukee-tool-logo": "milwaukee", "black-decker": "black-decker" };

async function main() {
  for (const c of crops) {
    const dest = path.join(out, c.out);
    await mkdir(path.dirname(dest), { recursive: true });
    const [left, top, width, height] = c.box;
    await sharp(c.file).extract({ left, top, width, height }).webp({ quality: 82 }).toFile(dest);
    console.log("crop", c.out);
  }
  await mkdir(path.join(out, "marcas"), { recursive: true });
  for (const b of brands) {
    const dest = path.join(out, "marcas", `${brandNames[b]}.webp`);
    await sharp(path.join(src, "catalog", "marcas", `${b}.png`)).trim().resize({ width: 320, height: 120, fit: "inside", withoutEnlargement: true }).webp({ quality: 90 }).toFile(dest);
    console.log("brand", dest);
  }
  console.log("logo");

  // Square logo (1080x1080) from the old favicon: icon from the "M" mark,
  // Open Graph image from the full lockup.
  const avatar = path.join(src, "catalog", "avatar.jpg");
  const appDir = path.join(root, "src", "app");
  await sharp(avatar)
    .extract({ left: 400, top: 312, width: 285, height: 285 })
    .resize(512, 512)
    .png()
    .toFile(path.join(appDir, "icon.png"));
  await sharp(avatar).extract({ left: 400, top: 312, width: 285, height: 285 }).resize(180, 180).png().toFile(path.join(appDir, "apple-icon.png"));
  await sharp(avatar).extract({ left: 400, top: 312, width: 285, height: 285 }).resize(160, 160).webp({ quality: 90 }).toFile(path.join(out, "logo-mark.webp"));
  const lockup = await sharp(avatar).extract({ left: 200, top: 320, width: 680, height: 440 }).resize({ height: 440 }).toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#ffffff" } })
    .composite([
      { input: lockup, left: 260, top: 80 },
      { input: Buffer.from('<svg width="1200" height="40"><rect width="1200" height="40" fill="#12173b"/></svg>'), left: 0, top: 590 },
    ])
    .png()
    .toFile(path.join(out, "og.png"));
  console.log("icons and og");

  // Horizontal header logo. The old horizontal PNG is only 303x39 px of
  // artwork, so it is rebuilt from the high resolution square logo:
  // the "M" mark beside the MAQCENTER wordmark.
  const mark = await sharp(avatar).extract({ left: 425, top: 337, width: 235, height: 235 }).resize(200, 200).toBuffer();
  const word = await sharp(avatar).extract({ left: 222, top: 592, width: 640, height: 158 }).resize({ height: 150 }).toBuffer();
  const wordMeta = await sharp(word).metadata();
  await sharp({ create: { width: 200 + 28 + wordMeta.width, height: 200, channels: 3, background: "#ffffff" } })
    .composite([
      { input: mark, left: 0, top: 0 },
      { input: word, left: 228, top: 28 },
    ])
    .webp({ quality: 92 })
    .toFile(path.join(out, "logo-maqcenter.webp"));
  console.log("header logo", 228 + wordMeta.width, "x 200");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
