"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../services/api";
import PopupTemplate from "./PopupTemplate";

export default function CampaignEngine() {
  const [campaign, setCampaign] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const initCampaign = async () => {
      try {
        const res = await api.marketing.getActiveCampaign();
        if (res.campaign) {
          const camp = res.campaign;

          // Check frequency rules
          const { frequencyType } = camp.frequency;
          const storageKey = `aura_campaign_seen_${camp._id}`;

          if (frequencyType === "Once" && localStorage.getItem(storageKey)) {
            return;
          }
          if (frequencyType === "Session" && sessionStorage.getItem(storageKey)) {
            return;
          }
          if (frequencyType === "Daily") {
            const lastSeen = localStorage.getItem(storageKey);
            if (lastSeen) {
              const daysSince = (Date.now() - parseInt(lastSeen, 10)) / (1000 * 60 * 60 * 24);
              if (daysSince < 1) return;
            }
          }

          setCampaign(camp);

          // Handle trigger
          const delay = camp.displayRules?.delaySeconds || 0;
          if (camp.displayRules?.trigger === "OnLoad") {
            timeoutId = setTimeout(() => {
              setIsVisible(true);
              api.marketing.track(camp._id, "impression").catch(console.error);

              // Mark as seen
              if (frequencyType === "Once") localStorage.setItem(storageKey, "true");
              if (frequencyType === "Session") sessionStorage.setItem(storageKey, "true");
              if (frequencyType === "Daily") localStorage.setItem(storageKey, Date.now().toString());
            }, delay * 1000);
          }
        }
      } catch (err) {
        console.error("Failed to load campaign:", err);
      }
    };

    initCampaign();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  if (!campaign) return null;

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleTrackClick = () => {
    api.marketing.track(campaign._id, "click").catch(console.error);
  };

  // Render the appropriate template based on campaign type
  return (
    <AnimatePresence>
      {isVisible && campaign.type === "popup" && (
        <PopupTemplate
          campaign={campaign}
          onClose={handleClose}
          onTrackClick={handleTrackClick}
        />
      )}
    </AnimatePresence>
  );
}
