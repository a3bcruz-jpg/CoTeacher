export function sanitizeFilename(title: string) {
  const safe = title.replace(/[^a-zA-Z0-9-_ ]/g, "").trim().replace(/\s+/g, "-");
  return (safe || "coteacher-document").slice(0, 80);
}

export function documentAsText(title: string, content: string) {
  return `${title}\n\n${content}\n`;
}
