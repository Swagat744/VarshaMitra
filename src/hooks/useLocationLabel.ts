"use client";

import { useAppState } from "@/hooks/useAppState";
import { useTranslation } from "@/i18n/LanguageContext";
import { getBlock, getDistrict } from "@/data/locations";
import { pickName } from "@/lib/utils";

/** Localized names for the user's selected location (state, district, block, village). */
export function useLocationLabel() {
  const { location, farmerProfile } = useAppState();
  const { language } = useTranslation();
  const isMr = language === "mr";

  const block = getBlock(location.blockId);
  const district = getDistrict(location.districtId);

  let blockName = location.blockName;
  if (isMr && location.blockNameMr) {
    blockName = location.blockNameMr;
  } else if (block) {
    blockName = pickName(block, language);
  }

  let districtName = location.districtName;
  if (isMr && location.districtNameMr) {
    districtName = location.districtNameMr;
  } else if (district) {
    districtName = pickName(district, language);
  }

  const stateName = isMr ? "महाराष्ट्र" : "Maharashtra";

  // Check if a village/town was explicitly selected or exists in profile
  let villageName: string | undefined;

  // 1. If location itself represents a town/village with a distinct parent taluka (e.g. Vasind in Shahapur, or Lasalgaon in Niphad)
  if (
    location.taluka &&
    location.blockName &&
    location.taluka.toLowerCase().trim() !== location.blockName.toLowerCase().trim()
  ) {
    villageName = isMr && location.blockNameMr ? location.blockNameMr : location.blockName;
    blockName = isMr && location.blockNameMr ? location.taluka : location.taluka;
  }
  // 2. Otherwise check farmerProfile, but ONLY if farmerProfile belongs to the current district and taluka!
  // This prevents cross-district pollution like "Niphad Town, Vasind" where a Nashik village is prepended to a Thane block.
  else if (farmerProfile?.villageName) {
    const normProfileDistrict = (farmerProfile.districtName || "").toLowerCase().trim();
    const normLocationDistrict = (location.districtName || "").toLowerCase().trim();
    const normProfileTaluka = (farmerProfile.talukaName || "").toLowerCase().trim();
    const normLocationBlock = (location.blockName || "").toLowerCase().trim();
    const normLocationTaluka = (location.taluka || "").toLowerCase().trim();

    const districtMatches =
      !normProfileDistrict ||
      !normLocationDistrict ||
      normProfileDistrict === normLocationDistrict ||
      normProfileDistrict.includes(normLocationDistrict) ||
      normLocationDistrict.includes(normProfileDistrict);

    const talukaMatches =
      !normProfileTaluka ||
      normProfileTaluka === normLocationBlock ||
      normProfileTaluka === normLocationTaluka ||
      normLocationBlock.includes(normProfileTaluka) ||
      normProfileTaluka.includes(normLocationBlock);

    if (districtMatches && talukaMatches) {
      villageName = isMr
        ? farmerProfile?.villageNameMr || farmerProfile?.villageName
        : farmerProfile?.villageName;
    }
  }

  // Generate full display string:
  // e.g. "Niphad, Nashik" or "Vasind, Shahapur" or "Niphad Town, Niphad"
  const full = villageName
    ? `${villageName}, ${blockName}`
    : `${blockName}, ${districtName}`;

  return { blockName, districtName, stateName, villageName, full };
}
