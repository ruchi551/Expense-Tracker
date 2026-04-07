"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

 const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/expenses", label: "Expenses" },
  { href: "/budgets", label: "Budgets" },
  { href: "/categories", label: "Categories" },
];

  return (
    <nav className="bg-white border-b px-8 py-4 flex items-center justify-between">
      <span className="font-semibold text-lg">ExpenseTracker</span>
      <div className="flex gap-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm ${
              pathname === link.href
                ? "text-black font-medium"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}