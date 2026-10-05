"use client";

import { useEffect, useState } from "react";
import { User } from "@/types";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    api.getAdminUsers().then(res => setUsers(res)).catch(console.error);
  }, []);

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-slate-400">Manage all registered users.</p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'merchant' ? 'success' : 'default'}>{u.role}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
