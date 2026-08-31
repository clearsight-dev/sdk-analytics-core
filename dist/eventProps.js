"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackProps = trackProps;
exports.toItem = toItem;
/**
 * Identity helper that type-checks a payload against its event.
 *
 * Runtime cost is one object pass-through; the value is that a missing or
 * misspelled property is a compile error rather than a silently absent column.
 */
function trackProps(_event, props) {
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
    return props;
}
/** Narrow a product to the `items[]` shape, so cart events can't over-share. */
function toItem(p) {
    return {
        productId: p.productId,
        title: p.title,
        currency: p.currency,
        price: p.price,
        brand: p.brand,
        productType: p.productType,
    };
}
//# sourceMappingURL=eventProps.js.map