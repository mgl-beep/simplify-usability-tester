"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Rubrics", href: "#rubrics" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const ids = links.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur shadow-sm"
          : "bg-transparent"
      }`}
      role="navigation"
      aria-label="Main"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-18">
        {/* Logo */}
        <a
          href="#"
          className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-xl text-slate-900 tracking-tight"
        >
          SIMPLIFY<span className="inline-block w-[4px] h-[4px] ml-[0.5px] align-baseline rounded-[0.5px]" style={{ backgroundColor: "#F59E0B" }} />
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                active === link.href.slice(1)
                  ? "text-simplify-blue"
                  : "text-slate-600 hover:text-simplify-blue"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#solution"
            className="text-sm font-semibold text-simplify-blue border-2 border-simplify-blue px-5 py-2 rounded-lg hover:bg-simplify-blue hover:text-white transition-all"
          >
            Watch Demo
          </a>
          <a
            href="#cta"
            className="text-sm font-semibold text-white bg-simplify-blue px-5 py-2 rounded-lg hover:bg-simplify-blue-dark transition-colors shadow-sm"
          >
            Request Pilot
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-slate-700"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 shadow-lg">
          <div className="px-6 py-4 flex flex-col gap-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-base font-medium text-slate-700 hover:text-simplify-blue py-2"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-slate-200" />
            <a
              href="#cta"
              onClick={() => setMobileOpen(false)}
              className="text-center font-semibold text-white bg-simplify-blue px-5 py-3 rounded-lg hover:bg-simplify-blue-dark transition-colors"
            >
              Request Pilot
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
