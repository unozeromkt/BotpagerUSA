import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDemoConfig } from "@/lib/demos";

type DemoPageProps = {
  params: Promise<{ demoSlug: string }>;
};

export async function generateMetadata({ params }: DemoPageProps): Promise<Metadata> {
  const { demoSlug } = await params;
  const demo = getDemoConfig(demoSlug);

  if (!demo) return {};

  return {
    title: `${demo.clientName} Demo | ${demo.pageTitle}`,
    description: `Private demo experience for ${demo.clientName}.`,
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
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { demoSlug } = await params;
  const demo = getDemoConfig(demoSlug);

  if (!demo) notFound();

  return (
    <main className="demoPage">
      <iframe
        className="demoFrame"
        src={demo.websiteUrl}
        title={`${demo.clientName}: ${demo.pageTitle}`}
        allow="fullscreen; clipboard-write"
        allowFullScreen
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </main>
  );
}
