import Image from "next/image";
import { roofingGuideMoments, type RoofingGuideMoment } from "@/lib/roofing-guide";
import styles from "./roofing-ghost-guide.module.css";

// In narrow layouts, reserve real document space for guidance instead of covering the page.
export function RoofingGuideNote({ moment }: { moment: Exclude<RoofingGuideMoment, "hero"> }) {
  const content = roofingGuideMoments[moment];
  return <aside className={styles.inlineNote} aria-label="A note from your AI assistant">
    <Image src="/images/botpager-mascot-transparent.png" width={40} height={40} alt="" />
    <div><span>{content.label}</span><p>{content.text}</p></div>
  </aside>;
}
