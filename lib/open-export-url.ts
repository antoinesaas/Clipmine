/** Ouvre un export (Safari iOS bloque souvent window.open). */
export function openExportUrl(url: string) {
  if (typeof window === "undefined") return;
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
