/** Arbitrary event payload — a plain, JSON-serialisable bag. */
export type EventProperties = Record<string, unknown>;
/** Traits/attributes attached to a user profile. */
export type UserTraits = Record<string, unknown>;
export interface AnalyticsAppDetails {
    name: string;
    version: string;
    build: string;
}
export interface AnalyticsDeviceDetails {
    type: string;
    id: string;
    advertisingId: string;
    manufacturer: string;
    model: string;
    name: string;
}
export interface AnalyticsNetworkDetails {
    bluetooth: boolean;
    carrier: string;
    cellular: boolean;
    wifi: boolean;
}
export interface AnalyticsOSDetails {
    name: string;
    version: string;
}
export interface AnalyticsPlatformDetails {
    bundleVersion: string;
    appId: string;
    appSaveId: string;
}
export interface AnalyticsScreenDetails {
    density: number;
    height: number;
    width: number;
}
/** The full device/app context the platform attached to every event. */
export interface AnalyticsContext {
    app: AnalyticsAppDetails;
    device: AnalyticsDeviceDetails;
    locale: string;
    network: AnalyticsNetworkDetails;
    os: AnalyticsOSDetails;
    apptilePlatform: AnalyticsPlatformDetails;
    screen: AnalyticsScreenDetails;
}
export declare const AnalyticsEventTypes: readonly ["page", "track"];
export type AnalyticsEventType = (typeof AnalyticsEventTypes)[number];
/** One analytics event — the shape the platform's AnalyticsAPI posted. */
export interface AnalyticsEvent {
    userId?: string;
    context?: Partial<AnalyticsContext>;
    event: string;
    properties: EventProperties;
    timestamp: string;
    type: AnalyticsEventType;
    id: string;
}
/**
 * Campaign attribution captured at first-open / app-open.
 * Ported from `DefaultEvents.ts` `CampaignParams`.
 */
export interface CampaignParams {
    source: string | null;
    medium: string | null;
    campaign: string | null;
    dynamicLink: boolean;
}
/**
 * Optional bootstrap info handed to `adapter.init`. Everything is optional so an
 * adapter can be initialised with nothing (native SDKs self-configure from their
 * google-services / plist files) or with a resolved user + partial context.
 */
export interface AnalyticsInitContext {
    userId?: string | null;
    context?: Partial<AnalyticsContext>;
}
/**
 * The contract every provider SDK implements. All methods are optional so an
 * adapter only wires the surface its vendor supports:
 *   - firebase  → init / identify(setUserId) / setUserProperties / track(logEvent) / screen
 *   - segment   → init / identify / track / screen / reset
 *   - klaviyo   → init / identify / setUserProperties(profile) / track / screen / reset
 *   - moengage  → init / identify(user-attributes) / setUserProperties / track / reset
 *
 * The theme's `AnalyticsService` holds a list of these adapters and fans every call
 * out to each one, wrapping each in try/catch so one failing provider never blocks
 * the rest (mirrors the platform's ApptileAnalytics.handleEvent).
 */
export interface AnalyticsAdapter {
    /** Stable id, e.g. `'firebase'`. */
    name: string;
    /** Called once from the theme's `analytics.initialize()`. */
    init?(): void | Promise<void>;
    /** Associate the current session with a user id (+ optional traits). */
    identify?(userId: string, traits?: UserTraits): void;
    /** Track a named event with properties. */
    track?(event: string, properties?: EventProperties): void;
    /** Track a screen/page view. */
    screen?(name: string, properties?: EventProperties): void;
    /** Clear identity / start an anonymous session (logout). */
    reset?(): void;
    /** Set/merge user profile attributes without changing identity. */
    setUserProperties?(props: EventProperties): void;
    /** Report a handled error. */
    logError?(error: Error, context?: EventProperties): void;
}
//# sourceMappingURL=types.d.ts.map