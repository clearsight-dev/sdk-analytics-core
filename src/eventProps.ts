// @tiledev/sdk-analytics-core — the TYPED property contract for the platform's
// tracked events.
//
// `events.ts` names the events; this file says what each one must carry. Source of
// record: the Apptile events list ("Platform Event Name" + "Segment Properties
// (Common - customerId: gid)" + "Properties Explaination"). Without this, every
// `track()` payload is a `Record<string, unknown>` and a missing `variantId` or a
// misspelled `productId` reaches production silently — the event lands, the
// property is absent, and the dashboard is quietly wrong.
//
// Use `trackProps` / `TrackedEventName` to get compile-time enforcement:
//
//   analytics.track("addToCart", trackProps("addToCart", { … }));
//
// or type the call site directly with `EventPropsFor<"addToCart">`.

/*
 * ⚠️ The payload shapes below are `type` aliases, NOT `interface`s, and that is
 * load-bearing — do not "tidy" them back.
 *
 * Every AnalyticsProvider in these apps types its sink as
 * `track(event: string, properties?: Record<string, unknown>)`. TypeScript gives
 * a type ALIAS of an object literal an implicit index signature, so it is
 * assignable to `Record<string, unknown>`; it deliberately does NOT give one to
 * an interface, because an interface can be reopened by declaration merging and
 * the checker cannot prove its final shape.
 *
 * So while these were interfaces, the intended call —
 *   track("addToCart", trackProps("addToCart", { … }))
 * — failed with TS2345 at EVERY call site, which made the typed helper
 * unusable exactly where it is meant to be used.
 */

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
  pageView: { pageName: string; pageId: string };
  customerLogIn: { method: AuthMethod };
  customerRegistered: { method: AuthMethod };
  productView: ProductEventProps;
  search: { term: string };
  addToWishlist: ProductEventProps & { available?: boolean; quantity?: number };
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
export function trackProps<E extends TrackedEventName>(
  _event: E,
  props: EventPropsFor<E>,
): EventPropsFor<E> & Record<string, unknown> {
  /*
   * The RETURN type widens to include `Record<string, unknown>`; the PARAMETER
   * stays exact. That split is the whole point:
   *
   *   - `props: EventPropsFor<E>` is what enforces the contract, so a missing
   *     `variantId` or a typo'd key is still a compile error at the call site.
   *   - every AnalyticsProvider types its sink as
   *     `track(event: string, properties?: Record<string, unknown>)`, and an
   *     intersection type gets no implicit index signature, so returning the
   *     bare `EventPropsFor<E>` made the intended call
   *     `track("addToCart", trackProps("addToCart", { … }))` fail TS2345 at
   *     every single call site — the helper was unusable where it was meant to
   *     be used.
   *
   * The assertion is sound: the value is a plain object literal whose keys are
   * all strings. It widens what callers may do with the result; it does not
   * weaken what they must pass in.
   */
  return props as EventPropsFor<E> & Record<string, unknown>;
}

/** Narrow a product to the `items[]` shape, so cart events can't over-share. */
export function toItem(p: ProductEventProps): ProductEventProps {
  return {
    productId: p.productId,
    title: p.title,
    currency: p.currency,
    price: p.price,
    brand: p.brand,
    productType: p.productType,
  };
}
