"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, Check } from "lucide-react";
import { Product } from "@/data/products";
import { api } from "@/services/api";
import { mapBackendProductToFrontend } from "@/context/StoreContext";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [collectionsList, setCollectionsList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [sizesList, setSizesList] = useState<any[]>([]);
  const [colorsList, setColorsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, colRes, catRes, sizeRes, colorRes] = await Promise.all([
          api.products.list({ limit: 100 }),
          api.masters.list("collection"),
          api.masters.list("category"),
          api.masters.list("size"),
          api.masters.list("color")
        ]);
        const items = prodRes.data || [];
        setDbProducts(items.map(mapBackendProductToFrontend));
        setCollectionsList(colRes.data || []);
        setCategoriesList(catRes.data || []);
        setSizesList(sizeRes.data || []);
        setColorsList(colorRes.data || []);
      } catch (err) {
        console.error("Failed to fetch shop data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // URL State Parsing
  const initialCategory = searchParams.get("category") || "";
  const initialFabric = searchParams.get("fabric") || "";
  const initialSearch = searchParams.get("search") || "";
  const initialFilter = searchParams.get("filter") || ""; // new, bestsellers

  // Local Filter States
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCollection, setSelectedCollection] = useState(searchParams.get("collection") || "");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>(initialFabric ? [initialFabric] : []);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [availabilityOnly, setAvailabilityOnly] = useState(false);
  const [sortBy, setSortBy] = useState("popularity");

  // Search input query
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Mobile Filter Drawer Toggle
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Update filters if URL parameters change
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
    setSelectedCollection(searchParams.get("collection") || "");
    if (searchParams.get("fabric")) {
      setSelectedFabrics([searchParams.get("fabric") || ""]);
    } else {
      setSelectedFabrics([]);
    }
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  // Available Filter Options (Resolved dynamically from backend masters)
  const categories = categoriesList.length > 0 ? categoriesList.map(c => c.name) : ["Coats", "Knitwear", "Dresses", "Trousers", "Shirts"];
  const sizes = sizesList.length > 0 ? sizesList.map(s => s.name) : ["XS", "S", "M", "L", "XL", "34", "36", "38", "40", "42"];
  const colors = colorsList.length > 0 
    ? colorsList.map(c => ({ name: c.name, hex: c.hex || "#000000" })) 
    : [
        { name: "Black", hex: "#111111" },
        { name: "Grey", hex: "#5E5E5E" },
        { name: "Cream/White", hex: "#FAFAF8" },
        { name: "Camel", hex: "#C19A6B" },
        { name: "Oatmeal", hex: "#D2B48C" },
        { name: "Ochre", hex: "#8B6F47" }
      ];
  const derivedFabrics = Array.from(new Set(dbProducts.map(p => p.fabric).filter(Boolean)));
  const fabrics = derivedFabrics.length > 0 ? derivedFabrics : ["Wool-Cashmere", "Organic Linen", "100% Cashmere", "100% Silk"];
  const priceRanges = [
    { label: "Under ₹300", value: "under-300", test: (p: number) => p < 300 },
    { label: "₹300 - ₹600", value: "300-600", test: (p: number) => p >= 300 && p <= 600 },
    { label: "Over ₹600", value: "over-600", test: (p: number) => p > 600 }
  ];

  // Helper toggle functions
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const toggleFabric = (fabric: string) => {
    setSelectedFabrics((prev) =>
      prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
    );
  };

  const togglePriceRange = (rangeVal: string) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(rangeVal) ? prev.filter((r) => r !== rangeVal) : [...prev, rangeVal]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory("");
    setSelectedCollection("");
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedFabrics([]);
    setSelectedPriceRanges([]);
    setAvailabilityOnly(false);
    setSearchQuery("");
    // Clear URL query
    router.push("/shop");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg pt-32 text-center text-xs tracking-widest uppercase">
        Loading Collection...
      </div>
    );
  }

  // Filter & Sort Logic
  const filteredProducts = dbProducts
    .filter((product) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(query);
        const matchCat = product.category.toLowerCase().includes(query);
        const matchDesc = product.description.toLowerCase().includes(query);
        const matchFabric = product.fabric.toLowerCase().includes(query);
        if (!matchName && !matchCat && !matchDesc && !matchFabric) return false;
      }

      // 2. Category
      if (selectedCategory && product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // 2.5. Collection
      if (selectedCollection && product.collectionRef !== selectedCollection) {
        return false;
      }

      // 3. Special URL Filter (New, Bestsellers)
      if (initialFilter === "new" && !product.isNew) return false;
      if (initialFilter === "bestsellers" && !product.isBestSeller) return false;
      if (initialFilter === "summer" && product.fabric !== "Organic Linen") return false;

      // 4. Sizes
      if (selectedSizes.length > 0) {
        const hasSize = product.sizes.some((s) => selectedSizes.includes(s));
        if (!hasSize) return false;
      }

      // 5. Colors
      if (selectedColors.length > 0) {
        const hasColor = product.colors.some((colorOpt) =>
          selectedColors.some(
            (c) =>
              colorOpt.name.toLowerCase().includes(c.toLowerCase()) ||
              (c === "Cream/White" &&
                (colorOpt.name.toLowerCase().includes("white") ||
                  colorOpt.name.toLowerCase().includes("oat")))
          )
        );
        if (!hasColor) return false;
      }

      // 6. Fabrics
      if (selectedFabrics.length > 0 && !selectedFabrics.includes(product.fabric)) {
        return false;
      }

      // 7. Price Ranges
      if (selectedPriceRanges.length > 0) {
        const finalPrice = product.salePrice || product.price;
        const matchesPrice = selectedPriceRanges.some((rangeVal) => {
          const testFunc = priceRanges.find((r) => r.value === rangeVal)?.test;
          return testFunc ? testFunc(finalPrice) : false;
        });
        if (!matchesPrice) return false;
      }

      // 8. Availability
      if (availabilityOnly && !product.availability) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sorting
      const priceA = a.salePrice || a.price;
      const priceB = b.salePrice || b.price;

      if (sortBy === "price-low") {
        return priceA - priceB;
      }
      if (sortBy === "price-high") {
        return priceB - priceA;
      }
      if (sortBy === "newest") {
        return a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1;
      }
      // default: popularity
      return b.popularity - a.popularity;
    });

  const FilterSections = () => (
    <div className="space-y-8 select-none">
      {/* Category Filter */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
          Category
        </h3>
        <ul className="space-y-2.5">
          <li>
            <button
              onClick={() => setSelectedCategory("")}
              className={`text-xs uppercase tracking-wider transition-colors ${
                selectedCategory === "" ? "text-accent font-semibold" : "text-secondary hover:text-primary"
              }`}
            >
              All Categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs uppercase tracking-wider transition-colors ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? "text-accent font-semibold"
                    : "text-secondary hover:text-primary"
                }`}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Collections Filter */}
      {collectionsList.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
            Collections
          </h3>
          <ul className="space-y-2.5">
            <li>
              <button
                onClick={() => {
                  setSelectedCollection("");
                  const params = new URLSearchParams(window.location.search);
                  params.delete("collection");
                  router.push(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
                }}
                className={`text-xs uppercase tracking-wider transition-colors ${
                  selectedCollection === "" ? "text-accent font-semibold" : "text-secondary hover:text-primary"
                }`}
              >
                All Collections
              </button>
            </li>
            {collectionsList.map((col) => (
              <li key={col._id}>
                <button
                  onClick={() => {
                    setSelectedCollection(col._id);
                    const params = new URLSearchParams(window.location.search);
                    params.set("collection", col._id);
                    router.push(`/shop?${params.toString()}`);
                  }}
                  className={`text-xs uppercase tracking-wider transition-colors text-left ${
                    selectedCollection === col._id
                      ? "text-accent font-semibold"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  {col.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Size Filter */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
          Size
        </h3>
        <div className="grid grid-cols-5 gap-1.5 max-w-[200px]">
          {sizes.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`text-[10px] uppercase font-sans font-medium py-1.5 border text-center transition-all ${
                  isSelected
                    ? "bg-primary text-white border-primary"
                    : "bg-transparent border-border-custom hover:border-primary text-secondary"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Filter */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
          Color
        </h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => {
            const isSelected = selectedColors.includes(color.name);
            return (
              <button
                key={color.name}
                onClick={() => toggleColor(color.name)}
                title={color.name}
                className={`w-6 h-6 border flex items-center justify-center transition-all relative ${
                  isSelected ? "border-primary scale-105" : "border-border-custom hover:border-secondary"
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {isSelected && (
                  <Check
                    strokeWidth={2.5}
                    className={`w-3.5 h-3.5 ${
                      color.name === "Cream/White" ? "text-primary" : "text-white"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fabric Filter */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
          Fabric
        </h3>
        <ul className="space-y-2.5">
          {fabrics.map((fabric) => {
            const isSelected = selectedFabrics.includes(fabric);
            return (
              <li key={fabric}>
                <button
                  onClick={() => toggleFabric(fabric)}
                  className={`text-xs uppercase tracking-wider transition-colors ${
                    isSelected ? "text-accent font-semibold" : "text-secondary hover:text-primary"
                  }`}
                >
                  {fabric}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
          Price Range
        </h3>
        <ul className="space-y-2.5">
          {priceRanges.map((range) => {
            const isSelected = selectedPriceRanges.includes(range.value);
            return (
              <li key={range.value}>
                <button
                  onClick={() => togglePriceRange(range.value)}
                  className={`text-xs uppercase tracking-wider transition-colors ${
                    isSelected ? "text-accent font-semibold" : "text-secondary hover:text-primary"
                  }`}
                >
                  {range.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Availability Toggle */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
          Availability
        </h3>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={availabilityOnly}
            onChange={(e) => setAvailabilityOnly(e.target.checked)}
            className="w-4 h-4 rounded-none border-border-custom bg-transparent focus:ring-0 accent-primary"
          />
          <span className="text-xs uppercase tracking-wider text-secondary">
            In Stock Only
          </span>
        </label>
      </div>

      {/* Clear Button */}
      <button
        onClick={clearAllFilters}
        className="w-full text-center py-2.5 text-xs uppercase tracking-widest font-semibold border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <div className="pt-20 min-h-screen bg-brand-bg">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        {/* Editorial Page Header */}
        <div className="border-b border-border-custom pb-10 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-secondary font-medium block mb-2">
              Aura Catalog
            </span>
            <h1 className="text-3xl md:text-5xl font-serif font-light text-primary uppercase tracking-wider">
              {selectedCategory || "The Collections"}
            </h1>
            {searchQuery && (
              <p className="text-xs tracking-wider text-secondary uppercase mt-2">
                Search Results for &ldquo;{searchQuery}&rdquo;
              </p>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center space-x-2 border border-border-custom px-4 py-2 bg-white text-xs font-semibold uppercase tracking-widest hover:border-primary transition-colors focus:outline-none"
            >
              <SlidersHorizontal strokeWidth={1.5} className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Sort Select */}
            <div className="relative inline-flex items-center bg-white border border-border-custom px-4 py-2 text-xs uppercase tracking-wider font-semibold">
              <span className="text-secondary mr-2">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent pr-4 py-0.5 focus:outline-none appearance-none cursor-pointer text-primary"
                aria-label="Sort products"
              >
                <option value="popularity">Most Popular</option>
                <option value="newest">New In</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown strokeWidth={1} className="w-4 h-4 ml-1 text-secondary pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Subcategory scrollable strip (Zara inspired) */}
        <div className="flex space-x-6 overflow-x-auto pb-4 mb-8 border-b border-border-custom scrollbar-none select-none">
          {[
            { label: "VIEW ALL", filter: "" },
            ...categories.map(c => ({ label: c.toUpperCase(), filter: c }))
          ].map((item) => {
            const isActive = selectedCategory === item.filter;
            return (
              <button
                key={item.label}
                onClick={() => setSelectedCategory(item.filter)}
                className={`text-[11px] font-sans tracking-widest font-semibold whitespace-nowrap uppercase py-1 border-b transition-all duration-300 ${
                  isActive ? "border-primary text-primary" : "border-transparent text-secondary hover:text-primary"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Desktop Filter Sidebar (3 Columns) */}
          <aside className="hidden lg:block lg:col-span-3 border-r border-border-custom pr-8">
            <FilterSections />
          </aside>

          {/* Product Grid (9 Columns) */}
          <div className="lg:col-span-9">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 md:gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white border border-border-custom">
                <p className="font-serif text-lg text-secondary uppercase tracking-widest mb-6">
                  No products match your selection
                </p>
                <button
                  onClick={clearAllFilters}
                  className="text-xs uppercase tracking-widest font-semibold border-b border-primary pb-1 hover:text-accent hover:border-accent transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 lg:hidden ${
          isMobileFilterOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setIsMobileFilterOpen(false)}
          className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
        />

        {/* Drawer content */}
        <div
          className={`absolute top-0 right-0 w-80 max-w-[90%] h-full bg-brand-bg p-8 shadow-xl flex flex-col justify-between transition-transform duration-300 transform ${
            isMobileFilterOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="flex items-center justify-between pb-6 border-b border-border-custom mb-8">
              <span className="text-xs uppercase tracking-widest font-semibold text-primary">
                Refine Collection
              </span>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 focus:outline-none"
                aria-label="Close filters"
              >
                <X strokeWidth={1} className="w-5 h-5 text-primary" />
              </button>
            </div>
            <FilterSections />
          </div>
          <div className="border-t border-border-custom pt-6 mt-6">
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full text-center py-4 bg-primary text-white text-xs font-semibold uppercase tracking-widest hover:bg-hover transition-colors"
            >
              Apply Filters ({filteredProducts.length})
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-bg pt-32 text-center text-xs tracking-widest uppercase">
          Loading Collection...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
