"use strict";
// @tiledev/sdk-analytics-core — the dependency-free analytics contract shared by
// every @tiledev/sdk-analytics-* provider and the theme's AnalyticsService.
//
// This package is types + events only: the AnalyticsAdapter interface each provider
// implements, the DefaultEvents catalogue, and the EventProperties/UserTraits shapes.
// The fan-out lives in the theme's AnalyticsService (which holds the adapter list).
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toItem = exports.trackProps = exports.DefaultEvents = exports.ApptileCoreEvents = void 0;
__exportStar(require("./types"), exports);
var events_1 = require("./events");
Object.defineProperty(exports, "ApptileCoreEvents", { enumerable: true, get: function () { return events_1.ApptileCoreEvents; } });
Object.defineProperty(exports, "DefaultEvents", { enumerable: true, get: function () { return events_1.DefaultEvents; } });
// The TYPED property contract: `events.ts` names the events, `eventProps.ts` says
// what each must carry, so a missing `variantId` is a compile error rather than a
// silently absent column in the dashboard.
var eventProps_1 = require("./eventProps");
Object.defineProperty(exports, "trackProps", { enumerable: true, get: function () { return eventProps_1.trackProps; } });
Object.defineProperty(exports, "toItem", { enumerable: true, get: function () { return eventProps_1.toItem; } });
//# sourceMappingURL=index.js.map