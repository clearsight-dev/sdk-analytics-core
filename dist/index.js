"use strict";
// @tiledev/sdk-analytics-core — the dependency-free analytics contract shared by
// every @tiledev/sdk-analytics-* provider and the theme's AnalyticsService.
//
// The AnalyticsAdapter interface each provider implements, the DefaultEvents catalogue, the
// EventProperties/UserTraits shapes, and (since 0.3.0) the builders for what each event carries.
// No dependencies, no registry, no React: the fan-out lives in the app's provider
// (`ApptileAnalyticsProvider` in @tiledev/sdk-analytics-apptile).
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
exports.cartAndWishlistEvents = exports.streamPurchaseParams = exports.streamCheckoutParams = exports.cartHasShows = exports.showAddToCartEvent = exports.streamItemParams = exports.liveJoinParams = exports.searchParams = exports.collectionViewParams = exports.waitlistSubscriptionEvent = exports.waitlistParams = exports.authParams = exports.customCartParams = exports.cartQuantityParams = exports.purchaseParams = exports.checkoutParams = exports.lineItemParams = exports.cartCurrency = exports.productParams = exports.toItem = exports.trackProps = exports.DefaultEvents = exports.ApptileCoreEvents = void 0;
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
// What each event carries, built from the Shopify objects an app holds (SDK move 7).
var eventParams_1 = require("./eventParams");
Object.defineProperty(exports, "productParams", { enumerable: true, get: function () { return eventParams_1.productParams; } });
Object.defineProperty(exports, "cartCurrency", { enumerable: true, get: function () { return eventParams_1.cartCurrency; } });
Object.defineProperty(exports, "lineItemParams", { enumerable: true, get: function () { return eventParams_1.lineItemParams; } });
Object.defineProperty(exports, "checkoutParams", { enumerable: true, get: function () { return eventParams_1.checkoutParams; } });
Object.defineProperty(exports, "purchaseParams", { enumerable: true, get: function () { return eventParams_1.purchaseParams; } });
Object.defineProperty(exports, "cartQuantityParams", { enumerable: true, get: function () { return eventParams_1.cartQuantityParams; } });
Object.defineProperty(exports, "customCartParams", { enumerable: true, get: function () { return eventParams_1.customCartParams; } });
Object.defineProperty(exports, "authParams", { enumerable: true, get: function () { return eventParams_1.authParams; } });
Object.defineProperty(exports, "waitlistParams", { enumerable: true, get: function () { return eventParams_1.waitlistParams; } });
Object.defineProperty(exports, "waitlistSubscriptionEvent", { enumerable: true, get: function () { return eventParams_1.waitlistSubscriptionEvent; } });
Object.defineProperty(exports, "collectionViewParams", { enumerable: true, get: function () { return eventParams_1.collectionViewParams; } });
Object.defineProperty(exports, "searchParams", { enumerable: true, get: function () { return eventParams_1.searchParams; } });
Object.defineProperty(exports, "liveJoinParams", { enumerable: true, get: function () { return eventParams_1.liveJoinParams; } });
Object.defineProperty(exports, "streamItemParams", { enumerable: true, get: function () { return eventParams_1.streamItemParams; } });
Object.defineProperty(exports, "showAddToCartEvent", { enumerable: true, get: function () { return eventParams_1.showAddToCartEvent; } });
Object.defineProperty(exports, "cartHasShows", { enumerable: true, get: function () { return eventParams_1.cartHasShows; } });
Object.defineProperty(exports, "streamCheckoutParams", { enumerable: true, get: function () { return eventParams_1.streamCheckoutParams; } });
Object.defineProperty(exports, "streamPurchaseParams", { enumerable: true, get: function () { return eventParams_1.streamPurchaseParams; } });
Object.defineProperty(exports, "cartAndWishlistEvents", { enumerable: true, get: function () { return eventParams_1.cartAndWishlistEvents; } });
//# sourceMappingURL=index.js.map