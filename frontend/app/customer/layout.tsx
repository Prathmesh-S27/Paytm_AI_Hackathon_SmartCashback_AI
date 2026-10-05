"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User as UserType } from "@/types";
import { LayoutDashboard, Map, Receipt, Sparkles, LogOut, Menu, X, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      router.push("/login");
    }
  }, [router]);

  const navLinks = [
    { href: "/customer", label: "Overview", icon: LayoutDashboard },
    { href: "/customer/map", label: "Map", icon: Map },
    { href: "/customer/transactions", label: "Transactions", icon: Receipt },
    { href: "/customer/recommendations", label: "Recommendations", icon: Sparkles },
    { href: "/customer/vouchers", label: "My Vouchers", icon: Ticket },
  ];

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/login");
  };

  if (!user) return <div className="min-h-screen bg-slate-900 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900 z-20">
        <div className="font-bold text-xl text-indigo-400">CashbackMVP</div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-400 p-2">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed md:static inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-10 flex flex-col transition-transform duration-300 md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:block">
          <div className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
            CashbackMVP
          </div>
        </div>

        <div className="p-4 border-b border-slate-800/50 mb-4 md:mt-0 mt-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-slate-50">{user.name}</div>
              <div className="text-xs text-slate-400 capitalize">{user.role}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group text-sm font-medium",
                  isActive 
                    ? "bg-indigo-500/10 text-indigo-400" 
                    : "text-slate-400 hover:text-slate-50 hover:bg-slate-800/50"
                )}
              >
                <link.icon size={18} className={isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-slate-400 hover:text-red-400 hover:bg-red-500/10 w-full text-sm font-medium"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
