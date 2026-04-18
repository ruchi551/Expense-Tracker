"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/expenses", label: "Transactions" },
    { href: "/budgets", label: "Budgets" },
    { href: "/reports", label: "Reports" },
    { href: "/categories", label: "Categories" },
  ];

  return (
    <nav style={{
      background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      padding: "0 2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "60px",
      boxShadow: "0 2px 10px rgba(99,102,241,0.3)",
    }}>
      <span style={{ color: "white", fontWeight: 700, fontSize: "18px" }}>
        💰 ExpenseTracker
      </span>

      <div style={{ display: "flex", gap: "8px" }}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              color: pathname === link.href ? "white" : "rgba(255,255,255,0.7)",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: pathname === link.href ? 600 : 400,
              padding: "6px 14px",
              borderRadius: "8px",
              background: pathname === link.href ? "rgba(255,255,255,0.2)" : "transparent",
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {session ? (
          <>
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>
              {session.user?.name || session.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "8px",
                padding: "6px 14px",
                fontSize: "13px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/login"
            style={{
              background: "white",
              color: "#6366f1",
              borderRadius: "8px",
              padding: "6px 14px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}