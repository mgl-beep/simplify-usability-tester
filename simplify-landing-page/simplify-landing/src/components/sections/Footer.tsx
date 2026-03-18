import { Linkedin, Twitter } from "lucide-react";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Privacy & Security", href: "#trust" },
  { label: "Rubric Alignment", href: "#rubrics" },
];

const resourceLinks = [
  { label: "CVC-OEI Rubric", href: "https://cvc.edu/wp-content/uploads/2018/10/CVC-OEI-Course-Design-Rubric-rev.10.2018.pdf", ext: true },
  { label: "Quality Matters", href: "https://www.qualitymatters.org/qa-resources/rubric-standards/higher-ed-rubric", ext: true },
  { label: "Peralta Equity Rubric", href: "https://www.peralta.edu/distance-education/online-equity-rubric", ext: true },
];

const companyLinks = [
  { label: "About", href: "#" },
  { label: "Contact", href: "#cta" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Accessibility Statement", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <span className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-xl text-white tracking-tight block mb-3">
              SIMPLIFY<span className="inline-block w-[4px] h-[4px] ml-[0.5px] align-baseline rounded-[0.5px]" style={{ backgroundColor: "#F59E0B" }} />
            </span>
            <p className="text-sm leading-relaxed mb-4">
              Accessible, usable, equitable courses &mdash; simplified.
            </p>
            <div className="flex gap-3">
              <a href="#" aria-label="LinkedIn" className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="#" aria-label="Twitter" className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm hover:text-white transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {resourceLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target={l.ext ? "_blank" : undefined}
                    rel={l.ext ? "noopener noreferrer" : undefined}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm hover:text-white transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="border-slate-800 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span>&copy; 2026 Simplify Inc. All rights reserved.</span>
          <span className="text-slate-500">Built with accessibility in mind</span>
        </div>
      </div>
    </footer>
  );
}
