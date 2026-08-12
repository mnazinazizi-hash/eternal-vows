"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/our-story", label: "Our Story" },
  { href: "/venue", label: "Venue" },
  { href: "/rsvp", label: "RSVP" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      id="topNav"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-surface/95 shadow-md backdrop-blur-md"
          : "bg-surface/80 backdrop-blur-md"
      }`}
    >
      <div className="max-w-6xl mx-auto px-container-padding h-16 md:h-20 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl md:text-2xl font-semibold text-primary tracking-tight"
        >
          Elena &amp; Marcus
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`font-label-caps text-label-caps transition-colors ${
                pathname === l.href
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-tertiary opacity-80 hover:opacity-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-on-surface"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined">
            {open ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-surface/95 backdrop-blur-md border-t border-outline-variant/20 px-container-padding py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`font-label-caps text-label-caps py-2 ${
                pathname === l.href
                  ? "text-primary"
                  : "text-on-surface-variant"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
