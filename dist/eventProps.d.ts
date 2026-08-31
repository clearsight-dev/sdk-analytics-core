/** Common to EVERY event — the customer's Shopify GID. OMIT when signed out (never null). */
export type CommonEventProps = {
    customerId?: string;
};
/** The product shape reused by product events and by every `items[]` array. */
export type ProductEventProps = {
    /** Shopify product id / SKU. */
    productId: string;
    /** Product title, e.g. "Nike Sneakers Shoe". */
    title: string;
    /** Shop currency, e.g. "INR". */
    currency?: string;
    /** Price for the item. */
    price?: number | string;
    /** Vendor, if any. */
    brand?: string;
    /** e.g. "T-shirts" (optional per the sheet). */
    productType?: string;
};
/** A cart/variant line — product plus the chosen variant and quantity. */
export type LineItemEventProps = ProductEventProps & {
    /** Units. `1` from a card or list. */
    quantity: number;
    /** Variant GID. */
    variantId: string;
    /** Variant name. */
    variantTitle: string;
};
/** Cart-level totals shared by viewCart / initiateCheckout / purchase. */
export type CartTotalsEventProps = {
    currency?: string;
    /** Total value of the cart. */
    totalValue: number | string;
    /** Number of lines in the cart. */
    totalItems: number;
    /** productView-shaped entries — the sheet's `items [ productView Event Data ]`. */
    items: ProductEventProps[];
};
/** `method` is a hard-coded literal per the sheet. */
export type AuthMethod = 'google' | 'facebook' | 'email' | 'phone';
/**
 * Event name → required properties.
 *
 * These twelve are the events the platform sheet defines. `DefaultEvents` carries
 * more names (lifecycle, OTP, wishlist-remove, …); those stay untyped until the
 * sheet defines their properties — deliberately, so this map never invents a
 * contract the platform has not specified.
 */
export interface TrackedEventProps {
    pageView: {
        pageName: string;
        pageId: string;
    };
    customerLogIn: {
        method: AuthMethod;
    };
    customerRegistered: {
        method: AuthMethod;
    };
    productView: ProductEventProps;
    search: {
        term: string;
    };
    addToWishlist: ProductEventProps & {
        available?: boolean;
        quantity?: number;
    };
    addToCart: LineItemEventProps;
    removeFromCart: LineItemEventProps;
    viewCart: CartTotalsEventProps;
    initiateCheckout: CartTotalsEventProps;
    purchase: CartTotalsEventProps & {
        orderId: string;
        orderName: string;
        shippingDiscount?: number | string;
        taxPrice?: number | string;
        shippingAmount?: number | string;
    };
    collectionView: {
        currency?: string;
        /** Collection the item was presented in. */
        listName: string;
        listId: string;
        items: ProductEventProps[];
    };
}
/** The events that carry a typed contract. */
export type TrackedEventName = keyof TrackedEventProps;
/** Properties for one event, plus the common `customerId`. */
export type EventPropsFor<E extends TrackedEventName> = TrackedEventProps[E] & CommonEventProps;
/**
 * Identity helper that type-checks a payload against its event.
 *
 * Runtime cost is one object pass-through; the value is that a missing or
 * misspelled property is a compile error rather than a silently absent column.
 */
export declare function trackProps<E extends TrackedEventName>(_event: E, props: EventPropsFor<E>): EventPropsFor<E> & Record<string, unknown>;
/** Narrow a product to the `items[]` shape, so cart events can't over-share. */
export declare function toItem(p: ProductEventProps): ProductEventProps;
//# sourceMappingURL=eventProps.d.ts.map