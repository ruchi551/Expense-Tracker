import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const DEFAULT_CATEGORIES = [
  { name: "Food", color: "#f59e0b" },
  { name: "Transport", color: "#3b82f6" },
  { name: "Shopping", color: "#8b5cf6" },
  { name: "Health", color: "#10b981" },
  { name: "Entertainment", color: "#ec4899" },
  { name: "Education", color: "#6366f1" },
  { name: "Other", color: "#6b7280" },
];

async function seedCategories() {
  const count = await prisma.category.count();
  if (count === 0) {
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES,
    });
  }
}

export async function GET() {
  await seedCategories();
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, color } = body;
  const category = await prisma.category.create({
    data: { name, color },
  });
  return NextResponse.json(category);
}