"use client";
import { useState, useEffect } from "react";

type Category = { id: string; name: string; color: string };
type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: string;
  category?: Category;
};

const PERIODS = ["all", "daily", "weekly", "monthly"];

export default function ExpensesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState("expense");
  const [period, setPeriod] = useState("all");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchAll() {
    const params = new URLSearchParams();
    if (period !== "all") params.set("period", period);
    if (search) params.set("search", search);
    if (filterCategory) params.set("categoryId", filterCategory);
    if (minAmount) params.set("minAmount", minAmount);
    if (maxAmount) params.set("maxAmount", maxAmount);

    const [expRes, catRes] = await Promise.all([
      fetch(`/api/expenses?${params.toString()}`),
      fetch("/api/categories"),
    ]);
    setTransactions(await expRes.json());
    setCategories(await catRes.json());
    setLoading(false);
  }

  useEffect(() => { fetchAll(); }, [period, search, filterCategory, minAmount, maxAmount]);

  function openEdit(t: Transaction) {
    setEditingId(t.id);
    setDescription(t.description);
    setAmount(t.amount.toString());
    setDate(t.date.split("T")[0]);
    setCategoryId(t.category?.id || "");
    setType(t.type);
    setShowForm(true);
  }

  function resetForm() {
    setEditingId(null);
    setDescription("");
    setAmount("");
    setDate("");
    setCategoryId("");
    setType("expense");
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { description, amount, date, categoryId, type };
    try {
      const res = editingId
        ? await fetch("/api/expenses", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editingId, ...body }),
          })
        : await fetch("/api/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
      if (res.ok) { resetForm(); fetchAll(); }
    } catch (err) { console.error(err); }
  }

  async function handleDelete(id: string) {
    await fetch("/api/expenses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchAll();
  }

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  function exportCSV() {
    const headers = ["Description", "Type", "Category", "Amount (Rs.)", "Date"];
    const rows = transactions.map((t) => [
      t.description,
      t.type,
      t.category?.name || "—",
      t.amount.toFixed(2),
      new Date(t.date).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Expense Tracker Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Total Income: Rs.${income.toFixed(2)}`, 14, 36);
    doc.text(`Total Expenses: Rs.${expenses.toFixed(2)}`, 14, 44);
    doc.text(`Balance: Rs.${balance.toFixed(2)}`, 14, 52);

    autoTable(doc, {
      startY: 60,
      head: [["Description", "Type", "Category", "Amount (Rs.)", "Date"]],
      body: transactions.map((t) => [
        t.description,
        t.type,
        t.category?.name || "—",
        t.amount.toFixed(2),
        new Date(t.date).toLocaleDateString(),
      ]),
      headStyles: { fillColor: [99, 102, 241] },
      alternateRowStyles: { fillColor: [245, 245, 255] },
    });

    doc.save("transactions.pdf");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Transactions</h1>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={exportCSV}
              style={{
                background: "white", color: "#10b981",
                border: "1.5px solid #10b981", borderRadius: "10px",
                padding: "10px 16px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
              }}
            >
              Export CSV
            </button>
            <button
              onClick={exportPDF}
              style={{
                background: "white", color: "#ef4444",
                border: "1.5px solid #ef4444", borderRadius: "10px",
                padding: "10px 16px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
              }}
            >
              Export PDF
            </button>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "white", border: "none", borderRadius: "10px",
                padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
              }}
            >
              + Add transaction
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "2rem" }}>
          {[
            { label: "Total income", value: `₹${income.toFixed(2)}`, color: "#10b981" },
            { label: "Total expenses", value: `₹${expenses.toFixed(2)}`, color: "#ef4444" },
            { label: "Balance", value: `₹${balance.toFixed(2)}`, color: balance >= 0 ? "#6366f1" : "#ef4444" },
          ].map((card) => (
            <div key={card.label} style={{
              background: "white", borderRadius: "16px", padding: "1.5rem",
              borderLeft: `4px solid ${card.color}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}>
              <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>{card.label}</p>
              <p style={{ fontSize: "24px", fontWeight: 700, color: card.color }}>{card.value}</p>
            </div>
          ))}
        </div>

        <div style={{ background: "white", borderRadius: "16px", padding: "1rem 1.5rem", marginBottom: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: showFilters ? "1rem" : "0" }}>
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "8px 14px", fontSize: "14px" }}
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: "8px 16px", borderRadius: "10px", fontSize: "13px",
                background: showFilters ? "#6366f1" : "white",
                color: showFilters ? "white" : "#666",
                border: "1.5px solid #e5e7eb", cursor: "pointer",
              }}
            >
              Filters {showFilters ? "▲" : "▼"}
            </button>
          </div>

          {showFilters && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px" }}>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "8px 14px", fontSize: "13px" }}
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Min amount (₹)"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                style={{ border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "8px 14px", fontSize: "13px" }}
              />
              <input
                type="number"
                placeholder="Max amount (₹)"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                style={{ border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "8px 14px", fontSize: "13px" }}
              />
              <button
                onClick={() => { setFilterCategory(""); setMinAmount(""); setMaxAmount(""); setSearch(""); }}
                style={{
                  border: "1.5px solid #e5e7eb", borderRadius: "10px",
                  padding: "8px 14px", fontSize: "13px", cursor: "pointer",
                  background: "white", color: "#666",
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}>
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: "6px 16px", borderRadius: "99px", fontSize: "13px",
                fontWeight: period === p ? 600 : 400,
                background: period === p ? "#6366f1" : "white",
                color: period === p ? "white" : "#666",
                border: period === p ? "none" : "1.5px solid #e5e7eb",
                cursor: "pointer", textTransform: "capitalize",
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {showForm && (
          <div style={{
            background: "white", borderRadius: "16px", padding: "1.5rem",
            marginBottom: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}>
            <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "1rem" }}>
              {editingId ? "Edit transaction" : "New transaction"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
                {["expense", "income"].map((t) => (
                  <button
                    key={t} type="button" onClick={() => setType(t)}
                    style={{
                      flex: 1, padding: "10px", borderRadius: "10px",
                      fontSize: "14px", fontWeight: 600, cursor: "pointer", border: "none",
                      background: type === t ? (t === "income" ? "#10b981" : "#ef4444") : "#f0f0f0",
                      color: type === t ? "white" : "#666",
                    }}
                  >
                    {t === "income" ? "↑ Income" : "↓ Expense"}
                  </button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>Description</label>
                  <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                    style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", boxSizing: "border-box" }}
                    placeholder="e.g. Lunch" required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>Amount (₹)</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                    style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", boxSizing: "border-box" }}
                    placeholder="0.00" required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", boxSizing: "border-box" }}
                    required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>Category</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                    style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", boxSizing: "border-box" }}>
                    <option value="">No category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  color: "white", border: "none", borderRadius: "10px",
                  padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
                }}>
                  {editingId ? "Update" : "Save"}
                </button>
                <button type="button" onClick={resetForm} style={{
                  background: "white", color: "#333", border: "1.5px solid #e5e7eb",
                  borderRadius: "10px", padding: "10px 20px", fontSize: "14px", cursor: "pointer",
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {loading ? (
            <p style={{ textAlign: "center", padding: "3rem", color: "#aaa" }}>Loading...</p>
          ) : transactions.length === 0 ? (
            <p style={{ textAlign: "center", padding: "3rem", color: "#aaa", fontSize: "14px" }}>
              No transactions found.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f0f0f0" }}>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "#555" }}>Description</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "#555" }}>Category</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "#555" }}>Date</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "#555" }}>Type</th>
                  <th style={{ textAlign: "right", padding: "12px 16px", fontWeight: 600, color: "#555" }}>Amount</th>
                  <th style={{ padding: "12px 16px" }}></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 500 }}>{t.description}</td>
                    <td style={{ padding: "14px 16px" }}>
                      {t.category ? (
                        <span style={{
                          background: t.category.color + "20", color: t.category.color,
                          padding: "3px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: 500,
                        }}>{t.category.name}</span>
                      ) : <span style={{ color: "#ccc" }}>—</span>}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#666" }}>
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        background: t.type === "income" ? "#d1fae5" : "#fee2e2",
                        color: t.type === "income" ? "#059669" : "#dc2626",
                        padding: "3px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: 500,
                      }}>
                        {t.type === "income" ? "↑ Income" : "↓ Expense"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right", fontWeight: 600, color: t.type === "income" ? "#10b981" : "#ef4444" }}>
                      {t.type === "income" ? "+" : "-"}₹{t.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        <button onClick={() => openEdit(t)} style={{
                          background: "#eff6ff", color: "#3b82f6", border: "none",
                          borderRadius: "6px", padding: "4px 10px", fontSize: "12px", cursor: "pointer",
                        }}>Edit</button>
                        <button onClick={() => handleDelete(t.id)} style={{
                          background: "#fef2f2", color: "#dc2626", border: "none",
                          borderRadius: "6px", padding: "4px 10px", fontSize: "12px", cursor: "pointer",
                        }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}