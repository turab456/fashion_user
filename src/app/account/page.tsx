"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { User, ShoppingBag, Heart, MapPin, RefreshCw, Lock, Power } from "lucide-react";
import { useStore, Address, mapBackendProductToFrontend } from "@/context/StoreContext";
import { Product } from "@/data/products";
import { api } from "@/services/api";
import Footer from "@/components/Footer";

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, register, logout, wishlist, toggleWishlist, addToCart } = useStore();

  const [dbProducts, setDbProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchAccountProducts() {
      try {
        const res = await api.products.list({ limit: 100 });
        const items = res.data || [];
        setDbProducts(items.map(mapBackendProductToFrontend));
      } catch (err) {
        console.error("Failed to load products for account page:", err);
      }
    }
    fetchAccountProducts();
  }, []);

  // Selected tab: profile | orders | wishlist | addresses | returns | password
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync state tab to search params
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Auth form states
  const [isLoginView, setIsLoginView] = useState(true);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  const [authError, setAuthError] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoadingAuth(true);

    try {
      if (isLoginView) {
        if (authEmail.trim() && authPassword.length >= 6) {
          await login(authEmail, authPassword);
        } else {
          alert("Please enter a valid email and password (min 6 characters).");
        }
      } else {
        if (authName.trim() && authEmail.trim() && authPassword.length >= 6) {
          await register(authName, authEmail, authPassword);
        } else {
          alert("Please complete all signup fields (password min 6 characters).");
        }
      }
    } catch (err: any) {
      console.error("Auth submit failed:", err);
      setAuthError(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/account?tab=${tab}`);
  };

  // Auth Panel (If not logged in)
  if (!user) {
    return (
      <div className="pt-20 min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-full max-w-[450px] px-6 py-16 bg-white border border-border-custom shadow-[0_4px_12px_rgba(0,0,0,0.01)] my-12">
          {/* Header */}
          <div className="text-center mb-8 select-none">
            <span className="font-serif text-3xl tracking-[0.2em] uppercase text-primary">
              HOQ
            </span>
            <p className="text-[10px] uppercase tracking-widest text-secondary mt-3">
              {isLoginView ? "Sign in to your account" : "Create a new account"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-5">
            {!isLoginView && (
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full bg-transparent border border-border-custom p-3.5 text-xs font-medium uppercase tracking-wider focus:outline-none focus:border-primary"
                  placeholder="Jane Doe"
                />
              </div>
            )}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full bg-transparent border border-border-custom p-3.5 text-xs font-medium uppercase tracking-wider focus:outline-none focus:border-primary"
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full bg-transparent border border-border-custom p-3.5 text-xs font-medium uppercase tracking-wider focus:outline-none focus:border-primary"
                placeholder="••••••••"
              />
            </div>

            {authError && (
              <p className="text-xs text-sale font-medium text-center uppercase tracking-widest mt-2 select-none">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={loadingAuth}
              className="w-full bg-primary text-white py-4 text-xs font-semibold uppercase tracking-widest hover:bg-hover transition-colors mt-6 focus:outline-none disabled:opacity-50"
            >
              {loadingAuth ? "Processing..." : (isLoginView ? "Sign In" : "Register")}
            </button>
          </form>

          {/* Switch link */}
          <div className="text-center mt-8 pt-6 border-t border-border-custom select-none">
            <button
              onClick={() => setIsLoginView(!isLoginView)}
              className="text-xs uppercase tracking-widest font-semibold text-secondary hover:text-primary transition-colors focus:outline-none"
            >
              {isLoginView ? "New to HOQ? Create Account" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loaded Wishlist items
  const wishlistedProducts = dbProducts.filter((p) => wishlist.includes(p.id));

  // Tab Menu Items
  const menuItems = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "orders", label: "Order History", icon: ShoppingBag },
    { id: "wishlist", label: "My Wishlist", icon: Heart },
    { id: "addresses", label: "Saved Addresses", icon: MapPin },
    { id: "returns", label: "Returns Portal", icon: RefreshCw },
    { id: "password", label: "Change Password", icon: Lock }
  ];

  return (
    <div className="pt-20 min-h-screen bg-brand-bg">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        {/* Account Header */}
        <div className="border-b border-border-custom pb-8 mb-10 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-secondary font-medium block mb-2">
              Welcome Back
            </span>
            <h1 className="text-2xl md:text-4xl font-serif text-primary uppercase tracking-wider">
              {user.name}
            </h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center text-xs uppercase tracking-widest font-semibold text-secondary hover:text-sale transition-colors focus:outline-none"
          >
            <Power strokeWidth={1.5} className="w-4 h-4 mr-2" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Navigation Menu (3 Columns) */}
          <aside className="lg:col-span-3 border border-border-custom bg-white select-none">
            <nav className="divide-y divide-border-custom">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full text-left px-6 py-4 text-xs uppercase tracking-widest font-semibold flex items-center justify-between transition-colors ${isActive ? "bg-brand-bg text-accent" : "hover:bg-brand-bg/50 text-secondary hover:text-primary"
                      }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <Icon strokeWidth={1.5} className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 bg-accent rounded-full" />}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right Column: Tab View (9 Columns) */}
          <div className="lg:col-span-9 bg-white border border-border-custom p-6 md:p-8 min-h-[500px]">
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-sm uppercase tracking-widest font-semibold text-primary border-b border-border-custom pb-3 mb-6">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-secondary font-semibold block mb-1">
                      Full Name
                    </span>
                    <p className="text-sm font-medium text-primary">{user.name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-secondary font-semibold block mb-1">
                      Email Address
                    </span>
                    <p className="text-sm font-medium text-primary">{user.email}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-secondary font-semibold block mb-1">
                      Country
                    </span>
                    <p className="text-sm font-medium text-primary">United States</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-secondary font-semibold block mb-1">
                      HOQ Membership Status
                    </span>
                    <p className="text-xs uppercase tracking-widest font-semibold text-accent mt-0.5">
                      Elite Member
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h2 className="text-sm uppercase tracking-widest font-semibold text-primary border-b border-border-custom pb-3 mb-6">
                  Order History ({user.orders.length})
                </h2>

                {user.orders.length > 0 ? (
                  <div className="space-y-6">
                    {user.orders.map((order) => (
                      <div key={order.id} className="border border-border-custom p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-border-custom pb-4 text-xs uppercase tracking-wider font-sans">
                          <div>
                            <span className="text-secondary block mb-0.5">Order ID</span>
                            <span className="text-primary font-semibold">{order.id}</span>
                          </div>
                          <div>
                            <span className="text-secondary block mb-0.5">Placed On</span>
                            <span className="text-primary font-semibold">{order.date}</span>
                          </div>
                          <div>
                            <span className="text-secondary block mb-0.5">Status</span>
                            <span className="text-success font-semibold">{order.status}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-secondary block mb-0.5">Total Paid</span>
                            <span className="text-primary font-semibold">₹{order.total} INR</span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="divide-y divide-border-custom">
                          {order.items.map((item, index) => (
                            <div key={index} className="py-4 flex justify-between items-center text-xs">
                              <div className="flex items-center space-x-4">
                                <div
                                  className="w-10 h-13 bg-cover bg-center flex-shrink-0"
                                  style={{ backgroundImage: `url(${item.image})` }}
                                />
                                <div>
                                  <Link
                                    href={`/product/${item.productId}`}
                                    className="font-semibold uppercase text-primary hover:text-accent"
                                  >
                                    {item.productName}
                                  </Link>
                                  <p className="text-[10px] text-secondary uppercase mt-0.5">
                                    Size: {item.size} / Color: {item.color}
                                  </p>
                                </div>
                              </div>
                              <span className="text-secondary">Qty: {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-secondary py-12 text-center uppercase tracking-widest font-medium">
                    No orders placed yet.
                  </p>
                )}
              </div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === "wishlist" && (
              <div className="space-y-6">
                <h2 className="text-sm uppercase tracking-widest font-semibold text-primary border-b border-border-custom pb-3 mb-6">
                  Saved Products ({wishlistedProducts.length})
                </h2>

                {wishlistedProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {wishlistedProducts.map((product) => (
                      <div key={product.id} className="relative flex flex-col bg-white border border-border-custom p-4">
                        <div
                          className="aspect-[4/5] bg-cover bg-center mb-4 cursor-pointer"
                          style={{ backgroundImage: `url(${product.images[0]})` }}
                          onClick={() => router.push(`/product/${product.id}`)}
                        />
                        <h3 className="text-xs uppercase tracking-widest font-semibold text-primary truncate">
                          {product.name}
                        </h3>
                        <p className="text-xs text-secondary mt-1">₹{product.price} INR</p>

                        <div className="grid grid-cols-2 gap-2 mt-4 select-none">
                          <button
                            onClick={() => addToCart(product, product.sizes[0], product.colors[0].name, 1)}
                            className="bg-primary text-white py-2 text-[10px] font-semibold uppercase tracking-widest hover:bg-hover transition-colors"
                          >
                            Add +
                          </button>
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="border border-border-custom text-secondary py-2 text-[10px] font-semibold uppercase tracking-widest hover:border-primary hover:text-primary transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-secondary py-12 text-center uppercase tracking-widest font-medium">
                    Your wishlist is empty.
                  </p>
                )}
              </div>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <h2 className="text-sm uppercase tracking-widest font-semibold text-primary border-b border-border-custom pb-3 mb-6">
                  Saved Addresses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.addresses.map((address, idx) => (
                    <div key={idx} className="border border-border-custom p-6 space-y-3 relative">
                      <span className="absolute top-4 right-4 bg-accent/15 text-accent text-[9px] font-semibold tracking-widest px-2 py-0.5 uppercase">
                        {idx === 0 ? "Default" : "Secondary"}
                      </span>
                      <p className="text-xs font-semibold uppercase text-primary">{address.name}</p>
                      <p className="text-xs text-secondary font-light tracking-wider leading-relaxed">
                        {address.street} <br />
                        {address.city}, {address.zip} <br />
                        {address.country}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RETURNS PORTAL */}
            {activeTab === "returns" && (
              <div className="space-y-6">
                <h2 className="text-sm uppercase tracking-widest font-semibold text-primary border-b border-border-custom pb-3 mb-6">
                  Returns Portal
                </h2>
                <p className="text-xs tracking-wider text-secondary leading-relaxed font-light mb-4">
                  Delivered orders qualify for returns within 14 days of receipt. Enter your order ID and reason below to trigger a pre-paid courier label.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("A pre-paid returns authorization email has been dispatched with packaging details.");
                  }}
                  className="space-y-4 max-w-md"
                >
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">
                      Select Order ID
                    </label>
                    <select className="w-full bg-transparent border border-border-custom p-3.5 text-xs font-medium uppercase tracking-wider focus:outline-none focus:border-primary appearance-none cursor-pointer">
                      {user.orders.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.id} - Total: ₹{o.total} INR
                        </option>
                      ))}
                      {user.orders.length === 0 && <option value="">No qualified orders</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">
                      Reason for Return
                    </label>
                    <select className="w-full bg-transparent border border-border-custom p-3.5 text-xs font-medium uppercase tracking-wider focus:outline-none focus:border-primary appearance-none cursor-pointer">
                      <option value="size">Size does not fit</option>
                      <option value="expectation">Item does not match expectations</option>
                      <option value="damage">Item arrived damaged</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="bg-primary text-white py-3.5 px-8 text-xs font-semibold uppercase tracking-widest hover:bg-hover transition-colors focus:outline-none"
                  >
                    Request Return Shipping Label
                  </button>
                </form>
              </div>
            )}

            {/* PASSWORD RESET TAB */}
            {activeTab === "password" && (
              <div className="space-y-6">
                <h2 className="text-sm uppercase tracking-widest font-semibold text-primary border-b border-border-custom pb-3 mb-6">
                  Change Password
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("Password updated successfully.");
                  }}
                  className="space-y-4 max-w-md"
                >
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      className="w-full bg-transparent border border-border-custom p-3.5 text-xs font-medium uppercase tracking-wider focus:outline-none focus:border-primary"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      className="w-full bg-transparent border border-border-custom p-3.5 text-xs font-medium uppercase tracking-wider focus:outline-none focus:border-primary"
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-primary text-white py-3.5 px-8 text-xs font-semibold uppercase tracking-widest hover:bg-hover transition-colors focus:outline-none"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-bg pt-32 text-center text-xs tracking-widest uppercase">
          Loading Dashboard...
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
