"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { Product } from "@/data/products";

export default function ProductCard({ product }: { product: Product }) {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const isWishlisted = wishlist.includes(product.id);
  const hasSale = product.salePrice !== null;

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsQuickAddOpen(!isQuickAddOpen);
  };

  const handleSelectSize = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    setSelectedSize(size);
    addToCart(product, size, product.colors[0].name, 1);
    setIsQuickAddOpen(false);
    setSelectedSize("");
  };

  return (
    <div
      className="group relative flex flex-col bg-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsQuickAddOpen(false);
      }}
    >
      {/* Product Image Wrapper */}
      <div className="relative aspect-[4/5] overflow-hidden bg-brand-bg select-none">
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          {/* Default Image */}
          <div
            className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 ${
              isHovered && product.images[1] ? "opacity-0" : "opacity-100"
            }`}
            style={{ backgroundImage: `url(${product.images[0]})` }}
          />

          {/* Hover Image */}
          {product.images[1] && (
            <div
              className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out group-hover:scale-105 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundImage: `url(${product.images[1]})` }}
            />
          )}
        </Link>

        {/* Wishlist Overlay Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-primary border border-border-custom hover:scale-105 transition-all focus:outline-none"
          aria-label="Add to wishlist"
        >
          <Heart
            strokeWidth={1}
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? "fill-accent text-accent" : "text-primary"
            }`}
          />
        </button>

        {/* Quick Add Overlay */}
        <div
          className={`absolute bottom-0 left-0 w-full bg-white/95 border-t border-border-custom transition-all duration-300 transform translate-y-full group-hover:translate-y-0 ${
            isQuickAddOpen ? "translate-y-0" : ""
          }`}
        >
          {isQuickAddOpen ? (
            <div className="p-3 text-center">
              <p className="text-[9px] uppercase tracking-widest text-secondary font-medium mb-2">
                Select Size
              </p>
              <div className="flex justify-center flex-wrap gap-1.5">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={(e) => handleSelectSize(e, size)}
                    className="text-[10px] uppercase font-sans font-medium border border-border-custom px-2.5 py-1 hover:bg-primary hover:text-white transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              onClick={handleQuickAddClick}
              className="w-full text-center py-3.5 text-xs font-semibold uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-colors focus:outline-none"
            >
              Quick Add +
            </button>
          )}
        </div>
      </div>

      {/* Product Text Details */}
      <div className="pt-3 pb-2 flex flex-col font-sans select-none">
        <div className="flex justify-between items-start">
          <h3 className="text-[11px] uppercase tracking-widest font-medium text-primary hover:text-accent transition-colors flex-1 mr-2 truncate">
            <Link href={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <button
            onClick={handleQuickAddClick}
            className="p-1 -mt-1 text-primary hover:opacity-75 transition-opacity focus:outline-none"
            aria-label="Quick add size"
          >
            <span className="text-base font-light font-sans">+</span>
          </button>
        </div>

        {/* Pricing Rows */}
        <div className="mt-1.5 flex flex-col space-y-1.5">
          {hasSale ? (
            <>
              <span className="text-[10px] line-through text-secondary font-medium">
                ₹{product.price}.00
              </span>
              <span className="bg-sale text-white text-[10px] font-semibold px-2 py-0.5 self-start uppercase tracking-wider rounded-none">
                -{Math.round(((product.price - (product.salePrice || 0)) / product.price) * 100)}% ₹{product.salePrice}.00
              </span>
            </>
          ) : (
            <span className="text-[10px] text-primary font-medium">
              ₹{product.price}.00
            </span>
          )}
        </div>

        {/* Colors & Category Meta details (Hidden on Mobile) */}
        <div className="hidden md:flex justify-between items-center mt-3 pt-2.5 border-t border-border-custom/50">
          <p className="text-[10px] uppercase tracking-wider text-secondary">
            {product.category}
          </p>
          <div className="flex space-x-1">
            {product.colors.map((color) => (
              <span
                key={color.name}
                title={color.name}
                className="w-2 h-2 border border-border-custom"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
