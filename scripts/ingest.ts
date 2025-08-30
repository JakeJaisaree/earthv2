// scripts/ingest.ts
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import OpenAI from "openai";

const ASTRA_ENDPOINT = process.env.ASTRA_DB_API_ENDPOINT!; // JSON API for your vector collection proxy if you have one
const ASTRA_TOKEN    = process.env.ASTRA_DB_APPLICATION_TOKEN!;
const EMBED_MODEL    = "text-embedding-3-large"; // or small for cost

async function embed(texts: string[]) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const res = await openai.embeddings.create({ model: EMBED_MODEL, input: texts });
  return res.data.map(d => d.embedding);
}

async function upsert(docs: { id: string; text: string; source: string; embedding: number[] }[]) {
  // adjust to your Astra vector upsert route; if you already use a helper, import it.
  for (const d of docs) {
    const r = await fetch(`${ASTRA_ENDPOINT}/rag_docs/${d.id}`, {
      method: "PUT",
      headers: { "Content-Type":"application/json", "x-cassandra-token": ASTRA_TOKEN },
      body: JSON.stringify({ text: d.text, source: d.source, embedding: d.embedding })
    });
    if (!r.ok) throw new Error(await r.text());
  }
}

async function chunkText(text: string, source: string) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1200,
    chunkOverlap: 150
  });
  const chunks = await splitter.splitText(text);
  const embeddings = await embed(chunks);
  return chunks.map((c, i) => ({
    id: `${source}::${i}`,
    text: c,
    source,
    embedding: embeddings[i]
  }));
}

async function extractPdf(fp: string) {
  const data = await fs.readFile(fp);
  const parsed = await pdf(data);
  return parsed.text;
}

async function main() {
  const folder = path.resolve(process.cwd(), "knowledge");
  const files = (await fs.readdir(folder)).filter(f => f.toLowerCase().endsWith(".pdf"));
  let batch: any[] = [];
  for (const f of files) {
    const p = path.join(folder, f);
    const text = await extractPdf(p);
    const docs = await chunkText(text, f);
    batch.push(...docs);
  }
  await upsert(batch);
  console.log(`Ingested ${batch.length} chunks.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
