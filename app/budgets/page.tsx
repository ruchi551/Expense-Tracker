"use client";
import { useState, useEffect } from "react";

type Category = { id: string; name: string; color: string };
type BudgetCategory = {
  id: string;
  allocatedAmount: number;
  category: Category;
};
type Budget = {
  id: string;
  name: string;
  totalAmount: number;
  period: string;
  categories: BudgetCategory[];
};

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [rows, setRows] = useState<{ categoryId: string; allocatedAmount: string }[]>([]);

  async function fetchAll() {
    const [b, c] = await Promise.all([
      fetch("/api/budgets"),
      fetch("/api/categories"),
    ]);
    const budgetData = await b.json();
    const catData = await c.json();
    setBudgets(Array.isArray(budgetData) ? budgetData : []);
    setCategories(Array.isArray(catData) ? catData : []);
  }

  useEffect(() => { fetchAll(); }, []);

  function addRow() {
    setRows([...rows, { categoryId: "", allocatedAmount: "" }]);
  }

  function updateRow(i: number, field: string, value: string) {
    const updated = [...rows];
    updated[i] = { ...updated[i], [field]: value };
    setRows(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        totalAmount,
        period,
        categories: rows.filter((r) => r.categoryId && r.allocatedAmount),
      }),
    });
    setName("");
    setTotalAmount("");
    setPeriod("monthly");
    setRows([]);
    setShowForm(false);
    fetchAll();
  }

  async function handleDelete(id: string) {
    await fetch("/api/budgets", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchAll();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Budgets</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Add budget
          </button>
        </div>

        {showForm && (
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}>
            <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "1rem" }}>New budget</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", boxSizing: "border-box" }}
                    placeholder="e.g. Monthly budget"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>Total amount (₹)</label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", boxSizing: "border-box" }}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>Period</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", boxSizing: "border-box" }}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 500 }}>Category limits</label>
                  <button
                    type="button"
                    onClick={addRow}
                    style={{ fontSize: "12px", color: "#6366f1", background: "none", border: "none", cursor: "pointer" }}
                  >
                    + Add category
                  </button>
                </div>
                {rows.map((row, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <select
                      value={row.categoryId}
                      onChange={(e) => updateRow(i, "categoryId", e.target.value)}
                      style={{ flex: 1, border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", fontSize: "14px" }}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={row.allocatedAmount}
                      onChange={(e) => updateRow(i, "allocatedAmount", e.target.value)}
                      style={{ width: "130px", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", fontSize: "14px" }}
                      placeholder="Amount (₹)"
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "10px 20px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Save budget
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    background: "white",
                    color: "#333",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 20px",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {budgets.length === 0 ? (
            <div style={{
              background: "white",
              borderRadius: "16px",
              padding: "3rem",
              textAlign: "center",
              color: "#aaa",
              fontSize: "14px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}>
              No budgets yet. Click "+ Add budget" to get started!
            </div>
          ) : (
            budgets.map((budget) => (
              <div key={budget.id} style={{
                background: "white",
                borderRadius: "16px",
                padding: "1.5rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div>
                    <h2 style={{ fontSize: "16px", fontWeight: 600 }}>{budget.name}</h2>
                    <p style={{ fontSize: "13px", color: "#666", textTransform: "capitalize" }}>
                      {budget.period} · ₹{budget.totalAmount.toFixed(2)} total
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    style={{
                      background: "#fef2f2",
                      color: "#dc2626",
                      border: "none",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
                {budget.categories.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {budget.categories.map((bc) => (
                      <div key={bc.id}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: bc.category.color, display: "inline-block" }} />
                            {bc.category.name}
                          </span>
                          <span style={{ color: "#666" }}>₹{bc.allocatedAmount.toFixed(2)}</span>
                        </div>
                        <div style={{ background: "#f0f0f0", borderRadius: "99px", height: "8px" }}>
                          <div style={{
                            background: bc.category.color,
                            borderRadius: "99px",
                            height: "8px",
                            width: `${Math.min((bc.allocatedAmount / budget.totalAmount) * 100, 100).toFixed(0)}%`,
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}