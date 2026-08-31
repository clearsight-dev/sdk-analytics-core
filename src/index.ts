// @tiledev/sdk-analytics-core — the dependency-free analytics contract shared by
// every @tiledev/sdk-analytics-* provider and the theme's AnalyticsService.
//
// This package is types + events only: the AnalyticsAdapter interface each provider
// implements, the DefaultEvents catalogue, and the EventProperties/UserTraits shapes.
// The fan-out lives in the theme's AnalyticsService (which holds the adapter list).

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
