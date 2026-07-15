"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/data/products";
import { api } from "@/services/api";
import { mapBackendProductToFrontend } from "@/context/StoreContext";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";

interface CMSSection {
  _id: string;
  sectionKey: string;
  title: string;
  subtitle: string;
  sortOrder: number;
  isEnabled: boolean;
  content?: {
    items?: Array<{
      product?: any; // The populated product from backend
    }>;
  };
}

export default function Home() {
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [cmsSections, setCmsSections] = useState<CMSSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, colRes, catRes, bannerRes, cmsRes] = await Promise.all([
          api.products.list({ limit: 12 }),
          api.masters.list("collection"),
          api.masters.list("category"),
          api.cms.getBanners(),
          api.cms.getHomepage(),
        ]);
        const items = prodRes.data || [];
        setDbProducts(items.map(mapBackendProductToFrontend));
        setCollections(colRes.data || []);
        setCategories(catRes.data || []);
        setBanners(bannerRes.data || []);
        setCmsSections(cmsRes.data || []);
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const newArrivals = dbProducts.filter((p) => p.isNew).slice(0, 4);
  const bestSellers = dbProducts.filter((p) => p.isBestSeller).slice(0, 4);
  const favorites = dbProducts.filter((p) => p.isCustomerFavorite).slice(0, 4);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterStatus("success");
      setNewsletterEmail("");
      setTimeout(() => setNewsletterStatus(""), 5001);
    }
  };

  // Helper: find a CMS section by key (only enabled ones)
  const getSection = (key: string): CMSSection | undefined =>
    cmsSections.find((s) => s.sectionKey === key);

  const isSectionEnabled = (key: string): boolean => {
    const s = getSection(key);
    return s ? s.isEnabled !== false : false;
  };

  // Sort the section keys by their CMS sortOrder for rendering
  const sectionOrder = cmsSections
    .filter((s) => s.isEnabled !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((s) => s.sectionKey);

  const heroBanner = banners.find((b) => b.position === "Hero") || null;
  const heroBg = heroBanner?.desktopImage || "/assets/hero_campaign.png";
  const heroSection = getSection("hero");

  // --- Section Renderers ---
  const renderHero = () => {
    const title = heroSection?.title || heroBanner?.name || "Redefining Modern Femininity.";
    const subtitle = heroSection?.subtitle || "A curated collection of timeless cashmere, fluid tailoring, and structural essentials.";
    const heroLink = heroBanner?.ctaLink || "/shop";
    return (
      <section key="hero" className="relative h-screen flex items-end justify-start bg-black select-none">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-85"
          style={{ backgroundImage: `url('${heroBg}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        <div className="relative max-w-[1440px] mx-auto w-full px-6 pb-20 md:pb-28 text-white z-10">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.1] font-serif">
              {title}
            </h1>
            <p className="text-sm md:text-base tracking-widest text-brand-bg/90 uppercase font-light max-w-md">
              {subtitle}
            </p>
            <div className="pt-4">
              <Link
                href={heroLink}
                className="inline-block bg-white text-primary px-8 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-brand-bg transition-colors"
              >
                Shop Collection
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderFeaturedCollections = (fallback = false) => {
    const sec = getSection("featured-collections");
    if (!sec && !fallback) return null;
    return (
      <section key="featured-collections" className="py-24 max-w-[1440px] mx-auto px-6 w-full">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-secondary font-medium block mb-2">
              {sec?.subtitle || "Curated Wardrobes"}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-primary font-normal">
              {sec?.title || "Featured Collections"}
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest font-semibold border-b border-primary pb-1 self-start md:self-auto hover:text-accent hover:border-accent transition-colors"
          >
            Explore All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.length > 0 ? (
            collections.slice(0, 3).map((col) => (
              <div key={col._id} className="group relative flex flex-col aspect-[3/4] overflow-hidden bg-white">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ backgroundImage: `url('${col.image || "/assets/wool_coat_front.png"}')` }}
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <h3 className="text-xl md:text-2xl font-serif font-light mb-2">
                    {col.name}
                  </h3>
                  <p className="text-[11px] uppercase tracking-widest opacity-80 mb-4 font-sans font-light">
                    {col.description || "Premium designer collections"}
                  </p>
                  <Link
                    href={`/shop?collection=${col._id}`}
                    className="text-xs uppercase tracking-widest font-semibold border-b border-white pb-0.5 self-start hover:opacity-85 transition-opacity"
                  >
                    Shop Edit
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-secondary py-20 text-sm">
              No collections available yet.
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderNewArrivals = (fallback = false) => {
    const sec = getSection("new-arrivals");
    if (!sec && !fallback) return null;
    return (
      <section key="new-arrivals" className="py-24 border-t border-border-custom bg-white">
        <div className="max-w-[1440px] mx-auto px-6 w-full">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-secondary font-medium block mb-2">
                {sec?.subtitle || "Seasonal Drop"}
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-primary font-normal">
                {sec?.title || "New Arrivals"}
              </h2>
            </div>
            <Link
              href="/shop?filter=new"
              className="text-xs uppercase tracking-widest font-semibold border-b border-primary pb-1 self-start md:self-auto hover:text-accent hover:border-accent transition-colors"
            >
              Shop New Arrivals
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-8">
            {(() => {
              const manualProducts = sec?.content?.items?.map(i => i.product).filter(Boolean).map(mapBackendProductToFrontend) || [];
              const displayProducts = manualProducts.length > 0 ? manualProducts : (newArrivals.length > 0 ? newArrivals : dbProducts.slice(0, 4));
              return displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ));
            })()}
          </div>
        </div>
      </section>
    );
  };

  const renderBestSellers = (fallback = false) => {
    const sec = getSection("best-sellers");
    if (!sec && !fallback) return null;
    return (
      <section key="best-sellers" className="py-24 border-t border-border-custom max-w-[1440px] mx-auto px-6 w-full">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-secondary font-medium block mb-2">
              {sec?.subtitle || "Most Wanted"}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-primary font-normal">
              {sec?.title || "Best Sellers"}
            </h2>
          </div>
          <Link
            href="/shop?filter=bestsellers"
            className="text-xs uppercase tracking-widest font-semibold border-b border-primary pb-1 self-start md:self-auto hover:text-accent hover:border-accent transition-colors"
          >
            Shop Best Sellers
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-8">
          {(() => {
            const manualProducts = sec?.content?.items?.map(i => i.product).filter(Boolean).map(mapBackendProductToFrontend) || [];
            const displayProducts = manualProducts.length > 0 ? manualProducts : (bestSellers.length > 0 ? bestSellers : dbProducts.slice(0, 4));
            return displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ));
          })()}
        </div>
      </section>
    );
  };

  const renderCampaignBanner = (fallback = false) => {
    const sec = getSection("campaign-banner");
    if (!sec && !fallback) return null;
    const secondaryBanner = banners.find((b) => b.position === "Collection") || banners.find((b) => b.position === "Offer") || null;
    const secondaryBg = secondaryBanner?.desktopImage || "/assets/campaign_banner.png";
    const secondaryLink = secondaryBanner?.ctaLink || "/shop";
    return (
      <section key="campaign-banner" className="relative h-[80vh] flex items-center justify-center bg-black select-none">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{ backgroundImage: `url('${secondaryBg}')` }}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative text-center text-white px-6 max-w-3xl space-y-6">
          <span className="text-[11px] uppercase tracking-[0.25em] text-brand-bg font-semibold block">
            {sec?.subtitle || "Campaign"}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light font-serif leading-[1.2]">
            {sec?.title || secondaryBanner?.name || "The Art of Slow Living"}
          </h2>
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-light max-w-lg mx-auto leading-relaxed">
            Crafted for endurance. Made with organic components and hand-finished seams, our collections represent modern permanent design.
          </p>
          <div className="pt-4">
            <Link
              href={secondaryLink}
              className="inline-block bg-white text-primary px-8 py-3.5 text-xs font-semibold uppercase tracking-widest hover:bg-brand-bg transition-colors"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </section>
    );
  };

  const renderShopByCategory = (fallback = false) => {
    const sec = getSection("shop-by-category");
    if (!sec && !fallback) return null;
    const getCategoryImage = (name: string) => {
      const images: Record<string, string> = {
        coats: "/assets/wool_coat_front.png",
        knitwear: "/assets/cashmere_knit_front.png",
        dresses: "/assets/linen_dress_front.png",
        trousers: "/assets/tailored_trousers_front.png",
      };
      return images[name.toLowerCase()] || "/assets/wool_coat_front.png";
    };
    return (
      <section key="shop-by-category" className="py-24 max-w-[1440px] mx-auto px-6 w-full">
        <div className="mb-12">
          <span className="text-[11px] uppercase tracking-widest text-secondary font-medium block mb-2">
            {sec?.subtitle || "Categorized Selection"}
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-primary font-normal">
            {sec?.title || "Shop by Category"}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(categories.length > 0 ? categories : []).slice(0, 4).map((cat) => (
            <Link
              key={cat.name}
              href={`/shop?category=${cat.name}`}
              className="group relative flex flex-col aspect-[4/5] bg-white overflow-hidden"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{ backgroundImage: `url('${cat.image || getCategoryImage(cat.name)}')` }}
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/15 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 w-full p-6 text-white flex justify-between items-center z-10">
                <span className="text-sm font-medium uppercase tracking-widest">{cat.name}</span>
                <ArrowRight strokeWidth={1} className="w-5 h-5 transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  };

  const renderCustomerFavorites = (fallback = false) => {
    const sec = getSection("customer-favorites");
    if (!sec && !fallback) return null;
    return (
      <section key="customer-favorites" className="py-24 border-t border-border-custom bg-white">
        <div className="max-w-[1440px] mx-auto px-6 w-full">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-secondary font-medium block mb-2">
                {sec?.subtitle || "Highly Rated"}
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-primary font-normal">
                {sec?.title || "Customer Favorites"}
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs uppercase tracking-widest font-semibold border-b border-primary pb-1 self-start md:self-auto hover:text-accent hover:border-accent transition-colors"
            >
              View All Favorites
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-8">
            {(() => {
              const manualProducts = sec?.content?.items?.map(i => i.product).filter(Boolean).map(mapBackendProductToFrontend) || [];
              const displayProducts = manualProducts.length > 0 ? manualProducts : (favorites.length > 0 ? favorites : dbProducts.slice(0, 4));
              return displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ));
            })()}
          </div>
        </div>
      </section>
    );
  };

  const renderInstagramGallery = (fallback = false) => {
    const sec = getSection("instagram-gallery");
    if (!sec && !fallback) return null;
    return (
      <section key="instagram-gallery" className="py-24 max-w-[1440px] mx-auto px-6 w-full">
        <div className="mb-12 text-center">
          <span className="text-[11px] uppercase tracking-widest text-secondary font-medium block mb-2 flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 mr-1.5 inline-block"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            {sec?.subtitle || "Social Moodboard"}
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-primary font-normal">
            {sec?.title || "Inspired by #HOQStyle"}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="aspect-[4/5] bg-cover bg-center bg-gray-100 hover:opacity-90 transition-opacity" style={{ backgroundImage: `url('/assets/hero_campaign.png')` }} />
          <div className="aspect-[4/5] bg-cover bg-center bg-gray-100 hover:opacity-90 transition-opacity" style={{ backgroundImage: `url('/assets/wool_coat_back.png')` }} />
          <div className="aspect-[4/5] bg-cover bg-center bg-gray-100 hover:opacity-90 transition-opacity" style={{ backgroundImage: `url('/assets/campaign_banner.png')` }} />
          <div className="aspect-[4/5] bg-cover bg-center bg-gray-100 hover:opacity-90 transition-opacity" style={{ backgroundImage: `url('/assets/cashmere_knit_front.png')` }} />
          <div className="aspect-[4/5] bg-cover bg-center bg-gray-100 hover:opacity-90 transition-opacity" style={{ backgroundImage: `url('/assets/tailored_trousers_front.png')` }} />
        </div>
      </section>
    );
  };

  const renderBrandStory = (fallback = false) => {
    const sec = getSection("brand-story");
    if (!sec && !fallback) return null;
    return (
      <section key="brand-story" id="brand-story" className="py-28 border-t border-b border-border-custom bg-white">
        <div className="max-w-[1000px] mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5">
            <span className="text-[11px] uppercase tracking-[0.2em] text-secondary font-medium block mb-3">
              {sec?.subtitle || "Our Philosophy"}
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-primary leading-tight font-light">
              {sec?.title || "The Art of Permanence"}
            </h2>
          </div>
          <div className="md:col-span-7 space-y-6">
            <p className="text-sm tracking-wider leading-relaxed text-primary font-medium">
              We stand against the noise of fleeting trends. HOQ is founded on the conviction that clothing should be a carefully collected dialogue between form, fiber, and function.
            </p>
            <p className="text-xs tracking-wider leading-relaxed text-secondary font-light">
              Every design is meticulously sketched in our creative studio, cut from pure ecological linen, long-staple cashmere, and sandwashed silks, and put together by generational tailors in small-batch family factories. We believe true luxury lies in absolute quality and slow permanence.
            </p>
          </div>
        </div>
      </section>
    );
  };

  const renderNewsletter = (fallback = false) => {
    const sec = getSection("newsletter");
    if (!sec && !fallback) return null;
    return (
      <section key="newsletter" className="py-24 text-center bg-brand-bg flex items-center justify-center">
        <div className="w-full max-w-xl px-6">
          <span className="text-[11px] uppercase tracking-[0.2em] text-secondary font-medium block mb-4">
            {sec?.subtitle || "HOQ Club"}
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-primary font-light mb-4">
            {sec?.title || "Subscribe for Collection Updates"}
          </h2>
          <p className="text-xs tracking-wider text-secondary uppercase max-w-md mx-auto mb-10 leading-relaxed">
            Gain early access to seasonal campaigns, artisanal drop releases, and member-only events.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="relative max-w-md mx-auto">
            <input
              type="email"
              placeholder="ENTER YOUR EMAIL ADDRESS..."
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="w-full bg-transparent border-b border-primary py-3 px-2 pr-12 text-xs tracking-widest uppercase text-center focus:outline-none focus:border-accent transition-colors"
            />
            <button
              type="submit"
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2.5 hover:opacity-75 transition-opacity"
              aria-label="Submit email"
            >
              <ArrowRight strokeWidth={1} className="w-4 h-4" />
            </button>
          </form>
          {newsletterStatus === "success" && (
            <p className="text-[11px] text-success tracking-widest uppercase mt-4">
              Thank you. You have been added to the HOQ list.
            </p>
          )}
        </div>
      </section>
    );
  };

  // Map section keys to their render functions
  const sectionRenderers: Record<string, () => React.ReactNode> = {
    hero: renderHero,
    "featured-collections": renderFeaturedCollections,
    "new-arrivals": renderNewArrivals,
    "best-sellers": renderBestSellers,
    "campaign-banner": renderCampaignBanner,
    "shop-by-category": renderShopByCategory,
    "customer-favorites": renderCustomerFavorites,
    "instagram-gallery": renderInstagramGallery,
    "brand-story": renderBrandStory,
    newsletter: renderNewsletter,
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-primary">
      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-xs uppercase tracking-widest text-secondary">Loading</p>
          </div>
        </div>
      ) : (
        <>
          {/* Render sections in CMS-defined order */}
          {sectionOrder.length > 0 ? (
            sectionOrder.map((key) => {
              const renderer = sectionRenderers[key];
              return renderer ? renderer() : null;
            })
          ) : (
            /* Fallback: if no CMS sections configured, render all in default order */
            <>
              {renderHero()}
              {renderFeaturedCollections(true)}
              {renderNewArrivals(true)}
              {renderBestSellers(true)}
              {renderCampaignBanner(true)}
              {renderShopByCategory(true)}
              {renderCustomerFavorites(true)}
              {renderInstagramGallery(true)}
              {renderBrandStory(true)}
              {renderNewsletter(true)}
            </>
          )}
          <Footer />
        </>
      )}
    </div>
  );
}
