// The event names and payload builders (SDK move 7): every payload against the snapshot of what
// amore-v2's own builders sent, and the rules that decide which events a change reports.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as sdk from '../dist/index.js';
import { cart, emptyCart, lineWithProduct, lineWithoutProduct, payloadsFrom, product, variant } from './fixtures/inputs.mjs';

const snapshot = JSON.parse(readFileSync(new URL('./fixtures/amore-v2-payloads.json', import.meta.url), 'utf8'));
const { DefaultEvents } = sdk;

let pass = 0;
const check = (label, fn) => { fn(); pass++; console.log('  ✓', label); };

console.log('payloads match what amore-v2 sent');
const payloads = payloadsFrom(sdk);
for (const [call, expected] of Object.entries(snapshot.payloads)) {
  check(call, () => assert.deepStrictEqual(payloads[call], expected));
}
check('no builder call is missing from the snapshot, or extra', () => {
  assert.deepStrictEqual(Object.keys(payloads).sort(), Object.keys(snapshot.payloads).sort());
});
check('the keys come in the same order, as the warehouse rows were written', () => {
  for (const [call, expected] of Object.entries(snapshot.payloads)) {
    if (expected && typeof expected === 'object') assert.deepStrictEqual(Object.keys(payloads[call]), Object.keys(expected), call);
  }
});

console.log('event names');
// amore-v2's own names, by its keys; two keys are spelled out in full here.
const renamedKeys = { BACK_IN_STOCK: 'BACK_IN_STOCK_SUBSCRIPTION', CART_HOLD_WAITLIST: 'CART_HOLD_WAITLIST_SUBSCRIPTION' };
for (const [key, value] of Object.entries(snapshot.Events)) {
  const sdkKey = renamedKeys[key] ?? key;
  check(`${key} is still "${value}" (DefaultEvents.${sdkKey})`, () => assert.equal(DefaultEvents[sdkKey], value));
}
check('back in stock is the camelCase name the automations select on, not the hyphenated one', () => {
  assert.equal(DefaultEvents.BACK_IN_STOCK_SUBSCRIPTION, 'backInStockSubscription');
});
check("Freckled Poppy's replay and show-sale names", () => {
  assert.equal(DefaultEvents.REPLAY_ADD_TO_CART, 'replayAddToCart');
  assert.equal(DefaultEvents.STREAM_CHECKOUT, 'streamCheckout');
  assert.equal(DefaultEvents.STREAM_PURCHASE, 'streamPurchase');
});
check('no two names share a value', () => {
  const values = Object.values(DefaultEvents);
  assert.equal(new Set(values).size, values.length);
});

console.log('a show\'s add');
check('a live show\'s add is streamAddToCart, with the payload amore-v2 sent', () => {
  const sent = sdk.showAddToCartEvent(product, variant, { streamType: 'live-stream', streamId: 'live-1' });
  assert.equal(sent.name, 'streamAddToCart');
  assert.deepStrictEqual(sent.properties, snapshot.payloads['streamItemParams(product, variant, live-1, live-stream)']);
});
check('a recording\'s add is replayAddToCart: the name changes, every field stays', () => {
  const sent = sdk.showAddToCartEvent(product, variant, { streamType: 'replay', streamId: 'replay-feed-1' });
  assert.equal(sent.name, 'replayAddToCart');
  assert.deepStrictEqual(sent.properties, snapshot.payloads['streamItemParams(product, variant, replay-feed-1, replay)']);
});

console.log('a show\'s checkout and purchase');
const shows = { live: ['show-A'], replay: ['show-B', 'show-C'] };
check('streamCheckout is initiateCheckout\'s payload plus streamIds and replayIds', () => {
  assert.deepStrictEqual(sdk.streamCheckoutParams(cart, shows), { ...snapshot.payloads['checkoutParams(cart)'], streamIds: ['show-A'], replayIds: ['show-B', 'show-C'] });
});
check('streamPurchase is purchase\'s payload plus streamIds and replayIds', () => {
  assert.deepStrictEqual(sdk.streamPurchaseParams(cart, shows), { ...snapshot.payloads['purchaseParams(cart)'], streamIds: ['show-A'], replayIds: ['show-B', 'show-C'] });
});
check('cartHasShows: only a cart holding a show\'s units sends them', () => {
  assert.equal(sdk.cartHasShows({ live: [], replay: [] }), false);
  assert.equal(sdk.cartHasShows({ live: ['A'], replay: [] }), true);
  assert.equal(sdk.cartHasShows({ live: [], replay: ['B'] }), true);
});

console.log('what a cart or wishlist change reports');
const names = (sent) => sent.map((event) => event.name);
const grown = { ...lineWithProduct, quantity: 3 };
const afterAdd = { ...cart, lines: [grown, lineWithoutProduct] };
check('cart:add: updateCart and addToCart with the line as it is now, then the two cart-wide events', () => {
  const sent = sdk.cartAndWishlistEvents({ type: 'cart:add', cart: afterAdd, changedLines: [{ line: grown, quantityChange: 1 }] });
  assert.deepStrictEqual(names(sent), ['updateCart', 'addToCart', 'updateCartQuantity', 'customUpdateCart']);
  const item = sdk.lineItemParams(grown, 'USD');
  assert.equal(item.quantity, 3, 'the whole line, as the engine reported it');
  assert.deepStrictEqual(sent[0].properties, item);
  assert.deepStrictEqual(sent[1].properties, item);
  assert.deepStrictEqual(sent[2].properties, sdk.cartQuantityParams(afterAdd));
  assert.deepStrictEqual(sent[3].properties, sdk.customCartParams(afterAdd, 'add'));
});
check('cart:add of two lines at once reports each line that grew', () => {
  const sent = sdk.cartAndWishlistEvents({
    type: 'cart:add',
    cart: afterAdd,
    changedLines: [{ line: grown, quantityChange: 1 }, { line: lineWithoutProduct, quantityChange: 1 }],
  });
  assert.deepStrictEqual(names(sent), ['updateCart', 'addToCart', 'updateCart', 'addToCart', 'updateCartQuantity', 'customUpdateCart']);
});
check('cart:add with no changed lines still sends the cart-wide events', () => {
  assert.deepStrictEqual(names(sdk.cartAndWishlistEvents({ type: 'cart:add', cart })), ['updateCartQuantity', 'customUpdateCart']);
});
check('cart:update reports the cart-wide events only, with actionType "update"', () => {
  const sent = sdk.cartAndWishlistEvents({ type: 'cart:update', cart, changedLines: [{ line: lineWithProduct, quantityChange: -1 }] });
  assert.deepStrictEqual(names(sent), ['updateCartQuantity', 'customUpdateCart']);
  assert.equal(sent[1].properties.actionType, 'update');
});
check('cart:remove: removeFromCart with how many went, then the cart-wide events', () => {
  const afterRemove = { ...cart, lines: [lineWithoutProduct] };
  const sent = sdk.cartAndWishlistEvents({ type: 'cart:remove', cart: afterRemove, changedLines: [{ line: lineWithProduct, quantityChange: -2 }] });
  assert.deepStrictEqual(names(sent), ['removeFromCart', 'updateCartQuantity', 'customUpdateCart']);
  assert.deepStrictEqual(sent[0].properties, { ...sdk.lineItemParams(lineWithProduct, 'USD'), quantity: 2 });
  assert.equal(sent[2].properties.actionType, 'remove');
});
check('the currency is the cart\'s after the write, even when it emptied it', () => {
  const sent = sdk.cartAndWishlistEvents({ type: 'cart:remove', cart: emptyCart, changedLines: [{ line: lineWithProduct, quantityChange: -2 }] });
  assert.equal(sent[0].properties.currency, 'USD');
  assert.deepStrictEqual(sent[1].properties, { totalQuantity: 0, numberOfProducts: 0 });
});
check('wishlist:add and wishlist:remove carry the product', () => {
  assert.deepStrictEqual(sdk.cartAndWishlistEvents({ type: 'wishlist:add', productId: 'P9' }), [{ name: 'addToWishlist', properties: { productId: 'P9' } }]);
  assert.deepStrictEqual(sdk.cartAndWishlistEvents({ type: 'wishlist:remove', productId: 'P9' }), [{ name: 'removeFromWishlist', properties: { productId: 'P9' } }]);
});
check('a wishlist event without its product reports productId null, as the diff did when it found none', () => {
  assert.deepStrictEqual(sdk.cartAndWishlistEvents({ type: 'wishlist:add' }), [{ name: 'addToWishlist', properties: { productId: null } }]);
});
check('cart:viewed: viewCart with the checkout params (sdk-shopify 0.14 useCartPage().viewed())', () => {
  assert.deepStrictEqual(sdk.cartAndWishlistEvents({ type: 'cart:viewed', cart }), [{ name: 'viewCart', properties: sdk.checkoutParams(cart) }]);
  assert.deepStrictEqual(sdk.cartAndWishlistEvents({ type: 'cart:viewed' }), [{ name: 'viewCart', properties: sdk.checkoutParams(null) }]);
});
check('checkout:started: initiateCheckout, and streamCheckout beside it only for a cart holding a show\'s units', () => {
  const none = { live: [], replay: [] };
  assert.deepStrictEqual(names(sdk.cartAndWishlistEvents({ type: 'checkout:started', cart, shows: none })), ['initiateCheckout']);
  assert.deepStrictEqual(names(sdk.cartAndWishlistEvents({ type: 'checkout:started', cart })), ['initiateCheckout']);
  const shows = { live: ['dn9hva23ii'], replay: [] };
  const sent = sdk.cartAndWishlistEvents({ type: 'checkout:started', cart, shows });
  assert.deepStrictEqual(names(sent), ['initiateCheckout', 'streamCheckout']);
  assert.deepStrictEqual(sent[0].properties, sdk.checkoutParams(cart));
  assert.deepStrictEqual(sent[1].properties, sdk.streamCheckoutParams(cart, shows));
});
check('sign-in, alerts and a placed order report nothing here', () => {
  for (const type of ['auth:loginSuccess', 'auth:logout', 'cart:outOfStock', 'cart:limitExceeded', 'checkout:orderPlaced', 'waitlist:add']) {
    assert.deepStrictEqual(sdk.cartAndWishlistEvents({ type, cart }), [], type);
  }
});

console.log(`\n${pass} checks passed`);
