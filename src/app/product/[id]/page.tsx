"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Plus, Minus, Info, ChevronDown, ChevronUp, Star, Truck, ShieldAlert } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { Product, Review } from "@/data/products";
import { api } from "@/services/api";
import { mapBackendProductToFrontend } from "@/context/StoreContext";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const { addToCart, wishlist, toggleWishlist, recentlyViewed, addToRecentlyViewed, user } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [dbProductId, setDbProductId] = useState<string | null>(null);
  const [dbReviews, setDbReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // States
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Write review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submitStatus, setSubmitStatus] = useState("");

  useEffect(() => {
    async function loadProductDetail() {
      try {
        setLoading(true);
        const bpRes = await api.products.getBySlug(id);
        const bp = bpRes.data;
        if (bp) {
          setDbProductId(bp._id);
          const mappedProduct = mapBackendProductToFrontend(bp);
          setProduct(mappedProduct);

          try {
            const revRes = await api.reviews.getProductReviews(bp._id);
            const rawReviews = revRes.data || [];
            const mappedReviews = rawReviews.map((r: any) => ({
              id: r._id,
              user: r.user?.name || "Verified Buyer",
              rating: r.rating,
              comment: r.comment,
              date: r.createdAt ? r.createdAt.split("T")[0] : new Date().toISOString().split("T")[0]
            }));
            setDbReviews(mappedReviews);
          } catch (rErr) {
            console.error("Failed to load product reviews:", rErr);
          }
        }

        const allRes = await api.products.list({ limit: 50 });
        const allMapped = (allRes.data || []).map(mapBackendProductToFrontend);
        setAllProducts(allMapped);
      } catch (err) {
        console.error("Failed to load product details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProductDetail();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      alert("Please enter a comment.");
      return;
    }
    if (!dbProductId) return;

    try {
      setSubmitStatus("loading");
      await api.reviews.createReview({
        productId: dbProductId,
        rating: reviewRating,
        comment: reviewComment
      });

      const revRes = await api.reviews.getProductReviews(dbProductId);
      const rawReviews = revRes.data || [];
      const mappedReviews = rawReviews.map((r: any) => ({
        id: r._id,
        user: r.user?.name || "Verified Buyer",
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt ? r.createdAt.split("T")[0] : new Date().toISOString().split("T")[0]
      }));
      setDbReviews(mappedReviews);

      setReviewComment("");
      setSubmitStatus("success");
      setTimeout(() => setSubmitStatus(""), 4000);
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      alert(err.message || "Failed to submit review. Note: You can only submit one review per product.");
      setSubmitStatus("");
    }
  };

  // Zoom lens state
  const [zoomStyle, setZoomStyle] = useState({ display: "none", backgroundPosition: "0% 0%" });

  // Accordion state
  const [expandedSection, setExpandedSection] = useState<string | null>("description");

  // Track page views for Recently Viewed
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product.id);
      setSelectedColor(product.colors[0].name);
      setSelectedSize("");
      setQuantity(1);
      setActiveImageIndex(0);
    }
  }, [product, addToRecentlyViewed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center pt-32 text-center text-xs tracking-widest uppercase">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col justify-between pt-20 bg-brand-bg">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="font-serif text-2xl uppercase tracking-widest text-primary mb-4">
            Product Not Found
          </h2>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest font-semibold border-b border-primary pb-1 hover:text-accent hover:border-accent transition-colors"
          >
            Back to Shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);
  const hasSale = product.salePrice !== null;
  const currentPrice = product.salePrice || product.price;

  // Recommendations: products from the same category
  const suggestedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Recently Viewed products loaded from context
  const recentlyViewedProducts = allProducts
    .filter((p) => recentlyViewed.includes(p.id) && p.id !== product.id)
    .slice(0, 4);

  // Zoom handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: "block",
      backgroundPosition: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none", backgroundPosition: "0% 0%" });
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size.");
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      alert("Please select a size.");
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    router.push("/checkout");
  };

  const toggleAccordion = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="pt-20 min-h-screen bg-brand-bg">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="text-[11px] uppercase tracking-wider text-secondary mb-10 select-none">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-primary">Shop</Link>
          <span className="mx-2">/</span>
          <Link href={`/shop?category=${product.category.toLowerCase()}`} className="hover:text-primary">
            {product.category}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-primary font-medium">{product.name}</span>
        </nav>

        {/* Product Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Image Gallery (7 Columns) */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Thumbnail Strip (Desktop Left) */}
            <div className="hidden md:flex md:col-span-2 flex-col space-y-3.5 order-2 md:order-1 select-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-[4/5] bg-cover bg-center border transition-all ${idx === activeImageIndex
                      ? "border-primary opacity-100"
                      : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  style={{ backgroundImage: `url(${img})` }}
                  aria-label={`View image ${idx + 1}`}
                />
              ))}
            </div>

            {/* Large Active Image Box (Desktop Right) */}
            <div className="md:col-span-10 order-1 md:order-2">
              <div
                className="relative aspect-[4/5] overflow-hidden bg-white border border-border-custom cursor-crosshair group select-none"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {/* Regular Image */}
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-300"
                  style={{ backgroundImage: `url(${product.images[activeImageIndex]})` }}
                />

                {/* Zoom Box overlay */}
                <div
                  className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-no-repeat"
                  style={{
                    ...zoomStyle,
                    backgroundImage: `url(${product.images[activeImageIndex]})`,
                    backgroundSize: "200%"
                  }}
                />
              </div>

              {/* Mobile Thumbnail Strip */}
              <div className="flex md:hidden space-x-2 mt-4 select-none">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-18 bg-cover bg-center border transition-all ${idx === activeImageIndex ? "border-primary" : "border-transparent opacity-60"
                      }`}
                    style={{ backgroundImage: `url(${img})` }}
                    aria-label={`View image ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Product Info (5 Columns) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-8">
            <div className="space-y-4 border-b border-border-custom pb-6">
              <span className="text-[11px] uppercase tracking-widest text-secondary font-medium block">
                {product.fabric} / {product.category}
              </span>
              <h1 className="text-2xl md:text-3xl font-serif font-normal text-primary tracking-wide uppercase">
                {product.name}
              </h1>

              {/* Rating stars */}
              <div className="flex items-center space-x-2">
                <div className="flex text-accent">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      strokeWidth={1}
                      className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? "fill-accent" : ""
                        }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-secondary font-medium font-sans">
                  {product.rating} ({product.reviews.length} reviews)
                </span>
              </div>

              {/* Price Row */}
              <div className="pt-2 flex items-center space-x-3.5">
                {hasSale ? (
                  <>
                    <span className="text-xl text-sale font-semibold">₹{product.salePrice} INR</span>
                    <span className="text-sm line-through text-secondary">₹{product.price}</span>
                  </>
                ) : (
                  <span className="text-xl text-primary font-medium">₹{product.price} INR</span>
                )}
              </div>
            </div>

            {/* Colors Select */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-secondary font-semibold block">
                Color: {selectedColor}
              </span>
              <div className="flex space-x-3">
                {product.colors.map((color) => {
                  const isSelected = selectedColor === color.name;
                  return (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-7 h-7 border flex items-center justify-center transition-all relative ${isSelected ? "border-primary scale-105" : "border-border-custom hover:border-secondary"
                        }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  );
                })}
              </div>
            </div>

            {/* Sizes Select */}
            <div className="space-y-3">
              <div className="flex justify-between items-center select-none">
                <span className="text-[10px] uppercase tracking-widest text-secondary font-semibold">
                  Size
                </span>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-[10px] uppercase tracking-widest text-accent font-semibold hover:underline flex items-center"
                >
                  <Info className="w-3.5 h-3.5 mr-1" strokeWidth={1} />
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`text-xs uppercase font-sans font-medium min-w-[50px] py-3.5 border text-center transition-all ${isSelected
                          ? "bg-primary text-white border-primary"
                          : "bg-white border-border-custom hover:border-primary text-primary"
                        }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Picker */}
            <div className="space-y-3 select-none">
              <span className="text-[10px] uppercase tracking-widest text-secondary font-semibold block">
                Quantity
              </span>
              <div className="flex items-center border border-border-custom bg-white max-w-[120px]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2.5 text-secondary hover:text-primary transition-colors focus:outline-none"
                  aria-label="Decrease quantity"
                >
                  <Minus strokeWidth={1} className="w-3.5 h-3.5" />
                </button>
                <span className="flex-1 text-center text-xs font-sans font-medium text-primary">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2.5 text-secondary hover:text-primary transition-colors focus:outline-none"
                  aria-label="Increase quantity"
                >
                  <Plus strokeWidth={1} className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3.5 pt-2">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-white text-primary border border-primary py-4 text-xs font-semibold uppercase tracking-widest hover:bg-primary hover:text-white transition-colors focus:outline-none"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="border border-border-custom p-4 bg-white hover:border-secondary transition-all"
                  aria-label="Toggle wishlist"
                >
                  <Heart
                    strokeWidth={1}
                    className={`w-5 h-5 transition-colors ${isWishlisted ? "fill-accent text-accent" : "text-primary"
                      }`}
                  />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full bg-primary text-white py-4 text-xs font-semibold uppercase tracking-widest hover:bg-hover transition-colors focus:outline-none"
              >
                Buy It Now
              </button>
            </div>

            {/* Delivery/Returns quick summary */}
            <div className="border-t border-border-custom pt-6 space-y-3.5">
              <div className="flex items-start space-x-3 text-xs text-secondary leading-normal">
                <Truck strokeWidth={1} className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>
                  Complimentary standard shipping inside 3-5 days. Express courier delivery options available.
                </span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-secondary leading-normal">
                <ShieldAlert strokeWidth={1} className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>
                  Complimentary returns allowed within 14 days on all products in original packaging.
                </span>
              </div>
            </div>

            {/* Accordion (Description, Materials, Care, Shipping) */}
            <div className="border-t border-b border-border-custom divide-y divide-border-custom font-sans">
              {/* Description Section */}
              <div className="py-4">
                <button
                  onClick={() => toggleAccordion("description")}
                  className="w-full flex items-center justify-between text-xs uppercase tracking-widest font-semibold text-primary focus:outline-none"
                >
                  <span>Description</span>
                  {expandedSection === "description" ? (
                    <ChevronUp strokeWidth={1} className="w-4 h-4 text-secondary" />
                  ) : (
                    <ChevronDown strokeWidth={1} className="w-4 h-4 text-secondary" />
                  )}
                </button>
                {expandedSection === "description" && (
                  <p className="mt-3 text-xs tracking-wider text-secondary leading-relaxed font-light">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Materials Section */}
              <div className="py-4">
                <button
                  onClick={() => toggleAccordion("materials")}
                  className="w-full flex items-center justify-between text-xs uppercase tracking-widest font-semibold text-primary focus:outline-none"
                >
                  <span>Materials & Composition</span>
                  {expandedSection === "materials" ? (
                    <ChevronUp strokeWidth={1} className="w-4 h-4 text-secondary" />
                  ) : (
                    <ChevronDown strokeWidth={1} className="w-4 h-4 text-secondary" />
                  )}
                </button>
                {expandedSection === "materials" && (
                  <p className="mt-3 text-xs tracking-wider text-secondary leading-relaxed font-light">
                    {product.materials}
                  </p>
                )}
              </div>

              {/* Care Section */}
              <div className="py-4">
                <button
                  onClick={() => toggleAccordion("care")}
                  className="w-full flex items-center justify-between text-xs uppercase tracking-widest font-semibold text-primary focus:outline-none"
                >
                  <span>Care Instructions</span>
                  {expandedSection === "care" ? (
                    <ChevronUp strokeWidth={1} className="w-4 h-4 text-secondary" />
                  ) : (
                    <ChevronDown strokeWidth={1} className="w-4 h-4 text-secondary" />
                  )}
                </button>
                {expandedSection === "care" && (
                  <p className="mt-3 text-xs tracking-wider text-secondary leading-relaxed font-light">
                    {product.care}
                  </p>
                )}
              </div>

              {/* Shipping Section */}
              <div className="py-4">
                <button
                  onClick={() => toggleAccordion("shipping")}
                  className="w-full flex items-center justify-between text-xs uppercase tracking-widest font-semibold text-primary focus:outline-none"
                >
                  <span>Shipping & Returns</span>
                  {expandedSection === "shipping" ? (
                    <ChevronUp strokeWidth={1} className="w-4 h-4 text-secondary" />
                  ) : (
                    <ChevronDown strokeWidth={1} className="w-4 h-4 text-secondary" />
                  )}
                </button>
                {expandedSection === "shipping" && (
                  <p className="mt-3 text-xs tracking-wider text-secondary leading-relaxed font-light">
                    {product.shipping}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="py-16 border-b border-border-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7">
              <h2 className="text-xl font-serif uppercase tracking-widest text-primary mb-8 select-none">
                Customer Reviews
              </h2>

              {dbReviews.length === 0 ? (
                <p className="text-xs text-secondary tracking-wider font-light">
                  No reviews yet for this product.
                </p>
              ) : (
                <div className="space-y-8 divide-y divide-border-custom">
                  {dbReviews.map((rev) => (
                    <div key={rev.id} className="pt-6 first:pt-0">
                      <div className="flex items-center justify-between mb-2 select-none">
                        <span className="text-xs uppercase tracking-wider font-semibold text-primary">
                          {rev.user}
                        </span>
                        <span className="text-[11px] text-secondary font-medium">{rev.date}</span>
                      </div>
                      <div className="flex text-accent mb-3 select-none">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            strokeWidth={1}
                            className={`w-3 h-3 ${i < rev.rating ? "fill-accent" : ""}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-secondary leading-relaxed tracking-wider font-light">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-5 border-l border-border-custom lg:pl-12 pt-8 lg:pt-0">
              <h3 className="text-sm uppercase tracking-widest font-semibold text-primary mb-6">
                Share Your Feedback
              </h3>

              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">
                      Rating
                    </label>
                    <div className="flex space-x-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            strokeWidth={1}
                            className={`w-5 h-5 ${star <= reviewRating ? "fill-accent text-accent" : "text-border-custom"
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">
                      Review Comment
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full bg-transparent border border-border-custom p-3.5 text-xs font-medium uppercase tracking-wider focus:outline-none focus:border-primary resize-none"
                      placeholder="Share your thoughts about this garment..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitStatus === "loading"}
                    className="w-full bg-primary text-white py-3.5 text-xs font-semibold uppercase tracking-widest hover:bg-hover transition-colors focus:outline-none disabled:opacity-50"
                  >
                    {submitStatus === "loading" ? "Submitting..." : "Submit Review"}
                  </button>

                  {submitStatus === "success" && (
                    <p className="text-xs text-accent mt-2">
                      Thank you! Your review has been submitted successfully.
                    </p>
                  )}
                </form>
              ) : (
                <div className="p-6 bg-brand-bg/50 border border-border-custom text-center">
                  <p className="text-xs text-secondary leading-relaxed mb-4">
                    Only registered customers can leave reviews.
                  </p>
                  <Link
                    href="/account?tab=profile"
                    className="inline-block bg-primary text-white px-6 py-3 text-[10px] font-semibold uppercase tracking-widest hover:bg-hover transition-colors"
                  >
                    Sign In to Write a Review
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RELATED PRODUCTS */}

        {/* You May Also Like */}
        {suggestedProducts.length > 0 && (
          <section className="py-16 border-b border-border-custom">
            <h2 className="text-xl font-serif uppercase tracking-widest text-primary mb-8 select-none">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {suggestedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        {recentlyViewedProducts.length > 0 && (
          <section className="py-16">
            <h2 className="text-xl font-serif uppercase tracking-widest text-primary mb-8 select-none">
              Recently Viewed
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recentlyViewedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Size Guide Drawer Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          <div
            onClick={() => setIsSizeGuideOpen(false)}
            className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white p-8 flex flex-col shadow-xl">
              <div className="flex justify-between items-center pb-6 border-b border-border-custom mb-6">
                <span className="text-xs uppercase tracking-widest font-semibold text-primary">
                  Size Guide
                </span>
                <button
                  onClick={() => setIsSizeGuideOpen(false)}
                  className="p-1 focus:outline-none"
                  aria-label="Close guide"
                >
                  <Plus className="w-6 h-6 rotate-45 text-primary" strokeWidth={1} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6">
                <p className="text-xs tracking-wider text-secondary leading-relaxed font-light">
                  AURA designs are cut for classic elegance, maintaining clean editorial fits. Follow our measurements table below to select your sizing.
                </p>

                {/* Table */}
                <table className="w-full text-left text-xs text-primary tracking-wider font-sans border-collapse">
                  <thead>
                    <tr className="border-b border-primary uppercase text-[10px] font-semibold">
                      <th className="py-3">Intl Size</th>
                      <th className="py-3">EU Size</th>
                      <th className="py-3">Bust (cm)</th>
                      <th className="py-3">Waist (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom text-secondary font-light">
                    <tr>
                      <td className="py-3.5">XS</td>
                      <td className="py-3.5">34</td>
                      <td className="py-3.5">80-84</td>
                      <td className="py-3.5">62-66</td>
                    </tr>
                    <tr>
                      <td className="py-3.5">S</td>
                      <td className="py-3.5">36</td>
                      <td className="py-3.5">84-88</td>
                      <td className="py-3.5">66-70</td>
                    </tr>
                    <tr>
                      <td className="py-3.5">M</td>
                      <td className="py-3.5">38</td>
                      <td className="py-3.5">88-92</td>
                      <td className="py-3.5">70-74</td>
                    </tr>
                    <tr>
                      <td className="py-3.5">L</td>
                      <td className="py-3.5">40</td>
                      <td className="py-3.5">92-96</td>
                      <td className="py-3.5">74-78</td>
                    </tr>
                    <tr>
                      <td className="py-3.5">XL</td>
                      <td className="py-3.5">42</td>
                      <td className="py-3.5">96-100</td>
                      <td className="py-3.5">78-82</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
