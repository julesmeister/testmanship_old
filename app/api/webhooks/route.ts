
import {
} from '@/utils/supabase-admin';
import { headers } from 'next/headers';

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'price.created',
  'price.updated',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted'
]);

export async function POST(req: Request) {
  return new Response(JSON.stringify({ received: true }));
}
