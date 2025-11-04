import React from "react";
import { FaLeaf, FaShoppingBag, FaHeart } from "react-icons/fa";
import PrithuLogo from "../../assets/prithu_logo.webp";
import FeatureItem from "./feautureItem";

export default function LeftPanel() {
  return (
    <div className="flex-1 bg-gradient-to-br from-green-700 via-emerald-600 to-lime-600 text-white p-8 flex flex-col justify-center">
      <div className="flex items-center gap-3 mb-6">
        <img
          src={PrithuLogo}
          alt="Prithu Logo"
          className="w-12 h-12 rounded-full bg-white p-1 shadow-md"
        />
        <h1 className="text-2xl font-bold tracking-tight">Prithu</h1>
      </div>

      <h2 className="text-xl font-semibold mb-2">Join the Healing Circle 🌱</h2>
      <p className="mb-8 text-sm opacity-90">
        Heal to Positive – a platform that connects you to mindful communities and personal growth.
      </p>

      <div className="space-y-5">
        <FeatureItem icon={<FaLeaf />} title="Community" text="Connect & grow with mindfulness." />
        <FeatureItem icon={<FaShoppingBag />} title="Wellness Shop" text="Curated products for lifestyle." />
        <FeatureItem icon={<FaHeart />} title="Mindful Journey" text="Track and nurture wellness." />
      </div>
    </div>
  );
}
