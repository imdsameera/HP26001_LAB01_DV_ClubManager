export async function fileToDataUrl(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  const base64 = buf.toString("base64");
  const type = file.type || "application/octet-stream";
  return `data:${type};base64,${base64}`;
}
