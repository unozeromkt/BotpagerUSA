import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header, SiteFooter } from "@/components/landing-page";
import { privacyContent } from "./privacy-content-normalized";
import "../terms/terms.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy explaining how BotPager collects, uses, discloses, and protects personal information.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "article",
    url: "/privacy",
    title: "Privacy Policy | BotPager",
    description: "Learn how BotPager handles personal information, SMS consent, communications, analytics, and privacy requests.",
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
    nodes.push(<ul key={`${keyPrefix}-ul-${nodes.length}`}>{list.map((item, index) => <li key={`${keyPrefix}-li-${index}`}>{renderInline(item)}</li>)}</ul>);
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

function PrivacyDocument() {
  const blocks = privacyContent.trim().split(/\n---\n/);
  const introLines = blocks.shift()?.split("\n") ?? [];
  const title = introLines.find((line) => line.startsWith("# "))?.slice(2) ?? "Privacy Policy";
  const introBody = introLines.filter((line) => !line.startsWith("# ") && !line.startsWith("**Last Updated:"));

  return (
    <article className="termsCard" aria-labelledby="privacy-title">
      <header className="termsDocumentHeader">
        <p className="termsEffective">Last Updated: September 1, 2026</p>
        <h1 id="privacy-title">{title}</h1>
      </header>
      <div className="termsIntro">{renderBody(introBody, "privacy-intro")}</div>
      {blocks.map((block, index) => {
        const lines = block.trim().split("\n");
        const heading = lines.shift()?.replace(/^##\s*/, "") ?? "";
        return (
          <section className="termsSection" key={heading || index} aria-labelledby={`privacy-section-${index}`}>
            <h2 id={`privacy-section-${index}`}>{renderInline(heading)}</h2>
            {renderBody(lines, `privacy-section-${index}`)}
          </section>
        );
      })}
    </article>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="termsPage privacyPage">
        <div className="container termsIntroHero">
          <p className="eyebrow">Legal</p>
          <h1>Privacy Policy</h1>
          <p>How BotPager collects, uses, and protects information across our website, forms, chat, SMS, and services.</p>
        </div>
        <div className="container termsDocumentWrap">
          <PrivacyDocument />
        </div>
      </main>
      <SiteFooter variant="conversion" />
    </>
  );
}
