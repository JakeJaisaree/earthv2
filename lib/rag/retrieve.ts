// lib/rag/retrieve.ts
export async function retrieve(query: string, { k = 6 } = {}) {
  // 1) embed the query
  const r = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY!}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ model: "text-embedding-3-large", input: query })
  });
  const j = await r.json();
  const v = j.data[0].embedding as number[];

  // 2) vector search in Astra — adapt to your endpoint
  const res = await fetch(`${process.env.ASTRA_DB_API_ENDPOINT!}/rag_docs/_vector-search`, {
    method: "POST",
    headers: { "Content-Type":"application/json", "x-cassandra-token": process.env.ASTRA_DB_APPLICATION_TOKEN! },
    body: JSON.stringify({ vector: v, topK: k })
  });
  const out = await res.json();
  // normalize to {text}
  return (out?.data ?? out ?? []).map((d: any) => ({ text: d.text, source: d.source, score: d.score }));
}
