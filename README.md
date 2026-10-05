# @tiledev/sdk-analytics-core

The **dependency-free** analytics contract shared by every `@tiledev/sdk-analytics-*`
provider and the app's analytics provider. No dependencies, no registry, no React. It defines:

- **`AnalyticsAdapter`**: the interface each provider (Apptile, OneSignal, and any vendor
  adapter) implements.
- **`DefaultEvents`** / **`ApptileCoreEvents`**: the event-name catalogue (ported from the
  platform's `ApptileAnalytics/DefaultEvents.ts`, the keys the per-provider transformers switch on,
  and since 0.3.0 the names every Tile app used to spell out itself).
- **The payload builders** (since 0.3.0): what each event carries, built from the Shopify objects
  an app already holds, in the Apptile engine's shapes.
- **`EventProperties`** / **`UserTraits`** and the device/event **wire types**
  (`AnalyticsEvent`, `AnalyticsContext`, `CampaignParams`, …).

```sh
npm install @tiledev/sdk-analytics-core
```

No peer dependencies. The builders read sdk-shopify's objects by their fields (structural types),
so this package never imports `@tiledev/sdk-shopify`.

## The adapter contract

```ts
interface AnalyticsAdapter {
  name: string;
  init?(): void | Promise<void>;
  identify?(userId: string, traits?: UserTraits): void;
  track?(event: string, properties?: EventProperties): void;
  screen?(name: string, properties?: EventProperties): void;
  reset?(): void;
  setUserProperties?(props: EventProperties): void;
  logError?(error: Error, context?: EventProperties): void;
}
```

Every method is optional: an adapter wires only the surface its vendor supports. Each
`@tiledev/sdk-analytics-*` package exports a `create…Adapter(options): AnalyticsAdapter`
factory that returns one of these.

## Wiring

There is no registry here. An app holds its adapters in one provider that sends every call to each
of them: `ApptileAnalyticsProvider` in `@tiledev/sdk-analytics-apptile` (0.5.0 and later) does
that, with the install id, the launch event and the page views. See that package's README.

## Event names

`DefaultEvents` carries the exact strings the platform and every store's warehouse read. A tidier
name here would be a second series nobody queries, so values don't change without a note for the
data team.

| Group | Names |
| --- | --- |
| Lifecycle | `apptile_first_open`, `apptile_app_open`, `apptile_app_update` (0.3.0) |
| Push | `apptile_notification_open`, `apptile_notification_foreground` (0.3.0) |
| Browsing | `pageView`, `search`, `productView`, `selectProduct`, `collectionView` |
| Wishlist | `addToWishlist`, `removeFromWishlist` |
| Cart | `addToCart`, `removeFromCart`, `updateCart`, `viewCart`, `updateCartQuantity` and `customUpdateCart` (0.3.0) |
| Checkout | `initiateCheckout`, `checkout`, `itemCheckedOut`, `purchase`, `itemPurchased` |
| Sign-in | `login`, `signup`, `logout`, `customerLogIn`, `customerRegistered`, … |
| Waitlists | `backInStockSubscription` (`BACK_IN_STOCK_SUBSCRIPTION`, fixed in 0.3.0), `cartHoldWaitlistSubscription` (0.3.0) |
| Live selling (0.3.0) | `liveJoin`, `streamAddToCart`, `replayAddToCart`, `streamCheckout`, `streamPurchase` |

**The waitlist names select the push automations.** `BACK_IN_STOCK_SUBSCRIPTION` was
`back-in-stock-subscription` until 0.3.0, which no automation matches.

**Live selling follows Freckled Poppy's names** (decided 2026-10-06, Head of Engineering): an add
during a live show is `streamAddToCart`, an add from its recording is `replayAddToCart` (not
`streamAddToCart` with `streamType: "replay"`), and a cart holding a show's units also sends
`streamCheckout` and `streamPurchase`. Each is sent **beside** the ordinary event (`addToCart`,
`initiateCheckout`, `purchase`), never instead of it, so the store's own numbers stay whole.

## Payload builders

The inputs are typed by the fields read: sdk-shopify's `Product`, `ProductVariant`, `Cart`,
`CartLine` and `Customer` fit (`ProductForEvents`, `VariantForEvents`, `CartForEvents`,
`CartLineForEvents`, `CustomerForEvents`). Every builder returns `EventProperties`. The shapes are the
Apptile engine's, kept on purpose: `emailId`, `contactNumber`, `merchandiseId`, and `purchase`'s
`orderId` being the **cart** id.

| Builder | For | Carries |
| --- | --- | --- |
| `productParams(product, variant?)` | `productView`, `collectionView` items | `productId, title, currency, price, brand, productType, available` (price: the variant's, else the range minimum) |
| `lineItemParams(line, currency)` | `addToCart`, `updateCart`, `removeFromCart`, `items` | `productId, title, currency, variantTitle, variantId, price, quantity, brand: null, productType: null` |
| `cartCurrency(cart)` | | the subtotal's currency, `''` without a cart |
| `checkoutParams(cart)` | `viewCart`, `initiateCheckout` | `currency, totalItems, totalValue` (subtotal), `items` |
| `purchaseParams(cart)` | `purchase` | `items, orderId, orderName` (both the cart id), `totalValue` (total), `currency, totalItems, taxPrice` |
| `cartQuantityParams(cart)` | `updateCartQuantity` | `totalQuantity, numberOfProducts` |
| `customCartParams(cart, actionType)` | `customUpdateCart` | `lineItems: [{ merchandiseId, quantity, productId, title }], actionType, cartId` |
| `authParams(customer)` | `login` | `userId, firstName, lastName, emailId, contactNumber` |
| `waitlistParams(product, variant, customer)` | the two waitlist events | `variantId, productId, productTitle, productHandle, featuredImage, variantTitle, customerId, customerEmail` |
| `liveJoinParams(streamId, viewerCount)` | `liveJoin` | `streamId, count, streamType: "live-stream", streamFrom: "broadcaster-app"` |
| `streamItemParams(product, variant, streamId, streamType = "live-stream")` | a show's add | `currency, price, productId, quantity: 1, title, variantId, variantTitle, streamId, streamType` |
| `streamCheckoutParams(cart, shows)` | `streamCheckout` | `checkoutParams(cart)` plus `streamIds, replayIds` |
| `streamPurchaseParams(cart, shows)` | `streamPurchase` | `purchaseParams(cart)` plus `streamIds, replayIds` |

### A show's add

```ts
showAddToCartEvent(product, variant, show: AddedFromShow): EventToSend
// AddedFromShow = { streamType: 'live-stream' | 'replay'; streamId: string }
// EventToSend   = { name: string; properties: EventProperties }
```

`replayAddToCart` for a recording, `streamAddToCart` for a live show, each with
`streamItemParams`. `streamId` is the show's id as the app files it: a recording's feed id
(`Replay.id`), a live show's streaming id. Send it only for an add that landed, beside `addToCart`:

```ts
const sent = showAddToCartEvent(product, variant, addedFromShow);
analytics.track(sent.name, sent.properties);
```

### A show's checkout and purchase

```ts
type ShowsInCart = { live: string[]; replay: string[] };   // sdk-shopify's showsInCart(cart)
cartHasShows(shows: ShowsInCart): boolean
```

`showsInCart(cart)` (sdk-shopify 0.10 and later, with its `attribution` on) reads the cart's
`_apptile_attribution`. Both lists are the shows' streaming ids (a replay is counted under the show
it records), and one cart can hold units from several shows. Send the show's copy beside the
ordinary event, and only when the cart holds a show's units:

```ts
analytics.track(DefaultEvents.INITIATE_CHECKOUT, checkoutParams(cart));
const shows = showsInCart(cart);
if (cartHasShows(shows)) analytics.track(DefaultEvents.STREAM_CHECKOUT, streamCheckoutParams(cart, shows));
```

`purchase` and `streamPurchase` the same way, built before the cart is reset.

### What a cart or wishlist change reports

```ts
cartAndWishlistEvents(event: ShopifyEventForAnalytics): EventToSend[]
```

The events the Apptile engine reported for one sdk-shopify event, in order. It reads the event's
`type`, `cart`, `changedLines` and `productId` (sdk-shopify 0.10 and later carry them), so nothing
waits for the cart to settle or diffs it:

| sdk-shopify event | Sends |
| --- | --- |
| `cart:add` | for each line that grew: `updateCart`, `addToCart` (the line as it is now, its whole quantity); then `updateCartQuantity`, `customUpdateCart` (`actionType: "add"`) |
| `cart:update` | `updateCartQuantity`, `customUpdateCart` (`"update"`) |
| `cart:remove` | for each line that went: `removeFromCart` (`quantity`: how many went); then `updateCartQuantity`, `customUpdateCart` (`"remove"`) |
| `wishlist:add` / `wishlist:remove` | `addToWishlist` / `removeFromWishlist` with `{ productId }` |
| anything else | nothing |

Sign-in isn't here: it depends on how the app signs shoppers in, so the app reports `login`,
`customerLogIn` and `logout` itself (with `authParams`).

```ts
useShopifyEvents((event) => {
  for (const sent of cartAndWishlistEvents(event)) analytics.track(sent.name, sent.properties);
});
```

## Development

```sh
npm run build   # clean + tsc
npm run lint    # tsc --noEmit
npm test        # build, then test/event-params.test.mjs
```

`test/fixtures/amore-v2-payloads.json` is what amore-v2's own builders sent for the inputs in
`test/fixtures/inputs.mjs` (2026-10-06, before SDK move 7). The builders must keep matching it, key
order included.
