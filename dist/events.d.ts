/** The two platform lifecycle events. Ported verbatim from `ApptileCoreEvents`. */
export declare const ApptileCoreEvents: {
    readonly FIRST_OPEN: "apptile_first_open";
    readonly APP_OPEN: "apptile_app_open";
};
/**
 * The canonical event names the theme emits. Values are the exact strings the
 * platform transformers key on, so `DefaultEvents.ADD_TO_CART === 'addToCart'`.
 *
 * Every store's warehouse has columns named after these strings, so a value here never changes
 * without a note for the data team: a renamed event starts a second series nobody queries.
 */
export declare const DefaultEvents: {
    readonly FIRST_OPEN: "apptile_first_open";
    readonly APP_OPEN: "apptile_app_open";
    /** The first launch after the app's version changed, instead of `apptile_app_open`. The engine's name. */
    readonly APP_UPDATE: "apptile_app_update";
    /** The shopper opened a push notification. */
    readonly NOTIFICATION_OPEN: "apptile_notification_open";
    /** A push notification arrived while the app was open. */
    readonly NOTIFICATION_FOREGROUND: "apptile_notification_foreground";
    readonly PAGE_VIEW: "pageView";
    readonly SEARCH: "search";
    readonly PRODUCT_VIEW: "productView";
    readonly SELECT_PRODUCT: "selectProduct";
    readonly COLLECTION_VIEW: "collectionView";
    readonly ADD_TO_WISHLIST: "addToWishlist";
    readonly REMOVE_FROM_WISHLIST: "removeFromWishlist";
    readonly ADD_TO_CART: "addToCart";
    readonly REMOVE_FROM_CART: "removeFromCart";
    readonly UPDATE_CART: "updateCart";
    readonly VIEW_CART: "viewCart";
    /** After every cart write: `{ totalQuantity, numberOfProducts }`. OneSignal's Abandoned Cart tag reads it. */
    readonly UPDATE_CART_QUANTITY: "updateCartQuantity";
    /** After every cart write: `{ lineItems, actionType, cartId }`. The platform's abandoned-cart automations read it. */
    readonly CUSTOM_UPDATE_CART: "customUpdateCart";
    readonly INITIATE_CHECKOUT: "initiateCheckout";
    readonly CHECKOUT: "checkout";
    readonly ITEM_CHECKED_OUT: "itemCheckedOut";
    readonly PURCHASE: "purchase";
    readonly ITEM_PURCHASED: "itemPurchased";
    readonly LOGIN: "login";
    readonly SIGNUP: "signup";
    readonly LOGOUT: "logout";
    readonly CUSTOMER_LOGIN: "customerLogIn";
    readonly CUSTOMER_REGISTERED: "customerRegistered";
    readonly CUSTOMER_LOGOUT: "customerLogout";
    readonly LOGIN_INITIATED: "login_initiated";
    readonly OTP_REQUESTED: "otp_requested";
    readonly OTP_VERIFIED: "otp_verified";
    readonly SIGNUP_SUCCESS: "signup_success";
    readonly LOGIN_SUCCESS: "login_success";
    readonly BANNER_CLICK: "banner_click";
    /**
     * Joining the waitlist for a sold-out size: `waitlistParams`. The platform's push automations
     * select on this exact string to send the back-in-stock push later, so here the name is the feature.
     *
     * Until 0.3.0 this was `back-in-stock-subscription`, hyphenated, which no automation matches: every
     * app spelled `backInStockSubscription` itself rather than use this constant.
     */
    readonly BACK_IN_STOCK_SUBSCRIPTION: "backInStockSubscription";
    /**
     * Joining the waitlist for a size Cart Hold has reserved in other shoppers' carts: `waitlistParams`.
     * Read by the same automations.
     */
    readonly CART_HOLD_WAITLIST_SUBSCRIPTION: "cartHoldWaitlistSubscription";
    /**
     * A shopper watching a live show, once per show per app run: `liveJoinParams`. The tracking plan's
     * name (the engine's widget called it `viewStream`).
     */
    readonly LIVE_JOIN: "liveJoin";
    /**
     * An add during a live show, credited to that show: `streamItemParams` with `streamType:
     * 'live-stream'`. Sent beside the ordinary `addToCart`, so the store's numbers stay whole while the
     * show gets credit for what it sold. `showAddToCartEvent` picks this name or the next.
     */
    readonly STREAM_ADD_TO_CART: "streamAddToCart";
    /**
     * An add from a show's recording: `streamItemParams` with `streamType: 'replay'`. Its own name, so
     * what the recordings sold is counted apart from what the show sold live (Freckled Poppy's names,
     * decided 2026-10-06, Head of Engineering). `streamId` joins the two back together.
     */
    readonly REPLAY_ADD_TO_CART: "replayAddToCart";
    /**
     * Checkout started on a cart holding units a show put there: `streamCheckoutParams`. Sent beside
     * `initiateCheckout`, never instead of it, and only when the cart holds a show's units.
     */
    readonly STREAM_CHECKOUT: "streamCheckout";
    /** The order for such a cart was placed: `streamPurchaseParams`, beside `purchase`. */
    readonly STREAM_PURCHASE: "streamPurchase";
};
export type DefaultEventName = (typeof DefaultEvents)[keyof typeof DefaultEvents];
//# sourceMappingURL=events.d.ts.map