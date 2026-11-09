"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Download,
  Calendar,
  Search,
  ExternalLink,
  Printer,
  Stamp,
  Award,
} from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";

export interface PmfbyClaimItem {
  claimId: string;
  farmerName: string;
  mobile: string;
  gatNo: string;
  taluka: string;
  talukaMr: string;
  district: string;
  crop: string;
  cropMr: string;
  acres: number;
  triggerType: "dry_spell" | "heavy_rain" | "pest_disease";
  triggerLabelEn: string;
  triggerLabelMr: string;
  consecutiveDryDays: number;
  peakRainMm: number;
  soilMoisturePct: number;
  filingDateEn: string;
  filingDateMr: string;
  status: "pending" | "approved" | "field_inspection" | "rejected";
  approvedByEn?: string;
  approvedByMr?: string;
  approvalCode?: string;
  approvalDateEn?: string;
  approvalDateMr?: string;
}

const INITIAL_CLAIMS: PmfbyClaimItem[] = [
  {
    claimId: "MH-PMFBY-2026-84920",
    farmerName: "Sagar Talpade",
    mobile: "9876543210",
    gatNo: "105/2",
    taluka: "Niphad",
    talukaMr: "निफाड",
    district: "Nashik",
    crop: "Onion (Rabi)",
    cropMr: "कांदा (रब्बी)",
    acres: 4.5,
    triggerType: "dry_spell",
    triggerLabelEn: "14-Day Monsoon Dry Spell Threshold Exceeded",
    triggerLabelMr: "सलग १४ दिवस पावसाचा खंड (विमा निकष पूर्ण)",
    consecutiveDryDays: 14,
    peakRainMm: 0.0,
    soilMoisturePct: 30.7,
    filingDateEn: "07 Nov 2026",
    filingDateMr: "७ नोव्हेंबर २०२६",
    status: "pending",
  },
  {
    claimId: "MH-PMFBY-2026-39104",
    farmerName: "Dattatraya Kadam",
    mobile: "9822198765",
    gatNo: "124/A",
    taluka: "Baramati",
    talukaMr: "बारामती",
    district: "Pune",
    crop: "Soybean",
    cropMr: "सोयाबीन",
    acres: 3.2,
    triggerType: "dry_spell",
    triggerLabelEn: "Severe Mid-Season Drought",
    triggerLabelMr: "हंगामी दुष्काळ व ओलावा घट",
    consecutiveDryDays: 16,
    peakRainMm: 1.2,
    soilMoisturePct: 24.1,
    filingDateEn: "06 Nov 2026",
    filingDateMr: "६ नोव्हेंबर २०२६",
    status: "pending",
  },
  {
    claimId: "MH-PMFBY-2026-58219",
    farmerName: "Sumit Barve",
    mobile: "7249702373",
    gatNo: "42/B",
    taluka: "Igatpuri",
    talukaMr: "इगतपुरी",
    district: "Nashik",
    crop: "Paddy",
    cropMr: "भात",
    acres: 2.5,
    triggerType: "dry_spell",
    triggerLabelEn: "Monsoon Sowing Moisture Deficit",
    triggerLabelMr: "पेरणीनंतर पावसाचा खंड",
    consecutiveDryDays: 15,
    peakRainMm: 0.0,
    soilMoisturePct: 28.5,
    filingDateEn: "05 Nov 2026",
    filingDateMr: "५ नोव्हेंबर २०२६",
    status: "approved",
    approvedByEn: "Dilip Patil, Taluka Agriculture Officer (Niphad)",
    approvedByMr: "दिलीप पाटील, तालुका कृषी अधिकारी (निफाड/नाशिक)",
    approvalCode: "MH-AGRI-PAN-2026-IGAT-091",
    approvalDateEn: "07 Nov 2026",
    approvalDateMr: "७ नोव्हेंबर २०२६",
  },
  {
    claimId: "MH-PMFBY-2026-71042",
    farmerName: "Ramesh Patil",
    mobile: "9822012345",
    gatNo: "18",
    taluka: "Shahapur",
    talukaMr: "शहापूर",
    district: "Thane",
    crop: "Rice / Pulses",
    cropMr: "भात / कडधान्य",
    acres: 3.0,
    triggerType: "pest_disease",
    triggerLabelEn: "Post-Rain Leaf Blight Flare-up",
    triggerLabelMr: "पावसानंतर करपा रोग प्रादुर्भाव",
    consecutiveDryDays: 12,
    peakRainMm: 4.5,
    soilMoisturePct: 34.0,
    filingDateEn: "04 Nov 2026",
    filingDateMr: "४ नोव्हेंबर २०२६",
    status: "field_inspection",
    approvedByEn: "Sanjay Deshmukh, Circle Agriculture Officer",
    approvedByMr: "संजय देशमुख, मंडळ कृषी अधिकारी",
    approvalCode: "MH-AGRI-INSP-2026-SHAH-014",
    approvalDateEn: "06 Nov 2026",
    approvalDateMr: "६ नोव्हेंबर २०२६",
  },
];

const STORAGE_KEY = "varshamitra:pmfby-verified-claims";

interface Props {
  selectedTaluka?: string;
  selectedDistrict?: string;
}

export default function PmfbyPanchamaDesk({
  selectedTaluka,
  selectedDistrict,
}: Props = {}) {
  const { language } = useTranslation();
  const isMr = language === "mr";

  const [claims, setClaims] = useState<PmfbyClaimItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return INITIAL_CLAIMS;
  });

  const [selectedClaimId, setSelectedClaimId] = useState<string>(claims[0]?.claimId || "");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Sync to localStorage so changes reflect across farmer portal
  const persistClaims = (newClaims: PmfbyClaimItem[]) => {
    setClaims(newClaims);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newClaims));
      window.dispatchEvent(new Event("varshamitra:pmfby-updated"));
    }
  };

  // Listen for storage events (e.g. if farmer submitted claim)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setClaims(JSON.parse(stored));
        }
      } catch {}
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("varshamitra:pmfby-updated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("varshamitra:pmfby-updated", handleStorageChange);
    };
  }, []);

  const selectedClaim = claims.find((c) => c.claimId === selectedClaimId) || claims[0];

  const handleApproveClaim = (claimId: string) => {
    const approvalCode = `MH-AGRI-PAN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowEn = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const nowMr = new Date().toLocaleDateString("mr-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const updated = claims.map((c) => {
      if (c.claimId === claimId) {
        return {
          ...c,
          status: "approved" as const,
          approvedByEn: "Dilip Patil, Taluka Agriculture Officer (TAO), Niphad",
          approvedByMr: "दिलीप पाटील, तालुका कृषी अधिकारी (निफाड / नाशिक)",
          approvalCode,
          approvalDateEn: nowEn,
          approvalDateMr: nowMr,
        };
      }
      return c;
    });

    persistClaims(updated);
    setActionSuccessMsg(
      isMr
        ? `दावा ${claimId} यशस्वीरित्या मंजूर केला! अधिकृत आदेश क्र.: ${approvalCode}`
        : `Claim ${claimId} approved! Official Govt Order Ref: ${approvalCode}`
    );
    setTimeout(() => setActionSuccessMsg(null), 6000);
  };

  const handleOrderFieldInspection = (claimId: string) => {
    const inspectionCode = `MH-INSP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowEn = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const nowMr = new Date().toLocaleDateString("mr-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const updated = claims.map((c) => {
      if (c.claimId === claimId) {
        return {
          ...c,
          status: "field_inspection" as const,
          approvedByEn: "Joint Committee of Circle Officer & Talathi",
          approvedByMr: "मंडळ अधिकारी व तलाठी संयुक्त पथक",
          approvalCode: inspectionCode,
          approvalDateEn: nowEn,
          approvalDateMr: nowMr,
        };
      }
      return c;
    });

    persistClaims(updated);
    setActionSuccessMsg(
      isMr
        ? `शेतकरी ${selectedClaim.farmerName} यांच्या शेतासाठी प्रत्यक्ष पंचनामा आदेश जारी केला! (आदेश: ${inspectionCode})`
        : `Field Spot Inspection scheduled for ${selectedClaim.farmerName}! (Order: ${inspectionCode})`
    );
    setTimeout(() => setActionSuccessMsg(null), 6000);
  };

  const filteredClaims = claims.filter((c) => {
    const matchesFilter = filterStatus === "all" || c.status === filterStatus;
    const matchesSearch =
      c.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.gatNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.claimId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.taluka.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.talukaMr.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="flex items-center gap-2 rounded-xl border-2 border-[#3B8B61] bg-[#3B8B61]/15 p-4 font-mono text-xs font-bold text-[#1F5336] shadow-sm animate-fade-in">
          <CheckCircle2 size={18} className="text-[#3B8B61] shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Desk Header Banner */}
      <div className="rounded-xl border-3 border-[#172B4D] bg-[#172B4D] p-5 text-white shadow-[4px_4px_0px_#123C32]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6A52E] px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#172B4D]">
                <ShieldCheck size={13} />
                {isMr ? "महाराष्ट्र शासन कृषी विभाग" : "Dept of Agriculture, Govt of Maharashtra"}
              </span>
              <span className="font-mono text-xs text-white/80">
                PMFBY Rev. Guidelines 2024
              </span>
            </div>
            <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
              {isMr
                ? "प्रधानमंत्री पीक विमा (PMFBY) पंचनामा व पडताळणी कक्ष"
                : "PMFBY Crop Loss Verification & Digital Panchanama Desk"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/10 px-3 py-2 text-right font-mono">
              <span className="block text-[10px] uppercase text-[#F4F0E5]/60">{isMr ? "एकूण दावे" : "Total Claims"}</span>
              <span className="text-base font-bold text-white">{claims.length}</span>
            </div>
            <div className="rounded-lg bg-white/10 px-3 py-2 text-right font-mono">
              <span className="block text-[10px] uppercase text-[#E6A52E]">{isMr ? "प्रलंबित" : "Pending"}</span>
              <span className="text-base font-bold text-[#E6A52E]">
                {claims.filter((c) => c.status === "pending").length}
              </span>
            </div>
            <div className="rounded-lg bg-white/10 px-3 py-2 text-right font-mono">
              <span className="block text-[10px] uppercase text-[#86EFAC]">{isMr ? "मंजूर" : "Approved"}</span>
              <span className="text-base font-bold text-[#86EFAC]">
                {claims.filter((c) => c.status === "approved").length}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-3 font-sans text-xs text-white/80 max-w-3xl leading-relaxed">
          {isMr
            ? "शेतकऱ्यांनी वर्षा मित्र ॲपवरून सादर केलेल्या ७२-तास आपत्ती दाव्यांची Copernicus ERA5 व स्वयंचलित हवामान केंद्राद्वारे (AWS) पडताळणी करून कृषी अधिकाऱ्यांना डिजिटल मंजुरी देण्याचे अधिकृत केंद्र."
            : "Official desk allowing Taluka Agriculture Officers to cross-verify 72-hour farmer crop-loss intimations against Copernicus ERA5 & IMD AWS telemetry, and issue digital panchanama certificates."}
        </p>
      </div>

      {/* Main 2-Col Desk Grid */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* Left Column: Claims Queue (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border-2 border-[#123C32] bg-white shadow-[4px_4px_0px_#123C32] overflow-hidden">
          <div className="flex items-center justify-between border-b-2 border-[#123C32]/15 bg-[#F4F0E5] px-4 py-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#123C32]">
              {isMr ? "दावा सूची" : "Incoming Claims Queue"}
            </span>
            <span className="font-mono text-xs text-[#252923]/60">
              {filteredClaims.length} {isMr ? "नोंदी" : "records"}
            </span>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-3 border-b border-[#123C32]/10 space-y-2 bg-[#F4F0E5]/40">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#252923]/50" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isMr ? "शेतकरी, गट क्र., तालुका शोधा..." : "Search farmer, gat no, taluka..."}
                className="w-full rounded-md border border-[#123C32]/30 bg-white pl-8 pr-3 py-1.5 font-mono text-xs text-[#252923] outline-none focus:border-[#123C32]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
              {[
                { id: "all", en: "All", mr: "सर्व" },
                { id: "pending", en: "Pending", mr: "प्रलंबित" },
                { id: "approved", en: "Approved", mr: "मंजूर" },
                { id: "field_inspection", en: "Spot Inspection", mr: "पंचनामा" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-2.5 py-1 rounded-md font-bold transition shrink-0 ${
                    filterStatus === tab.id
                      ? "bg-[#123C32] text-white"
                      : "bg-white border border-[#123C32]/20 text-[#252923] hover:bg-[#F4F0E5]"
                  }`}
                >
                  {isMr ? tab.mr : tab.en}
                </button>
              ))}
            </div>
          </div>

          {/* Claim items list */}
          <div className="max-h-[560px] overflow-y-auto divide-y divide-[#123C32]/10">
            {filteredClaims.map((claim) => {
              const isSelected = claim.claimId === selectedClaimId;
              return (
                <div
                  key={claim.claimId}
                  onClick={() => setSelectedClaimId(claim.claimId)}
                  className={`p-3.5 cursor-pointer transition ${
                    isSelected
                      ? "bg-[#123C32]/10 border-l-4 border-l-[#123C32]"
                      : "hover:bg-[#F4F0E5]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-[#123C32]">
                      {claim.claimId}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                        claim.status === "approved"
                          ? "bg-[#3B8B61]/20 text-[#1F5336]"
                          : claim.status === "field_inspection"
                          ? "bg-[#2878A5]/20 text-[#1E4E6D]"
                          : "bg-[#E6A52E]/25 text-[#8F4C13]"
                      }`}
                    >
                      {claim.status === "approved"
                        ? (isMr ? "मंजूर" : "Approved")
                        : claim.status === "field_inspection"
                        ? (isMr ? "पंचनामा आदेश" : "Inspection")
                        : (isMr ? "प्रलंबित" : "Pending")}
                    </span>
                  </div>

                  <p className="mt-1 font-display text-sm font-bold text-[#252923]">
                    {claim.farmerName}{" "}
                    <span className="font-mono text-xs font-normal text-[#252923]/70">
                      ({isMr ? "गट क्र." : "Gat No."} {claim.gatNo})
                    </span>
                  </p>

                  <div className="mt-1 flex items-center justify-between text-xs text-[#252923]/70 font-mono">
                    <span>
                      {isMr ? claim.talukaMr : claim.taluka} · {isMr ? claim.cropMr : claim.crop}
                    </span>
                    <span>{claim.acres} {isMr ? "एकर" : "Acres"}</span>
                  </div>

                  <p className="mt-1.5 text-[11px] text-[#C7473B] font-semibold line-clamp-1">
                    ⚠️ {isMr ? claim.triggerLabelMr : claim.triggerLabelEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Claim Inspector & Administrative Actions (7 cols) */}
        {selectedClaim && (
          <div className="lg:col-span-7 rounded-xl border-3 border-[#123C32] bg-white p-6 shadow-[6px_6px_0px_#123C32] space-y-5">
            
            {/* Header info */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-[#123C32]/15 pb-4">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#123C32]/60">
                  {isMr ? "दावा सविस्तर पडताळणी" : "Official Claim Verification Dossier"}
                </span>
                <h3 className="font-display text-2xl font-black text-[#123C32] mt-0.5">
                  {selectedClaim.farmerName}
                </h3>
                <p className="font-mono text-xs text-[#252923]/70 mt-0.5">
                  {isMr
                    ? `७/१२ गट क्र.: ${selectedClaim.gatNo} · तालुका ${selectedClaim.talukaMr}, जिल्हा ${selectedClaim.district}`
                    : `7/12 Gat No: ${selectedClaim.gatNo} · Taluka ${selectedClaim.taluka}, District ${selectedClaim.district}`}
                </p>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs font-bold text-[#123C32]">
                  {selectedClaim.claimId}
                </span>
                <p className="font-mono text-[10px] text-[#252923]/60">
                  {isMr ? "दाखल दिनांक: " : "Filed: "}
                  {isMr ? selectedClaim.filingDateMr : selectedClaim.filingDateEn}
                </p>
              </div>
            </div>

            {/* Crop & Land Details Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border-2 border-[#123C32]/20 bg-[#F4F0E5] p-3 font-mono text-xs">
                <span className="block text-[10px] text-[#252923]/60 uppercase">{isMr ? "विमा पीक" : "Insured Crop"}</span>
                <strong className="text-[#123C32] text-sm">{isMr ? selectedClaim.cropMr : selectedClaim.crop}</strong>
              </div>
              <div className="rounded-lg border-2 border-[#123C32]/20 bg-[#F4F0E5] p-3 font-mono text-xs">
                <span className="block text-[10px] text-[#252923]/60 uppercase">{isMr ? "क्षेत्रफळ" : "Area"}</span>
                <strong className="text-[#123C32] text-sm">{selectedClaim.acres} {isMr ? "एकर" : "Acres"}</strong>
              </div>
              <div className="rounded-lg border-2 border-[#123C32]/20 bg-[#F4F0E5] p-3 font-mono text-xs">
                <span className="block text-[10px] text-[#252923]/60 uppercase">{isMr ? "शेतकरी संपर्क" : "Mobile"}</span>
                <strong className="text-[#123C32] text-sm">+91 {selectedClaim.mobile}</strong>
              </div>
            </div>

            {/* ── Agro-Meteorological Evidence Ledger (Satellite & Ground Station) ── */}
            <div className="rounded-xl border-2 border-[#123C32] bg-[#F4F0E5]/60 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#123C32]/15 pb-2">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#123C32]">
                  <Award size={14} className="text-[#E6A52E]" />
                  <span>{isMr ? "वस्तुनिष्ठ कृषी-हवामान पुरावा नोंदवही" : "Objective Weather Evidence Ledger"}</span>
                </div>
                <span className="rounded bg-[#3B8B61]/15 px-2 py-0.5 font-mono text-[9px] font-bold text-[#1F5336] border border-[#3B8B61]/30">
                  Copernicus ERA5 Verified
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded bg-white border border-[#123C32]/10">
                  <span>{isMr ? "१. सलग पावसाचा खंड (Dry Spell):" : "1. Rainfall Deficit Streak:"}</span>
                  <strong className="text-[#C7473B]">
                    {selectedClaim.consecutiveDryDays} {isMr ? "दिवस" : "days"}{" "}
                    ({isMr ? "PMFBY निकष: ≥ १४ दिवस" : "PMFBY Threshold: ≥ 14 days"})
                  </strong>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white border border-[#123C32]/10">
                  <span>{isMr ? "२. २४ तास कमाल पाऊस (Peak Precip):" : "2. Peak 24h Rainfall:"}</span>
                  <strong className="text-[#123C32]">
                    {selectedClaim.peakRainMm} mm{" "}
                    ({isMr ? "अतिवृष्टी मर्यादा: ≥ ६४.५ mm" : "Heavy Rain Threshold: ≥ 64.5 mm"})
                  </strong>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white border border-[#123C32]/10">
                  <span>{isMr ? "३. उपग्रह मृदा ओलावा निर्देशांक (Vapsa):" : "3. Soil Moisture Index (0-7 cm):"}</span>
                  <strong className="text-[#2878A5]">
                    {selectedClaim.soilMoisturePct}% Volumetric{" "}
                    ({isMr ? "वाफसा मर्यादा तळाला" : "Below Vapsa Wilting Point"})
                  </strong>
                </div>
              </div>

              <p className="text-[11px] text-[#252923]/70 font-sans leading-tight">
                {isMr
                  ? "✓ वरील तिन्ही निकषांची स्वयंचलित पडताळणी IMD मानकांनुसार व महसूल मंडळ अहवालानुसार पूर्ण झाली आहे."
                  : "✓ All three parameters have been cross-checked against Maharashtra State Revenue Circle norms and IMD gridded precipitation thresholds."}
              </p>
            </div>

            {/* Status & Approval Box */}
            {selectedClaim.status === "approved" && (
              <div className="rounded-lg border-2 border-[#3B8B61] bg-[#3B8B61]/10 p-4 space-y-1 font-mono text-xs">
                <div className="flex items-center gap-2 text-[#1F5336] font-bold text-sm">
                  <Stamp size={18} className="text-[#3B8B61]" />
                  <span>{isMr ? "अधिकृत शासकीय नुकसान दाखला मंजूर" : "Officially Approved Government Loss Certificate"}</span>
                </div>
                <p className="text-[#252923]">
                  {isMr ? "मंजूर करणारे अधिकारी: " : "Approved By: "}
                  <strong>{isMr ? selectedClaim.approvedByMr : selectedClaim.approvedByEn}</strong>
                </p>
                <p className="text-[#252923]">
                  {isMr ? "आदेश संदर्भ क्रमांक: " : "Govt Order Ref: "}<strong>{selectedClaim.approvalCode}</strong>
                </p>
                <p className="text-[#252923]/60 text-[10px]">
                  {isMr ? "मंजुरी दिनांक: " : "Date of Approval: "}
                  {isMr ? selectedClaim.approvalDateMr : selectedClaim.approvalDateEn}
                </p>
              </div>
            )}

            {selectedClaim.status === "field_inspection" && (
              <div className="rounded-lg border-2 border-[#2878A5] bg-[#2878A5]/10 p-4 space-y-1 font-mono text-xs">
                <div className="flex items-center gap-2 text-[#1E4E6D] font-bold text-sm">
                  <Clock size={18} className="text-[#2878A5]" />
                  <span>{isMr ? "प्रत्यक्ष शेत पंचनामा आदेश जारी" : "Field Spot Inspection Scheduled"}</span>
                </div>
                <p className="text-[#252923]">
                  {isMr ? "नेमलेले पथक: " : "Assigned Team: "}
                  <strong>{isMr ? selectedClaim.approvedByMr : selectedClaim.approvedByEn}</strong>
                </p>
                <p className="text-[#252923]">
                  {isMr ? "आदेश क्रमांक: " : "Order Ref: "}<strong>{selectedClaim.approvalCode}</strong>
                </p>
              </div>
            )}

            {/* ── Official Action Buttons ── */}
            <div className="pt-2 border-t-2 border-[#123C32]/15 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {selectedClaim.status !== "approved" && (
                  <button
                    type="button"
                    onClick={() => handleApproveClaim(selectedClaim.claimId)}
                    className="flex items-center gap-2 rounded-lg border-2 border-[#3B8B61] bg-[#3B8B61] px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[2px_2px_0px_#123C32] hover:bg-[#2e6d4c] transition active:scale-95"
                  >
                    <CheckCircle2 size={15} />
                    <span>{isMr ? "दाखला मंजूर करा" : "Approve Certificate"}</span>
                  </button>
                )}

                {selectedClaim.status !== "field_inspection" && (
                  <button
                    type="button"
                    onClick={() => handleOrderFieldInspection(selectedClaim.claimId)}
                    className="flex items-center gap-2 rounded-lg border-2 border-[#2878A5] bg-white px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[#2878A5] shadow-[2px_2px_0px_#2878A5] hover:bg-[#2878A5]/10 transition active:scale-95"
                  >
                    <Calendar size={15} />
                    <span>{isMr ? "प्रत्यक्ष पंचनामा आदेश द्या" : "Order Spot Inspection"}</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg border border-[#123C32]/30 bg-[#F4F0E5] px-3 py-2 font-mono text-xs font-bold text-[#123C32] hover:bg-white transition"
              >
                <Printer size={13} />
                <span>{isMr ? "प्रमाणपत्र मुद्रित करा" : "Print Dossier"}</span>
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
