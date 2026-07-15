"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Globe, ArrowRight } from "lucide-react";

export default function Footer() {
  const [currency, setCurrency] = useState("INR");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5001);
    }
  };

  const footerLinks = {
    customerCare: [
      { label: "Contact Us", href: "#" },
      { label: "Shipping & Returns", href: "#" },
      { label: "Size Guide", href: "#" },
      { label: "FAQs", href: "#" },
      { label: "Order Tracking", href: "#" }
    ],
    about: [
      { label: "Our Story", href: "#brand-story" },
      { label: "Sustainability", href: "#" },
      { label: "Artisanal Craft", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" }
    ],
    legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Preferences", href: "#" },
      { label: "Accessibility Statement", href: "#" }
    ]
  };

  return (
    <footer className="bg-white border-t border-border-custom text-primary pt-20 pb-12 font-sans">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 pb-16 border-b border-border-custom">
          {/* Brand & Story Column */}
          <div className="lg:col-span-2 space-y-6 pr-4">
            <span className="font-serif text-2xl tracking-[0.25em] uppercase text-primary">
              HOQ
            </span>
            <p className="text-xs tracking-wider leading-relaxed text-secondary max-w-sm">
              We design timeless wardrobes for the modern woman. Embracing fluid tailoring, exquisite materials, and clean silhouettes to redefine femininity.
            </p>
            {/* Newsletter form within footer */}
            <form onSubmit={handleSubscribe} className="relative max-w-sm pt-4">
              <p className="text-[10px] uppercase tracking-widest text-secondary font-medium mb-3">
                Join our updates
              </p>
              <div className="relative">
                <input
                  type="email"
                  placeholder="ENTER YOUR EMAIL..."
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-primary py-2.5 pr-10 text-xs tracking-widest uppercase focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:opacity-75 transition-opacity"
                  aria-label="Subscribe to newsletter"
                >
                  <ArrowRight strokeWidth={1} className="w-4 h-4" />
                </button>
              </div>
              {subscribed && (
                <p className="text-[10px] text-success tracking-widest uppercase mt-2">
                  Thank you for subscribing.
                </p>
              )}
            </form>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-primary font-semibold mb-6">
              Customer Care
            </h3>
            <ul className="space-y-4">
              {footerLinks.customerCare.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs tracking-wider text-secondary hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-primary font-semibold mb-6">
              About HOQ
            </h3>
            <ul className="space-y-4">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs tracking-wider text-secondary hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-primary font-semibold mb-6">
              Legal
            </h3>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs tracking-wider text-secondary hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            {/* Currency Selector */}
            <div className="relative inline-flex items-center text-xs tracking-wider text-secondary">
              <Globe strokeWidth={1} className="w-4 h-4 mr-2" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent pr-8 py-1 focus:outline-none appearance-none cursor-pointer hover:text-primary"
                aria-label="Select currency"
              >
                <option value="INR">India (INR ₹)</option>
                <option value="EUR">European Union (EUR €)</option>
                <option value="GBP">United Kingdom (GBP £)</option>
                <option value="JPY">Japan (JPY ¥)</option>
              </select>
              <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 border-t-4 border-t-secondary border-x-4 border-x-transparent" />
            </div>
          </div>

          {/* Copyright Notes */}
          <div className="text-[11px] tracking-wider text-secondary text-center md:text-right">
            <span>© {new Date().getFullYear()} HOQ CO. ALL RIGHTS RESERVED.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
