import Link from "next/link";

/** Logo ClipMine — un seul mot, sans espace entre Clip et Mine. */
export default function Logo({
  className = "logo",
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link href={href} className={className}>
      <span className="dot" aria-hidden />
      <span className="logo-word">
        Clip<span className="b">Mine</span>
      </span>
    </Link>
  );
}
