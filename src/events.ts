// @tiledev/sdk-analytics-core — the canonical event catalogue.
//
// Ported from the platform's `ApptileAnalytics/DefaultEvents.ts` (the two
// lifecycle events) and the event keys the per-provider transformers switch on
// (firebase `gaEventsMap`, klaviyo `transformers`, moengage `eventsMap`,
// segment `transformers`). Every provider adapter maps THESE canonical names onto
// its vendor's event names.

/** The two platform lifecycle events. Ported verbatim from `ApptileCoreEvents`. */
export const ApptileCoreEvents = {
  FIRST_OPEN: 'apptile_first_open',
  APP_OPEN: 'apptile_app_open',
} as const;

/**
 * The canonical event names the theme emits. Values are the exact strings the
 * platform transformers key on, so `DefaultEvents.ADD_TO_CART === 'addToCart'`.
 */
export const DefaultEvents = {
  // lifecycle
  FIRST_OPEN: ApptileCoreEvents.FIRST_OPEN,
  APP_OPEN: ApptileCoreEvents.APP_OPEN,

  // navigation
  PAGE_VIEW: 'pageView',
  SEARCH: 'search',

  // catalogue
  PRODUCT_VIEW: 'productView',
  SELECT_PRODUCT: 'selectProduct',
  COLLECTION_VIEW: 'collectionView',

  // wishlist
  ADD_TO_WISHLIST: 'addToWishlist',
  REMOVE_FROM_WISHLIST: 'removeFromWishlist',

  // cart
  ADD_TO_CART: 'addToCart',
  REMOVE_FROM_CART: 'removeFromCart',
  UPDATE_CART: 'updateCart',
  VIEW_CART: 'viewCart',

  // checkout / purchase
  INITIATE_CHECKOUT: 'initiateCheckout',
  CHECKOUT: 'checkout',
  ITEM_CHECKED_OUT: 'itemCheckedOut',
  PURCHASE: 'purchase',
  ITEM_PURCHASED: 'itemPurchased',

  // auth
  LOGIN: 'login',
  SIGNUP: 'signup',
  LOGOUT: 'logout',
  CUSTOMER_LOGIN: 'customerLogIn',
  CUSTOMER_REGISTERED: 'customerRegistered',
  CUSTOMER_LOGOUT: 'customerLogout',
  LOGIN_INITIATED: 'login_initiated',
  OTP_REQUESTED: 'otp_requested',
  OTP_VERIFIED: 'otp_verified',
  SIGNUP_SUCCESS: 'signup_success',
  LOGIN_SUCCESS: 'login_success',

  // merchandising
  BANNER_CLICK: 'banner_click',

  // klaviyo back-in-stock
  BACK_IN_STOCK_SUBSCRIPTION: 'back-in-stock-subscription',
} as const;

export type DefaultEventName = (typeof DefaultEvents)[keyof typeof DefaultEvents];
