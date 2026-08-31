# @tiledev/sdk-analytics-core

The **dependency-free** analytics contract shared by every `@tiledev/sdk-analytics-*`
provider and the theme's `AnalyticsService`. This package is **types + events only** — no
runtime, no registry, no React. It defines:

- **`AnalyticsAdapter`** — the interface each provider (firebase, segment, klaviyo,
  moengage, appsflyer, clevertap, facebook-pixel, tiktok) implements.
- **`DefaultEvents`** / **`ApptileCoreEvents`** — the canonical event-name catalogue
  (ported from the platform's `ApptileAnalytics/DefaultEvents.ts` + the keys the
  per-provider transformers switch on).
- **`EventProperties`** / **`UserTraits`** and the device/event **wire types**
  (`AnalyticsEvent`, `AnalyticsContext`, `CampaignParams`, …).

```sh
npm install @tiledev/sdk-analytics-core
```

No peer dependencies — this is a pure types + constants package.

## The adapter contract

```ts
interface AnalyticsAdapter {
  name: string;
  init?(): void | Promise<void>;
  identify?(userId: string, traits?: UserTraits): void;
  track?(event: string, properties?: EventProperties): void;
  screen?(name: string, properties?: EventProperties): void;
  reset?(): void;
  setUserProperties?(props: EventProperties): void;
  logError?(error: Error, context?: EventProperties): void;
}
```

Every method is optional — an adapter wires only the surface its vendor supports. Each
`@tiledev/sdk-analytics-*` package exports a `create…Adapter(options): AnalyticsAdapter`
factory that returns one of these.

## Wiring: the theme's AnalyticsService is the single integration point

There is no registry here. The theme's `AnalyticsService`
(`src/core/services/analytics.ts`) holds an array of registered adapters and fans every
`initialize` / `identify` / `track` / `screen` / `reset` / `logError` call out over them
with a for-loop — each provider's logic stays inside its own `AnalyticsAdapter`. Register
the enabled providers with `use()` (or `register()`, or the constructor):

```ts
import { analytics } from '@/core/services/analytics'; // the theme AnalyticsService singleton
import { createFirebaseAnalyticsAdapter } from '@tiledev/sdk-analytics-firebase';
import { createSegmentAnalyticsAdapter } from '@tiledev/sdk-analytics-segment';

// Register every enabled provider. Each adapter owns its own track/identify/screen/... logic;
// AnalyticsService just loops over the registered adapters.
analytics.use([
  createFirebaseAnalyticsAdapter({ /* config via options */ }),
  createSegmentAnalyticsAdapter({ writeKey: '…' }),
  // clevertap / appsflyer / facebook-pixel / tiktok / klaviyo / moengage
]);
// <AnalyticsProvider> already uses the `analytics` singleton — nothing else to wire
```

The theme's public `AnalyticsService` surface (`initialize` / `identify` / `track` /
`screen` / `reset` / `logError` / `setEnabled`) is unchanged, so `<AnalyticsProvider>`
consumes the `analytics` singleton with no cast and no per-SDK provider.

## Default lifecycle events

`ApptileCoreEvents` / `DefaultEvents` carry the canonical names the theme emits —
`apptile_first_open` / `apptile_app_open`, `addToCart`, `purchase`, … — which each provider
adapter maps onto its vendor's event vocabulary.

## Development

```sh
npm run build   # clean + tsc
npm run lint    # tsc --noEmit
```
