"use client";
import { useState, useEffect } from "react";

type Category = { id: string; name: string; color: string };

const COLORS = [
  "#6366f1", "#f59e0b", "#10b981",
  "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899",
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [showForm, setShowForm] = useState(false);

  async function fetchCategories() {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  }

  useEffect(() => { fetchCategories(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    setName("");
    setColor(COLORS[0]);
    setShowForm(false);
    fetchCategories();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Categories</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add category
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">New category</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. Food"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Color</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="w-8 h-8 rounded-full border-2"
                      style={{
                        backgroundColor: c,
                        borderColor: color === c ? "#111" : "transparent",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Save category
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

        <div className="grid grid-cols-3 gap-4">
          {categories.length === 0 ? (
            <div className="col-span-3 bg-white rounded-xl border p-8 text-center text-gray-400 text-sm">
              No categories yet. Add your first one!
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-xl border p-4 flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-medium text-sm">{cat.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}