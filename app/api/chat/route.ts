// app/api/chat/route.ts
import { NextRequest } from "next/server";
import OpenAI from "openai";
import { EARTH_V2_SYSTEM_PROMPT } from "/lib/prompt/earthv2";
import { retrieve } from "/lib/rag/retrieve"; // your existing Astra retrieval helper

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  const { messages } = await req.json() as {
    messages: { role: "user"|"assistant"|"system"; content: string }[];
  };

  // 1) pull the latest user utterance for retrieval
  const userMsg = [...messages].reverse().find(m => m.role === "user")?.content || "";

  // 2) retrieve knowledge chunks (Astra DB vector search)
  const chunks = await retrieve(userMsg, { k: 6 });
  const contextBlock = chunks.map((c, i) => `[#${i+1}] ${c.text}`).join("\n\n");

  // 3) craft the message list: system voice + context + conversation
  const system = { role: "system" as const, content: EARTH_V2_SYSTEM_PROMPT };
  const context = {
    role: "system" as const,
    content:
`Context (embedded material). Cite by bracket number when relevant.
${contextBlock}`
  };

  const resp = await openai.chat.completions.create({
    model: "gpt-4.1", // or your chosen model,
    messages: [system, context, ...messages],
    stream: false
  });

  const text = resp.choices[0]?.message?.content ?? "";
  return new Response(JSON.stringify({ text }), { status: 200 });
}

