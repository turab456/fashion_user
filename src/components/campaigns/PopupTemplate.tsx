"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Copy, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface PopupTemplateProps {
  campaign: any;
  onClose: () => void;
  onTrackClick: () => void;
}

export default function PopupTemplate({ campaign, onClose, onTrackClick }: PopupTemplateProps) {
  const [copied, setCopied] = useState(false);
  const { content } = campaign;

  const handleCopy = () => {
    if (content.couponCode) {
      navigator.clipboard.writeText(content.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl bg-white shadow-2xl flex flex-col md:flex-row overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none text-primary hover:text-sale transition-colors rounded-full"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        {/* Image Section */}
        {content.productImage && (
          <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-gray-100">
            <img 
              src={content.productImage} 
              alt={content.title || "Promotion"} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content Section */}
        <div className={`w-full ${content.productImage ? 'md:w-1/2' : 'max-w-xl mx-auto'} p-8 md:p-12 flex flex-col justify-center items-center text-center bg-white`}>
          {content.subtitle && (
            <span className="text-[10px] font-semibold tracking-widest uppercase text-secondary mb-4">
              {content.subtitle}
            </span>
          )}
          
          {content.title && (
            <h2 className="text-3xl md:text-4xl font-light text-primary mb-4 leading-tight">
              {content.title}
            </h2>
          )}
          
          {content.promoDescription && (
            <p className="text-sm text-secondary leading-relaxed mb-8 max-w-sm">
              {content.promoDescription}
            </p>
          )}

          {content.couponCode && (
            <div className="mb-8 w-full max-w-xs">
              <div className="text-[10px] font-semibold tracking-widest uppercase text-secondary mb-2">
                Use Promo Code
              </div>
              <div 
                onClick={handleCopy}
                className="flex items-center justify-between border-2 border-dashed border-primary/20 bg-[#f9fafb] p-3 cursor-pointer group hover:border-primary/40 transition-colors"
              >
                <span className="text-lg font-mono font-medium tracking-wider text-primary">
                  {content.couponCode}
                </span>
                {copied ? (
                  <CheckCircle2 size={18} className="text-success" />
                ) : (
                  <Copy size={18} className="text-secondary group-hover:text-primary transition-colors" />
                )}
              </div>
            </div>
          )}

          {content.buttonText && content.redirectUrl && (
            <Link 
              href={content.redirectUrl}
              onClick={() => {
                onTrackClick();
                onClose();
              }}
              className="w-full max-w-xs bg-primary text-white py-4 text-[11px] font-semibold tracking-widest uppercase hover:bg-hover transition-colors text-center"
            >
              {content.buttonText}
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}
