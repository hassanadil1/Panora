import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { clerkClient } from "@clerk/clerk-sdk-node";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set in .env.local");
}

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY is not set in .env.local");
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function syncUsers() {
  try {
    // Get all users from Clerk
    const users = await clerkClient.users.getUserList();
    
    console.log(`Found ${users.length} users in Clerk`);
    console.log('Convex URL:', process.env.NEXT_PUBLIC_CONVEX_URL);

    // First, let's check if we can query the users table
    try {
      const existingUsers = await convex.query(api.users.getAllUsers);
      console.log('Existing users in Convex:', existingUsers);
    } catch (error) {
      console.error('Error querying existing users:', error);
    }

    // Create each user in Convex
    for (const user of users) {
      try {
        if (!user.emailAddresses?.[0]?.emailAddress) {
          console.warn(`Skipping user ${user.id} - no email address`);
          continue;
        }

        const userData = {
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous User',
          email: user.emailAddresses[0].emailAddress,
          clerkId: user.id,
          imageUrl: user.imageUrl,
        };
        console.log('Inserting user data:', userData);
        
        const result = await convex.mutation(api.users.createUser, userData);
        console.log('Insert result:', result);
        console.log(`Synced user: ${user.emailAddresses[0].emailAddress}`);
      } catch (error) {
        console.error(`Error syncing user ${user.emailAddresses[0]?.emailAddress}:`, error);
      }
    }

    // Verify the data was inserted
    const allUsers = await convex.query(api.users.getAllUsers);
    console.log('All users in Convex after sync:', allUsers);

    console.log('Sync completed!');
  } catch (error) {
    console.error('Error syncing users:', error);
  }
}

syncUsers(); 