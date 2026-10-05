"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.productParams = productParams;
exports.cartCurrency = cartCurrency;
exports.lineItemParams = lineItemParams;
exports.checkoutParams = checkoutParams;
exports.purchaseParams = purchaseParams;
exports.cartQuantityParams = cartQuantityParams;
exports.customCartParams = customCartParams;
exports.authParams = authParams;
exports.waitlistParams = waitlistParams;
exports.liveJoinParams = liveJoinParams;
exports.streamItemParams = streamItemParams;
exports.showAddToCartEvent = showAddToCartEvent;
exports.cartHasShows = cartHasShows;
exports.streamCheckoutParams = streamCheckoutParams;
exports.streamPurchaseParams = streamPurchaseParams;
exports.cartAndWishlistEvents = cartAndWishlistEvents;
const events_1 = require("./events");
// ─── Products and carts ───────────────────────────────────────────────────────
/**
 * One product, one shape, wherever it is reported (`productView`, and each item of `collectionView`).
 * Without a variant the price is the range minimum: the number the shopper saw on the card.
 */
function productParams(product, variant) {
    var _a;
    return {
        productId: product.id,
        title: product.title,
        currency: product.priceRange.min.currencyCode,
        price: Number(((_a = variant === null || variant === void 0 ? void 0 : variant.price) !== null && _a !== void 0 ? _a : product.priceRange.min).amount),
        brand: product.vendor || null,
        productType: product.productType || null,
        available: product.availableForSale,
    };
}
/** The cart's currency, from its subtotal; `''` without a cart. */
function cartCurrency(cart) {
    var _a;
    return (_a = cart === null || cart === void 0 ? void 0 : cart.cost.subtotalAmount.currencyCode) !== null && _a !== void 0 ? _a : '';
}
/**
 * One cart line, in the engine's `items` shape. `quantity` is the line's whole quantity. `brand` and
 * `productType` are null rather than absent: a cart line doesn't carry them, and a present-but-empty
 * column reads better in the warehouse than a missing key.
 */
function lineItemParams(line, currency) {
    var _a, _b, _c, _d;
    return {
        productId: (_b = (_a = line.product) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null,
        title: (_d = (_c = line.product) === null || _c === void 0 ? void 0 : _c.title) !== null && _d !== void 0 ? _d : null,
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
function checkoutParams(cart) {
    var _a, _b, _c;
    const currency = cartCurrency(cart);
    return {
        currency,
        totalItems: (_a = cart === null || cart === void 0 ? void 0 : cart.lines.length) !== null && _a !== void 0 ? _a : 0,
        totalValue: Number((_b = cart === null || cart === void 0 ? void 0 : cart.cost.subtotalAmount.amount) !== null && _b !== void 0 ? _b : 0),
        items: ((_c = cart === null || cart === void 0 ? void 0 : cart.lines) !== null && _c !== void 0 ? _c : []).map((line) => lineItemParams(line, currency)),
    };
}
/**
 * The `purchase` properties, the store's revenue number, in the engine's shape. `orderId` and
 * `orderName` are both the **cart** id, as the engine sent (the order's own id isn't known on the
 * thank-you page). Build it before the cart is reset: that's the last moment its lines exist.
 */
function purchaseParams(cart) {
    var _a, _b, _c, _d, _e, _f, _g;
    const currency = cartCurrency(cart);
    return {
        items: ((_a = cart === null || cart === void 0 ? void 0 : cart.lines) !== null && _a !== void 0 ? _a : []).map((line) => lineItemParams(line, currency)),
        orderId: (_b = cart === null || cart === void 0 ? void 0 : cart.id) !== null && _b !== void 0 ? _b : null,
        orderName: (_c = cart === null || cart === void 0 ? void 0 : cart.id) !== null && _c !== void 0 ? _c : null,
        totalValue: Number((_d = cart === null || cart === void 0 ? void 0 : cart.cost.totalAmount.amount) !== null && _d !== void 0 ? _d : 0),
        currency,
        totalItems: (_e = cart === null || cart === void 0 ? void 0 : cart.lines.length) !== null && _e !== void 0 ? _e : 0,
        taxPrice: Number((_g = (_f = cart === null || cart === void 0 ? void 0 : cart.cost.totalTaxAmount) === null || _f === void 0 ? void 0 : _f.amount) !== null && _g !== void 0 ? _g : 0),
    };
}
/** `{ totalQuantity, numberOfProducts }` for `updateCartQuantity`, counted as the engine counted. */
function cartQuantityParams(cart) {
    var _a;
    const lines = (_a = cart === null || cart === void 0 ? void 0 : cart.lines) !== null && _a !== void 0 ? _a : [];
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
function customCartParams(cart, actionType) {
    var _a, _b;
    return {
        lineItems: ((_a = cart === null || cart === void 0 ? void 0 : cart.lines) !== null && _a !== void 0 ? _a : []).map((line) => {
            var _a, _b, _c, _d;
            return ({
                merchandiseId: line.merchandise.id,
                quantity: line.quantity,
                productId: (_b = (_a = line.product) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null,
                title: (_d = (_c = line.product) === null || _c === void 0 ? void 0 : _c.title) !== null && _d !== void 0 ? _d : null,
            });
        }),
        actionType,
        cartId: (_b = cart === null || cart === void 0 ? void 0 : cart.id) !== null && _b !== void 0 ? _b : null,
    };
}
// ─── Shoppers ─────────────────────────────────────────────────────────────────
/** `{ userId, firstName, lastName, emailId, contactNumber }` for `login`: the engine's spelling, kept. */
function authParams(customer) {
    var _a, _b, _c, _d;
    return {
        userId: customer.id,
        firstName: (_a = customer.firstName) !== null && _a !== void 0 ? _a : '',
        lastName: (_b = customer.lastName) !== null && _b !== void 0 ? _b : '',
        emailId: (_c = customer.email) !== null && _c !== void 0 ? _c : '',
        contactNumber: (_d = customer.phone) !== null && _d !== void 0 ? _d : '',
    };
}
/**
 * The waitlist events' properties (`backInStockSubscription`, `cartHoldWaitlistSubscription`): who
 * is waiting, on which size of which product. The automation reads the customer from it, which is why
 * joining a waitlist needs sign-in.
 */
function waitlistParams(product, variant, customer) {
    var _a, _b, _c, _d;
    return {
        variantId: variant.id,
        productId: product.id,
        productTitle: product.title,
        productHandle: product.handle,
        featuredImage: (_b = (_a = product.featuredImage) === null || _a === void 0 ? void 0 : _a.url) !== null && _b !== void 0 ? _b : '',
        variantTitle: variant.title,
        customerId: (_c = customer === null || customer === void 0 ? void 0 : customer.id) !== null && _c !== void 0 ? _c : '',
        customerEmail: (_d = customer === null || customer === void 0 ? void 0 : customer.email) !== null && _d !== void 0 ? _d : '',
    };
}
/**
 * `liveJoin`'s properties: the show's streaming id, the viewer count as it stood on arrival, and the
 * engine widget's constants for the type and source, so its dashboard rows aggregate with these.
 */
function liveJoinParams(streamId, viewerCount) {
    return { streamId, count: viewerCount, streamType: 'live-stream', streamFrom: 'broadcaster-app' };
}
/**
 * One unit of one variant, as the show events carry it. `streamId` is the show's id as the app files
 * it: a recording's feed id (`Replay.id`), a live show's streaming id. `streamType` says which.
 */
function streamItemParams(product, variant, streamId, streamType = 'live-stream') {
    var _a, _b, _c;
    return {
        currency: product.priceRange.min.currencyCode,
        price: Number(((_a = variant === null || variant === void 0 ? void 0 : variant.price) !== null && _a !== void 0 ? _a : product.priceRange.min).amount),
        productId: product.id,
        quantity: 1,
        title: product.title,
        variantId: (_b = variant === null || variant === void 0 ? void 0 : variant.id) !== null && _b !== void 0 ? _b : null,
        variantTitle: (_c = variant === null || variant === void 0 ? void 0 : variant.title) !== null && _c !== void 0 ? _c : null,
        streamId,
        streamType,
    };
}
/**
 * The show's own copy of an add that landed: `replayAddToCart` for a recording, `streamAddToCart` for a
 * live show, each with `streamItemParams`. Send it beside the ordinary `addToCart`, never instead.
 */
function showAddToCartEvent(product, variant, show) {
    const name = show.streamType === 'replay' ? events_1.DefaultEvents.REPLAY_ADD_TO_CART : events_1.DefaultEvents.STREAM_ADD_TO_CART;
    return { name, properties: streamItemParams(product, variant, show.streamId, show.streamType) };
}
/** True when `shows` names at least one show: only then are `streamCheckout` and `streamPurchase` sent. */
function cartHasShows(shows) {
    return shows.live.length > 0 || shows.replay.length > 0;
}
/** `streamCheckout`'s properties: `checkoutParams` plus the shows, as `streamIds` and `replayIds`. */
function streamCheckoutParams(cart, shows) {
    return { ...checkoutParams(cart), streamIds: shows.live, replayIds: shows.replay };
}
/** `streamPurchase`'s properties: `purchaseParams` plus the shows, as `streamIds` and `replayIds`. */
function streamPurchaseParams(cart, shows) {
    return { ...purchaseParams(cart), streamIds: shows.live, replayIds: shows.replay };
}
/**
 * The events the engine reported for a cart or wishlist change, in order, for an sdk-shopify event.
 * Anything else (sign-in, alerts, checkout) is `[]`: sign-in is the app's to report, because it
 * depends on how the app signs shoppers in.
 *
 * - `cart:add`: for each line that grew, `updateCart` then `addToCart`, both with the line as it is now
 *   (its whole quantity, as the engine reported it); then `updateCartQuantity` and `customUpdateCart`.
 * - `cart:update` (a quantity changed on the cart page): `updateCartQuantity` and `customUpdateCart`.
 * - `cart:remove`: for each line that went, `removeFromCart` with `quantity` = how many went; then
 *   `updateCartQuantity` and `customUpdateCart`.
 * - `wishlist:add` / `wishlist:remove`: `addToWishlist` / `removeFromWishlist` with `{ productId }`.
 */
function cartAndWishlistEvents(event) {
    var _a, _b, _c, _d;
    const toSend = [];
    if (event.type === 'cart:add' || event.type === 'cart:update' || event.type === 'cart:remove') {
        const cart = (_a = event.cart) !== null && _a !== void 0 ? _a : null;
        const currency = cartCurrency(cart);
        const actionType = event.type.split(':')[1];
        for (const change of (_b = event.changedLines) !== null && _b !== void 0 ? _b : []) {
            if (event.type === 'cart:add' && change.quantityChange > 0) {
                const item = lineItemParams(change.line, currency);
                toSend.push({ name: events_1.DefaultEvents.UPDATE_CART, properties: item });
                toSend.push({ name: events_1.DefaultEvents.ADD_TO_CART, properties: item });
            }
            if (event.type === 'cart:remove' && change.quantityChange < 0) {
                toSend.push({
                    name: events_1.DefaultEvents.REMOVE_FROM_CART,
                    properties: { ...lineItemParams(change.line, currency), quantity: -change.quantityChange },
                });
            }
        }
        toSend.push({ name: events_1.DefaultEvents.UPDATE_CART_QUANTITY, properties: cartQuantityParams(cart) });
        toSend.push({ name: events_1.DefaultEvents.CUSTOM_UPDATE_CART, properties: customCartParams(cart, actionType) });
        return toSend;
    }
    if (event.type === 'wishlist:add') {
        toSend.push({ name: events_1.DefaultEvents.ADD_TO_WISHLIST, properties: { productId: (_c = event.productId) !== null && _c !== void 0 ? _c : null } });
    }
    if (event.type === 'wishlist:remove') {
        toSend.push({ name: events_1.DefaultEvents.REMOVE_FROM_WISHLIST, properties: { productId: (_d = event.productId) !== null && _d !== void 0 ? _d : null } });
    }
    return toSend;
}
//# sourceMappingURL=eventParams.js.map