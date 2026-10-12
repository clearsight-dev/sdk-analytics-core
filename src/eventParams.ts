// @tiledev/sdk-analytics-core — the payload builders: what each event carries, built from the
// Shopify objects an app already holds.
//
// Moved here from the apps (SDK move 7, 2026-10-06): amore-v2, amber-v2, Freckled Poppy, k-marie and
// krushkandy each kept the same copy. The shapes are the **Apptile engine's**, not this package's
// taste: every store's warehouse has columns named after what the engine sent, so a tidier key here is
// a null column there. That is why `emailId` and `contactNumber` are spelled as they are, why
// `customCartParams` says `merchandiseId`, and why `purchase` reports the **cart** id as its order id.
//
// The inputs are typed by the fields read, not by importing `@tiledev/sdk-shopify`, so this package
// stays dependency-free: sdk-shopify's `Product`, `ProductVariant`, `Cart`, `CartLine` and `Customer`
// all fit.

import type { EventProperties } from './types';
import { DefaultEvents } from './events';

// ─── The fields the builders read ─────────────────────────────────────────────

/** A price: sdk-shopify's `Money`. */
export type MoneyForEvents = { amount: string; currencyCode: string };

/** The parts of a product the builders read: sdk-shopify's `Product` fits. */
export type ProductForEvents = {
  id: string;
  title: string;
  priceRange: { min: MoneyForEvents };
  vendor?: string | null;
  productType?: string | null;
  availableForSale?: boolean;
  handle?: string;
  featuredImage?: { url: string } | null;
};

/** The parts of a variant the builders read: sdk-shopify's `ProductVariant` fits. */
export type VariantForEvents = { id: string; title: string; price: MoneyForEvents };

/** The parts of a cart line the builders read: sdk-shopify's `CartLine` fits. */
export type CartLineForEvents = {
  quantity: number;
  merchandise: { id: string; title: string; price: MoneyForEvents };
  product?: { id: string; title: string } | null;
};

/** The parts of a cart the builders read: sdk-shopify's `Cart` fits. */
export type CartForEvents = {
  id: string;
  lines: CartLineForEvents[];
  cost: { subtotalAmount: MoneyForEvents; totalAmount: MoneyForEvents; totalTaxAmount?: MoneyForEvents | null };
};

/** The parts of a customer the builders read: sdk-shopify's `Customer` fits. */
export type CustomerForEvents = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
};

/** One event to send: its name and its properties, for `analytics.track(name, properties)`. */
export type EventToSend = { name: string; properties: EventProperties };

// ─── Products and carts ───────────────────────────────────────────────────────

/**
 * One product, one shape, wherever it is reported (`productView`, and each item of `collectionView`).
 * Without a variant the price is the range minimum: the number the shopper saw on the card.
 */
export function productParams(product: ProductForEvents, variant?: VariantForEvents | null): EventProperties {
  return {
    productId: product.id,
    title: product.title,
    currency: product.priceRange.min.currencyCode,
    price: Number((variant?.price ?? product.priceRange.min).amount),
    brand: product.vendor || null,
    productType: product.productType || null,
    available: product.availableForSale,
  };
}

/** The cart's currency, from its subtotal; `''` without a cart. */
export function cartCurrency(cart: CartForEvents | null | undefined): string {
  return cart?.cost.subtotalAmount.currencyCode ?? '';
}

/**
 * One cart line, in the engine's `items` shape. `quantity` is the line's whole quantity. `brand` and
 * `productType` are null rather than absent: a cart line doesn't carry them, and a present-but-empty
 * column reads better in the warehouse than a missing key.
 */
export function lineItemParams(line: CartLineForEvents, currency: string): EventProperties {
  return {
    productId: line.product?.id ?? null,
    title: line.product?.title ?? null,
    currency,
    variantTitle: line.merchandise.title,
    variantId: line.merchandise.id,
    price: Number(line.merchandise.price.amount),
    quantity: line.quantity,
    brand: null,
    productType: null,
  };
}

/** `{ currency, totalItems, totalValue, items }`: the engine's `viewCart` and `initiateCheckout` properties. */
export function checkoutParams(cart: CartForEvents | null | undefined): EventProperties {
  const currency = cartCurrency(cart);
  return {
    currency,
    totalItems: cart?.lines.length ?? 0,
    totalValue: Number(cart?.cost.subtotalAmount.amount ?? 0),
    items: (cart?.lines ?? []).map((line) => lineItemParams(line, currency)),
  };
}

/**
 * The `purchase` properties, the store's revenue number, in the engine's shape. `orderId` and
 * `orderName` are both the **cart** id, as the engine sent (the order's own id isn't known on the
 * thank-you page). Build it before the cart is reset: that's the last moment its lines exist.
 */
export function purchaseParams(cart: CartForEvents | null | undefined): EventProperties {
  const currency = cartCurrency(cart);
  return {
    items: (cart?.lines ?? []).map((line) => lineItemParams(line, currency)),
    orderId: cart?.id ?? null,
    orderName: cart?.id ?? null,
    totalValue: Number(cart?.cost.totalAmount.amount ?? 0),
    currency,
    totalItems: cart?.lines.length ?? 0,
    taxPrice: Number(cart?.cost.totalTaxAmount?.amount ?? 0),
  };
}

/** `{ totalQuantity, numberOfProducts }` for `updateCartQuantity`, counted as the engine counted. */
export function cartQuantityParams(cart: CartForEvents | null | undefined): EventProperties {
  const lines = cart?.lines ?? [];
  return {
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    numberOfProducts: lines.filter((line) => line.quantity > 0).length,
  };
}

/**
 * `{ lineItems, actionType, cartId }` for `customUpdateCart`: what the platform's abandoned-cart
 * automations read, which is why `lineItems` keeps the engine's `merchandiseId` key rather than
 * `variantId`. `actionType` is the write: `'add'`, `'update'` or `'remove'`.
 */
export function customCartParams(cart: CartForEvents | null | undefined, actionType: string): EventProperties {
  return {
    lineItems: (cart?.lines ?? []).map((line) => ({
      merchandiseId: line.merchandise.id,
      quantity: line.quantity,
      productId: line.product?.id ?? null,
      title: line.product?.title ?? null,
    })),
    actionType,
    cartId: cart?.id ?? null,
  };
}

// ─── Shoppers ─────────────────────────────────────────────────────────────────

/** `{ userId, firstName, lastName, emailId, contactNumber }` for `login`: the engine's spelling, kept. */
export function authParams(customer: CustomerForEvents): EventProperties {
  return {
    userId: customer.id,
    firstName: customer.firstName ?? '',
    lastName: customer.lastName ?? '',
    emailId: customer.email ?? '',
    contactNumber: customer.phone ?? '',
  };
}

/**
 * The waitlist events' properties (`backInStockSubscription`, `cartHoldWaitlistSubscription`): who
 * is waiting, on which size of which product. The automation reads the customer from it, which is why
 * joining a waitlist needs sign-in.
 */
export function waitlistParams(
  product: Pick<ProductForEvents, 'id' | 'title' | 'handle' | 'featuredImage'>,
  variant: Pick<VariantForEvents, 'id' | 'title'>,
  customer: Pick<CustomerForEvents, 'id' | 'email'> | null,
): EventProperties {
  return {
    variantId: variant.id,
    productId: product.id,
    productTitle: product.title,
    productHandle: product.handle,
    featuredImage: product.featuredImage?.url ?? '',
    variantTitle: variant.title,
    customerId: customer?.id ?? '',
    customerEmail: customer?.email ?? '',
  };
}

// ─── Live selling ─────────────────────────────────────────────────────────────

/** Which kind of show an add is credited to: on air, or its recording. The engine's wire values. */
export type StreamType = 'live-stream' | 'replay';

/** The show an add is credited to. */
export type AddedFromShow = {
  streamType: StreamType;
  /** A recording's feed id (`Replay.id`), or a live show's streaming id. */
  streamId: string;
};

/**
 * `liveJoin`'s properties: the show's streaming id, the viewer count as it stood on arrival, and the
 * engine widget's constants for the type and source, so its dashboard rows aggregate with these.
 */
export function liveJoinParams(streamId: string, viewerCount: number): EventProperties {
  return { streamId, count: viewerCount, streamType: 'live-stream', streamFrom: 'broadcaster-app' };
}

/**
 * One unit of one variant, as the show events carry it. `streamId` is the show's id as the app files
 * it: a recording's feed id (`Replay.id`), a live show's streaming id. `streamType` says which.
 */
export function streamItemParams(
  product: ProductForEvents,
  variant: VariantForEvents | null | undefined,
  streamId: string | null,
  streamType: StreamType = 'live-stream',
): EventProperties {
  return {
    currency: product.priceRange.min.currencyCode,
    price: Number((variant?.price ?? product.priceRange.min).amount),
    productId: product.id,
    quantity: 1,
    title: product.title,
    variantId: variant?.id ?? null,
    variantTitle: variant?.title ?? null,
    streamId,
    streamType,
  };
}

/**
 * The show's own copy of an add that landed: `replayAddToCart` for a recording, `streamAddToCart` for a
 * live show, each with `streamItemParams`. Send it beside the ordinary `addToCart`, never instead.
 */
export function showAddToCartEvent(
  product: ProductForEvents,
  variant: VariantForEvents | null | undefined,
  show: AddedFromShow,
): EventToSend {
  const name = show.streamType === 'replay' ? DefaultEvents.REPLAY_ADD_TO_CART : DefaultEvents.STREAM_ADD_TO_CART;
  return { name, properties: streamItemParams(product, variant, show.streamId, show.streamType) };
}

/**
 * The shows a cart holds units from: sdk-shopify's `showsInCart(cart)`, read off the cart's
 * `_apptile_attribution`. `live` and `replay` are both the SHOWS' streaming ids (a replay is counted
 * under the show it records). One cart can hold units from several shows.
 */
export type ShowsInCart = { live: string[]; replay: string[] };

/** True when `shows` names at least one show: only then are `streamCheckout` and `streamPurchase` sent. */
export function cartHasShows(shows: ShowsInCart): boolean {
  return shows.live.length > 0 || shows.replay.length > 0;
}

/** `streamCheckout`'s properties: `checkoutParams` plus the shows, as `streamIds` and `replayIds`. */
export function streamCheckoutParams(cart: CartForEvents | null | undefined, shows: ShowsInCart): EventProperties {
  return { ...checkoutParams(cart), streamIds: shows.live, replayIds: shows.replay };
}

/** `streamPurchase`'s properties: `purchaseParams` plus the shows, as `streamIds` and `replayIds`. */
export function streamPurchaseParams(cart: CartForEvents | null | undefined, shows: ShowsInCart): EventProperties {
  return { ...purchaseParams(cart), streamIds: shows.live, replayIds: shows.replay };
}

// ─── What a cart or wishlist change reports ───────────────────────────────────

/** One line a cart write changed: sdk-shopify's `CartLineChange` fits. */
export type CartLineChangeForEvents = {
  /** The line after the write; for a line the write took out of the cart, the line as it was. */
  line: CartLineForEvents;
  /** Units added (above 0) or taken away (below 0). */
  quantityChange: number;
};

/**
 * The parts of an sdk-shopify `ShopifyEvent` read here: its `type`, and what the write changed.
 * sdk-shopify's `ShopifyEvent` fits (0.10 and later carry `cart`, `changedLines` and `productId`).
 */
export type ShopifyEventForAnalytics = {
  type: string;
  cart?: CartForEvents | null;
  changedLines?: CartLineChangeForEvents[];
  productId?: string;
  /** The shows the cart holds units from, on sdk-shopify's `checkout:started` (0.14.0). */
  shows?: ShowsInCart;
};

/**
 * The events the engine reported for a cart or wishlist change, in order, for an sdk-shopify event.
 * Anything else (sign-in, alerts, a placed order) is `[]`: sign-in is the app's to report, because it
 * depends on how the app signs shoppers in.
 *
 * - `cart:add`: for each line that grew, `updateCart` then `addToCart`, both with the line as it is now
 *   (its whole quantity, as the engine reported it); then `updateCartQuantity` and `customUpdateCart`.
 * - `cart:update` (a quantity changed on the cart page): `updateCartQuantity` and `customUpdateCart`.
 * - `cart:remove`: for each line that went, `removeFromCart` with `quantity` = how many went; then
 *   `updateCartQuantity` and `customUpdateCart`.
 * - `wishlist:add` / `wishlist:remove`: `addToWishlist` / `removeFromWishlist` with `{ productId }`.
 * - `cart:viewed` (sdk-shopify 0.14.0's `useCartPage().viewed()`): `viewCart` with `checkoutParams`.
 * - `checkout:started` (its `checkout.start()`): `initiateCheckout` with `checkoutParams`, then
 *   `streamCheckout` beside it when the cart holds a show's units (`shows`; Freckled Poppy's event).
 *   Both moved from amore-v2's Cart, which sent them itself (0.3.1).
 */
export function cartAndWishlistEvents(event: ShopifyEventForAnalytics): EventToSend[] {
  const toSend: EventToSend[] = [];

  if (event.type === 'cart:add' || event.type === 'cart:update' || event.type === 'cart:remove') {
    const cart = event.cart ?? null;
    const currency = cartCurrency(cart);
    const actionType = event.type.split(':')[1];

    for (const change of event.changedLines ?? []) {
      if (event.type === 'cart:add' && change.quantityChange > 0) {
        const item = lineItemParams(change.line, currency);
        toSend.push({ name: DefaultEvents.UPDATE_CART, properties: item });
        toSend.push({ name: DefaultEvents.ADD_TO_CART, properties: item });
      }
      if (event.type === 'cart:remove' && change.quantityChange < 0) {
        toSend.push({
          name: DefaultEvents.REMOVE_FROM_CART,
          properties: { ...lineItemParams(change.line, currency), quantity: -change.quantityChange },
        });
      }
    }

    toSend.push({ name: DefaultEvents.UPDATE_CART_QUANTITY, properties: cartQuantityParams(cart) });
    toSend.push({ name: DefaultEvents.CUSTOM_UPDATE_CART, properties: customCartParams(cart, actionType) });
    return toSend;
  }

  if (event.type === 'cart:viewed') {
    toSend.push({ name: DefaultEvents.VIEW_CART, properties: checkoutParams(event.cart ?? null) });
    return toSend;
  }
  if (event.type === 'checkout:started') {
    const cart = event.cart ?? null;
    toSend.push({ name: DefaultEvents.INITIATE_CHECKOUT, properties: checkoutParams(cart) });
    if (event.shows && cartHasShows(event.shows)) {
      toSend.push({ name: DefaultEvents.STREAM_CHECKOUT, properties: streamCheckoutParams(cart, event.shows) });
    }
    return toSend;
  }

  if (event.type === 'wishlist:add') {
    toSend.push({ name: DefaultEvents.ADD_TO_WISHLIST, properties: { productId: event.productId ?? null } });
  }
  if (event.type === 'wishlist:remove') {
    toSend.push({ name: DefaultEvents.REMOVE_FROM_WISHLIST, properties: { productId: event.productId ?? null } });
  }
  return toSend;
}
