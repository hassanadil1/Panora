"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function UsersPage() {
  const users = useQuery(api.users.getAllUsers);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Users in Convex DB</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(users, null, 2)}
      </pre>
    </div>
  );
} 