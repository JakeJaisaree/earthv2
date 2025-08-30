import fs from "fs/promises";
import path from "path";
import OpenAI from "openai";

// Load the index file
type IndexItem = { id: string; source: string; text: string; embedding: string };
type IndexFile = { model: string; items: IndexItem[] };

function decode(b64: string): Float32Array {
  const buf = Buffer.from(b64, "base64");
  return new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / Float32Array.BYTES_PER_ELEMENT);
}

function cosine(a: Float32Array, b: Float32Array) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i], y = b[i];
    dot += x * y; na += x * x; nb += y * y;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-12);
}

let cached: { items: { id: string; source: string; text: string; vec: Float32Array }[]; model: string } | null = null;

async function loadIndex() {
  if (cached) return cached;
  const p = path.resolve("data/index.json");
  const raw = await fs.readFile(p, "utf8").catch(() => null);
  if (!raw) throw new Error("Missing data/index.json. Run: npm run ingest");
  const index = JSON.parse(raw) as IndexFile;
  const items = index.items.map(it => ({ id: it.id, source: it.source, text: it.text, vec: decode(it.embedding) }));
  cached = { items, model: index.model };
  return cached;
}

export async function retrieve(query: string, { k = 6 }: { k?: number } = {}) {
  const { items, model } = await loadIndex();
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const emb = await openai.embeddings.create({ model, input: query });
  const q = new Float32Array(emb.data[0].embedding);

  const scored = items.map(it => ({ ...it, score: cosine(q, it.vec) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map(({ id, source, text, score }) => ({ id, source, text, score }));
}
