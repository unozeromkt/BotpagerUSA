import type { Metadata } from "next";
import Link from "next/link";
import { demoConfigs } from "@/lib/demos";

export const metadata: Metadata = {
  title: "Demo Index",
  description: "Private index of BotPager client demos.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function DemosIndexPage() {
  const demos = Object.values(demoConfigs);

  return (
    <main className="demosIndexPage">
      <div className="demosIndexGlow demosIndexGlowOne" aria-hidden="true" />
      <div className="demosIndexGlow demosIndexGlowTwo" aria-hidden="true" />

      <div className="demosIndexShell">
        <header className="demosIndexHeader">
          <div>
            <p className="demosIndexEyebrow">BotPager · Private workspace</p>
            <h1>Demo index</h1>
            <p className="demosIndexIntro">
              Browse the client experiences currently available to share.
            </p>
          </div>
          <span className="demosIndexCount" aria-label={`${demos.length} demos`}>
            {demos.length.toString().padStart(2, "0")} demos
          </span>
        </header>

        {demos.length > 0 ? (
          <div className="demosGrid">
            {demos.map((demo, index) => (
              <article className="demoIndexCard" key={demo.slug}>
                <div className="demoIndexCardTop">
                  <span className="demoIndexNumber">{(index + 1).toString().padStart(2, "0")}</span>
                  <span className="demoIndexStatus">Ready to share</span>
                </div>
                <div>
                  <p className="demoIndexType">Client demo</p>
                  <h2>{demo.clientName}</h2>
                  <p className="demoIndexDescription">{demo.pageTitle}</p>
                </div>
                <div className="demoIndexCardBottom">
                  <span>{demo.widgetId ? "Website + AI agent" : "Website experience"}</span>
                  <Link className="demoIndexLink" href={`/${demo.slug}`}>
                    Open demo <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="demosEmptyState">
            <h2>No demos yet</h2>
            <p>Add a demo to <code>lib/demos.ts</code> and it will appear here.</p>
          </div>
        )}
      </div>
    </main>
  );
}
