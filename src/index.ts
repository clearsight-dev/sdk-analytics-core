// @tiledev/sdk-analytics-core — the dependency-free analytics contract shared by
// every @tiledev/sdk-analytics-* provider and the theme's AnalyticsService.
//
// The AnalyticsAdapter interface each provider implements, the DefaultEvents catalogue, the
// EventProperties/UserTraits shapes, and (since 0.3.0) the builders for what each event carries.
// No dependencies, no registry, no React: the fan-out lives in the app's provider
// (`ApptileAnalyticsProvider` in @tiledev/sdk-analytics-apptile).

export * from './types';
export { ApptileCoreEvents, DefaultEvents, type DefaultEventName } from './events';
// The TYPED property contract: `events.ts` names the events, `eventProps.ts` says
// what each must carry, so a missing `variantId` is a compile error rather than a
// silently absent column in the dashboard.
export {
  trackProps,
  toItem,
  type CommonEventProps,
  type ProductEventProps,
  type LineItemEventProps,
  type CartTotalsEventProps,
  type AuthMethod,
  type TrackedEventProps,
  type TrackedEventName,
  type EventPropsFor,
} from './eventProps';
// What each event carries, built from the Shopify objects an app holds (SDK move 7).
export {
  productParams,
  cartCurrency,
  lineItemParams,
  checkoutParams,
  purchaseParams,
  cartQuantityParams,
  customCartParams,
  authParams,
  waitlistParams,
  liveJoinParams,
  streamItemParams,
  showAddToCartEvent,
  cartHasShows,
  streamCheckoutParams,
  streamPurchaseParams,
  cartAndWishlistEvents,
  type MoneyForEvents,
  type ProductForEvents,
  type VariantForEvents,
  type CartLineForEvents,
  type CartForEvents,
  type CustomerForEvents,
  type EventToSend,
  type StreamType,
  type AddedFromShow,
  type ShowsInCart,
  type CartLineChangeForEvents,
  type ShopifyEventForAnalytics,
} from './eventParams';
