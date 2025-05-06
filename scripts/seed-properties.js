// Script to add mock property data to the Convex database
// Run this script with: node scripts/seed-properties.js

const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config();

// Use the development URL directly (from `npx convex deploy` output)
const CONVEX_URL = "https://limitless-dalmatian-309.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);

// First, we need to find a user
async function seedProperties() {
  try {
    console.log("Connecting to Convex at", CONVEX_URL);
    console.log("Fetching users...");
    const users = await convex.query("users:getAllUsers");
    
    if (!users || users.length === 0) {
      console.error("No users found in the database. Please create a user first.");
      return;
    }
    
    // Use the first user as the seller
    const user = users[0];
    console.log(`Using user ${user.name} (${user._id}) as the seller for properties`);
    
    // Option to clear existing properties first
    console.log("Clearing existing properties...");
    await convex.mutation("mockProperties:clearProperties");
    
    // Add properties with the user as the seller
    console.log("Adding mock properties...");
    const result = await convex.mutation("mockProperties:seedProperties", { 
      userId: user._id 
    });
    
    console.log("Success:", result.message);
    console.log("Property IDs:", result.propertyIds);
  } catch (error) {
    console.error("Error seeding properties:", error);
  }
}

seedProperties(); 