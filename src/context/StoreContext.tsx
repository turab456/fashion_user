"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product } from "@/data/products";
import { api } from "@/services/api";

export interface CartItem {
  product: Product;
  size: string;
  color: { name: string; hex: string };
  quantity: number;
}

export interface Address {
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  date: string;
  items: {
    productId: string;
    productName: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  total: number;
  status: string;
  shippingAddress: Address;
}

interface User {
  name: string;
  email: string;
  addresses: Address[];
  orders: Order[];
}

interface StoreContextType {
  cart: CartItem[];
  wishlist: string[];
  recentlyViewed: string[];
  isSearchOpen: boolean;
  isCartOpen: boolean;
  user: User | null;
  addToCart: (product: Product, size: string, colorName: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, colorName: string) => void;
  updateCartQuantity: (productId: string, size: string, colorName: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  addToRecentlyViewed: (productId: string) => void;
  setSearchOpen: (open: boolean) => void;
  setCartOpen: (open: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  createOrder: (address: Address, paymentMethod: string, couponCode?: string) => Promise<Order>;
  taxRate: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Helper to map backend product structure to frontend Product structure
export function mapBackendProductToFrontend(bp: any): Product {
  const colorsMap = new Map<string, { name: string; hex: string; images: string[] }>();
  const sizesSet = new Set<string>();
  
  let basePrice = 0;
  let baseSalePrice: number | null = null;
  
  if (bp.variants && bp.variants.length > 0) {
    basePrice = bp.variants[0].prices?.mrp || 0;
    baseSalePrice = bp.variants[0].prices?.offerPrice || null;
    
    bp.variants.forEach((v: any) => {
      if (v.color) {
        colorsMap.set(v.color.name, {
          name: v.color.name,
          hex: v.color.hex,
          images: v.images && v.images.length > 0 ? v.images : bp.images
        });
      }
      if (v.size) {
        sizesSet.add(v.size.name);
      }
    });
  }
  
  const colors = Array.from(colorsMap.values());
  const sizes = Array.from(sizesSet);
  
  return {
    id: bp.slug, // Use slug as product.id for routing matching
    name: bp.name,
    price: basePrice,
    salePrice: baseSalePrice,
    images: bp.images && bp.images.length > 0 ? bp.images : ["/assets/wool_coat_front.png"],
    colors: colors.length > 0 ? colors : [{ name: "Default", hex: "#000000", images: bp.images }],
    sizes: sizes.length > 0 ? sizes : ["S", "M", "L"],
    category: bp.category?.name || "General",
    description: bp.description || "",
    materials: bp.materials || "",
    care: bp.careInstructions || "",
    shipping: bp.shipping || "Complimentary standard delivery within 3-5 business days. Express shipping available.",
    rating: bp.rating || 4.8,
    reviews: bp.reviews || [],
    isNew: bp.isNewArrival || false,
    isBestSeller: bp.isBestSeller || false,
    isCustomerFavorite: bp.isTrending || bp.isRecommended || false,
    popularity: bp.popularity || 85,
    fabric: bp.materials || "Natural fabrics",
    availability: bp.variants ? bp.variants.some((v: any) => v.stock > 0) : true,
    collectionRef: bp.collectionRef?._id || bp.collectionRef || null
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [taxRate, setTaxRate] = useState<number>(0);
  
  // Cache to store loaded backend variants by product slug/id
  const [variantsCache, setVariantsCache] = useState<Record<string, any[]>>({});

  const cacheVariants = useCallback((slug: string, variants: any[]) => {
    setVariantsCache((prev) => ({ ...prev, [slug]: variants }));
  }, []);

  // Sync state items to database
  const syncCurrentCartToDb = useCallback(async (currentItems: CartItem[]) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("aura_token") : null;
    if (!token) return;

    try {
      const itemsToSync: Array<{ variant: string; quantity: number }> = [];
      for (const item of currentItems) {
        let variantId = "";
        const cachedVariants = variantsCache[item.product.id];
        
        if (cachedVariants) {
          const match = cachedVariants.find(
            (v: any) => v.color?.name === item.color.name && v.size?.name === item.size
          );
          if (match) variantId = match._id;
        }

        if (!variantId) {
          const bpRes = await api.products.getBySlug(item.product.id);
          const bp = bpRes.data;
          if (bp && bp.variants) {
            cacheVariants(item.product.id, bp.variants);
            const match = bp.variants.find(
              (v: any) => v.color?.name === item.color.name && v.size?.name === item.size
            );
            if (match) variantId = match._id;
          }
        }

        if (variantId) {
          itemsToSync.push({ variant: variantId, quantity: item.quantity });
        }
      }
      await api.cart.sync(itemsToSync);
    } catch (err) {
      console.error("Failed to sync cart to database:", err);
    }
  }, [variantsCache, cacheVariants]);

  // Load cart from DB
  const loadDbCart = useCallback(async () => {
    try {
      const cartRes = await api.cart.get();
      const dbCartItems = cartRes.data?.items || [];
      
      const mappedItems: CartItem[] = dbCartItems.map((item: any) => {
        if (!item.variant || !item.variant.product) return null;
        
        const product = mapBackendProductToFrontend(item.variant.product);
        
        if (item.variant.product.variants) {
          cacheVariants(product.id, item.variant.product.variants);
        }

        return {
          product,
          size: item.variant.size?.name || "M",
          color: {
            name: item.variant.color?.name || "Default",
            hex: item.variant.color?.hex || "#000000"
          },
          quantity: item.quantity
        };
      }).filter(Boolean) as CartItem[];
      
      setCart(mappedItems);
    } catch (err: any) {
      console.error("Failed to load cart from database:", err);
      if (err.message?.includes("Invalid or expired access token") || err.status === 401) {
        localStorage.removeItem("aura_token");
        localStorage.removeItem("aura_user");
        setUser(null);
      }
    }
  }, [cacheVariants]);

  // Load user profile detail (orders)
  const loadDbUserDetail = useCallback(async () => {
    try {
      const ordersRes = await api.orders.myOrders();
      const dbOrders = ordersRes.data || [];
      
      const mappedOrders: Order[] = dbOrders.map((ord: any) => ({
        id: ord.orderNumber || ord._id,
        date: ord.createdAt ? ord.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
        items: (ord.items || []).map((item: any) => ({
          productId: item.product?.slug || item.product?._id || "",
          productName: item.product?.name || item.productName || "",
          size: item.size || "M",
          color: item.color || "Default",
          price: item.price,
          quantity: item.quantity,
          image: item.image || (item.product?.images && item.product.images[0]) || ""
        })),
        total: ord.totals?.grandTotal || ord.totalAmount || 0,
        status: ord.status,
        shippingAddress: ord.shippingAddress || { name: "", street: "", city: "", zip: "", country: "" }
      }));

      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          orders: mappedOrders
        };
      });
    } catch (err: any) {
      console.error("Failed to load user details from database:", err);
      if (err.message?.includes("Invalid or expired access token") || err.status === 401) {
        localStorage.removeItem("aura_token");
        localStorage.removeItem("aura_user");
        setUser(null);
      }
    }
  }, []);

  // Load initial settings from local storage
  useEffect(() => {
    const savedWishlist = localStorage.getItem("aura_wishlist");
    const savedRecent = localStorage.getItem("aura_recent");
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    if (savedRecent) setRecentlyViewed(JSON.parse(savedRecent));

    const token = localStorage.getItem("aura_token");
    const savedUser = localStorage.getItem("aura_user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      loadDbCart();
      loadDbUserDetail();
    } else {
      const savedCart = localStorage.getItem("aura_cart");
      if (savedCart) setCart(JSON.parse(savedCart));
    }
  }, [loadDbCart, loadDbUserDetail]);

  // Sync to local storage on changes (only for guests)
  useEffect(() => {
    const token = localStorage.getItem("aura_token");
    if (!token) {
      localStorage.setItem("aura_cart", JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("aura_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("aura_recent", JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("aura_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("aura_user");
    }
  }, [user]);

  const addToCart = useCallback((product: Product, size: string, colorName: string, quantity = 1) => {
    const colorOption = product.colors.find((c) => c.name === colorName) || product.colors[0];
    const color = { name: colorOption.name, hex: colorOption.hex };

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.size === size &&
          item.color.name === colorName
      );

      let updatedCart;
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += quantity;
        updatedCart = newCart;
      } else {
        updatedCart = [...prevCart, { product, size, color, quantity }];
      }

      // Sync updated cart to DB
      syncCurrentCartToDb(updatedCart);
      return updatedCart;
    });

    setCartOpen(true);
  }, [syncCurrentCartToDb]);

  const removeFromCart = useCallback((productId: string, size: string, colorName: string) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.size === size &&
            item.color.name === colorName
          )
      );
      syncCurrentCartToDb(updatedCart);
      return updatedCart;
    });
  }, [syncCurrentCartToDb]);

  const updateCartQuantity = useCallback((productId: string, size: string, colorName: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, colorName);
      return;
    }
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.product.id === productId &&
        item.size === size &&
        item.color.name === colorName
          ? { ...item, quantity }
          : item
      );
      syncCurrentCartToDb(updatedCart);
      return updatedCart;
    });
  }, [removeFromCart, syncCurrentCartToDb]);

  const clearCart = useCallback(() => {
    setCart([]);
    syncCurrentCartToDb([]);
  }, [syncCurrentCartToDb]);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const addToRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewed((prev) => {
      if (prev.includes(productId) && prev[0] === productId) return prev;
      const filtered = prev.filter((id) => id !== productId);
      return [productId, ...filtered].slice(0, 5);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    const { user: userObj, accessToken } = res.data;
    localStorage.setItem("aura_token", accessToken);

    const guestCart = [...cart];

    const mappedUser: User = {
      name: userObj.name,
      email: userObj.email,
      addresses: userObj.addresses || [],
      orders: []
    };
    setUser(mappedUser);
    localStorage.setItem("aura_user", JSON.stringify(mappedUser));

    // Merge guest cart items into user's DB cart
    if (guestCart.length > 0) {
      try {
        const itemsToSync = [];
        for (const item of guestCart) {
          const bpRes = await api.products.getBySlug(item.product.id);
          const bp = bpRes.data;
          if (bp && bp.variants) {
            const match = bp.variants.find(
              (v: any) => v.color?.name === item.color.name && v.size?.name === item.size
            );
            if (match) {
              itemsToSync.push({ variant: match._id, quantity: item.quantity });
            }
          }
        }
        if (itemsToSync.length > 0) {
          await api.cart.sync(itemsToSync);
        }
      } catch (err) {
        console.error("Failed to sync guest cart to DB upon login:", err);
      }
    }

    await loadDbCart();
    await loadDbUserDetail();
  }, [cart, loadDbCart, loadDbUserDetail]);

  const loadTaxRate = async () => {
    try {
      const res = await api.masters.list("taxes");
      if (res.data && res.data.length > 0) {
        setTaxRate(res.data[0].rate || 0);
      }
    } catch (err) {
      console.warn("Failed to load tax rate, defaulting to 0:", err);
    }
  };

  useEffect(() => {
    const initStore = async () => {
      await loadDbUserDetail();
      await loadDbCart();
      await loadTaxRate();
    };
    initStore();
  }, [loadDbUserDetail, loadDbCart]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await api.auth.register({ name, email, password });
    await login(email, password);
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error("Failed to logout from API, clearing local session:", err);
    }
    localStorage.removeItem("aura_token");
    localStorage.removeItem("aura_user");
    localStorage.removeItem("aura_cart");
    setUser(null);
    setCart([]);
  }, []);

  const createOrder = useCallback(async (address: Address, paymentMethod: string, couponCode?: string): Promise<Order> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("aura_token") : null;
    if (token) {
      const checkoutRes = await api.orders.checkout({
        shippingAddress: {
          name: address.name,
          street: address.street,
          city: address.city,
          zip: address.zip,
          country: address.country
        },
        billingAddress: {
          name: address.name,
          street: address.street,
          city: address.city,
          zip: address.zip,
          country: address.country
        },
        paymentGateway: paymentMethod === "Cash on Delivery" ? "COD" : "Stripe",
        couponCode
      });

      const ord = checkoutRes.data;
      await loadDbUserDetail();
      setCart([]); // Clear state cart
      
      return {
        id: ord.orderNumber || ord._id,
        date: ord.createdAt ? ord.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
        items: (ord.items || []).map((item: any) => ({
          productId: item.product || "",
          productName: item.name || "",
          size: item.size || "M",
          color: item.color || "Default",
          price: item.price,
          quantity: item.quantity,
          image: item.image || ""
        })),
        total: ord.totals?.grandTotal || ord.totalAmount || 0,
        status: ord.status,
        shippingAddress: address
      };
    } else {
      // Guest order checkout fallback
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        size: item.size,
        color: item.color.name,
        price: item.product.salePrice || item.product.price,
        quantity: item.quantity,
        image: item.product.images[0]
      }));

      const total = cart.reduce(
        (sum, item) => sum + (item.product.salePrice || item.product.price) * item.quantity,
        0
      );

      const newOrder: Order = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split("T")[0],
        items: orderItems,
        total,
        status: "Processing",
        shippingAddress: address
      };

      setCart([]);
      return newOrder;
    }
  }, [cart, loadDbUserDetail]);

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        recentlyViewed,
        isSearchOpen,
        isCartOpen,
        user,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        addToRecentlyViewed,
        setSearchOpen,
        setCartOpen,
        login,
        register,
        logout,
        createOrder,
        taxRate
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
