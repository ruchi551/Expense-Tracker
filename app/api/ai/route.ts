import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Transaction = {
  type: string;
  amount: number;
  date: Date;
  description: string;
  category?: { name: string } | null;
};

export async function POST(req: Request) {
  const { message } = await req.json();
  const msg = message.toLowerCase();

  const transactions: Transaction[] = await prisma.expense.findMany({
    include: { category: true },
    orderBy: { date: "desc" },
  });

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisMonthExpenses = transactions
    .filter((t) => t.type === "expense" && new Date(t.date) >= thisMonthStart)
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthIncome = transactions
    .filter((t) => t.type === "income" && new Date(t.date) >= thisMonthStart)
    .reduce((sum, t) => sum + t.amount, 0);

  const byCategory = Object.entries(
    transactions
      .filter((t) => t.type === "expense" && t.category)
      .reduce((acc: Record<string, number>, t) => {
        const name = t.category!.name;
        acc[name] = (acc[name] || 0) + t.amount;
        return acc;
      }, {})
  ).sort((a, b) => b[1] - a[1]);

  const topCategory = byCategory[0];

  const recentExpenses = transactions
    .filter((t) => t.type === "expense")
    .slice(0, 3)
    .map((t) => `${t.description} (₹${t.amount})`)
    .join(", ");

  let reply = "";

  if (msg.includes("balance")) {
    reply = `Your current balance is ₹${balance.toFixed(2)}. You have earned ₹${income.toFixed(2)} and spent ₹${expenses.toFixed(2)} in total.`;
  } else if (msg.includes("this month") && msg.includes("spend")) {
    reply = `This month you have spent ₹${thisMonthExpenses.toFixed(2)} and earned ₹${thisMonthIncome.toFixed(2)}.`;
  } else if (msg.includes("spend") || msg.includes("spent") || msg.includes("expense")) {
    reply = `Your total expenses are ₹${expenses.toFixed(2)}. This month you spent ₹${thisMonthExpenses.toFixed(2)}. Your recent expenses are: ${recentExpenses || "none yet"}.`;
  } else if (msg.includes("income") || msg.includes("earn")) {
    reply = `Your total income is ₹${income.toFixed(2)}. This month you earned ₹${thisMonthIncome.toFixed(2)}.`;
  } else if (msg.includes("saving") || msg.includes("save")) {
    if (savingsRate > 0) {
      reply = `Your savings rate is ${savingsRate.toFixed(1)}%. You are saving ₹${balance.toFixed(2)} overall. ${savingsRate > 20 ? "Great job! You are saving well." : "Try to save at least 20% of your income."}`;
    } else {
      reply = `You are currently spending more than you earn. Try to reduce expenses to start saving.`;
    }
  } else if (msg.includes("top") || msg.includes("biggest") || msg.includes("most") || msg.includes("category")) {
    if (topCategory) {
      reply = `Your biggest spending category is ${topCategory[0]} with ₹${topCategory[1].toFixed(2)} spent. Here is your full breakdown: ${byCategory.map(([name, amount]) => `${name}: ₹${Number(amount).toFixed(2)}`).join(", ")}.`;
    } else {
      reply = `You don't have any categorized expenses yet. Add categories to your transactions to see the breakdown.`;
    }
  } else if (msg.includes("tip") || msg.includes("advice") || msg.includes("suggest") || msg.includes("cut") || msg.includes("reduce")) {
    const tips = [];
    if (savingsRate < 20) tips.push("Try to save at least 20% of your income each month.");
    if (topCategory) tips.push(`Your biggest expense is ${topCategory[0]} at ₹${Number(topCategory[1]).toFixed(2)} — see if you can reduce it.`);
    if (balance < 0) tips.push("You are spending more than you earn. Cut non-essential expenses immediately.");
    tips.push("Track every expense no matter how small.");
    tips.push("Set a monthly budget for each category.");
    reply = tips.join(" ");
  } else if (msg.includes("transaction") || msg.includes("recent")) {
    reply = `Your recent expenses are: ${recentExpenses || "no expenses yet"}. You have ${transactions.length} total transactions.`;
  } else if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    reply = `Hello! I'm your finance assistant. Your balance is ₹${balance.toFixed(2)}. You can ask me about your spending, income, savings, or tips to save money!`;
  } else if (msg.includes("how are you")) {
    reply = `I'm doing great! Your finances show a balance of ₹${balance.toFixed(2)}. How can I help you today?`;
  } else {
    reply = `I can help you with: your balance (₹${balance.toFixed(2)}), spending (₹${expenses.toFixed(2)} total), income (₹${income.toFixed(2)} total), savings rate (${savingsRate.toFixed(1)}%), top categories, and money-saving tips. What would you like to know?`;
  }

  return NextResponse.json({ message: reply });
}