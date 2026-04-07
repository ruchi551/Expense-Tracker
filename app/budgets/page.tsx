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
  const [selectedCategories, setSelectedCategories] = useState
    { categoryId: string; allocatedAmount: string }[]
  >([]);

  async function fetchAll() {
    const [budgetRes, catRes] = await Promise.all([
      fetch("/api/budgets"),
      fetch("/api/categories"),
    ]);
    setBudgets(await budgetRes.json());
    setCategories(await catRes.json());
  }

  useEffect(() => {
    fetchAll();
  }, []);

  function addCategoryRow() {
    setSelectedCategories([
      ...selectedCategories,
      { categoryId: "", allocatedAmount: "" },
    ]);
  }

  function updateCategoryRow(
    index: number,
    field: string,
    value: string
  ) {
    const updated = [...selectedCategories];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedCategories(updated);
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
        categories: selectedCategories.filter(
          (c) => c.categoryId && c.allocatedAmount
        ),
      }),
    });
    setName("");
    setTotalAmount("");
    setPeriod("monthly");
    setSelectedCategories([]);
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Budgets</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add budget
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">New budget</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Budget name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g. Monthly budget"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Total amount ($)</label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Period</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-600">Category limits</label>
                  <button
                    type="button"
                    onClick={addCategoryRow}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    + Add category
                  </button>
                </div>
                {selectedCategories.map((row, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select
                      value={row.categoryId}
                      onChange={(e) => updateCategoryRow(index, "categoryId", e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={row.allocatedAmount}
                      onChange={(e) => updateCategoryRow(index, "allocatedAmount", e.target.value)}
                      className="w-32 border rounded-lg px-3 py-2 text-sm"
                      placeholder="Amount"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Save budget
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

        <div className="space-y-4">
          {budgets.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center text-gray-400 text-sm">
              No budgets yet. Click "+ Add budget" to get started!
            </div>
          ) : (
            budgets.map((budget) => (
              <div key={budget.id} className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-semibold text-lg">{budget.name}</h2>
                    <p className="text-sm text-gray-500 capitalize">{budget.period} · ${budget.totalAmount.toFixed(2)} total</p>
                  </div>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    Delete
                  </button>
                </div>
                {budget.categories.length > 0 && (
                  <div className="space-y-3">
                    {budget.categories.map((bc) => (
                      <div key={bc.id}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: bc.category.color }}
                            />
                            {bc.category.name}
                          </span>
                          <span className="text-gray-500">
                            ${bc.allocatedAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              backgroundColor: bc.category.color,
                              width: `${Math.min(
                                (bc.allocatedAmount / budget.totalAmount) * 100,
                                100
                              ).toFixed(0)}%`,
                            }}
                          />
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