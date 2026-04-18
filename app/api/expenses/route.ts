import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getOrCreateTestUser() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: { email: "test@example.com", name: "Test User" },
    });
  }
  return user;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const period = searchParams.get("period");
  const search = searchParams.get("search");
  const categoryId = searchParams.get("categoryId");
  const minAmount = searchParams.get("minAmount");
  const maxAmount = searchParams.get("maxAmount");

  const now = new Date();
  let dateFilter = {};

  if (period === "daily") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    dateFilter = { date: { gte: start } };
  } else if (period === "weekly") {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    dateFilter = { date: { gte: start } };
  } else if (period === "monthly") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    dateFilter = { date: { gte: start } };
  }

  const expenses = await prisma.expense.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(search ? { description: { contains: search, mode: "insensitive" } } : {}),
      ...(minAmount ? { amount: { gte: parseFloat(minAmount) } } : {}),
      ...(maxAmount ? { amount: { lte: parseFloat(maxAmount) } } : {}),
      ...dateFilter,
    },
    include: { category: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(expenses);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { description, amount, date, categoryId, type } = body;
  const user = await getOrCreateTestUser();

  const expense = await prisma.expense.create({
    data: {
      description,
      amount: parseFloat(amount),
      date: new Date(date),
      type: type || "expense",
      userId: user.id,
      categoryId: categoryId || null,
    },
  });
  return NextResponse.json(expense);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, description, amount, date, categoryId, type } = body;

  const expense = await prisma.expense.update({
    where: { id },
    data: {
      description,
      amount: parseFloat(amount),
      date: new Date(date),
      type: type || "expense",
      categoryId: categoryId || null,
    },
  });
  return NextResponse.json(expense);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.expense.delete({ where: { id } });
  return NextResponse.json({ success: true });
}