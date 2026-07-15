"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, CreditCard, ChevronRight, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { useStore, Address } from "@/context/StoreContext";
import { api } from "@/services/api";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckoutPage() {
  const { cart, clearCart, createOrder, user, taxRate } = useStore();

  // Multi-step state: "shipping" | "delivery" | "payment" | "success"
  const [step, setStep] = useState<"shipping" | "delivery" | "payment" | "success">("shipping");

  // Shipping form state
  const [shippingAddress, setShippingAddress] = useState<Address>({
    name: user?.name || "",
    street: user?.addresses[0]?.street || "",
    city: user?.addresses[0]?.city || "",
    zip: user?.addresses[0]?.zip || "",
    country: user?.addresses[0]?.country || "United States"
  });
  const [email, setEmail] = useState(user?.email || "");

  // Shipping method
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");

  // Coupon code
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0); // in dollars
  const [appliedCoupon, setAppliedCoupon] = useState("");

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"card" | "razorpay" | "upi" | "wallet">("card");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvc: "" });
  const [upiDetails, setUpiDetails] = useState("");

  // Completed Order info state
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Subtotal details
  const subtotal = cart.reduce(
    (sum, item) => sum + (item.product.salePrice || item.product.price) * item.quantity,
    0
  );
  const shippingCost = shippingMethod === "express" ? 25 : 0;
  const tax = Math.round((subtotal - discount) * (taxRate / 100));
  const grandTotal = subtotal - discount + shippingCost + tax;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const res = await api.coupons.validate(couponCode.toUpperCase().trim(), subtotal);
      const val = res.data;
      setDiscount(val.discountAmount);
      setAppliedCoupon(val.code);
      setCouponMessage(`Coupon applied! You saved ₹${val.discountAmount}.`);
      setCouponError(null);
      setCouponCode("");
    } catch (err: any) {
      console.error("Coupon validation failed:", err);
      setCouponError(err.message || "Failed to validate coupon code.");
      setCouponMessage(null);
    }
  };

  const submitShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !shippingAddress.name || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zip) {
      alert("Please complete all shipping address fields.");
      return;
    }
    setStep("delivery");
  };

  const submitDelivery = () => {
    setStep("payment");
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment validation
    if (paymentMethod === "card") {
      if (cardDetails.number.replace(/\s/g, "").length < 16 || cardDetails.expiry.length < 5 || cardDetails.cvc.length < 3) {
        alert("Please enter valid card details.");
        return;
      }
    } else if (paymentMethod === "upi") {
      if (!upiDetails.includes("@")) {
        alert("Please enter a valid UPI ID (e.g. name@upi).");
        return;
      }
    }

    try {
      // Call store createOrder to update user profile order history
      const orderObj = await createOrder(shippingAddress, paymentMethod, appliedCoupon || undefined);
      setConfirmedOrder({
        ...orderObj,
        shippingCost,
        tax,
        discount,
        grandTotal,
        email,
        paymentMethod
      });
      setStep("success");
    } catch (err: any) {
      console.error("Checkout failed:", err);
      alert(err.message || "Failed to process checkout. Please try again.");
    }
  };

  // Success Confirmation State
  if (step === "success" && confirmedOrder) {
    return (
      <div className="pt-20 min-h-screen bg-brand-bg select-none">
        <div className="max-w-[700px] mx-auto px-6 py-20 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle2 strokeWidth={1} className="w-16 h-16 text-success" />
          </div>
          <span className="text-[11px] uppercase tracking-widest text-secondary font-medium block mb-2">
            Payment Authorized
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-light text-primary uppercase tracking-wider mb-4">
            Thank you for your order
          </h1>
          <p className="text-xs tracking-wider text-secondary uppercase max-w-md mx-auto mb-10 leading-relaxed">
            Your payment was processed successfully. A confirmation email has been dispatched to <span className="font-semibold text-primary">{confirmedOrder.email}</span>.
          </p>

          {/* Receipt details */}
          <div className="bg-white border border-border-custom text-left p-6 md:p-8 space-y-6 mb-8 font-sans">
            <div className="flex justify-between items-center border-b border-border-custom pb-4 text-xs uppercase tracking-wider">
              <div>
                <span className="text-secondary block">Order Ref</span>
                <span className="text-primary font-semibold">{confirmedOrder.id}</span>
              </div>
              <div className="text-right">
                <span className="text-secondary block">Date</span>
                <span className="text-primary font-semibold">{confirmedOrder.date}</span>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-border-custom">
              {confirmedOrder.items.map((item: any, idx: number) => (
                <div key={idx} className="py-4 flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-12 bg-cover bg-center"
                      style={{ backgroundImage: `url(${item.image})` }}
                    />
                    <div>
                      <p className="font-semibold uppercase text-primary">{item.productName}</p>
                      <p className="text-[10px] text-secondary uppercase mt-0.5">
                        Size: {item.size} / Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium text-primary">${item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-border-custom pt-4 space-y-2 text-xs uppercase tracking-wider text-secondary">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-primary font-medium">${subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sale">
                  <span>Discount</span>
                  <span>-${discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping ({confirmedOrder.shippingMethod === "express" ? "Express" : "Standard"})</span>
                <span className="text-primary font-medium">
                  {confirmedOrder.shippingCost > 0 ? `$${confirmedOrder.shippingCost}` : "Free"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span className="text-primary font-medium">${confirmedOrder.tax}</span>
              </div>
              <div className="flex justify-between border-t border-primary pt-4 text-sm font-semibold text-primary">
                <span>Total Paid</span>
                <span>₹{confirmedOrder.grandTotal} INR</span>
              </div>
            </div>

            {/* Delivery address */}
            <div className="border-t border-border-custom pt-4 text-xs">
              <span className="uppercase tracking-wider font-semibold text-primary block mb-2">
                Shipping Address
              </span>
              <p className="text-secondary tracking-wider font-light leading-relaxed">
                {confirmedOrder.shippingAddress.name} <br />
                {confirmedOrder.shippingAddress.street} <br />
                {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.zip} <br />
                {confirmedOrder.shippingAddress.country}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/shop"
              className="inline-block bg-primary text-white px-10 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-hover transition-colors w-full sm:w-auto"
            >
              Continue Shopping
            </Link>
            <div>
              <Link
                href="/account"
                className="text-xs uppercase tracking-widest font-semibold border-b border-primary pb-0.5 hover:text-accent hover:border-accent transition-colors"
              >
                Go to Account Dashboard
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Empty checkout guard
  if (cart.length === 0) {
    return (
      <div className="pt-20 min-h-screen bg-brand-bg">
        <div className="max-w-[1440px] mx-auto px-6 py-24 text-center">
          <h2 className="font-serif text-2xl uppercase tracking-widest text-primary mb-6">
            Your bag is empty
          </h2>
          <Link
            href="/shop"
            className="inline-block bg-primary text-white px-8 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-hover transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-brand-bg">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        {/* Checkout Heading */}
        <h1 className="text-2xl md:text-3xl font-serif text-primary uppercase tracking-widest text-center border-b border-border-custom pb-6 mb-10">
          Secure Checkout
        </h1>

        {/* Step Indicator */}
        <div className="max-w-xl mx-auto flex items-center justify-between mb-16 text-[10px] md:text-xs font-semibold uppercase tracking-widest text-secondary select-none">
          <span className={step === "shipping" ? "text-primary font-bold border-b border-primary pb-1" : ""}>
            1. Shipping
          </span>
          <ChevronRight strokeWidth={1} className="w-4 h-4 text-secondary" />
          <span className={step === "delivery" ? "text-primary font-bold border-b border-primary pb-1" : ""}>
            2. Delivery
          </span>
          <ChevronRight strokeWidth={1} className="w-4 h-4 text-secondary" />
          <span className={step === "payment" ? "text-primary font-bold border-b border-primary pb-1" : ""}>
            3. Payment
          </span>
        </div>

        {/* Checkout Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Form Details (7 Columns) */}
          <div className="lg:col-span-7 bg-white border border-border-custom p-6 md:p-10 space-y-8">
            {/* STEP 1: SHIPPING */}
            {step === "shipping" && (
              <form onSubmit={submitShipping} className="space-y-6">
                <h2 className="text-sm uppercase tracking-widest font-semibold text-primary border-b border-border-custom pb-3">
                  Contact Information
                </h2>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border border-border-custom p-3.5 text-xs font-medium uppercase tracking-wider focus:outline-none focus:border-primary"
                    placeholder="name@example.com"
                  />
                </div>

                <h2 className="text-sm uppercase tracking-widest font-semibold text-primary border-b border-border-custom pb-3 pt-4">
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.name}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                      className="w-full bg-transparent border border-border-custom p-3.5 text-xs font-medium uppercase tracking-wider focus:outline-none focus:border-primary"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      className="w-full bg-transparent border border-border-custom p-3.5 text-xs font-medium uppercase tracking-wider focus:outline-none focus:border-primary"
                      placeholder="123 Fashion Blvd"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full bg-transparent border border-border-custom p-3.5 text-xs font-medium uppercase tracking-wider focus:outline-none focus:border-primary"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">
                      ZIP / Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.zip}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                      className="w-full bg-transparent border border-border-custom p-3.5 text-xs font-medium uppercase tracking-wider focus:outline-none focus:border-primary"
                      placeholder="10012"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">
                      Country
                    </label>
                    <select
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      className="w-full bg-transparent border border-border-custom p-3.5 text-xs font-medium uppercase tracking-wider focus:outline-none focus:border-primary appearance-none cursor-pointer"
                    >
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="European Union">European Union</option>
                      <option value="Japan">Japan</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    className="w-full bg-primary text-white py-4 text-xs font-semibold uppercase tracking-widest hover:bg-hover transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Continue to Delivery Method</span>
                    <ArrowRight strokeWidth={1} className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: DELIVERY METHOD */}
            {step === "delivery" && (
              <div className="space-y-6">
                <h2 className="text-sm uppercase tracking-widest font-semibold text-primary border-b border-border-custom pb-3">
                  Delivery Method
                </h2>
                <div className="space-y-3">
                  {/* Standard */}
                  <label className="flex items-center justify-between p-4 border border-border-custom hover:border-primary cursor-pointer transition-colors bg-brand-bg/50">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="shipping_method"
                        checked={shippingMethod === "standard"}
                        onChange={() => setShippingMethod("standard")}
                        className="w-4 h-4 border-border-custom text-primary focus:ring-0 accent-primary"
                      />
                      <div>
                        <span className="text-xs uppercase tracking-wider font-semibold text-primary block">
                          Standard Shipping
                        </span>
                        <span className="text-[11px] text-secondary">
                          Delivery within 3-5 business days
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-success uppercase">Free</span>
                  </label>

                  {/* Express */}
                  <label className="flex items-center justify-between p-4 border border-border-custom hover:border-primary cursor-pointer transition-colors bg-brand-bg/50">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="shipping_method"
                        checked={shippingMethod === "express"}
                        onChange={() => setShippingMethod("express")}
                        className="w-4 h-4 border-border-custom text-primary focus:ring-0 accent-primary"
                      />
                      <div>
                        <span className="text-xs uppercase tracking-wider font-semibold text-primary block">
                          Express Delivery
                        </span>
                        <span className="text-[11px] text-secondary">
                          Delivery within 1-2 business days
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-primary">$25.00</span>
                  </label>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => setStep("shipping")}
                    className="flex-1 bg-transparent border border-border-custom text-secondary py-4 text-xs font-semibold uppercase tracking-widest hover:text-primary transition-colors focus:outline-none"
                  >
                    Back
                  </button>
                  <button
                    onClick={submitDelivery}
                    className="flex-1 bg-primary text-white py-4 text-xs font-semibold uppercase tracking-widest hover:bg-hover transition-colors flex items-center justify-center space-x-2 focus:outline-none"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight strokeWidth={1} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT */}
            {step === "payment" && (
              <form onSubmit={submitPayment} className="space-y-6">
                <h2 className="text-sm uppercase tracking-widest font-semibold text-primary border-b border-border-custom pb-3">
                  Payment Method
                </h2>

                {/* Gateways Tab */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs font-semibold uppercase tracking-wider select-none">
                  {/* Card (Stripe) */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`py-3 border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                      paymentMethod === "card" ? "border-primary bg-primary text-white" : "border-border-custom bg-white hover:border-primary"
                    }`}
                  >
                    <CreditCard strokeWidth={1.5} className="w-4 h-4" />
                    <span className="text-[9px]">Credit Card</span>
                  </button>

                  {/* Razorpay */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("razorpay")}
                    className={`py-3 border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                      paymentMethod === "razorpay" ? "border-primary bg-primary text-white" : "border-border-custom bg-white hover:border-primary"
                    }`}
                  >
                    <Lock strokeWidth={1.5} className="w-4 h-4" />
                    <span className="text-[9px]">Razorpay</span>
                  </button>

                  {/* UPI */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi")}
                    className={`py-3 border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                      paymentMethod === "upi" ? "border-primary bg-primary text-white" : "border-border-custom bg-white hover:border-primary"
                    }`}
                  >
                    <Lock strokeWidth={1.5} className="w-4 h-4" />
                    <span className="text-[9px]">UPI Pay</span>
                  </button>

                  {/* Wallets */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("wallet")}
                    className={`py-3 border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                      paymentMethod === "wallet" ? "border-primary bg-primary text-white" : "border-border-custom bg-white hover:border-primary"
                    }`}
                  >
                    <Lock strokeWidth={1.5} className="w-4 h-4" />
                    <span className="text-[9px]">Wallets</span>
                  </button>
                </div>

                {/* Card Fields (Stripe Simulation) */}
                {paymentMethod === "card" && (
                  <div className="space-y-4 pt-4 border border-border-custom p-4 md:p-6 bg-brand-bg/30">
                    <p className="text-[10px] text-secondary font-semibold uppercase tracking-widest flex items-center">
                      <Lock className="w-3.5 h-3.5 mr-1 text-success" /> Securing Stripe Payment Gateway
                    </p>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        required
                        value={cardDetails.number}
                        onChange={(e) => {
                          const formatted = e.target.value
                            .replace(/\s?/g, "")
                            .replace(/(\d{4})/g, "$1 ")
                            .trim();
                          setCardDetails({ ...cardDetails, number: formatted.slice(0, 19) });
                        }}
                        className="w-full bg-white border border-border-custom p-3 text-xs font-sans font-medium focus:outline-none focus:border-primary"
                        placeholder="4111 2222 3333 4444"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          required
                          value={cardDetails.expiry}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            const formatted = val.length >= 2 ? `${val.slice(0, 2)}/${val.slice(2, 4)}` : val;
                            setCardDetails({ ...cardDetails, expiry: formatted.slice(0, 5) });
                          }}
                          className="w-full bg-white border border-border-custom p-3 text-xs font-sans font-medium focus:outline-none focus:border-primary text-center"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">
                          CVC / CVV
                        </label>
                        <input
                          type="password"
                          required
                          value={cardDetails.cvc}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })
                          }
                          className="w-full bg-white border border-border-custom p-3 text-xs font-sans font-medium focus:outline-none focus:border-primary text-center"
                          placeholder="•••"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Razorpay Simulation */}
                {paymentMethod === "razorpay" && (
                  <div className="space-y-4 pt-4 border border-border-custom p-6 bg-brand-bg/30 text-center">
                    <p className="text-[10px] text-secondary font-semibold uppercase tracking-widest flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5 mr-1 text-success" /> Secure Razorpay Gateway
                    </p>
                    <p className="text-xs text-secondary py-4 tracking-wider leading-relaxed">
                      Upon clicking authorization, a secure overlay payment window from Razorpay will pop up to process card, net banking, or regional wallet payments.
                    </p>
                  </div>
                )}

                {/* UPI Fields */}
                {paymentMethod === "upi" && (
                  <div className="space-y-4 pt-4 border border-border-custom p-6 bg-brand-bg/30">
                    <p className="text-[10px] text-secondary font-semibold uppercase tracking-widest flex items-center">
                      <Lock className="w-3.5 h-3.5 mr-1 text-success" /> Secure UPI Gateway
                    </p>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">
                        UPI ID (VPA)
                      </label>
                      <input
                        type="text"
                        required
                        value={upiDetails}
                        onChange={(e) => setUpiDetails(e.target.value)}
                        className="w-full bg-white border border-border-custom p-3 text-xs font-sans font-medium focus:outline-none focus:border-primary"
                        placeholder="username@upi"
                      />
                    </div>
                  </div>
                )}

                {/* Wallets Simulation */}
                {paymentMethod === "wallet" && (
                  <div className="space-y-4 pt-4 border border-border-custom p-6 bg-brand-bg/30 text-center">
                    <p className="text-[10px] text-secondary font-semibold uppercase tracking-widest flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5 mr-1 text-success" /> Secure Digital Wallet Gateway
                    </p>
                    <p className="text-xs text-secondary py-4 tracking-wider leading-relaxed">
                      Express authorization supports Apple Pay, Google Pay, and standard digital payment wallets.
                    </p>
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setStep("delivery")}
                    className="flex-1 bg-transparent border border-border-custom text-secondary py-4 text-xs font-semibold uppercase tracking-widest hover:text-primary transition-colors focus:outline-none"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-4 text-xs font-semibold uppercase tracking-widest hover:bg-hover transition-colors flex items-center justify-center space-x-2 focus:outline-none"
                  >
                    <span>Authorize Payment</span>
                    <ShieldCheck strokeWidth={1} className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Order Summary (5 Columns) */}
          <div className="lg:col-span-5 bg-white border border-border-custom p-6 md:p-8 space-y-6">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-primary border-b border-border-custom pb-4">
              Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)})
            </h2>

            {/* List items */}
            <div className="divide-y divide-border-custom max-h-[300px] overflow-y-auto pr-2">
              {cart.map((item, idx) => {
                const finalPrice = item.product.salePrice || item.product.price;
                return (
                  <div key={idx} className="py-4 flex justify-between items-start text-xs">
                    <div className="flex items-center space-x-3.5">
                      <div
                        className="w-12 h-15 bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: `url(${item.product.images[0]})` }}
                      />
                      <div>
                        <h3 className="font-semibold uppercase text-primary truncate max-w-[150px]">
                          {item.product.name}
                        </h3>
                        <p className="text-[10px] text-secondary uppercase mt-0.5">
                          Size: {item.size} / Color: {item.color.name}
                        </p>
                        <p className="text-[10px] text-secondary mt-0.5">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-medium text-primary">₹{finalPrice * item.quantity}</span>
                  </div>
                );
              })}
            </div>

            {/* Promo Code Capture */}
            {step !== "payment" && (
              <form onSubmit={handleApplyCoupon} className="pt-2 border-t border-border-custom">
                <label className="block text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2.5">
                  Promotional Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-transparent border border-border-custom px-3 py-2 text-xs uppercase tracking-wider focus:outline-none focus:border-primary"
                    placeholder="ENTER CODE (E.G. WELCOME10)"
                  />
                  <button
                    type="submit"
                    className="bg-primary text-white px-4 py-2 text-[10px] font-semibold uppercase tracking-widest hover:bg-hover transition-colors"
                  >
                    Apply
                  </button>
                </div>
                <AnimatePresence>
                  {couponMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-[10px] text-success tracking-widest uppercase mt-3 p-2 bg-[#d1fae5] border border-success/30"
                    >
                      {couponMessage}
                    </motion.div>
                  )}
                  {couponError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-[10px] text-sale tracking-widest uppercase mt-3 p-2 bg-[#fee2e2] border border-sale/30"
                    >
                      {couponError}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            )}

            {/* Financial Calculations */}
            <div className="border-t border-border-custom pt-6 space-y-3.5 text-xs uppercase tracking-wider text-secondary">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-primary font-medium">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sale">
                  <span>Promo Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-primary font-medium">
                  {shippingCost > 0 ? `₹${shippingCost}` : "Free"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax ({taxRate}%)</span>
                <span className="text-primary font-medium">₹{tax}</span>
              </div>
              <div className="flex justify-between border-t border-primary pt-4 text-sm font-semibold text-primary">
                <span>Estimated Total</span>
                <span>₹{grandTotal} INR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
