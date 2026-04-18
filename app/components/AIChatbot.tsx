"use client";
import { useState } from "react";

type Message = { role: "user" | "ai"; text: string };

const SUGGESTIONS = [
  "How much did I spend this month?",
  "What is my biggest expense category?",
  "Give me tips to save money",
  "Am I saving enough?",
  "Where should I cut spending?",
];

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Hi! I'm your AI finance assistant. Ask me anything about your spending!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(text: string) {
    if (!text.trim()) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.message }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Sorry, something went wrong. Please try again." }]);
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: "24px", right: "24px",
          width: "56px", height: "56px", borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          color: "white", border: "none", fontSize: "24px",
          cursor: "pointer", boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000,
        }}
      >
        {open ? "✕" : "🤖"}
      </button>

      {open && (
        <div style={{
          position: "fixed", bottom: "90px", right: "24px",
          width: "380px", height: "520px",
          background: "white", borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column",
          zIndex: 1000, overflow: "hidden",
        }}>
          <div style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            padding: "1rem 1.25rem",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <span style={{ fontSize: "20px" }}>🤖</span>
            <div>
              <p style={{ color: "white", fontWeight: 600, fontSize: "15px", margin: 0 }}>AI Finance Assistant</p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", margin: 0 }}>Powered by Claude</p>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "10px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth: "80%",
                  padding: "10px 14px",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                    : "#f5f5f5",
                  color: msg.role === "user" ? "white" : "#111",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  padding: "10px 14px", borderRadius: "16px 16px 16px 4px",
                  background: "#f5f5f5", fontSize: "13px", color: "#666",
                }}>
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div style={{ padding: "0 1rem 0.5rem", display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  style={{
                    fontSize: "11px", padding: "4px 10px",
                    borderRadius: "99px", border: "1.5px solid #e5e7eb",
                    background: "white", cursor: "pointer", color: "#6366f1",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid #f0f0f0", display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Ask about your finances..."
              style={{
                flex: 1, border: "1.5px solid #e5e7eb", borderRadius: "10px",
                padding: "8px 14px", fontSize: "13px", outline: "none",
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "white", border: "none", borderRadius: "10px",
                padding: "8px 14px", fontSize: "13px", cursor: "pointer",
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}