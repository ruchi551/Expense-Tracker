import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DashboardCharts from "./DashboardCharts";

export default async function DashboardPage() {
  const allTransactions = await prisma.expense.findMany({
    include: { category: true },
    orderBy: { date: "desc" },
  });

  const budgets = await prisma.budget.findMany({
    include: { categories: { include: { category: true } } },
  });

  const income = allTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = allTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const top5 = allTransactions
    .filter((t) => t.type === "expense" && new Date(t.date) >= thisMonthStart)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const recent = allTransactions.slice(0, 6);

  const byMonth = Object.values(
    allTransactions.reduce((acc, t) => {
      const month = new Date(t.date).toLocaleString("default", {
        month: "short", year: "2-digit",
      });
      if (!acc[month]) acc[month] = { month, income: 0, expenses: 0 };
      if (t.type === "income") acc[month].income += t.amount;
      else acc[month].expenses += t.amount;
      return acc;
    }, {} as Record<string, { month: string; income: number; expenses: number }>)
  ).slice(-6);

  const byCategory = Object.values(
    allTransactions
      .filter((t) => t.type === "expense" && t.category)
      .reduce((acc, t) => {
        const name = t.category!.name;
        const color = t.category!.color;
        if (!acc[name]) acc[name] = { name, value: 0, color };
        acc[name].value += t.amount;
        return acc;
      }, {} as Record<string, { name: string; value: number; color: string }>)
  );

  const spendingTrend = Object.values(
    allTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        const date = new Date(t.date).toLocaleDateString("default", {
          day: "2-digit", month: "short",
        });
        if (!acc[date]) acc[date] = { date, amount: 0 };
        acc[date].amount += t.amount;
        return acc;
      }, {} as Record<string, { date: string; amount: number }>)
  ).slice(-14);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "2rem" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>Dashboard</h1>
        <p style={{ color: "#666", marginBottom: "2rem" }}>Welcome back! Here's your financial overview.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "2rem" }}>
          {[
            { label: "Balance", value: `₹${balance.toFixed(2)}`, color: balance >= 0 ? "#6366f1" : "#ef4444" },
            { label: "Total income", value: `₹${income.toFixed(2)}`, color: "#10b981" },
            { label: "Total expenses", value: `₹${expenses.toFixed(2)}`, color: "#ef4444" },
            { label: "Savings rate", value: `${savingsRate.toFixed(1)}%`, color: "#f59e0b" },
          ].map((card) => (
            <div key={card.label} style={{
              background: "white", borderRadius: "16px", padding: "1.5rem",
              borderLeft: `4px solid ${card.color}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}>
              <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>{card.label}</p>
              <p style={{ fontSize: "22px", fontWeight: 700, color: card.color }}>{card.value}</p>
            </div>
          ))}
        </div>

        <DashboardCharts
          byMonth={byMonth}
          byCategory={byCategory}
          spendingTrend={spendingTrend}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "1rem" }}>Top 5 expenses this month</h2>
            {top5.length === 0 ? (
              <p style={{ color: "#aaa", fontSize: "13px" }}>No expenses this month</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {top5.map((t, i) => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{
                      width: "24px", height: "24px", borderRadius: "50%",
                      background: "#fee2e2", color: "#ef4444",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", fontWeight: 700, flexShrink: 0,
                    }}>{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "13px", fontWeight: 500 }}>{t.description}</p>
                      {t.category && (
                        <span style={{
                          fontSize: "11px", color: t.category.color,
                          background: t.category.color + "20",
                          padding: "1px 8px", borderRadius: "99px",
                        }}>{t.category.name}</span>
                      )}
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#ef4444" }}>
                      ₹{t.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "1rem" }}>Budget progress</h2>
            {budgets.length === 0 ? (
              <p style={{ color: "#aaa", fontSize: "13px" }}>No budgets set</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {budgets.slice(0, 4).map((budget) => (
                  <div key={budget.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 500 }}>{budget.name}</span>
                      <span style={{ color: "#666" }}>₹{budget.totalAmount.toFixed(2)}</span>
                    </div>
                    <div style={{ background: "#f0f0f0", borderRadius: "99px", height: "8px" }}>
                      <div style={{
                        background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                        borderRadius: "99px", height: "8px", width: "40%",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", marginTop: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 600 }}>Recent transactions</h2>
            <Link href="/expenses" style={{ fontSize: "13px", color: "#6366f1", textDecoration: "none" }}>View all →</Link>
          </div>
          {recent.length === 0 ? (
            <p style={{ color: "#aaa", fontSize: "14px", textAlign: "center", padding: "1rem" }}>No transactions yet.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "10px 8px", fontWeight: 500 }}>{t.description}</td>
                    <td style={{ padding: "10px 8px" }}>
                      {t.category && (
                        <span style={{
                          background: t.category.color + "20", color: t.category.color,
                          padding: "2px 8px", borderRadius: "99px", fontSize: "12px",
                        }}>{t.category.name}</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 8px" }}>
                      <span style={{
                        background: t.type === "income" ? "#d1fae5" : "#fee2e2",
                        color: t.type === "income" ? "#059669" : "#dc2626",
                        padding: "2px 8px", borderRadius: "99px", fontSize: "12px",
                      }}>
                        {t.type === "income" ? "↑" : "↓"} {t.type}
                      </span>
                    </td>
                    <td style={{ padding: "10px 8px", color: "#666", fontSize: "13px" }}>
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700,
                      color: t.type === "income" ? "#10b981" : "#ef4444",
                    }}>
                      {t.type === "income" ? "+" : "-"}₹{t.amount.toFixed(2)}
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