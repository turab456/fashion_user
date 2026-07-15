const BASE_URL = "http://localhost:5000/api/v1";

const getHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("aura_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

export async function request(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { ...getHeaders(), ...options.headers };
  const res = await fetch(url, { ...options, headers });
  
  if (!res.ok) {
    let errMsg = `Request failed with status ${res.status}`;
    try {
      const errData = await res.json();
      errMsg = errData.message || errMsg;
    } catch (_) {}
    throw new Error(errMsg);
  }

  const payload = await res.json();
  return payload; // returns { success: true, message: "...", data: ... }
}

export const api = {
  auth: {
    login: (body: any) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
    register: (body: any) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
    logout: () => request("/auth/logout", { method: "POST" }),
  },
  products: {
    list: (query: Record<string, any>) => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          params.append(k, String(v));
        }
      });
      const qs = params.toString() ? `?${params.toString()}` : "";
      return request(`/products${qs}`);
    },
    getBySlug: (slug: string) => request(`/products/slug/${slug}`),
    getById: (id: string) => request(`/products/${id}`),
  },
  cart: {
    get: () => request("/cart"),
    sync: (items: Array<{ variant: string; quantity: number }>) =>
      request("/cart/sync", { method: "POST", body: JSON.stringify({ items }) }),
    addItem: (variantId: string, quantity: number) =>
      request("/cart", { method: "POST", body: JSON.stringify({ variantId, quantity }) }),
    removeItem: (variantId: string) =>
      request(`/cart/${variantId}`, { method: "DELETE" }),
  },
  orders: {
    checkout: (body: any) => request("/orders/checkout", { method: "POST", body: JSON.stringify(body) }),
    myOrders: () => request("/orders/my-orders"),
    getById: (id: string) => request(`/orders/${id}`),
    verifyRazorpay: (orderId: string, paymentId: string, signature: string) => 
      request("/orders/verify-razorpay", { 
        method: "POST", 
        body: JSON.stringify({ orderId, paymentId, signature }) 
      }),
  },
  reviews: {
    getProductReviews: (productId: string) => request(`/reviews/product/${productId}`),
    createReview: (body: any) => request("/reviews", { method: "POST", body: JSON.stringify(body) }),
  },
  customer: {
    addAddress: (body: any) => request("/customers/addresses", { method: "POST", body: JSON.stringify(body) }),
    wishlist: (productId: string) => request("/customers/wishlist", { method: "POST", body: JSON.stringify({ productId }) }),
    addRecentlyViewed: (productId: string) => request("/customers/recently-viewed", { method: "POST", body: JSON.stringify({ productId }) }),
  },
  coupons: {
    validate: (code: string, subtotal: number) =>
      request("/coupons/validate", {
        method: "POST",
        body: JSON.stringify({ code, subtotal })
      }),
  },
  marketing: {
    getActiveCampaign: () => request("/marketing/campaigns/active"),
    track: (id: string, type: "impression" | "click") => request(`/marketing/campaigns/track/${id}`, { method: "POST", body: JSON.stringify({ type }) }),
  },
  masters: {
    list: (masterType: string) => request(`/master/${masterType}`),
  },
  cms: {
    getBanners: () => request("/cms/banners"),
    getHomepage: () => request("/cms/homepage"),
  }
};
