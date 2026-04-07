import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const budgets = await prisma.budget.findMany({
    include: {
      categories: {
        include: { category: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(budgets);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, totalAmount, period, categories } = body;

  const budget = await prisma.budget.create({
    data: {
      name,
      totalAmount: parseFloat(totalAmount),
      period,
      categories: {
        create: categories.map((c: { categoryId: string; allocatedAmount: number }) => ({
          categoryId: c.categoryId,
          allocatedAmount: parseFloat(c.allocatedAmount.toString()),
        })),
      },
    },
    include: {
      categories: {
        include: { category: true },
      },
    },
  });
  return NextResponse.json(budget);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.budget.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
