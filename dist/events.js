"use strict";
// @tiledev/sdk-analytics-core — the canonical event catalogue.
//
// Ported from the platform's `ApptileAnalytics/DefaultEvents.ts` (the two
// lifecycle events) and the event keys the per-provider transformers switch on
// (firebase `gaEventsMap`, klaviyo `transformers`, moengage `eventsMap`,
// segment `transformers`). Every provider adapter maps THESE canonical names onto
// its vendor's event names.
//
// Since 0.3.0 it also carries the names every Tile app spelled out for itself (the engine-only ones,
// the waitlists' and the live-selling ones), so no app keeps its own copy.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultEvents = exports.ApptileCoreEvents = void 0;
/** The two platform lifecycle events. Ported verbatim from `ApptileCoreEvents`. */
exports.ApptileCoreEvents = {
    FIRST_OPEN: 'apptile_first_open',
    APP_OPEN: 'apptile_app_open',
};
/**
 * The canonical event names the theme emits. Values are the exact strings the
 * platform transformers key on, so `DefaultEvents.ADD_TO_CART === 'addToCart'`.
 *
 * Every store's warehouse has columns named after these strings, so a value here never changes
 * without a note for the data team: a renamed event starts a second series nobody queries.
 */
exports.DefaultEvents = {
    // lifecycle
    FIRST_OPEN: exports.ApptileCoreEvents.FIRST_OPEN,
    APP_OPEN: exports.ApptileCoreEvents.APP_OPEN,
    /** The first launch after the app's version changed, instead of `apptile_app_open`. The engine's name. */
    APP_UPDATE: 'apptile_app_update',
    // push
    /** The shopper opened a push notification. */
    NOTIFICATION_OPEN: 'apptile_notification_open',
    /** A push notification arrived while the app was open. */
    NOTIFICATION_FOREGROUND: 'apptile_notification_foreground',
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
    /** After every cart write: `{ totalQuantity, numberOfProducts }`. OneSignal's Abandoned Cart tag reads it. */
    UPDATE_CART_QUANTITY: 'updateCartQuantity',
    /** After every cart write: `{ lineItems, actionType, cartId }`. The platform's abandoned-cart automations read it. */
    CUSTOM_UPDATE_CART: 'customUpdateCart',
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
    // waitlists
    /**
     * Joining the waitlist for a sold-out size: `waitlistParams`. The platform's push automations
     * select on this exact string to send the back-in-stock push later, so here the name is the feature.
     *
     * Until 0.3.0 this was `back-in-stock-subscription`, hyphenated, which no automation matches: every
     * app spelled `backInStockSubscription` itself rather than use this constant.
     */
    BACK_IN_STOCK_SUBSCRIPTION: 'backInStockSubscription',
    /**
     * Joining the waitlist for a size Cart Hold has reserved in other shoppers' carts: `waitlistParams`.
     * Read by the same automations.
     */
    CART_HOLD_WAITLIST_SUBSCRIPTION: 'cartHoldWaitlistSubscription',
    // live selling
    /**
     * A shopper watching a live show, once per show per app run: `liveJoinParams`. The tracking plan's
     * name (the engine's widget called it `viewStream`).
     */
    LIVE_JOIN: 'liveJoin',
    /**
     * An add during a live show, credited to that show: `streamItemParams` with `streamType:
     * 'live-stream'`. Sent beside the ordinary `addToCart`, so the store's numbers stay whole while the
     * show gets credit for what it sold. `showAddToCartEvent` picks this name or the next.
     */
    STREAM_ADD_TO_CART: 'streamAddToCart',
    /**
     * An add from a show's recording: `streamItemParams` with `streamType: 'replay'`. Its own name, so
     * what the recordings sold is counted apart from what the show sold live (Freckled Poppy's names,
     * decided 2026-10-06, Head of Engineering). `streamId` joins the two back together.
     */
    REPLAY_ADD_TO_CART: 'replayAddToCart',
    /**
     * Checkout started on a cart holding units a show put there: `streamCheckoutParams`. Sent beside
     * `initiateCheckout`, never instead of it, and only when the cart holds a show's units.
     */
    STREAM_CHECKOUT: 'streamCheckout',
    /** The order for such a cart was placed: `streamPurchaseParams`, beside `purchase`. */
    STREAM_PURCHASE: 'streamPurchase',
};
//# sourceMappingURL=events.js.map