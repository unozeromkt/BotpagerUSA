import type { Metadata } from "next";
import { notFound } from "next/navigation";

type ResourceArticleProps = {
  params: Promise<{ articleSlug: string }>;
};

export async function generateMetadata({ params }: ResourceArticleProps): Promise<Metadata> {
  await params;
  return { robots: { index: false, follow: false } };
}

export default async function ResourceArticleRoute({ params }: ResourceArticleProps) {
  await params;
  notFound();
}
