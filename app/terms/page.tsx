import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header, SiteFooter } from "@/components/landing-page";
import { termsContent } from "./terms-content";
import "./terms.css";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service governing access to and use of BotPager websites, software, AI tools, marketing services, and automation systems.",
  alternates: { canonical: "/terms" },
  openGraph: {
    type: "article",
    url: "/terms",
    title: "Terms of Service | BotPager",
    description: "Terms governing BotPager services for local service businesses.",
  },
};

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

function renderBody(lines: string[], keyPrefix: string) {
  const nodes: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    nodes.push(<p key={`${keyPrefix}-p-${nodes.length}`}>{renderInline(paragraph.join(" "))}</p>);
    paragraph = [];
  };

  const flushList = () => {
    if (!list.length) return;
    nodes.push(
      <ul key={`${keyPrefix}-ul-${nodes.length}`}>
        {list.map((item, index) => <li key={`${keyPrefix}-li-${index}`}>{renderInline(item)}</li>)}
      </ul>,
    );
    list = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
    } else if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      nodes.push(<h3 key={`${keyPrefix}-h3-${nodes.length}`}>{renderInline(trimmed.slice(4))}</h3>);
    } else if (trimmed.startsWith("* ")) {
      flushParagraph();
      list.push(trimmed.slice(2));
    } else {
      flushList();
      paragraph.push(trimmed);
    }
  });

  flushParagraph();
  flushList();
  return nodes;
}

function TermsDocument() {
  const blocks = termsContent.trim().split(/\n---\n/);
  const introLines = blocks.shift()?.split("\n") ?? [];
  const title = introLines.find((line) => line.startsWith("# "))?.slice(2) ?? "Terms of Service";
  const introBody = introLines.filter((line) => !line.startsWith("# ") && !line.startsWith("**Effective Date:") && !line.startsWith("**Last Updated:"));

  return (
    <article className="termsCard" aria-labelledby="terms-title">
      <header className="termsDocumentHeader">
        <p className="termsEffective">Effective Date: August 31, 2026 · Last Updated: August 31, 2026</p>
        <h1 id="terms-title">{title}</h1>
      </header>
      <div className="termsIntro">{renderBody(introBody, "intro")}</div>
      {blocks.map((block, index) => {
        const lines = block.trim().split("\n");
        const heading = lines.shift()?.replace(/^##\s*/, "") ?? "";
        return (
          <section className="termsSection" key={heading || index} aria-labelledby={`terms-section-${index}`}>
            <h2 id={`terms-section-${index}`}>{renderInline(heading)}</h2>
            {renderBody(lines, `section-${index}`)}
          </section>
        );
      })}
    </article>
  );
}

export default function TermsPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="termsPage">
        <div className="container termsIntroHero">
          <p className="eyebrow">Legal</p>
          <h1>Terms of Service</h1>
          <p>These terms explain the relationship between BotPager and the local service businesses we serve.</p>
        </div>
        <div className="container termsDocumentWrap">
          <TermsDocument />
        </div>
      </main>
      <SiteFooter variant="conversion" />
    </>
  );
}
