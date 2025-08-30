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

export default function UpgradePage() {
  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "1rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Go Pro</h1>
        <p style={{ color: "#555", marginBottom: "1.5rem" }}>
          Unlock unlimited usage and premium features.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button
            onClick={goPro}
            style={{
              flex: 1,
              backgroundColor: "#2563eb",
              color: "white",
              padding: "0.75rem 1rem",
              border: "none",
              borderRadius: "0.5rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1e40af")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
          >
            Subscribe
          </button>
          <button
            onClick={manage}
            style={{
              flex: 1,
              backgroundColor: "white",
              color: "#374151",
              padding: "0.75rem 1rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.5rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
              e.currentTarget.style.borderColor = "#9ca3af";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.borderColor = "#d1d5db";
            }}
          >
            Manage Billing
          </button>
        </div>
      </div>
    </main>
  );
}




