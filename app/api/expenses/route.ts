import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getOrCreateTestUser() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "test@example.com",
        name: "Test User",
      },
    });
  }
  return user;
}

export async function GET() {
  const expenses = await prisma.expense.findMany({
    include: { category: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(expenses);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { description, amount, date, categoryId } = body;
  const user = await getOrCreateTestUser();
  const expense = await prisma.expense.create({
    data: {
      description,
      amount: parseFloat(amount),
      date: new Date(date),
      userId: user.id,
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