import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const expenses = await prisma.expense.findMany({
    orderBy: { date: "desc" },
    take: 5,
    include: { category: true },
  });

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const count = await prisma.expense.count();
  const categoryCount = await prisma.category.count();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-8">Welcome to your expense tracker!</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border p-6">
            <p className="text-sm text-gray-500 mb-1">Total spent</p>
            <p className="text-2xl font-semibold">${total.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <p className="text-sm text-gray-500 mb-1">Total expenses</p>
            <p className="text-2xl font-semibold">{count}</p>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <p className="text-sm text-gray-500 mb-1">Categories</p>
            <p className="text-2xl font-semibold">{categoryCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Recent expenses</h2>
            <Link href="/expenses" className="text-sm text-gray-500 hover:text-black">
              View all →
            </Link>
          </div>
          {expenses.length === 0 ? (
            <p className="text-gray-400 text-sm">No expenses yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{expense.description}</td>
                    <td className="py-3 text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right font-medium">
                      ${expense.amount.toFixed(2)}
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