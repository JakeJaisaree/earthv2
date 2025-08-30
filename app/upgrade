"use client";

export default function Upgrade() {
  async function goPro() {
    const r = await fetch("/api/stripe/checkout", { method: "POST" });
    const { url } = await r.json();
    location.href = url;
  }

  async function manage() {
    const r = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await r.json();
    location.href = url;
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Go Pro</h1>
      <p>Unlock unlimited usage.</p>
      <button onClick={goPro} style={{ border: "1px solid", padding: 12, marginRight: 8 }}>
        Subscribe
      </button>
      <button onClick={manage} style={{ border: "1px solid", padding: 12 }}>
        Manage billing
      </button>
    </main>
  );
}
