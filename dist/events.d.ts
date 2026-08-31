/** The two platform lifecycle events. Ported verbatim from `ApptileCoreEvents`. */
export declare const ApptileCoreEvents: {
    readonly FIRST_OPEN: "apptile_first_open";
    readonly APP_OPEN: "apptile_app_open";
};
/**
 * The canonical event names the theme emits. Values are the exact strings the
 * platform transformers key on, so `DefaultEvents.ADD_TO_CART === 'addToCart'`.
 */
export declare const DefaultEvents: {
    readonly FIRST_OPEN: "apptile_first_open";
    readonly APP_OPEN: "apptile_app_open";
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
    readonly BACK_IN_STOCK_SUBSCRIPTION: "back-in-stock-subscription";
};
export type DefaultEventName = (typeof DefaultEvents)[keyof typeof DefaultEvents];
//# sourceMappingURL=events.d.ts.map