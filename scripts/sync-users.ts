import { config } from "dotenv";
import { resolve } from "path";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { clerkClient } from "@clerk/nextjs/server";

// Load .env.local
config({ path: resolve(process.cwd(), ".env.local") });

// Debug environment variables
console.log("Environment variables loaded:");
console.log("NEXT_PUBLIC_CONVEX_URL:", process.env.NEXT_PUBLIC_CONVEX_URL);
console.log("CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY?.slice(0, 10) + "...");

if (!process.env.CLERK_SECRET_KEY) {
  console.error("CLERK_SECRET_KEY is not set in .env.local");
  process.exit(1);
}

// Initialize clients
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function syncUsers() {
  try {
    // Get all users from Clerk
    const response = await clerkClient.users.getUserList();
    const clerkUsers = response.data;
    console.log(`Found ${clerkUsers.length} users in Clerk`);

    // Sync each user to Convex
    for (const user of clerkUsers) {
      try {
        await convex.mutation(api.users.createUser, {
          name: `${user.firstName} ${user.lastName}`,
          email: user.emailAddresses[0]?.emailAddress || "",
          clerkId: user.id,
          imageUrl: user.imageUrl,
        });
        console.log(`Synced user: ${user.firstName} ${user.lastName}`);
      } catch (error) {
        console.error(`Error syncing user ${user.id}:`, error);
      }
    }

    console.log("Sync completed!");
  } catch (error) {
    console.error("Error syncing users:", error);
  }
}

syncUsers(); 