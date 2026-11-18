"use client";

import { useId, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { Expand, X } from "lucide-react";
import styles from "./roofing-product-screenshot.module.css";

export function RoofingProductScreenshot({ image, title, alt, caption, dark = false }: {
  image: StaticImageData;
  title: string;
  alt: string;
  caption: string;
  dark?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [hasOpened, setHasOpened] = useState(false);
  const openPreview = () => {
    setHasOpened(true);
    dialogRef.current?.showModal();
  };

  return <figure className={styles.figure} data-dark={dark}>
    <button type="button" className={styles.preview} onClick={openPreview} aria-label={`Enlarge ${title}`} aria-haspopup="dialog">
      <Image src={image} alt={alt} sizes="(max-width: 1248px) calc(100vw - 32px), 1200px" className={styles.image} />
    </button>
    <figcaption className={styles.caption}>
      <div><strong>{title}</strong><p>{caption} Illustrative demo with fictional data.</p></div>
      <button type="button" onClick={openPreview} aria-haspopup="dialog"><Expand size={16} aria-hidden="true" />Expand screenshot</button>
    </figcaption>
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={titleId} closedby="any">
      <div className={styles.toolbar}>
        <div><h3 id={titleId}>{title}</h3><p>Illustrative demo · Fictional data<span className={styles.scrollHint}> · Scroll to view details</span></p></div>
        <form method="dialog"><button autoFocus aria-label={`Close ${title}`}><X size={19} aria-hidden="true" /><span>Close</span></button></form>
      </div>
      <div className={styles.imageViewport} tabIndex={0} role="region" aria-label={`${title}, scroll to inspect the full screenshot`}>
        {hasOpened && <Image src={image} alt={alt} className={styles.expandedImage} unoptimized />}
      </div>
    </dialog>
  </figure>;
}
