"use client";

import { useUser, useOrganization } from "@clerk/nextjs";

export default function ClerkUsersPage() {
  const { user } = useUser();
  const { organization } = useOrganization();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Current Clerk User</h1>
      <pre className="bg-gray-100 p-4 rounded mb-8">
        {JSON.stringify(user, null, 2)}
      </pre>

      <h2 className="text-xl font-bold mb-4">User Details</h2>
      <div className="space-y-4">
        <div>
          <strong>ID:</strong> {user?.id}
        </div>
        <div>
          <strong>Name:</strong> {user?.firstName} {user?.lastName}
        </div>
        <div>
          <strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress}
        </div>
        <div>
          <strong>Image:</strong> {user?.imageUrl}
        </div>
      </div>
    </div>
  );
} 