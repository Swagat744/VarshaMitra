"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Smartphone,
  Send,
  Share2,
  Volume2,
  VolumeX,
  CheckCircle2,
  RefreshCw,
  Radio,
  Signal,
  BatteryCharging,
  MessageSquare,
  Users,
  Copy,
  Filter,
  Sparkles,
  BookOpen,
  MapPin,
  Building,
  Globe,
} from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";

type TargetScope = "block" | "district" | "statewide";
type TargetCrop = "all" | "onion" | "soybean" | "cotton" | "grapes" | "wheat";

interface RuralSmsSimulatorProps {
  blockName: string;
  districtName: string;
  riskLevel: string;
  primaryDriver?: string;
  forecastRainMm?: number;
}

export default function RuralSmsSimulator({
  blockName = "Niphad",
  districtName = "Nashik",
  riskLevel = "high",
  primaryDriver,
  forecastRainMm = 12.4,
}: RuralSmsSimulatorProps) {
  const { language } = useTranslation();
  const isMr = language === "mr";

  // ── Targeting Filters ──
  const [targetScope, setTargetScope] = useState<TargetScope>("block");
  const [targetCrop, setTargetCrop] = useState<TargetCrop>("all");

  // Dynamic farmer count calculation based on scope & crop
  const targetFarmerCount = useMemo(() => {
    let base = 1420;
    if (targetScope === "district") base = 32850;
    if (targetScope === "statewide") base = 485000;

    if (targetCrop === "onion") return Math.round(base * 0.35);
    if (targetCrop === "soybean") return Math.round(base * 0.42);
    if (targetCrop === "cotton") return Math.round(base * 0.28);
    if (targetCrop === "grapes") return Math.round(base * 0.18);
    if (targetCrop === "wheat") return Math.round(base * 0.24);
    return base;
  }, [targetScope, targetCrop]);

  // Target Location Label for message headers
  const targetLocationLabel = useMemo(() => {
    if (targetScope === "statewide") {
      return isMr ? "महाराष्ट्र राज्य (सर्व ३६ जिल्हे)" : "Maharashtra Statewide (All 36 Districts)";
    }
    if (targetScope === "district") {
      return isMr ? `${districtName} जिल्हा` : `${districtName} District`;
    }
    return isMr ? `${blockName} (${districtName})` : `${blockName} (${districtName})`;
  }, [targetScope, blockName, districtName, isMr]);

  // Pre-calibrated Advisory Library
  const ADVISORY_TEMPLATES = useMemo(
    () => [
      {
        id: "dry_spell",
        labelEn: "1. Dry Spell Mitigation",
        labelMr: "१. पावसाचा खंड व ओलावा संवर्धन",
        textEn: `[VarshaMitra/AgriDept]\n${targetLocationLabel}: Prolonged dry spell forecast. Apply foliar spray of Potassium Nitrate (13:00:45) @ 10g/L or Urea @ 20g/L to preserve leaf moisture. Use sprinkler irrigation. PMFBY Helpline: 14447`,
        textMr: `[VarshaMitra/महाकृषी]\n${targetLocationLabel}: पुढील ७ दिवस पावसाचा खंड कायम राहण्याचा अंदाज. पिकात ओलावा टिकवण्यासाठी पोटॅशियम नायट्रेट (१३:००:४५) १० ग्रॅम/लिटर फवारावे. तुषार सिंचनाने हलके पाणी द्यावे. PMFBY मदत: 14447`,
      },
      {
        id: "pest_disease",
        labelEn: "2. Pest & Disease Alert",
        labelMr: "२. करपा व किड नियंत्रण",
        textEn: `[VarshaMitra/AgriAdvisory]\n${targetLocationLabel}: High night dew & overcast skies favoring purple blotch and sucking pests. Spray Difenoconazole @ 0.5 ml/L water with sticker. Control thrips with Fipronil 5% SC @ 1.5 ml/L.`,
        textMr: `[VarshaMitra/कृषी सल्ला]\n${targetLocationLabel}: रात्रीचे धुके व दवबिंदूंमुळे पिकांवर जांभळा करपा व फुलकिडे (थ्रिप्स) प्रादुर्भावाची शक्यता. नियंत्रणासाठी डायफेनोकोनॅझोल ०.५ मिली प्रति लिटर पाण्यात मिसळून फवारावे. सोबत चिकटद्रव्य वापरावे.`,
      },
      {
        id: "pmfby_claim",
        labelEn: "3. PMFBY 72-Hr Loss Intimation",
        labelMr: "३. विमा नुकसान ७२-तास सूचना",
        textEn: `[VarshaMitra/PMFBY]\nFarmers of ${targetLocationLabel}: If standing crops suffered moisture deficit damage, intimate claim within 72 hours on Toll-Free 14447 or through VarshaMitra app to qualify for spot panchanama.`,
        textMr: `[VarshaMitra/PMFBY]\n${targetLocationLabel} शेतकरी बांधव: पावसाच्या खंडामुळे पिकांचे नुकसान झाले असल्यास ७२ तासांच्या आत 14447 टोल-फ्री क्रमांकावर किंवा वर्षा मित्र ॲपवरून नुकसान नोंदवावी (पंचनामा अनिवार्य).`,
      },
      {
        id: "irrigation_vapsa",
        labelEn: "4. Soil Moisture & Vapsa",
        labelMr: "४. सिंचन व वाफसा नियोजन",
        textEn: `[VarshaMitra/AgriDept]\n${targetLocationLabel}: Check topsoil Vapsa condition (50:50 air-water balance) before fertilizer application. Schedule light irrigation for wheat at Crown Root Initiation stage.`,
        textMr: `[VarshaMitra/महाकृषी]\n${targetLocationLabel}: जमिनीतील वाफसा (५०:५० हवा/पाणी समतोल) तपासूनच खत व्यवस्थापन करावे. मुकुट मुळे फुटण्याच्या (CRI) अवस्थेत गहू पिकास पहिली हलकी पाणीपाळी तात्काळ द्यावी.`,
      },
    ],
    [targetLocationLabel]
  );

  // Active message in the Nokia screen and textarea
  const [message, setMessage] = useState<string>(
    isMr ? ADVISORY_TEMPLATES[0].textMr : ADVISORY_TEMPLATES[0].textEn
  );

  // Update message when scope or language changes
  useEffect(() => {
    setMessage(isMr ? ADVISORY_TEMPLATES[0].textMr : ADVISORY_TEMPLATES[0].textEn);
  }, [targetLocationLabel, isMr]);

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Voice playback simulating Kisan Call Center IVRS
  const handleVoiceBroadcast = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = isMr ? "mr-IN" : "en-IN";
    utterance.rate = 0.92;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleBroadcast = () => {
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastSent(true);

      // Persist to shared store so Farmer Cockpit displays this emergency alert
      if (typeof window !== "undefined") {
        const alertObj = {
          id: `broadcast-${Date.now()}`,
          blockName: targetScope === "block" ? blockName : "",
          districtName: targetScope === "statewide" ? "" : districtName,
          message,
          timestamp: new Date().toLocaleTimeString(isMr ? "mr-IN" : "en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sender: isMr
            ? `तालुका कृषी अधिकारी (${blockName})`
            : `Taluka Agri Officer (${blockName})`,
          farmerCount: targetFarmerCount,
        };
        try {
          const existing = JSON.parse(
            localStorage.getItem("varshamitra:broadcast-alerts") || "[]"
          );
          const updated = [alertObj, ...existing.slice(0, 9)];
          localStorage.setItem("varshamitra:broadcast-alerts", JSON.stringify(updated));
          window.dispatchEvent(new Event("varshamitra:new-broadcast"));
        } catch {
          // ignore
        }
      }

      setTimeout(() => setBroadcastSent(false), 5000);
    }, 1100);
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const charCount = message.length;
  const smsSegments = Math.ceil(charCount / 160) || 1;

  // WhatsApp link
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

  return (
    <div className="rounded-xl border-3 border-[#123C32] bg-white p-6 shadow-[5px_5px_0px_#123C32] space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#123C32]/15 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#123C32] bg-[#F4F0E5] text-[#123C32]">
            <Radio size={22} className="text-[#123C32]" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded border border-[#123C32] bg-[#123C32] px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[#F4F0E5]">
                2G SMS & WhatsApp Dispatch
              </span>
              <span className="font-mono text-xs text-[#252923]/70">
                CDAC Kisaan Portal & mKisan DLT Gateway
              </span>
            </div>
            <h3 className="font-display text-lg font-black text-[#123C32]">
              {isMr
                ? "ग्रामीण शेतकरी SMS, व्हॉट्सॲप व IVRS थेट प्रसारण"
                : "Rural 2G Feature Phone, WhatsApp & IVRS Broadcast Console"}
            </h3>
          </div>
        </div>

        {/* Dynamic Recipient Count Badge */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="flex items-center gap-1.5 rounded-lg border-2 border-[#123C32] bg-[#F4F0E5] px-3 py-1.5 text-[#123C32] shadow-xs">
            <Users size={14} className="text-[#3B8B61]" />
            <span>
              <strong>{targetFarmerCount.toLocaleString("en-IN")}</strong>{" "}
              {targetScope === "statewide"
                ? isMr
                  ? "राज्यव्यापी शेतकरी"
                  : "Statewide Farmers"
                : targetScope === "district"
                ? isMr
                  ? `शेतकरी (${districtName} जिल्हा)`
                  : `in ${districtName} District`
                : isMr
                ? `शेतकरी (${blockName} तालुका)`
                : `in ${blockName} Block`}
            </span>
          </span>
        </div>
      </div>

      {/* ── TARGETING MATRIX STRIP (Filters for Location & Crop) ── */}
      <div className="rounded-xl border-2 border-[#123C32]/30 bg-[#F4F0E5]/60 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#123C32]/10 pb-2">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#123C32]">
            <Filter size={14} />
            <span>{isMr ? "लक्ष्यित शेतकरी निवड निकष (Target Filters)" : "Target Farmer Filters"}</span>
          </div>
          <span className="font-mono text-[11px] text-[#252923]/60">
            {isMr ? "स्थान व पिकानुसार थेट प्रसारण" : "Target by Location & Crop"}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Location Scope Selector */}
          <div>
            <label className="font-mono text-[11px] font-bold uppercase text-[#252923]/70 block mb-1.5">
              {isMr ? "१. प्रसारण कार्यक्षेत्र (Location Scope):" : "1. Location Scope:"}
            </label>
            <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
              <button
                type="button"
                onClick={() => setTargetScope("block")}
                className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-2 font-semibold transition ${
                  targetScope === "block"
                    ? "border-[#123C32] bg-[#123C32] text-white shadow-xs"
                    : "border-[#123C32]/20 bg-white text-[#252923] hover:bg-[#F4F0E5]"
                }`}
              >
                <MapPin size={12} />
                <span>{blockName}</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetScope("district")}
                className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-2 font-semibold transition ${
                  targetScope === "district"
                    ? "border-[#123C32] bg-[#123C32] text-white shadow-xs"
                    : "border-[#123C32]/20 bg-white text-[#252923] hover:bg-[#F4F0E5]"
                }`}
              >
                <Building size={12} />
                <span>{districtName}</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetScope("statewide")}
                className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-2 font-semibold transition ${
                  targetScope === "statewide"
                    ? "border-[#123C32] bg-[#123C32] text-white shadow-xs"
                    : "border-[#123C32]/20 bg-white text-[#252923] hover:bg-[#F4F0E5]"
                }`}
              >
                <Globe size={12} />
                <span>{isMr ? "महाराष्ट्र (३६)" : "Statewide (36)"}</span>
              </button>
            </div>
          </div>

          {/* Crop Filter */}
          <div>
            <label className="font-mono text-[11px] font-bold uppercase text-[#252923]/70 block mb-1.5">
              {isMr ? "२. लक्ष्यित पीक (Target Crop):" : "2. Target Crop:"}
            </label>
            <select
              value={targetCrop}
              onChange={(e) => setTargetCrop(e.target.value as TargetCrop)}
              className="w-full rounded-lg border-2 border-[#123C32]/30 bg-white px-3 py-2 font-mono text-xs font-bold text-[#123C32] focus:border-[#123C32] outline-none"
            >
              <option value="all">{isMr ? "सर्व पिके (All Crops)" : "All Crops (General Alert)"}</option>
              <option value="onion">{isMr ? "कांदा उत्पादक (Onion Farmers)" : "Onion Farmers"}</option>
              <option value="soybean">{isMr ? "सोयाबीन उत्पादक (Soybean Farmers)" : "Soybean Farmers"}</option>
              <option value="cotton">{isMr ? "कापूस उत्पादक (Cotton Farmers)" : "Cotton Farmers"}</option>
              <option value="grapes">{isMr ? "द्राक्ष बागायतदार (Grape Vineyards)" : "Grape Vineyards"}</option>
              <option value="wheat">{isMr ? "गहू उत्पादक (Wheat Farmers)" : "Wheat Farmers"}</option>
            </select>
          </div>
        </div>

        {/* Quick Insert University Advisory Templates */}
        <div className="pt-2 border-t border-[#123C32]/10 space-y-1.5">
          <span className="font-mono text-[10px] uppercase font-bold text-[#252923]/60 block">
            {isMr ? "कृषी विद्यापीठ प्रमाणित जलद मसुदे (Quick Insert):" : "Pre-Calibrated University Templates (1-Click Insert):"}
          </span>
          <div className="flex flex-wrap gap-2">
            {ADVISORY_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setMessage(isMr ? tpl.textMr : tpl.textEn)}
                className="rounded-md border border-[#123C32]/30 bg-white px-2.5 py-1 font-mono text-[11px] font-bold text-[#123C32] hover:bg-[#123C32] hover:text-white transition shadow-2xs"
              >
                {isMr ? tpl.labelMr : tpl.labelEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN STUDIO: Left 5 cols Retro Nokia 2G Phone, Right 7 cols Editor & Actions ── */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* ── Realistic 2G Feature Phone LCD Screen (5 cols) ── */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-[280px] rounded-3xl border-4 border-[#252923] bg-[#2C302E] p-4 shadow-[6px_6px_0px_#123C32]">
            {/* Phone Top Speaker & Brand */}
            <div className="flex flex-col items-center pb-2">
              <div className="h-1.5 w-12 rounded-full bg-black/40" />
              <span className="mt-1 font-mono text-[9px] font-black uppercase tracking-widest text-[#F4F0E5]/60">
                NOKIA · 2G CELL
              </span>
            </div>

            {/* LCD Display Frame */}
            <div className="rounded-xl border-3 border-[#123C32] bg-[#9EA792] p-3 font-mono text-xs text-[#1A231C] shadow-inner">
              {/* LCD Status Bar */}
              <div className="flex items-center justify-between border-b border-[#1A231C]/30 pb-1 text-[10px]">
                <div className="flex items-center gap-1 font-bold">
                  <Signal size={11} />
                  <span>BSNL 2G</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>10:42 AM</span>
                  <BatteryCharging size={11} />
                </div>
              </div>

              {/* SMS Header */}
              <div className="mt-1.5 flex items-center justify-between text-[10px] font-bold border-b border-dashed border-[#1A231C]/25 pb-1">
                <span className="flex items-center gap-1">
                  <MessageSquare size={10} />
                  <span>VM-MAHAGRI</span>
                </span>
                <span>1/1</span>
              </div>

              {/* LCD Message Display */}
              <div className="my-2 min-h-[120px] font-sans text-[11px] font-semibold leading-relaxed whitespace-pre-line tracking-tight">
                {message}
              </div>

              {/* LCD Bottom Bar */}
              <div className="flex items-center justify-between border-t border-[#1A231C]/30 pt-1 text-[9px] font-bold">
                <span>Options</span>
                <span>Back</span>
              </div>
            </div>

            {/* Phone Keypad Simulator (Aesthetic) */}
            <div className="mt-3 grid grid-cols-3 gap-1.5 px-2">
              {[
                "1",
                "2 ABC",
                "3 DEF",
                "4 GHI",
                "5 JKL",
                "6 MNO",
                "7 PQRS",
                "8 TUV",
                "9 WXYZ",
                "*",
                "0 +",
                "#",
              ].map((key) => (
                <div
                  key={key}
                  className="flex h-7 items-center justify-center rounded-md border border-[#F4F0E5]/10 bg-[#3A3F3C] text-[9px] font-mono font-bold text-[#F4F0E5]/80 shadow-xs"
                >
                  {key}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Officer Dispatch Controls & Live Editor (7 cols) ── */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-[#123C32]">
                {isMr ? "प्रसारण संदेश मजकूर (संपादित करा)" : "Drafted Advisory Message (Editable)"}
              </label>
              <span className="font-mono text-[10px] text-[#252923]/60">
                DLT ID: MH-AGRI-100492
              </span>
            </div>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1.5 w-full rounded-xl border-2 border-[#123C32]/30 bg-[#F4F0E5]/40 p-3 font-sans text-xs sm:text-sm font-medium leading-relaxed text-[#252923] focus:border-[#123C32] focus:bg-white focus:outline-none"
            />
            <div className="mt-1 flex items-center justify-between font-mono text-[11px] text-[#252923]/70">
              <span>
                Length: <strong>{charCount}</strong> chars ({smsSegments} SMS {smsSegments > 1 ? "parts" : "part"})
              </span>
              <span>Encoding: GSM-7 / Unicode UTF-16</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap gap-2 pt-2">
            {/* Send Bulk SMS */}
            <button
              type="button"
              onClick={handleBroadcast}
              disabled={isBroadcasting}
              className="flex items-center gap-1.5 rounded-lg border-2 border-[#123C32] bg-[#123C32] px-4 py-2 font-mono text-xs font-bold uppercase text-[#F4F0E5] shadow-[2px_2px_0px_#252923] hover:bg-[#172B4D] disabled:opacity-60 transition"
            >
              {isBroadcasting ? (
                <>
                  <RefreshCw size={14} className="animate-spin text-[#E6A52E]" />
                  <span>{isMr ? "प्रसारण होत आहे..." : "Dispatching..."}</span>
                </>
              ) : (
                <>
                  <Send size={14} className="text-[#E6A52E]" />
                  <span>
                    {isMr
                      ? `${targetFarmerCount.toLocaleString("en-IN")} शेतकऱ्यांना SMS पाठवा`
                      : `Broadcast to ${targetFarmerCount.toLocaleString("en-IN")} Farmers`}
                  </span>
                </>
              )}
            </button>

            {/* Share to WhatsApp */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border-2 border-[#3B8B61] bg-[#3B8B61] px-4 py-2 font-mono text-xs font-bold uppercase text-white shadow-[2px_2px_0px_#123C32] hover:bg-[#2e6e4c] transition"
            >
              <Share2 size={14} />
              <span>{isMr ? "व्हॉट्सॲपवर पाठवा" : "Share on WhatsApp"}</span>
            </a>

            {/* IVRS Voice Test */}
            <button
              type="button"
              onClick={handleVoiceBroadcast}
              className={`flex items-center gap-1.5 rounded-lg border-2 border-[#123C32] px-3.5 py-2 font-mono text-xs font-bold uppercase transition ${
                isSpeaking
                  ? "bg-[#C7473B] text-white border-[#C7473B]"
                  : "bg-white text-[#123C32] hover:bg-[#F4F0E5]"
              }`}
            >
              {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>
                {isSpeaking
                  ? isMr
                    ? "थांबवा"
                    : "Stop IVRS"
                  : isMr
                  ? "IVRS कॉल ऐका"
                  : "Test Voice IVRS"}
              </span>
            </button>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-lg border border-[#123C32]/30 bg-white px-3 py-2 font-mono text-xs font-semibold text-[#123C32] hover:bg-[#F4F0E5]"
            >
              <Copy size={13} />
              <span>{copied ? (isMr ? "कॉपी केले" : "Copied") : isMr ? "कॉपी" : "Copy"}</span>
            </button>
          </div>

          {/* Delivery confirmation badge */}
          {broadcastSent && (
            <div className="flex items-center gap-2 rounded-lg border-2 border-[#3B8B61] bg-[#3B8B61]/10 p-3.5 font-mono text-xs font-bold text-[#1F5336] animate-in fade-in">
              <CheckCircle2 size={18} className="text-[#3B8B61] shrink-0" />
              <span>
                {isMr
                  ? `यशस्वी! CDAC Kisaan SMS Gateway द्वारे ${targetLocationLabel} मधील ${targetFarmerCount.toLocaleString("en-IN")} शेतकऱ्यांना SMS व शेतकरी ॲपवर इशारा प्रसारित झाला.`
                  : `Success! Advisory transmitted to ${targetFarmerCount.toLocaleString("en-IN")} registered mobile numbers in ${targetLocationLabel} via CDAC Gateway.`}
              </span>
            </div>
          )}

          <div className="rounded-lg border border-[#123C32]/15 bg-[#F4F0E5]/60 p-3 font-sans text-xs text-[#252923]/75 leading-relaxed">
            <span className="font-bold text-[#123C32]">Accessibility Note:</span>{" "}
            {isMr
              ? "स्मार्टफोन किंवा इंटरनेट नसलेल्या शेतकऱ्यांसाठी हा संदेश थेट बेसिक २जी फोनवर देवनागरी युनिकोड किंवा आयव्हीआरएस व्हॉइस कॉलद्वारे पोहोचविला जातो."
              : "Bridging the digital divide: smallholders without smartphones or 4G data receive this prompt SMS or automated IVRS voice call on their basic feature phones."}
          </div>
        </div>
      </div>
    </div>
  );
}
