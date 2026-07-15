"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/context/StoreContext";

export default function CartDrawer() {
  const { isCartOpen, setCartOpen, cart, updateCartQuantity, removeFromCart } = useStore();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.product.salePrice || item.product.price) * item.quantity,
    0
  );

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="absolute inset-0 bg-primary"
          />

          {/* Drawer Wrapper */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ translateX: "100%" }}
              animate={{ translateX: 0 }}
              exit={{ translateX: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="w-screen max-w-md bg-white flex flex-col shadow-xl"
            >
              {/* Header */}
              <div className="px-6 py-6 border-b border-border-custom flex items-center justify-between">
                <span className="text-[13px] uppercase tracking-widest font-semibold text-primary">
                  Shopping Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
                </span>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-1 -mr-2 text-primary hover:opacity-75 focus:outline-none"
                  aria-label="Close cart"
                >
                  <X strokeWidth={1} className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-border-custom">
                {cart.length > 0 ? (
                  cart.map((item, idx) => {
                    const price = item.product.salePrice || item.product.price;
                    return (
                      <div key={`${item.product.id}-${item.size}-${item.color.name}-${idx}`} className="py-6 flex">
                        {/* Product Image */}
                        <div
                          className="w-20 h-25 bg-cover bg-center flex-shrink-0"
                          style={{ backgroundImage: `url(${item.product.images[0]})` }}
                        />

                        {/* Product Details */}
                        <div className="ml-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="text-[13px] font-semibold uppercase tracking-wider text-primary">
                                <Link
                                  href={`/product/${item.product.id}`}
                                  onClick={() => setCartOpen(false)}
                                  className="hover:text-accent transition-colors"
                                >
                                  {item.product.name}
                                </Link>
                              </h4>
                              <p className="text-[13px] font-medium text-primary ml-2">
                                ₹{price * item.quantity}
                              </p>
                            </div>
                            <p className="text-[11px] uppercase tracking-wider text-secondary mt-1">
                              Size: {item.size} / Color: {item.color.name}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-border-custom bg-brand-bg">
                              <button
                                onClick={() =>
                                  updateCartQuantity(
                                    item.product.id,
                                    item.size,
                                    item.color.name,
                                    item.quantity - 1
                                  )
                                }
                                className="px-2 py-1 text-secondary hover:text-primary transition-colors focus:outline-none"
                                aria-label="Decrease quantity"
                              >
                                <Minus strokeWidth={1} className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3 text-xs text-primary font-sans font-medium select-none">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateCartQuantity(
                                    item.product.id,
                                    item.size,
                                    item.color.name,
                                    item.quantity + 1
                                  )
                                }
                                className="px-2 py-1 text-secondary hover:text-primary transition-colors focus:outline-none"
                                aria-label="Increase quantity"
                              >
                                <Plus strokeWidth={1} className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Remove Icon */}
                            <button
                              onClick={() =>
                                removeFromCart(item.product.id, item.size, item.color.name)
                              }
                              className="text-secondary hover:text-sale p-1 transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 strokeWidth={1} className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                    <p className="font-serif text-lg text-secondary uppercase tracking-widest mb-6">
                      Your bag is empty
                    </p>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="text-xs uppercase tracking-widest font-semibold border-b border-primary pb-1 hover:text-accent hover:border-accent transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                )}
              </div>

              {/* Footer Summary */}
              {cart.length > 0 && (
                <div className="border-t border-border-custom px-6 py-6 bg-brand-bg space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs uppercase tracking-wider text-secondary">
                      <span>Subtotal</span>
                      <span className="text-primary font-medium">₹{subtotal} INR</span>
                    </div>
                    <div className="flex justify-between text-xs uppercase tracking-wider text-secondary">
                      <span>Shipping</span>
                      <span className="text-success font-medium">Complimentary</span>
                    </div>
                    <p className="text-[11px] text-secondary italic">
                      Tax and final shipping charges calculated at checkout.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Link
                      href="/checkout"
                      onClick={() => setCartOpen(false)}
                      className="w-full flex items-center justify-center space-x-2 bg-primary text-white py-4 text-xs font-semibold uppercase tracking-widest hover:bg-hover transition-colors"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight strokeWidth={1} className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="w-full text-center py-2 text-xs uppercase tracking-widest font-semibold text-secondary hover:text-primary transition-colors focus:outline-none"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
