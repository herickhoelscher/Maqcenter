"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "./nav";

export function NavBar() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
  return (
    <nav aria-label="Principal" className="on-dark bg-navy text-white">
      <ul className="container-site flex gap-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] lg:gap-2">
        {mainNav.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`block border-b-2 px-3 py-3 text-body font-semibold transition-colors ${
                  active ? "border-amber bg-navy-deep text-amber" : "border-transparent text-white/85 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
