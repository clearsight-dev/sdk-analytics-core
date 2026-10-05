// The inputs of the payload snapshot (test/fixtures/amore-v2-payloads.json): shaped like sdk-shopify's
// Product, ProductVariant, Cart, CartLine and Customer. The same inputs went through amore-v2's own builders
// (src/core/analytics/events.ts, 2026-10-06, before SDK move 7) to make the snapshot, so the SDK's
// builders are checked against what the app sent.
const usd = (amount) => ({ amount, currencyCode: "USD" });

export const variant = {
  id: "gid://shopify/ProductVariant/111",
  title: "Medium / Blue",
  sku: "SKU-1",
  availableForSale: true,
  quantityAvailable: 4,
  price: usd("19.50"),
  compareAtPrice: null,
  selectedOptions: [],
  image: null,
};

export const product = {
  id: "gid://shopify/Product/1",
  handle: "blue-dress",
  title: "Blue Dress",
  vendor: "Amore",
  productType: "Dresses",
  availableForSale: true,
  priceRange: { min: usd("15.00"), max: usd("25.00") },
  featuredImage: { url: "https://cdn.example/blue.jpg" },
  variants: [variant],
};

export const productWithoutVendor = {
  ...product,
  id: "gid://shopify/Product/2",
  vendor: "",
  productType: "",
  availableForSale: false,
  featuredImage: null,
};

const line = (id, quantity, merchandise, lineProduct) => ({
  id,
  quantity,
  merchandise,
  attributes: [],
  sellingPlanId: null,
  product: lineProduct,
  cost: { totalAmount: usd("0"), amountPerQuantity: merchandise.price, compareAtAmountPerQuantity: null },
});

export const lineWithProduct = line("gid://shopify/CartLine/a", 2, variant, { id: product.id, title: product.title, handle: product.handle });
export const lineWithoutProduct = line(
  "gid://shopify/CartLine/b",
  1,
  { ...variant, id: "gid://shopify/ProductVariant/222", title: "Default Title", price: usd("7") },
  null,
);
export const lineAtZero = line("gid://shopify/CartLine/c", 0, { ...variant, id: "gid://shopify/ProductVariant/333" }, null);

export const cart = {
  id: "gid://shopify/Cart/abc",
  checkoutUrl: "https://shop/checkout",
  totalQuantity: 3,
  note: null,
  attributes: [],
  buyerIdentity: { countryCode: "US", email: null, phone: null },
  lines: [lineWithProduct, lineWithoutProduct],
  cost: { subtotalAmount: usd("46.00"), totalAmount: usd("49.68"), totalTaxAmount: usd("3.68") },
  discountCodes: [],
  appliedGiftCards: [],
  createdAt: "",
  updatedAt: "",
};

export const cartWithoutTax = { ...cart, id: "gid://shopify/Cart/notax", lines: [lineWithProduct, lineAtZero], cost: { subtotalAmount: usd("39.00"), totalAmount: usd("39.00"), totalTaxAmount: null } };
export const emptyCart = { ...cart, id: "gid://shopify/Cart/empty", lines: [], cost: { subtotalAmount: usd("0.0"), totalAmount: usd("0.0"), totalTaxAmount: null } };

export const customer = { id: "gid://shopify/Customer/9", email: "a@b.c", firstName: "Ann", lastName: "Bee", phone: "+15550001", defaultAddress: null, acceptsMarketing: true };
export const customerWithNulls = { id: "gid://shopify/Customer/10", email: "", firstName: null, lastName: null, phone: null, defaultAddress: null, acceptsMarketing: false };

/** Every builder call to snapshot, by a stable name. `b` is the builder set under test. */
export function payloadsFrom(b) {
  return {
    "productParams(product)": b.productParams(product),
    "productParams(product, variant)": b.productParams(product, variant),
    "productParams(productWithoutVendor, null)": b.productParams(productWithoutVendor, null),
    "checkoutParams(cart)": b.checkoutParams(cart),
    "checkoutParams(emptyCart)": b.checkoutParams(emptyCart),
    "checkoutParams(null)": b.checkoutParams(null),
    "purchaseParams(cart)": b.purchaseParams(cart),
    "purchaseParams(cartWithoutTax)": b.purchaseParams(cartWithoutTax),
    "purchaseParams(null)": b.purchaseParams(null),
    "cartCurrency(cart)": b.cartCurrency(cart),
    "cartCurrency(null)": b.cartCurrency(null),
    "lineItem(lineWithProduct)": b.lineItemParams(lineWithProduct, "USD"),
    "lineItem(lineWithoutProduct)": b.lineItemParams(lineWithoutProduct, "USD"),
    "cartQuantityParams(cart)": b.cartQuantityParams(cart),
    "cartQuantityParams(cartWithoutTax)": b.cartQuantityParams(cartWithoutTax),
    "cartQuantityParams(null)": b.cartQuantityParams(null),
    "customCartParams(cart, add)": b.customCartParams(cart, "add"),
    "customCartParams(cart, update)": b.customCartParams(cart, "update"),
    "customCartParams(null, remove)": b.customCartParams(null, "remove"),
    "authParams(customer)": b.authParams(customer),
    "authParams(customerWithNulls)": b.authParams(customerWithNulls),
    "waitlistParams(product, variant, customer)": b.waitlistParams(product, variant, customer),
    "waitlistParams(productWithoutVendor, variant, null)": b.waitlistParams(productWithoutVendor, variant, null),
    "liveJoinParams(stream-1, 42)": b.liveJoinParams("stream-1", 42),
    "streamItemParams(product, variant, live-1)": b.streamItemParams(product, variant, "live-1"),
    "streamItemParams(product, variant, live-1, live-stream)": b.streamItemParams(product, variant, "live-1", "live-stream"),
    "streamItemParams(product, variant, replay-feed-1, replay)": b.streamItemParams(product, variant, "replay-feed-1", "replay"),
    "streamItemParams(product, null, null)": b.streamItemParams(product, null, null),
  };
}
