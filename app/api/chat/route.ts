// app/api/chat/route.ts
import { NextRequest } from "next/server";
import OpenAI from "openai";
import { retrieve } from "@/lib/rag/retrieve";
import { EARTH_V2_SYSTEM_PROMPT } from "@/lib/prompt/earthv2";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  const { messages } = await req.json() as {
    messages: { role: "user"|"assistant"|"system"; content: string }[];
  };

  const userMsg = [...messages].reverse().find(m => m.role === "user")?.content ?? "";
  const chunks = await retrieve(userMsg, { k: 6 });
  const context = chunks.map((c, i) => `[#${i+1} ${c.source}] ${c.text}`).join("\n\n");

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      { role: "system", content: EARTH_V2_SYSTEM_PROMPT },
      { role: "system", content: `Context (embedded material). Cite bracket numbers when relevant:\n${context}` },
      ...messages
    ]
  });

  const text = resp.choices[0]?.message?.content ?? "";
  return new Response(JSON.stringify({ text, refs: chunks.map((c,i)=>({ n:i+1, source:c.source })) }), { status: 200 });
}




