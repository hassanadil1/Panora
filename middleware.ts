import { authMiddleware } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default authMiddleware({
  async afterAuth(auth, req) {
    console.log("Auth middleware triggered", { userId: auth.userId, sessionClaims: auth.sessionClaims });
    
    if (auth.userId) {
      try {
        const userData = {
          name: (auth.sessionClaims?.name as string) || "",
          email: (auth.sessionClaims?.email as string) || "",
          clerkId: auth.userId,
          imageUrl: (auth.sessionClaims?.picture as string) || "",
        };
        console.log("Creating user in Convex with data:", userData);
        
        const result = await convex.mutation(api.users.createUser, userData);
        console.log("User created in Convex:", result);
      } catch (error) {
        console.error("Error syncing user with Convex:", error);
      }
    }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 