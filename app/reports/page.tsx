"use client";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type Expense = {
  id: string;
  amount: number;
  date: string;
  category?: { name: string; color: string };
};

export default function ReportsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/expenses")
      .then((r) => r.json())
      .then((data) => {
        setExpenses(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const byCategory = Object.values(
    expenses.reduce((acc, e) => {
      const name = e.category?.name || "Uncategorized";
      const color = e.category?.color || "#6b7280";
      if (!acc[name]) acc[name] = { name, value: 0, color };
      acc[name].value += e.amount;
      return acc;
    }, {} as Record<string, { name: string; value: number; color: string }>)
  );

  const byMonth = Object.values(
    expenses.reduce((acc, e) => {
      const month = new Date(e.date).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      if (!acc[month]) acc[month] = { month, total: 0 };
      acc[month].total += e.amount;
      return acc;
    }, {} as Record<string, { month: string; total: number }>)
  ).slice(-6);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const highest = byCategory.reduce(
    (max, c) => (c.value > (max?.value || 0) ? c : max),
    byCategory[0]
  );

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "2rem" }}>
        <p style={{ color: "#aaa" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "2rem" }}>Reports</h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "2rem" }}>
          {[
            { label: "Total spent", value: `₹${total.toFixed(2)}`, color: "#6366f1" },
            { label: "Total expenses", value: expenses.length.toString(), color: "#8b5cf6" },
            { label: "Top category", value: highest?.name || "—", color: "#06b6d4" },
          ].map((card) => (
            <div key={card.label} style={{
              background: "white",
              borderRadius: "16px",
              padding: "1.5rem",
              borderLeft: `4px solid ${card.color}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}>
              <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>{card.label}</p>
              <p style={{ fontSize: "22px", fontWeight: 700, color: card.color }}>{card.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "1rem" }}>Spending by month</h2>
            {byMonth.length === 0 ? (
              <p style={{ color: "#aaa", fontSize: "13px" }}>No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => [`₹${value.toFixed(2)}`, "Total"]} />
                  <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "1rem" }}>Spending by category</h2>
            {byCategory.length === 0 ? (
              <p style={{ color: "#aaa", fontSize: "13px" }}>No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {byCategory.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`₹${value.toFixed(2)}`]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "1rem" }}>Breakdown by category</h2>
          {byCategory.length === 0 ? (
            <p style={{ color: "#aaa", fontSize: "13px" }}>No data yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {byCategory
                .sort((a, b) => b.value - a.value)
                .map((cat) => (
                  <div key={cat.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: cat.color, display: "inline-block" }} />
                        {cat.name}
                      </span>
                      <span style={{ fontWeight: 600 }}>₹{cat.value.toFixed(2)}</span>
                    </div>
                    <div style={{ background: "#f0f0f0", borderRadius: "99px", height: "8px" }}>
                      <div style={{
                        background: cat.color,
                        borderRadius: "99px",
                        height: "8px",
                        width: `${((cat.value / total) * 100).toFixed(0)}%`,
                      }} />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}