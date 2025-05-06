import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env");
  }

  console.log("Received webhook from Clerk");

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing svix headers");
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log(`Processing Clerk webhook: ${eventType}`);

  try {
    // Handle user creation
    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      console.log(`User created: ${id}, ${email_addresses[0]?.email_address}`);

      try {
        const result = await convex.mutation(api.users.createUser, {
          name: `${first_name || ""} ${last_name || ""}`.trim() || "New User",
          email: email_addresses[0]?.email_address || `user-${id}@example.com`,
          clerkId: id,
          imageUrl: image_url || undefined,
          active: true,
        });
        console.log("User created in Convex:", result);
      } catch (error) {
        console.error("Error creating user in Convex:", error);
        return new Response("Error creating user in Convex", {
          status: 500,
        });
      }
    }

    // Handle user update
    else if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      console.log(`User updated: ${id}`);

      try {
        const result = await convex.mutation(api.users.updateUser, {
          clerkId: id,
          name: first_name && last_name ? `${first_name} ${last_name}`.trim() : undefined,
          email: email_addresses && email_addresses[0] ? email_addresses[0].email_address : undefined,
          imageUrl: image_url || undefined,
        });
        console.log("User updated in Convex:", result);
      } catch (error) {
        console.error("Error updating user in Convex:", error);
        return new Response("Error updating user in Convex", {
          status: 500,
        });
      }
    }

    // Handle user deletion
    else if (eventType === "user.deleted") {
      const { id } = evt.data;
      console.log(`User deleted: ${id}`);

      // Make sure id is a string
      if (!id) {
        console.error("Missing user ID in webhook payload");
        return new Response("Missing user ID", { status: 400 });
      }

      try {
        // Alternative approach - mark user as inactive instead of deleting
        const result = await convex.mutation(api.users.updateUser, {
          clerkId: id,
          active: false,
        });
        console.log("User marked as inactive in Convex:", result);
      } catch (error) {
        console.error("Error handling deleted user in Convex:", error);
        return new Response("Error handling deleted user in Convex", {
          status: 500,
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { 
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
} 