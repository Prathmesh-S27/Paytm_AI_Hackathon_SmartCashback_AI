"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { User, Store, Shield } from "lucide-react";
import { api } from "@/lib/api";
import type { User as UserType } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    // In a real app we'd fetch this. For MVP, we use hardcoded or fetched demo users.
    api.getUsers().then(res => setUsers(res)).catch(() => {
      // Fallback dummy data if backend is not up yet
      setUsers([
        { id: "u1", name: "Alice Customer", email: "alice@demo.com", role: "customer" },
        { id: "m1", name: "Bob Merchant", email: "bob@demo.com", role: "merchant" },
        { id: "a1", name: "Charlie Admin", email: "admin@demo.com", role: "admin" }
      ]);
    }).finally(() => setLoading(false));
  }, []);

  const handleSelectUser = (user: UserType) => {
    localStorage.setItem("currentUser", JSON.stringify(user));
    if (user.role === "customer") router.push("/customer");
    else if (user.role === "merchant") router.push("/merchant");
    else router.push("/admin");
  };

  const roles = [
    { id: "customer", title: "Customer", icon: User, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "hover:border-indigo-500/50" },
    { id: "merchant", title: "Merchant", icon: Store, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/50" },
    { id: "admin", title: "Admin", icon: Shield, color: "text-violet-400", bg: "bg-violet-500/10", border: "hover:border-violet-500/50" }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-slate-900/0 z-0" />
      
      <div className="max-w-4xl w-full z-10 relative">
        <div className="text-center mb-12 animate-slideUp">
          <h1 className="text-4xl font-bold mb-4">Select Your Role</h1>
          <p className="text-slate-400 text-lg">Choose a demo profile to continue</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roles.map((role, idx) => (
            <Card
              key={role.id}
              hoverLift
              onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
              className={`p-6 text-center cursor-pointer border transition-all animate-slideUp animate-delay-${(idx+1)*100} ${
                selectedRole === role.id ? role.border + " shadow-[0_0_20px_rgba(0,0,0,0.3)] border-opacity-100" : "border-slate-700/50"
              }`}
            >
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${role.bg} ${role.color}`}>
                <role.icon size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">{role.title}</h3>
              <p className="text-slate-400 text-sm">Log in as a demo {role.id}</p>
            </Card>
          ))}
        </div>

        {selectedRole && (
          <div className="animate-fadeIn">
            <h3 className="text-xl font-medium mb-4 text-center">Available Profiles</h3>
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {loading ? (
                <div className="col-span-2 text-center text-slate-400">Loading profiles...</div>
              ) : (
                users.filter(u => u.role === selectedRole).map(user => (
                  <Card key={user.id} hoverLift onClick={() => handleSelectUser(user)} className="p-4 flex items-center gap-4 cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-slate-400">{user.email}</div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
