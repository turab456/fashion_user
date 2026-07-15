"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, User, ShoppingBag, Menu, X } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function Header() {
  const pathname = usePathname();
  const { cart, wishlist, setSearchOpen, setCartOpen, user } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine if header should be transparent (only on home page when scroll is at top)
  const isHome = pathname === "/";
  const isTransparent = isHome && !isScrolled && !isMobileMenuOpen;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial scroll

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  const navLinks = [
    { label: "New", href: "/shop?filter=new" },
    { label: "Shop", href: "/shop" },
    { label: "Collections", href: "/shop?filter=collections" },
    { label: "Summer", href: "/shop?filter=summer" },
    { label: "Best Sellers", href: "/shop?filter=bestsellers" },
    { label: "About", href: "#brand-story" }
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
          isTransparent
            ? "bg-transparent text-white border-transparent"
            : "bg-white text-primary border-b border-border-custom shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
          {/* Mobile Menu Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 -ml-2 focus:outline-none"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" className="w-5 h-5">
              <line x1="4" y1="8" x2="20" y2="8"></line>
              <line x1="4" y1="16" x2="20" y2="16"></line>
            </svg>
          </button>

          {/* Left: Brand Logo */}
          <Link
            href="/"
            className="font-serif text-2xl tracking-[0.25em] font-normal uppercase select-none transition-opacity hover:opacity-80"
          >
            AURA
          </Link>

          {/* Center: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="relative text-[13px] tracking-widest uppercase py-2 group font-medium"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center space-x-1 md:space-x-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:opacity-75 transition-opacity focus:outline-none"
              aria-label="Open search"
            >
              <Search strokeWidth={1} className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
            </button>

            {/* Account (Desktop Only) */}
            <Link
              href="/account"
              className="hidden md:block p-2 hover:opacity-75 transition-opacity focus:outline-none"
              aria-label="Go to account"
            >
              <User strokeWidth={1} className="w-[20px] h-[20px]" />
            </Link>

            {/* Wishlist (Desktop Only) */}
            <Link
              href="/account?tab=wishlist"
              className="hidden md:block relative p-2 hover:opacity-75 transition-opacity focus:outline-none"
              aria-label="Go to wishlist"
            >
              <Heart strokeWidth={1} className="w-[20px] h-[20px]" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-[6px] h-[6px] bg-accent rounded-full" />
              )}
            </Link>

            {/* Cart - Icon on Desktop, Text Bracket [qty] on Mobile */}
            <button
              onClick={() => setCartOpen(true)}
              className="p-2 hover:opacity-75 transition-opacity focus:outline-none select-none flex items-center justify-center font-sans"
              aria-label="Open cart"
            >
              <span className="md:hidden text-[11px] font-sans font-medium tracking-widest text-primary">
                [{totalCartItems}]
              </span>
              <div className="hidden md:block relative">
                <ShoppingBag strokeWidth={1} className="w-[20px] h-[20px]" />
                {totalCartItems > 0 && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 text-[9px] font-sans font-semibold rounded-full w-4 h-4 flex items-center justify-center transition-colors ${
                      isTransparent ? "bg-white text-primary" : "bg-primary text-white"
                    }`}
                  >
                    {totalCartItems}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute inset-0 bg-primary/20 backdrop-blur-sm transition-opacity duration-300"
        />

        {/* Menu content */}
        <div
          className={`absolute top-0 left-0 w-80 max-w-[90%] h-full bg-brand-bg text-primary p-8 shadow-xl flex flex-col justify-between transition-transform duration-300 transform ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-12">
              <span className="font-serif text-2xl tracking-[0.2em] uppercase">AURA</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 focus:outline-none"
                aria-label="Close menu"
              >
                <X strokeWidth={1} className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base tracking-widest uppercase font-medium border-b border-border-custom pb-2 block"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* User Status in Mobile Menu */}
          <div className="border-t border-border-custom pt-6">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-secondary">Logged in as</p>
                  <p className="text-sm font-medium">{user.name}</p>
                </div>
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs uppercase tracking-widest text-accent underline"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <Link
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm uppercase tracking-widest font-semibold block text-center border border-primary py-3 hover:bg-primary hover:text-white transition-colors"
              >
                Sign In / Join
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
