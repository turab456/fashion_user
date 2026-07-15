"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Search, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore, mapBackendProductToFrontend } from "@/context/StoreContext";
import { Product } from "@/data/products";
import { api } from "@/services/api";

export default function SearchOverlay() {
  const router = useRouter();
  const { isSearchOpen, setSearchOpen } = useStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load products from backend for client search indexing
  useEffect(() => {
    async function loadSearchProducts() {
      try {
        const res = await api.products.list({ limit: 100 });
        const items = res.data || [];
        setDbProducts(items.map(mapBackendProductToFrontend));
      } catch (err) {
        console.error("Failed to load search index products:", err);
      }
    }
    loadSearchProducts();
  }, []);

  // Focus input on open
  useEffect(() => {
    if (isSearchOpen) {
      setQuery("");
      setResults([]);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const searchTerms = query.toLowerCase().split(" ");
    const filtered = dbProducts.filter((product) => {
      const matchName = product.name.toLowerCase();
      const matchCat = product.category.toLowerCase();
      const matchFabric = product.fabric.toLowerCase();
      const matchDesc = product.description.toLowerCase();

      return searchTerms.every(
        (term) =>
          matchName.includes(term) ||
          matchCat.includes(term) ||
          matchFabric.includes(term) ||
          matchDesc.includes(term)
      );
    });
    setResults(filtered.slice(0, 4));
  }, [query, dbProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchOpen(false);
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleTrendingClick = (term: string) => {
    setSearchOpen(false);
    router.push(`/shop?search=${encodeURIComponent(term)}`);
  };

  const trendingSearches = ["Cashmere", "Trench", "Linen Trousers", "Asymmetrical", "Silk Shirt"];

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-brand-bg flex flex-col"
        >
          {/* Header Row */}
          <div className="max-w-[1440px] mx-auto w-full px-6 h-20 flex items-center justify-between">
            <span className="font-serif text-2xl tracking-[0.25em] uppercase text-primary select-none">
              HOQ
            </span>
            <button
              onClick={() => setSearchOpen(false)}
              className="p-2 -mr-2 hover:opacity-75 transition-opacity focus:outline-none"
              aria-label="Close search"
            >
              <X strokeWidth={1} className="w-6 h-6 text-primary" />
            </button>
          </div>

          {/* Search Body */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-2xl px-6 py-12">
              <form onSubmit={handleSearchSubmit} className="relative mb-12">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="SEARCH OUR COLLECTIONS..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent border-b border-primary py-4 px-2 pr-12 text-lg md:text-xl tracking-widest uppercase font-serif focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:opacity-75 transition-opacity"
                  aria-label="Submit search"
                >
                  <Search strokeWidth={1} className="w-6 h-6 text-primary" />
                </button>
              </form>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Left Side: Trending Searches */}
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-secondary font-medium mb-6">
                    Trending Searches
                  </h3>
                  <ul className="space-y-4">
                    {trendingSearches.map((term) => (
                      <li key={term}>
                        <button
                          onClick={() => handleTrendingClick(term)}
                          className="text-[14px] uppercase tracking-wider text-primary hover:text-accent transition-colors flex items-center group"
                        >
                          {term}
                          <ArrowRight
                            strokeWidth={1}
                            className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right Side: Product Results */}
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-secondary font-medium mb-6">
                    {results.length > 0 ? "Suggested Products" : "Suggested Categories"}
                  </h3>
                  {results.length > 0 ? (
                    <div className="space-y-4">
                      {results.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center space-x-4 p-2 hover:bg-white border border-transparent hover:border-border-custom transition-all"
                        >
                          <div
                            className="w-12 h-15 bg-cover bg-center"
                            style={{ backgroundImage: `url(${product.images[0]})` }}
                          />
                          <div>
                            <p className="text-xs uppercase tracking-wider font-semibold text-primary">
                              {product.name}
                            </p>
                            <p className="text-xs text-secondary mt-0.5">
                              ₹{product.price} INR
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {["Coats", "Knitwear", "Dresses", "Trousers", "Shirts"].map((cat) => (
                        <li key={cat}>
                          <Link
                            href={`/shop?category=${cat.toLowerCase()}`}
                            onClick={() => setSearchOpen(false)}
                            className="text-[14px] uppercase tracking-wider text-primary hover:text-accent transition-colors block"
                          >
                            {cat}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
