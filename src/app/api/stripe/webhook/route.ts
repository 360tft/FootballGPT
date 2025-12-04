import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Disable body parsing - we need the raw body for signature verification
export const dynamic = 'force-dynamic'

// Helper to extract subscription ID from various Stripe object types
function getSubscriptionId(
  sub: string | Stripe.Subscription | { id: string } | null | undefined
): string | null {
  if (!sub) return null
  if (typeof sub === 'string') return sub
  return sub.id
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const adminClient = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription' && session.subscription) {
          const subscriptionId = getSubscriptionId(session.subscription)

          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)

            // Get the user ID from metadata
            const userId = session.metadata?.supabase_user_id

            if (userId && 'current_period_end' in subscription) {
              const customerId = typeof session.customer === 'string'
                ? session.customer
                : (session.customer as Stripe.Customer | null)?.id

              await adminClient.from('subscriptions').upsert({
                user_id: userId,
                stripe_customer_id: customerId || '',
                stripe_subscription_id: subscription.id,
                status: subscription.status,
                current_period_end: new Date((subscription.current_period_end as number) * 1000).toISOString(),
              })
            }
          }
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Find the subscription by stripe_subscription_id and update it
        const { data: existingSubscription } = await adminClient
          .from('subscriptions')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (existingSubscription && 'current_period_end' in subscription) {
          await adminClient
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_end: new Date((subscription.current_period_end as number) * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }

        const subscriptionId = getSubscriptionId(invoice.subscription)

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          if ('current_period_end' in subscription) {
            await adminClient
              .from('subscriptions')
              .update({
                status: subscription.status,
                current_period_end: new Date((subscription.current_period_end as number) * 1000).toISOString(),
              })
              .eq('stripe_subscription_id', subscription.id)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }

        const subscriptionId = getSubscriptionId(invoice.subscription)

        if (subscriptionId) {
          await adminClient
            .from('subscriptions')
            .update({
              status: 'past_due',
            })
            .eq('stripe_subscription_id', subscriptionId)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
