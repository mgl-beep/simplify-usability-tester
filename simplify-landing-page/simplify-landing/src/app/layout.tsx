import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SIMPLIFY — Canvas Course Accessibility & Usability Plug-in | Simplify EdTech",
  description:
    "SIMPLIFY is a Canvas LTI plug-in that scans your courses for accessibility and usability issues, reports against CVC-OEI, Quality Matters, and Peralta rubrics, and offers one-click fixes. Free pilot available.",
  openGraph: {
    title: "SIMPLIFY — Stop juggling accessibility tools. Start fixing your courses.",
    description:
      "One Canvas plug-in that scans, reports, and fixes accessibility issues — aligned to the rubrics you already use. Free 60-day pilot.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SIMPLIFY — Canvas Course Accessibility & Usability Plug-in",
    description:
      "Scan your Canvas courses for accessibility issues, get rubric-aligned reports, and fix problems with one click.",
  },
  keywords: [
    "Canvas LMS accessibility",
    "course accessibility checker",
    "CVC-OEI rubric tool",
    "Quality Matters accessibility",
    "Peralta equity rubric",
    "Canvas LTI plugin",
    "WCAG course compliance",
    "online course accessibility",
    "POCR accessibility",
    "higher education accessibility tool",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Simplify Inc.",
                url: "https://simplifyedtech.com",
              },
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "SIMPLIFY",
                applicationCategory: "EducationalApplication",
                operatingSystem: "Web",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  description: "Free 60-day pilot",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "How is SIMPLIFY different from UDOIT?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "UDOIT scans native HTML content in Canvas but doesn't scan uploaded documents, doesn't map findings to CVC-OEI or QM rubric elements, and offers limited auto-fix capabilities. SIMPLIFY does all of that in a single tool, plus adds equity rubric alignment and institutional dashboards.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "What rubrics does SIMPLIFY support?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "SIMPLIFY supports three frameworks: the CVC-OEI Course Design Rubric (Sections A-D), the Quality Matters Higher Education Rubric (8 Standards), and the Peralta Online Equity Rubric 3.0 (Elements E1-E8).",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Is student data accessed or stored?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "No. SIMPLIFY only accesses course content — pages, assignments, files, and structure. It never accesses student submissions, grades, or personal information. We are fully FERPA compliant.",
                    },
                  },
                ],
              },
            ]),
          }}
        />
      </head>
      <body
        className={`${plusJakarta.variable} ${inter.variable} antialiased`}
      >
        <a href="#main" className="skip-nav">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
