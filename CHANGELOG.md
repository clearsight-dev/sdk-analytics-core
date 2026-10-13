# Changelog

## 0.3.2 (2026-10-13)

What amore-v2's page hooks reported themselves, moved here with sdk-shopify 0.15's page models:

- **`cartAndWishlistEvents` reports `checkout:completed`** (sdk-shopify 0.15's checkout page saw the order
  placed, with the cart as it was): `purchase` with `purchaseParams`, and `streamPurchase` beside it for a
  cart holding a show's units; a checkout of its own link (no cart) sends `purchase` with its `source`
  (`auctionWins`). `checkout:orderPlaced` still reports nothing. An app that sent `purchase` itself from
  that page stops doing so when it moves to `useCheckoutPage`.
- **`collectionViewParams(collection)`** and **`searchParams(search)`**: production's `collectionView` and
  `search`, from what sdk-shopify 0.15's `useCollectionPage` `onView` and `useSearchPage` `onSearched` hand
  over.
- **`waitlistSubscriptionEvent(joined)`**: `cartHoldWaitlistSubscription` for a size waiting on other
  carts, else `backInStockSubscription`, from sdk-shopify 0.15's `onJoinedWaitlist`.
- Tests: 5 more in `test/event-params.test.mjs`.

## 0.3.1 (2026-10-12)

- **`cartAndWishlistEvents` reports sdk-shopify 0.14.0's cart page events:** `cart:viewed` → `viewCart`,
  `checkout:started` → `initiateCheckout`, and `streamCheckout` beside it when the event's `shows` hold a
  show's units. Moved from amore-v2's Cart, which sent them itself; an app's existing analytics bridge
  (`useShopifyEvents` → `cartAndWishlistEvents`) now reports them with no change. A patch, so
  sdk-analytics-apptile's `^0.3.0` peer takes it. Tests: 2 more in `test/event-params.test.mjs`.

## 0.3.0 (2026-10-06)

SDK move 7 (2026-10-06): the event names and payload builders every Tile app
kept its own copy of (amore-v2, amber-v2, Freckled Poppy, k-marie, krushkandy) live here now.
Analytics follow Freckled Poppy's model (decided 2026-10-06, Head of Engineering).

### Breaking: `BACK_IN_STOCK_SUBSCRIPTION` is `backInStockSubscription`

It was `back-in-stock-subscription`, hyphenated. The platform's push automations select on
`backInStockSubscription`, so an app that used the constant would have stopped every back-in-stock
push; every app spelled the string itself instead. No published package read the old value (checked
2026-10-06: only sdk-analytics-core and sdk-analytics-apptile are on npm, and the Apptile adapter
doesn't read it).

### New event names in `DefaultEvents`

The names every app spelled out itself, so the catalogue is whole:

- `APP_UPDATE: 'apptile_app_update'`, `NOTIFICATION_OPEN: 'apptile_notification_open'`,
  `NOTIFICATION_FOREGROUND: 'apptile_notification_foreground'`.
- `UPDATE_CART_QUANTITY: 'updateCartQuantity'`, `CUSTOM_UPDATE_CART: 'customUpdateCart'`.
- `CART_HOLD_WAITLIST_SUBSCRIPTION: 'cartHoldWaitlistSubscription'`.
- Live selling, Freckled Poppy's names: `LIVE_JOIN: 'liveJoin'`,
  `STREAM_ADD_TO_CART: 'streamAddToCart'`, `REPLAY_ADD_TO_CART: 'replayAddToCart'`,
  `STREAM_CHECKOUT: 'streamCheckout'`, `STREAM_PURCHASE: 'streamPurchase'`.

`ApptileCoreEvents` is unchanged (the platform's two lifecycle events).

### New: the payload builders (`src/eventParams.ts`)

Copied from amore-v2's `src/core/analytics/events.ts` (which matched Freckled Poppy's), with the
inputs typed by the fields they read, so sdk-shopify's objects fit and this package still imports
nothing:

- `productParams(product, variant?)`, `lineItemParams(line, currency)` (the apps' `lineItem`),
  `cartCurrency(cart)`, `checkoutParams(cart)`, `purchaseParams(cart)`,
  `cartQuantityParams(cart)`, `customCartParams(cart, actionType)`, `authParams(customer)`,
  `waitlistParams(product, variant, customer)`, `liveJoinParams(streamId, viewerCount)`,
  `streamItemParams(product, variant, streamId, streamType = 'live-stream')`.
- **New: `showAddToCartEvent(product, variant, show): EventToSend`**: `replayAddToCart` for a
  recording, `streamAddToCart` for a live show, with `streamItemParams`. One place decides the name.
- **New: `streamCheckoutParams(cart, shows)` and `streamPurchaseParams(cart, shows)`**:
  `checkoutParams` / `purchaseParams` plus `streamIds` and `replayIds`, Freckled Poppy's payloads.
  `shows` is sdk-shopify's `showsInCart(cart)`; `cartHasShows(shows)` says whether to send them.
- **New: `cartAndWishlistEvents(event): EventToSend[]`**: the events the engine reported for one
  sdk-shopify cart or wishlist event (the apps' `AnalyticsBridge`, without its 50 ms wait and its diff
  of the cart). It reads the event's `cart`, `changedLines` and `productId`, which sdk-shopify 0.10
  carries. With two lines added at once (`addLines`) it reports each line that grew, where the diff
  reported only the first; no amore-v2 screen adds two lines at once.
- Types: `MoneyForEvents`, `ProductForEvents`, `VariantForEvents`, `CartLineForEvents`,
  `CartForEvents`, `CustomerForEvents`, `EventToSend`, `StreamType`, `AddedFromShow`,
  `ShowsInCart`, `CartLineChangeForEvents`, `ShopifyEventForAnalytics`.

**The payloads are unchanged.** `test/event-params.test.mjs` runs every builder over
`test/fixtures/inputs.mjs` and compares the result, key order included, with what amore-v2's own
builders sent for the same inputs (`test/fixtures/amore-v2-payloads.json`, 2026-10-06). The only
changed name is a recording's add (`streamAddToCart` → `replayAddToCart`, same fields); the new
events are `streamCheckout` and `streamPurchase`.

### Moving an app over

Delete the app's own `Events` object and builders; import them from here. Two keys are spelled
out in full: the apps' `BACK_IN_STOCK` is `DefaultEvents.BACK_IN_STOCK_SUBSCRIPTION`, and
`CART_HOLD_WAITLIST` is `DefaultEvents.CART_HOLD_WAITLIST_SUBSCRIPTION`. An app's `lineItem` is
`lineItemParams`. A show's add goes through `showAddToCartEvent`, which sends a recording's add as
`replayAddToCart`: tell the data team (amore-v2's note: `docs/parity/analytics-show-events.md`).

### Tests

`npm test` (new): 73 checks in `test/event-params.test.mjs`. 28 builder payloads against the
snapshot, every name amore-v2 sent, the show events, and what each cart and wishlist event reports.
