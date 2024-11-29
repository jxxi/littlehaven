/* eslint-disable @typescript-eslint/naming-convention */
import type { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

import { db } from '@/libs/DB'; // Assuming this is your Drizzle db instance
import { usersSchema } from '@/models/Schema'; // Your users table schema

export async function GET() {
  return Response.json({ message: 'Hello World!' });
}

export async function POST(req: Request) {
  // Get the webhook signing secret from your environment variables
  const { WEBHOOK_SECRET } = process.env;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local',
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  if (eventType === 'user.created') {
    // Handle user creation
    const { id, username } = evt.data;

    // Add your user creation logic here
    // For example, create a user in your database
    try {
      await db.insert(usersSchema).values({
        userId: id, // Use Clerk's user ID
        username: username || '',
      });
      return new Response('User created successfully', {
        status: 200,
      });
    } catch (err) {
      return new Response('Error creating user', {
        status: 500,
      });
    }
  }

  return new Response('Webhook received', {
    status: 200,
  });
}
