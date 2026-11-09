"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  RefreshCw,
  Search,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Compass,
  Building2,
} from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import { useAppState } from "@/hooks/useAppState";
import { stateInfo } from "@/data/locations";
import {
  MAHARASHTRA_LOCATIONS,
  type DistrictOption,
  type TalukaOption,
  type CityOption,
} from "@/data/maharashtraAdministrativeHierarchy";
import {
  api,
  type LocationSearchItem,
} from "@/lib/api";

export default function LocationPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const isMr = language === "mr";
  const { location, setLocation, role, hydrated } = useAppState();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // GPS geolocation state
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Cascading Hierarchy Dropdown State (All 36 Districts)
  const initialDist = useMemo(() => {
    const found = MAHARASHTRA_LOCATIONS.find(
      (d) => d.id === location.districtId?.toLowerCase() || d.nameEn.toLowerCase() === location.districtName?.toLowerCase()
    );
    return found || MAHARASHTRA_LOCATIONS.find((d) => d.id === "nashik") || MAHARASHTRA_LOCATIONS[0];
  }, [location.districtId, location.districtName]);

  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(initialDist.id);

  const currentDistrict = useMemo(
    () => MAHARASHTRA_LOCATIONS.find((d) => d.id === selectedDistrictId) || MAHARASHTRA_LOCATIONS[0],
    [selectedDistrictId]
  );

  const initialTaluka = useMemo(() => {
    const found = currentDistrict.talukas.find(
      (t) =>
        t.id === location.blockId?.toLowerCase() ||
        t.nameEn.toLowerCase() === location.blockName?.toLowerCase() ||
        t.id === location.taluka?.toLowerCase() ||
        t.nameEn.toLowerCase() === location.taluka?.toLowerCase()
    );
    return found || currentDistrict.talukas[0];
  }, [currentDistrict, location.blockId, location.blockName, location.taluka]);

  const [selectedTalukaId, setSelectedTalukaId] = useState<string>(initialTaluka?.id || currentDistrict.talukas[0]?.id || "");
  const [selectedCityId, setSelectedCityId] = useState<string>("all");

  const currentTaluka = useMemo(
    () => currentDistrict.talukas.find((t) => t.id === selectedTalukaId) || currentDistrict.talukas[0],
    [currentDistrict, selectedTalukaId]
  );

  // Candidate location preview
  const [candidate, setCandidate] = useState<{
    blockId: string;
    blockName: string;
    blockNameMr: string;
    districtId: string;
    districtName: string;
    districtNameMr: string;
    latitude: number;
    longitude: number;
    taluka?: string | null;
    postalCode?: string | null;
    displayName?: string | null;
    isDynamic?: boolean;
    precision?: string;
  }>({
    blockId: location.blockId,
    blockName: location.blockName,
    blockNameMr: location.blockNameMr || location.blockName,
    districtId: location.districtId,
    districtName: location.districtName,
    districtNameMr: location.districtNameMr || location.districtName,
    latitude: location.latitude ?? 18.5204,
    longitude: location.longitude ?? 73.8567,
    taluka: location.taluka,
    postalCode: location.postalCode,
    displayName: location.displayName,
    isDynamic: location.isDynamic,
  });

  // Auth guard check
  useEffect(() => {
    if (hydrated && !role) {
      router.replace("/login");
    }
  }, [hydrated, role, router]);

  // Handle Search Input with dual fallback (Local gazetteer + backend nominatim)
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setSearchError(null);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!val.trim() || val.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      const q = val.trim().toLowerCase();

      // 1. Search local authoritative hierarchy instantly
      const localMatches: LocationSearchItem[] = [];
      for (const dist of MAHARASHTRA_LOCATIONS) {
        for (const tal of dist.talukas) {
          // Check Taluka match
          if (tal.nameEn.toLowerCase().includes(q) || tal.nameMr.includes(q) || tal.id.includes(q)) {
            localMatches.push({
              id: tal.id,
              name: tal.nameEn,
              name_mr: tal.nameMr,
              taluka: tal.nameEn,
              district_id: dist.id,
              district_name: dist.nameEn,
              district_name_mr: dist.nameMr,
              state_id: "mh",
              state_name: "Maharashtra",
              latitude: tal.lat,
              longitude: tal.lng,
              display_name: `${tal.nameEn} Taluka, ${dist.nameEn} District, Maharashtra`,
              precision: "approximate_centroid",
              source: "local_gazetteer",
            });
          }

          // Check Cities/Villages under this taluka
          for (const city of tal.cities) {
            if (city.nameEn.toLowerCase().includes(q) || city.nameMr.includes(q) || city.id.includes(q)) {
              localMatches.push({
                id: city.id,
                name: city.nameEn,
                name_mr: city.nameMr,
                taluka: tal.nameEn,
                district_id: dist.id,
                district_name: dist.nameEn,
                district_name_mr: dist.nameMr,
                state_id: "mh",
                state_name: "Maharashtra",
                latitude: city.lat,
                longitude: city.lng,
                display_name: `${city.nameEn}, ${tal.nameEn} Taluka, ${dist.nameEn} District`,
                precision: "exact_geocoded_point",
                source: "local_gazetteer",
              });
            }
          }
        }
      }

      // 2. Also try backend Nominatim geocoder if available
      try {
        const apiRes = await api.searchLocations(val.trim(), 5);
        if (apiRes.results && apiRes.results.length > 0) {
          // Combine and deduplicate
          const combined = [...localMatches.slice(0, 4), ...apiRes.results];
          const unique = combined.filter(
            (v, i, a) => a.findIndex((t) => t.id === v.id || t.name === v.name) === i
          );
          setSearchResults(unique.slice(0, 8));
        } else {
          setSearchResults(localMatches.slice(0, 8));
        }
      } catch {
        // Use local matches if backend search fails
        setSearchResults(localMatches.slice(0, 8));
      } finally {
        setIsSearching(false);
        if (localMatches.length === 0) {
          setSearchError(
            isMr
              ? "महाराष्ट्रात कोणतेही स्थान आढळले नाही. कृपया तालुका किंवा पिन कोड तपासा."
              : "No locations found in Maharashtra. Try searching for a nearby taluka or PIN code."
          );
        }
      }
    }, 300);
  };

  const handleSelectSearchResult = async (item: LocationSearchItem) => {
    try {
      const resolved = await api.resolveLocation({
        latitude: item.latitude,
        longitude: item.longitude,
        postal_code: item.postal_code || undefined,
        query: item.name,
      });

      setCandidate({
        blockId: resolved.id,
        blockName: resolved.name,
        blockNameMr: resolved.name_mr || resolved.name,
        districtId: resolved.district_id,
        districtName: resolved.district_name,
        districtNameMr: item.district_name_mr || resolved.district_name,
        latitude: resolved.latitude,
        longitude: resolved.longitude,
        taluka: item.taluka || resolved.name,
        postalCode: item.postal_code,
        displayName: item.display_name,
        isDynamic: true,
        precision: item.precision,
      });

      setSearchQuery("");
      setSearchResults([]);
    } catch {
      setCandidate({
        blockId: item.id,
        blockName: item.name,
        blockNameMr: item.name_mr,
        districtId: item.district_id,
        districtName: item.district_name,
        districtNameMr: item.district_name_mr,
        latitude: item.latitude,
        longitude: item.longitude,
        taluka: item.taluka || item.name,
        postalCode: item.postal_code,
        displayName: item.display_name,
        isDynamic: true,
        precision: item.precision,
      });
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setGpsError(
        isMr
          ? "आपल्या ब्राउझरमध्ये GPS स्थान समर्थित नाही."
          : "Geolocation is not supported by your browser."
      );
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const resolved = await api.reverseGeocodeLocation(latitude, longitude);
          setCandidate({
            blockId: resolved.id,
            blockName: resolved.name,
            blockNameMr: resolved.name_mr,
            districtId: resolved.district_id,
            districtName: resolved.district_name,
            districtNameMr: resolved.district_name_mr,
            latitude: resolved.latitude,
            longitude: resolved.longitude,
            taluka: resolved.taluka,
            postalCode: resolved.postal_code,
            displayName: resolved.display_name,
            isDynamic: true,
            precision: resolved.precision,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to resolve GPS coordinates";
          setGpsError(msg);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        setGpsError(
          err.code === 1
            ? (isMr ? "स्थान परवानगी नाकारली गेली." : "Location access permission was denied.")
            : (isMr ? "GPS स्थान प्राप्त करण्यास अयशस्वी." : "Could not determine GPS position.")
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // District dropdown change
  const handleDistrictChange = (dId: string) => {
    setSelectedDistrictId(dId);
    const dist = MAHARASHTRA_LOCATIONS.find((d) => d.id === dId);
    if (dist && dist.talukas.length > 0) {
      const firstTal = dist.talukas[0];
      setSelectedTalukaId(firstTal.id);
      setSelectedCityId("all");
      setCandidate({
        blockId: firstTal.id,
        blockName: firstTal.nameEn,
        blockNameMr: firstTal.nameMr,
        districtId: dist.id,
        districtName: dist.nameEn,
        districtNameMr: dist.nameMr,
        latitude: firstTal.lat,
        longitude: firstTal.lng,
        taluka: firstTal.nameEn,
        displayName: `${firstTal.nameEn} Taluka, ${dist.nameEn} District, Maharashtra`,
        isDynamic: false,
      });
    }
  };

  // Taluka dropdown change
  const handleTalukaChange = (tId: string) => {
    setSelectedTalukaId(tId);
    setSelectedCityId("all");
    const tal = currentDistrict.talukas.find((t) => t.id === tId);
    if (tal) {
      setCandidate({
        blockId: tal.id,
        blockName: tal.nameEn,
        blockNameMr: tal.nameMr,
        districtId: currentDistrict.id,
        districtName: currentDistrict.nameEn,
        districtNameMr: currentDistrict.nameMr,
        latitude: tal.lat,
        longitude: tal.lng,
        taluka: tal.nameEn,
        displayName: `${tal.nameEn} Taluka, ${currentDistrict.nameEn} District, Maharashtra`,
        isDynamic: false,
      });
    }
  };

  // Village / Town dropdown change
  const handleCityChange = (cId: string) => {
    setSelectedCityId(cId);
    if (!currentTaluka) return;

    if (cId === "all") {
      setCandidate({
        blockId: currentTaluka.id,
        blockName: currentTaluka.nameEn,
        blockNameMr: currentTaluka.nameMr,
        districtId: currentDistrict.id,
        districtName: currentDistrict.nameEn,
        districtNameMr: currentDistrict.nameMr,
        latitude: currentTaluka.lat,
        longitude: currentTaluka.lng,
        taluka: currentTaluka.nameEn,
        displayName: `${currentTaluka.nameEn} Taluka, ${currentDistrict.nameEn} District, Maharashtra`,
        isDynamic: false,
      });
    } else {
      const city = currentTaluka.cities.find((c) => c.id === cId);
      if (city) {
        setCandidate({
          blockId: city.id,
          blockName: city.nameEn,
          blockNameMr: city.nameMr,
          districtId: currentDistrict.id,
          districtName: currentDistrict.nameEn,
          districtNameMr: currentDistrict.nameMr,
          latitude: city.lat,
          longitude: city.lng,
          taluka: currentTaluka.nameEn,
          displayName: `${city.nameEn}, ${currentTaluka.nameEn} Taluka, ${currentDistrict.nameEn} District`,
          isDynamic: true,
          precision: "exact_geocoded_point",
        });
      }
    }
  };

  // Confirm selection and commit to AppState
  const confirmLocation = () => {
    setLocation({
      stateId: stateInfo.id,
      stateName: stateInfo.name,
      districtId: candidate.districtId,
      districtName: candidate.districtName,
      districtNameMr: candidate.districtNameMr,
      blockId: candidate.blockId,
      blockName: candidate.blockName,
      blockNameMr: candidate.blockNameMr,
      latitude: candidate.latitude,
      longitude: candidate.longitude,
      taluka: candidate.taluka,
      postalCode: candidate.postalCode,
      displayName: candidate.displayName,
      isDynamic: candidate.isDynamic,
    });
    router.push(role === "officer" ? "/officer/dashboard" : "/farmer/dashboard");
  };

  if (!hydrated || !role) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-8 bg-[#F4F0E5] text-[#252923]">
      {/* ── Page Header ── */}
      <div className="border-b-2 border-[#123C32]/20 pb-5">
        <div className="flex items-center gap-2">
          <span className="rounded border border-[#123C32] bg-[#123C32] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#F4F0E5]">
            {isMr ? "स्थान निवड व शोध" : "Location Selector"}
          </span>
          <span className="font-mono text-xs font-semibold text-[#123C32]">
            {isMr ? "महाराष्ट्र शासन • सर्व ३६ जिल्हे व ३५१ तालुके" : "Maharashtra · All 36 Districts & 351 Talukas"}
          </span>
        </div>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#123C32] sm:text-3xl">
          {isMr ? "स्थान निवडा किंवा शोधा" : "Select or Search Location"}
        </h1>
        <p className="mt-1 font-sans text-xs text-[#252923]/70 sm:text-sm">
          {isMr
            ? "महाराष्ट्रातील कोणत्याही गाव, शहर, तालुका, जिल्हा, किंवा पिन कोड शोधा किंवा खालील ३-स्तरीय ड्रॉपडाउनमधून निवडा."
            : "Locate any village, town, taluka, or PIN code across all 36 districts of Maharashtra."}
        </p>
      </div>

      {/* ── 1. Search Box & Autocomplete ── */}
      <div className="rounded-xl border-2 border-[#123C32] bg-white p-6 shadow-[4px_4px_0px_#123C32] space-y-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#123C32]">
            <Search size={15} />
            <span>{isMr ? "१. गाव, शहर, तालुका किंवा पिन कोड शोधा" : "1. Search Place, Taluka, or PIN Code"}</span>
          </label>
          <span className="rounded border border-[#123C32]/20 bg-[#F4F0E5] px-2 py-0.5 font-mono text-[10px] font-bold text-[#123C32]">
            {isMr ? "राज्यव्यापी शोध" : "Statewide Geocoding"}
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={isMr ? "उदा. निफाड, वाशिंद, बारामती, शहापूर, लासलगाव, ४२२२०९..." : "e.g. Niphad, Vasind, Baramati, Shahapur, Lasalgaon, 422209..."}
            className="w-full rounded-lg border-2 border-[#123C32]/30 bg-[#F4F0E5]/50 px-4 py-3 font-sans text-sm font-semibold text-[#252923] outline-none transition focus:border-[#123C32] focus:bg-white"
          />
          {isSearching && (
            <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5 font-mono text-xs text-[#123C32]">
              <RefreshCw size={13} className="animate-spin text-[#123C32]" />
              <span>{isMr ? "शोधत आहे..." : "Searching..."}</span>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="divide-y divide-[#123C32]/10 overflow-hidden rounded-lg border-2 border-[#123C32] bg-white shadow-lg">
            {searchResults.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectSearchResult(item)}
                className="flex w-full items-start justify-between p-3.5 text-left transition hover:bg-[#F4F0E5]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#123C32] shrink-0" />
                    <span className="font-display font-bold text-sm text-[#252923]">
                      {isMr ? item.name_mr : item.name}
                    </span>
                    {item.taluka && (
                      <span className="rounded border border-[#123C32]/30 bg-[#F4F0E5] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#123C32]">
                        {isMr ? `तालुका: ${item.taluka}` : `Taluka: ${item.taluka}`}
                      </span>
                    )}
                    <span className="rounded bg-[#172B4D]/10 px-1.5 py-0.5 font-mono text-[10px] text-[#172B4D]">
                      {isMr ? item.district_name_mr : item.district_name}
                    </span>
                  </div>
                  <p className="mt-0.5 font-sans text-xs text-[#252923]/70 pl-5">
                    {item.display_name}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-[#252923]/60 shrink-0">
                  {item.latitude.toFixed(3)}°N, {item.longitude.toFixed(3)}°E
                </span>
              </button>
            ))}
          </div>
        )}

        {searchError && (
          <p className="font-mono text-xs text-[#C7473B]">{searchError}</p>
        )}

        {/* GPS Quick Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#123C32]/10 pt-4">
          <p className="font-sans text-xs text-[#252923]/70">
            {isMr ? "किंवा डिव्हाइस GPS द्वारे शेताचे थेट अक्षांश-रेखांश मिळवा:" : "Or detect current field coordinates via device GPS:"}
          </p>
          <button
            type="button"
            onClick={handleUseGPS}
            disabled={isLocating}
            className="flex items-center gap-1.5 rounded-lg border-2 border-[#123C32] bg-white px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-[#123C32] shadow-[2px_2px_0px_#123C32] hover:bg-[#F4F0E5]"
          >
            {isLocating ? (
              <RefreshCw size={13} className="animate-spin text-[#123C32]" />
            ) : (
              <Navigation size={13} className="text-[#E6A52E]" />
            )}
            <span>{isMr ? "GPS स्थान वापरा" : "Use GPS Location"}</span>
          </button>
        </div>

        {gpsError && (
          <p className="font-mono text-xs text-[#C7473B]">{gpsError}</p>
        )}
      </div>

      {/* ── 2. Administrative 3-Tier Cascading Selector (District -> Taluka -> Village) ── */}
      <div className="rounded-xl border-2 border-[#123C32] bg-white p-6 shadow-[4px_4px_0px_#123C32] space-y-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#123C32]">
            <Compass size={15} />
            <span>{isMr ? "२. जिल्हा, तालुका व गाव निवडा" : "2. Browse by District, Taluka & Village"}</span>
          </label>
          <span className="font-mono text-[10px] text-[#252923]/60">
            {MAHARASHTRA_LOCATIONS.length} {isMr ? "जिल्हे उपलब्ध" : "Districts Available"}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* 1. District Dropdown */}
          <div>
            <label className="font-mono text-xs font-bold uppercase text-[#252923]/70">
              {isMr ? "जिल्हा (District):" : "District:"}
            </label>
            <select
              value={selectedDistrictId}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="mt-1.5 w-full rounded-lg border-2 border-[#123C32]/30 bg-[#F4F0E5]/50 px-3 py-2.5 font-sans text-sm font-semibold text-[#252923] outline-none transition focus:border-[#123C32] focus:bg-white"
            >
              {MAHARASHTRA_LOCATIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {isMr ? d.nameMr : d.nameEn} ({d.talukas.length} {isMr ? "तालुके" : "talukas"})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Taluka Dropdown */}
          <div>
            <label className="font-mono text-xs font-bold uppercase text-[#252923]/70">
              {isMr ? "तालुका (Taluka):" : "Taluka / Block:"}
            </label>
            <select
              value={selectedTalukaId}
              onChange={(e) => handleTalukaChange(e.target.value)}
              className="mt-1.5 w-full rounded-lg border-2 border-[#123C32]/30 bg-[#F4F0E5]/50 px-3 py-2.5 font-sans text-sm font-semibold text-[#252923] outline-none transition focus:border-[#123C32] focus:bg-white"
            >
              {currentDistrict.talukas.map((t) => (
                <option key={t.id} value={t.id}>
                  {isMr ? t.nameMr : t.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Village / Town Dropdown */}
          <div>
            <label className="font-mono text-xs font-bold uppercase text-[#252923]/70">
              {isMr ? "गाव / शहर (Village / Town):" : "Village / Town:"}
            </label>
            <select
              value={selectedCityId}
              onChange={(e) => handleCityChange(e.target.value)}
              className="mt-1.5 w-full rounded-lg border-2 border-[#123C32]/30 bg-[#F4F0E5]/50 px-3 py-2.5 font-sans text-sm font-semibold text-[#252923] outline-none transition focus:border-[#123C32] focus:bg-white"
            >
              <option value="all">
                {isMr
                  ? `संपूर्ण ${currentTaluka?.nameMr || ""} तालुका`
                  : `Entire ${currentTaluka?.nameEn || ""} Taluka`}
              </option>
              {currentTaluka?.cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {isMr ? c.nameMr : c.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── 3. Candidate Location Confirmation Card ── */}
      <div className="rounded-xl border-3 border-[#123C32] bg-white p-6 shadow-[6px_6px_0px_#123C32] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#123C32]/15 pb-3">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#123C32]">
            {isMr ? "निवडलेल्या स्थानाचे पूर्वावलोकन" : "Selected Location Preview"}
          </span>
          <span className="flex items-center gap-1 rounded border border-[#123C32] bg-[#F4F0E5] px-2 py-0.5 font-mono text-[10px] font-bold text-[#123C32]">
            <ShieldCheck size={12} className="text-[#3B8B61]" />
            {isMr ? "निश्चित करण्यासाठी तयार" : "Ready to Set"}
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-[#123C32]" />
            <h3 className="font-display text-2xl font-black text-[#123C32]">
              {isMr ? candidate.blockNameMr : candidate.blockName}
            </h3>
          </div>
          <p className="font-sans text-xs sm:text-sm text-[#252923]/75 mt-1">
            {candidate.taluka && candidate.taluka !== candidate.blockName ? (
              isMr ? (
                <span>
                  तालुका: <strong>{candidate.taluka}</strong> · जिल्हा: <strong>{candidate.districtNameMr || candidate.districtName}</strong>, महाराष्ट्र
                </span>
              ) : (
                <span>
                  Taluka: <strong>{candidate.taluka}</strong> · District: <strong>{candidate.districtName}</strong>, Maharashtra
                </span>
              )
            ) : (
              isMr ? (
                <span>
                  जिल्हा: <strong>{candidate.districtNameMr || candidate.districtName}</strong>, महाराष्ट्र
                </span>
              ) : (
                <span>
                  District: <strong>{candidate.districtName}</strong>, Maharashtra
                </span>
              )
            )}
          </p>
          <p className="font-mono text-xs text-[#252923]/60 mt-1">
            Centroid: {candidate.latitude.toFixed(3)}°N, {candidate.longitude.toFixed(3)}°E
          </p>
        </div>

        <button
          type="button"
          onClick={confirmLocation}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#123C32] bg-[#123C32] py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F4F0E5] shadow-[4px_4px_0px_#252923] hover:bg-[#172B4D] transition"
        >
          <span>{isMr ? "स्थान निश्चित करा (Confirm Location)" : "Set Location & Continue"}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
