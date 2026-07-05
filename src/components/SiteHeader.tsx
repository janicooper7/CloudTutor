"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";

const links = [
  { href: "#how", label: "How it works" },
  { href: "#feedback", label: "Feedback" },
  { href: "#journey", label: "Journey" },
  { href: "#pricing", label: "Pricing" },
];

type SiteHeaderUser = {
  name?: string | null;
  email?: string | null;
};

export default function SiteHeader({ user }: { user?: SiteHeaderUser | null }) {
  const [scrolled, setScrolled] = useState(false);

  // Prefer the person's first name; fall back to "My account".
  const accountLabel =
    user?.name?.trim().split(/\s+/)[0] || (user ? "My account" : null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-line bg-bg/80 backdrop-blur-md backdrop-saturate-150"
          : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[78px] w-full max-w-[1160px] items-center justify-between px-8">
        <a href="#" className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-[1.4rem] font-semibold tracking-tight">
            CloudTutor
          </span>
        </a>

        <nav className="hidden items-center gap-10 font-medium text-ink-soft md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group relative transition-colors hover:text-ink"
            >
              {l.label}
              <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 rounded-full bg-brand transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          {accountLabel ? (
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full bg-brand-deep px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
              style={{ boxShadow: "0 10px 24px -10px rgba(31,110,224,.7)" }}
            >
              {accountLabel}
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden font-semibold text-ink-soft transition-colors hover:text-ink sm:block">
                Log in
              </Link>
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-full bg-brand-deep px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                style={{ boxShadow: "0 10px 24px -10px rgba(31,110,224,.7)" }}
              >
                Start free
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
