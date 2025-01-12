import { getEnvVariable, elizaLogger } from './index';
import { UUID, IDatabaseAdapter } from './types';

const stripeSecretKey = getEnvVariable('STRIPE_SECRET_KEY');

export const createStripeCustomer = async ({
    email,
    name,
    userId,
    source,
    rateCardId
}: {
    email: string;
    name?: string;
    userId: UUID;
    source?: string;
    rateCardId: string;
}): Promise<{ customerId: string; rateCardSubscriptionId: string }> => {
    try {
        // Create a test clock for testing purposes
        const currentTime = Math.floor(Date.now() / 1000);
        elizaLogger.info("Current time:", currentTime);
        const testClockResponse = await fetch('https://api.stripe.com/v1/test_helpers/test_clocks', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Stripe-Version': '2024-12-18.acacia'
            },
            body: new URLSearchParams({
                frozen_time: currentTime.toString()
            }).toString()
        });

        const testClockResponseText = await testClockResponse.text();
        const testClock = JSON.parse(testClockResponseText);
        const testClockId = testClock.id;
        elizaLogger.info(`Stripe test clock created:`, testClock);

        // First API call - Create Customer
        elizaLogger.info('Attempting to create Stripe customer with:', {
            email,
            name,
            hasSecretKey: !!stripeSecretKey
        });

        const customerResponse = await fetch('https://api.stripe.com/v1/customers', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Stripe-Version': '2024-12-18.acacia'
            },
            body: new URLSearchParams({
                email,
                ...(name && { name }),
                test_clock: testClockId,
                'metadata[userId]': userId,
                'metadata[source]': source || 'Unknown'
            }).toString()
        });

        const customerResponseText = await customerResponse.text();

        if (!customerResponse.ok) {
            throw new Error(`Stripe Customer API error: ${customerResponse.status} - ${customerResponseText}`);
        }

        const stripeCustomer = JSON.parse(customerResponseText);
        const customerId = stripeCustomer.id;
        elizaLogger.success(`Stripe customer created for ${email}:`, stripeCustomer);

        // Second API call - Create Payer
        elizaLogger.info('Attempting to create Stripe payer for the customer:', customerId);

        const payerResponse = await fetch('https://api.stripe.com/v2/billing/payers', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Content-Type': 'application/json',
                'Stripe-Version': '2024-12-18.acacia'
            },
            body: JSON.stringify({  // Using JSON.stringify instead of URLSearchParams
                customer: customerId
            })
        });

        const payerResponseText = await payerResponse.text();

        if (!payerResponse.ok) {
            throw new Error(`Stripe payer API error: ${payerResponse.status} - ${payerResponseText}`);
        }

        const payer = JSON.parse(payerResponseText);
        const payerId = payer.id;
        elizaLogger.success(`Stripe payer created for customer ${customerId}:`, payerId);

        // Third API call - get the cadence cycle from the rate card
        elizaLogger.info('Attempting to get the cadence  cycle from the rate card:', customerId);

        const billingCycleResponse = await fetch('https://api.stripe.com/v2/billing/rate_cards/' + rateCardId, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Content-Type': 'application/json',
                'Stripe-Version': '2024-12-18.acacia'
            }
        });

        const billingCycleResponseText = await billingCycleResponse.text();

        if (!billingCycleResponse.ok) {
            throw new Error(`Stripe billing cycle API error: ${billingCycleResponse.status} - ${billingCycleResponseText}`);
        }

        const billingCycle = JSON.parse(billingCycleResponseText);
        const cadenceCycle = billingCycle.service_interval;
        const cadenceInterval = billingCycle.service_interval_count;
        const rateCardVersion = billingCycle.latest_version;
        elizaLogger.success(`Stripe billing cycle retrieved for rate card ${rateCardId}: Cycle: ${cadenceCycle} - Interval: ${cadenceInterval}`);

        // Fourth API call - Create Cadence
        elizaLogger.info(`Attempting to create Stripe cadenec for the customer: ${customerId} - payer: ${payerId}`);

        const cadenceResponse = await fetch('https://api.stripe.com/v2/billing/cadences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Content-Type': 'application/json',
                'Stripe-Version': '2024-12-18.acacia'
            },
            body: JSON.stringify({
                payer: payerId,
                billing_cycle: {
                    type: cadenceCycle,
                    interval_count: cadenceInterval
                }
            })
        });

        const cadenceResponseText = await cadenceResponse.text();

        if (!cadenceResponse.ok) {
            throw new Error(`Stripe cadence API error: ${cadenceResponse.status} - ${cadenceResponseText}`);
        }

        const cadence = JSON.parse(cadenceResponseText);
        const cadenceId = cadence.id;
        elizaLogger.success(`Stripe cadence created for customer ${customerId}:`, cadenceId);

        // Fifth API call - Create Rate Card Subscription
        elizaLogger.info('Attempting to create Stripe rate card subscription for the customer:', customerId);
        elizaLogger.success(`Attempting to create Stripe rate card subscription for the customer: ${customerId} - payer: ${payerId} - cadence: ${cadenceId} - rate card: ${rateCardId}`);

        const rateCardSubscriptionResponse = await fetch('https://api.stripe.com/v2/billing/rate_card_subscriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Content-Type': 'application/json',
                'Stripe-Version': '2024-12-18.acacia'
            },
            body: JSON.stringify({
                rate_card: rateCardId,
                rate_card_version: rateCardVersion,
                billing_cadence: cadenceId
            })
        });

        const rateCardSubscriptionResponseText = await rateCardSubscriptionResponse.text();

        if (!rateCardSubscriptionResponse.ok) {
            throw new Error(`Stripe rate card subscription API error: ${rateCardSubscriptionResponse.status} - ${rateCardSubscriptionResponseText}`);
        }

        const rateCardSubscription = JSON.parse(rateCardSubscriptionResponseText);
        const rateCardSubscriptionId = rateCardSubscription.id;
        elizaLogger.success(`Stripe rate card subscription created:`, rateCardSubscriptionId);

        return {
            customerId: customerId,
            rateCardSubscriptionId: rateCardSubscriptionId
        };

    } catch (error) {
        elizaLogger.error('Error making Stripe API call:', {
            error,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

//record meter event
export const recordStripeEvent = async ({ customerId, eventName, value }: { customerId: string, eventName: string, value: string }) => {
    elizaLogger.info(`Recording stripe event for: ${customerId} - ${eventName}`);
    // call meter v2 api call
    const meterEventResponse = await fetch('https://api.stripe.com/v2/billing/meter_events', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${stripeSecretKey}`,
            'Content-Type': 'application/json',
            'Stripe-Version': '2024-12-18.acacia'
        },
        body: JSON.stringify({
            event_name: eventName,
            payload: {
                stripe_customer_id: customerId,
                value: value
            }
        })
    });

    const meterEventResponseText = await meterEventResponse.text();
    const meterEvent = JSON.parse(meterEventResponseText);

    if (!meterEventResponse.ok) {
        throw new Error(`Stripe meter event API error: ${meterEventResponse.status} - ${meterEventResponseText}`);
    } else {
        elizaLogger.success(`Stripe meter event recorded: ${meterEvent}`);
    }

    return meterEvent;
};

// get Checkout session link
export const getCheckoutSession = async ({ customerId, url }: { customerId: string, url: string }) => {
    elizaLogger.info(`Getting Checkout session link for: ${customerId} - Return URL: ${url}`);
    // call meter v2 api call
    const checkoutSessionResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Stripe-Version': '2024-12-18.acacia'
        },
        body: new URLSearchParams({
            mode: 'setup',
            success_url: url,
            currency: 'usd',
            customer: customerId
        }).toString()
    });

    const checkoutSessionResponseText = await checkoutSessionResponse.text();
    const checkoutSession = JSON.parse(checkoutSessionResponseText);
    const checkoutSessionUrl = checkoutSession.url;

    if (!checkoutSessionResponse.ok) {
        throw new Error(`Stripe Checkout Session API error: ${checkoutSessionResponse.status} - ${checkoutSessionResponseText}`);
    } else {
        elizaLogger.success(`Stripe Checkout Session URL: ${checkoutSessionUrl}`);
    }

    return checkoutSessionUrl;
};

// get Customer Portal session link
export const getPortalSession = async ({ customerId, url }: { customerId: string, url: string }) => {
    elizaLogger.info(`Getting Customer Portal session link for: ${customerId} - Return URL: ${url}`);
    // call meter v2 api call
    const portalSessionResponse = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Stripe-Version': '2024-12-18.acacia'
        },
        body: new URLSearchParams({
            customer: customerId,
            return_url: url
        }).toString()
    });

    const portalSessionResponseText = await portalSessionResponse.text();
    const portalSession = JSON.parse(portalSessionResponseText);
    const portalSessionUrl = portalSession.url;

    if (!portalSessionResponse.ok) {
        throw new Error(`Stripe Customer Portal API error: ${portalSessionResponse.status} - ${portalSessionResponseText}`);
    } else {
        elizaLogger.success(`Stripe Customer Portal URL: ${portalSessionUrl}`);
    }

    return portalSessionUrl;
};