// scripts/ingest.ts
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import OpenAI from "openai";

// tiny chunker
function chunkText(t: string, size = 1200, overlap = 150) {
  const out: string[] = [];
  let i = 0;
  while (i < t.length) {
    const end = Math.min(i + size, t.length);
    out.push(t.slice(i, end));
    i = end - overlap;
    if (i < 0) i = 0;
    if (i >= t.length) break;
  }
  return out.map(s => s.replace(/\s+/g, " ").trim()).filter(Boolean);
}

async function extractPdf(filePath: string) {
  const data = await fs.readFile(filePath);
  const parsed = await pdf(data);
  return parsed.text || "";
}

async function main() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const knowledgeDir = path.resolve("knowledge");
  const files = (await fs.readdir(knowledgeDir)).filter(f => f.toLowerCase().endsWith(".pdf"));
  if (files.length === 0) throw new Error("No PDFs found in /knowledge");

  const docs: { id: string; text: string; source: string }[] = [];

  for (const f of files) {
    const full = path.join(knowledgeDir, f);
    const text = await extractPdf(full);
    const chunks = chunkText(text);
    chunks.forEach((c, i) => docs.push({ id: `${f}::${i}`, text: c, source: f }));
  }

  // embed in batches to be friendly
  const inputs = docs.map(d => d.text);
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small", // cheap & good
    input: inputs
  });

  const vectors = res.data.map(d => d.embedding);

  // write flat index
  const out = docs.map((d, i) => ({
    id: d.id,
    source: d.source,
    text: d.text,
    // store as Float32 array to save space; encode base64
    embedding: Buffer.from(new Float32Array(vectors[i]).buffer).toString("base64")
  }));

  await fs.mkdir("data", { recursive: true });
  await fs.writeFile(path.resolve("data/index.json"), JSON.stringify({ model: "text-embedding-3-small", items: out }), "utf8");
  console.log(`Wrote data/index.json with ${out.length} chunks from ${files.length} file(s).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

