import { SignedInAuthObject } from "@clerk/nextjs/server";

declare module "@clerk/nextjs/server" {
  interface SignedInAuthObject {
    userId: string;
    user: {
      firstName: string | null;
      lastName: string | null;
      imageUrl: string | null;
      emailAddresses: Array<{
        emailAddress: string;
      }>;
    };
  }
} 