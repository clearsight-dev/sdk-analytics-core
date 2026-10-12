import type { EventProperties } from './types';
/** A price: sdk-shopify's `Money`. */
export type MoneyForEvents = {
    amount: string;
    currencyCode: string;
};
/** The parts of a product the builders read: sdk-shopify's `Product` fits. */
export type ProductForEvents = {
    id: string;
    title: string;
    priceRange: {
        min: MoneyForEvents;
    };
    vendor?: string | null;
    productType?: string | null;
    availableForSale?: boolean;
    handle?: string;
    featuredImage?: {
        url: string;
    } | null;
};
/** The parts of a variant the builders read: sdk-shopify's `ProductVariant` fits. */
export type VariantForEvents = {
    id: string;
    title: string;
    price: MoneyForEvents;
};
/** The parts of a cart line the builders read: sdk-shopify's `CartLine` fits. */
export type CartLineForEvents = {
    quantity: number;
    merchandise: {
        id: string;
        title: string;
        price: MoneyForEvents;
    };
    product?: {
        id: string;
        title: string;
    } | null;
};
/** The parts of a cart the builders read: sdk-shopify's `Cart` fits. */
export type CartForEvents = {
    id: string;
    lines: CartLineForEvents[];
    cost: {
        subtotalAmount: MoneyForEvents;
        totalAmount: MoneyForEvents;
        totalTaxAmount?: MoneyForEvents | null;
    };
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
export type EventToSend = {
    name: string;
    properties: EventProperties;
};
/**
 * One product, one shape, wherever it is reported (`productView`, and each item of `collectionView`).
 * Without a variant the price is the range minimum: the number the shopper saw on the card.
 */
export declare function productParams(product: ProductForEvents, variant?: VariantForEvents | null): EventProperties;
/** The cart's currency, from its subtotal; `''` without a cart. */
export declare function cartCurrency(cart: CartForEvents | null | undefined): string;
/**
 * One cart line, in the engine's `items` shape. `quantity` is the line's whole quantity. `brand` and
 * `productType` are null rather than absent: a cart line doesn't carry them, and a present-but-empty
 * column reads better in the warehouse than a missing key.
 */
export declare function lineItemParams(line: CartLineForEvents, currency: string): EventProperties;
/** `{ currency, totalItems, totalValue, items }`: the engine's `viewCart` and `initiateCheckout` properties. */
export declare function checkoutParams(cart: CartForEvents | null | undefined): EventProperties;
/**
 * The `purchase` properties, the store's revenue number, in the engine's shape. `orderId` and
 * `orderName` are both the **cart** id, as the engine sent (the order's own id isn't known on the
 * thank-you page). Build it before the cart is reset: that's the last moment its lines exist.
 */
export declare function purchaseParams(cart: CartForEvents | null | undefined): EventProperties;
/** `{ totalQuantity, numberOfProducts }` for `updateCartQuantity`, counted as the engine counted. */
export declare function cartQuantityParams(cart: CartForEvents | null | undefined): EventProperties;
/**
 * `{ lineItems, actionType, cartId }` for `customUpdateCart`: what the platform's abandoned-cart
 * automations read, which is why `lineItems` keeps the engine's `merchandiseId` key rather than
 * `variantId`. `actionType` is the write: `'add'`, `'update'` or `'remove'`.
 */
export declare function customCartParams(cart: CartForEvents | null | undefined, actionType: string): EventProperties;
/** `{ userId, firstName, lastName, emailId, contactNumber }` for `login`: the engine's spelling, kept. */
export declare function authParams(customer: CustomerForEvents): EventProperties;
/**
 * The waitlist events' properties (`backInStockSubscription`, `cartHoldWaitlistSubscription`): who
 * is waiting, on which size of which product. The automation reads the customer from it, which is why
 * joining a waitlist needs sign-in.
 */
export declare function waitlistParams(product: Pick<ProductForEvents, 'id' | 'title' | 'handle' | 'featuredImage'>, variant: Pick<VariantForEvents, 'id' | 'title'>, customer: Pick<CustomerForEvents, 'id' | 'email'> | null): EventProperties;
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
export declare function liveJoinParams(streamId: string, viewerCount: number): EventProperties;
/**
 * One unit of one variant, as the show events carry it. `streamId` is the show's id as the app files
 * it: a recording's feed id (`Replay.id`), a live show's streaming id. `streamType` says which.
 */
export declare function streamItemParams(product: ProductForEvents, variant: VariantForEvents | null | undefined, streamId: string | null, streamType?: StreamType): EventProperties;
/**
 * The show's own copy of an add that landed: `replayAddToCart` for a recording, `streamAddToCart` for a
 * live show, each with `streamItemParams`. Send it beside the ordinary `addToCart`, never instead.
 */
export declare function showAddToCartEvent(product: ProductForEvents, variant: VariantForEvents | null | undefined, show: AddedFromShow): EventToSend;
/**
 * The shows a cart holds units from: sdk-shopify's `showsInCart(cart)`, read off the cart's
 * `_apptile_attribution`. `live` and `replay` are both the SHOWS' streaming ids (a replay is counted
 * under the show it records). One cart can hold units from several shows.
 */
export type ShowsInCart = {
    live: string[];
    replay: string[];
};
/** True when `shows` names at least one show: only then are `streamCheckout` and `streamPurchase` sent. */
export declare function cartHasShows(shows: ShowsInCart): boolean;
/** `streamCheckout`'s properties: `checkoutParams` plus the shows, as `streamIds` and `replayIds`. */
export declare function streamCheckoutParams(cart: CartForEvents | null | undefined, shows: ShowsInCart): EventProperties;
/** `streamPurchase`'s properties: `purchaseParams` plus the shows, as `streamIds` and `replayIds`. */
export declare function streamPurchaseParams(cart: CartForEvents | null | undefined, shows: ShowsInCart): EventProperties;
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
export declare function cartAndWishlistEvents(event: ShopifyEventForAnalytics): EventToSend[];
//# sourceMappingURL=eventParams.d.ts.map