"use client";
import { useState, useEffect } from "react";

type Category = { id: string; name: string; color: string };
type Expense = {
  id: string;
  description: string;
  amount: number;
  date: string;
  category?: Category;
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchAll() {
    const [expRes, catRes] = await Promise.all([
      fetch("/api/expenses"),
      fetch("/api/categories"),
    ]);
    setExpenses(await expRes.json());
    setCategories(await catRes.json());
    setLoading(false);
  }

  useEffect(() => { fetchAll(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, amount, date, categoryId }),
    });
    setDescription("");
    setAmount("");
    setDate("");
    setCategoryId("");
    setShowForm(false);
    fetchAll();
  }

  async function handleDelete(id: string) {
    await fetch("/api/expenses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchAll();
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Expenses</h1>
            <p className="text-gray-500 text-sm mt-1">
              Total: ${total.toFixed(2)}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add expense
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">New expense</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g. Lunch"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">No category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Save expense
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="border px-4 py-2 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl border">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : expenses.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No expenses yet. Click "+ Add expense" to get started!
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 text-gray-500 font-medium">Description</th>
                  <th className="text-left p-4 text-gray-500 font-medium">Category</th>
                  <th className="text-left p-4 text-gray-500 font-medium">Date</th>
                  <th className="text-right p-4 text-gray-500 font-medium">Amount</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b last:border-0">
                    <td className="p-4 font-medium">{expense.description}</td>
                    <td className="p-4">
                      {expense.category ? (
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: expense.category.color + "20",
                            color: expense.category.color,
                          }}
                        >
                          {expense.category.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right font-medium">
                      ${expense.amount.toFixed(2)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        Delete
                      </button>
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