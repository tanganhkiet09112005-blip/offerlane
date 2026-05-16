"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./store.module.css";

const LOGO_PLACEHOLDER = "/assets/placeholders/store.svg";

export function StoreMiniCard({
  name,
  href,
  description,
  logoSrc,
  ribbon,
}: {
  name: string;
  href: string;
  description?: string;
  logoSrc?: string | null;
  ribbon?: string | null;
}) {
  const src = logoSrc?.trim() ? logoSrc.trim() : LOGO_PLACEHOLDER;

  return (
    <Link href={href} className={styles.storeMiniCard}>
      {ribbon?.trim() ? (
        <span className={styles.storeMiniRibbon}>{ribbon.trim()}</span>
      ) : null}
      <div className={styles.storeMiniInner}>
        <Image
          src={src}
          alt=""
          width={56}
          height={56}
          className={styles.storeMiniLogo}
        />
        <div className={styles.storeMiniText}>
          <span className={styles.storeMiniName}>{name}</span>
          {description?.trim() ? (
            <span className={styles.storeMiniDesc}>{description.trim()}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
