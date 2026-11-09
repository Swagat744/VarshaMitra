"use client";

import { useState } from "react";
import {
  Wheat,
  Sprout,
  PackageCheck,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  Send,
  FileDown,
  Layers,
  Sparkles,
  Droplets,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";

interface ContingencyCrop {
  id: string;
  nameEn: string;
  nameMr: string;
  variety: string;
  durationDays: string;
  rainfallNeedMm: string;
  suitabilityConditionEn: string;
  suitabilityConditionMr: string;
  mahabeejStockQtl: number;
  depotLocation: string;
  depotLocationMr: string;
  subsidyRate: string;
  standardPricePerKg: number;
  subsidizedPricePerKg: number;
  universityAdvisory: string;
  recommendedPracticesMr: string[];
  recommendedPracticesEn: string[];
}

const CONTINGENCY_CROPS: ContingencyCrop[] = [
  {
    id: "horsegram",
    nameEn: "Horse Gram (Kulthi)",
    nameMr: "हुलगा (कुळीथ)",
    variety: "सीना (Sina) / AK-42",
    durationDays: "६५ - ७५ दिवस (65-75 Days)",
    rainfallNeedMm: "१५० - २५० मिमी",
    suitabilityConditionEn: "Severe dry-spell, late sowing (August-September), shallow to medium soils.",
    suitabilityConditionMr: "पावसाचा तीव्र खंड, उशिरा पेरणी व हलकी ते मध्यम जमीन यासाठी अत्यंत योग्य.",
    mahabeejStockQtl: 420,
    depotLocation: "Niphad Taluka Kharedi-Vikri Sangha Depot",
    depotLocationMr: "निफाड तालुका खरेदी-विक्री संघ आगार, नाशिक",
    subsidyRate: "५०% महाडिबीटी अनुदान (NFSM 50%)",
    standardPricePerKg: 95,
    subsidizedPricePerKg: 47.5,
    universityAdvisory: "महात्मा फुले कृषी विद्यापीठ (MPKV), राहुरी शिफारस २०२६",
    recommendedPracticesMr: [
      "पेरणीपूर्वी रायझोबियम व पीएसबी जिवाणू संवर्धकाची २५ ग्रॅम प्रति किलो प्रक्रिया करावी.",
      "३० सें.मी. अंतरावर पाभरीने पेरणी करावी, बियाणे खोली ३-४ सें.मी. ठेवावी.",
      "ओलावा टिकवण्यासाठी दर ३ ओळींनंतर एक चर (Conservation Furrow) काढावा.",
    ],
    recommendedPracticesEn: [
      "Seed treatment with Rhizobium and PSB bio-fertilizers @ 25g/kg before sowing.",
      "Line sowing at 30 cm spacing, keeping depth between 3-4 cm.",
      "Form in-situ conservation furrows every 3 crop rows to harvest dew and residual moisture.",
    ],
  },
  {
    id: "bajra",
    nameEn: "Pearl Millet (Bajra)",
    nameMr: "बाजरी",
    variety: "श्रद्धा (Shraddha) / सबुरी (Saburi)",
    durationDays: "७० - ८० दिवस (70-80 Days)",
    rainfallNeedMm: "२०० - ३५० मिमी",
    suitabilityConditionEn: "Moderate rainfall deficit; excellent tillering and grain filling under drought.",
    suitabilityConditionMr: "मध्यम दुष्काळात भरपूर फुटवे आणि दाणे भरणारी भरडधान्य जात.",
    mahabeejStockQtl: 680,
    depotLocation: "Baramati APMC Seeds Hub, Pune",
    depotLocationMr: "बारामती कृषी उत्पन्न बाजार समिती आगार, पुणे",
    subsidyRate: "राष्ट्रीय अन्न सुरक्षा अभियान (NFSM) ४०% अनुदान",
    standardPricePerKg: 120,
    subsidizedPricePerKg: 72,
    universityAdvisory: "अखिल भारतीय समन्वित बाजरी संशोधन प्रकल्प, धुळे",
    recommendedPracticesMr: [
      "पेरणी रुंद वरंबा-सरी (BBF) पद्धतीने ४५ × १२ सें.मी. अंतरावर करावी.",
      "पेरणीवेळी संपूर्ण नत्र व स्फुरद (५०:२५:० किलो/हेक्टर) खतमात्रा द्यावी.",
      "ताण पडल्यास पोटॅशियम नायट्रेट (13-0-45) ची १.५% फवारणी दाणे भरताना करावी.",
    ],
    recommendedPracticesEn: [
      "Sow using Broad Bed Furrow (BBF) machine at 45 × 12 cm spacing.",
      "Apply full basal dose of N:P (50:25:0 kg/ha) at the time of sowing.",
      "Spray 1.5% Potassium Nitrate (13-0-45) during grain-fill stage to mitigate terminal drought.",
    ],
  },
  {
    id: "sesame",
    nameEn: "Sesame (Till)",
    nameMr: "तीळ",
    variety: "फुले तीळ क्र. १ (Phule Till-1) / JLT-408",
    durationDays: "७५ - ८५ दिवस (75-85 Days)",
    rainfallNeedMm: "१५० - २२० मिमी",
    suitabilityConditionEn: "Post-monsoon residual moisture, well-drained light to medium soils.",
    suitabilityConditionMr: "परतीचा पाऊस कमी झाल्यास रब्बी हंगामात कमी पाण्यावर सर्वाधिक नफा देणारे नगदी पीक.",
    mahabeejStockQtl: 290,
    depotLocation: "Solapur Zilla Parishad Central Depot",
    depotLocationMr: "सोलापूर जिल्हा परिषद मध्यवर्ती बियाणे केंद्र",
    subsidyRate: "तेलबिया मिशन ५०% थेट लाभ (DBT)",
    standardPricePerKg: 210,
    subsidizedPricePerKg: 105,
    universityAdvisory: "तेलबिया संशोधन केंद्र, जळगाव (MPKV)",
    recommendedPracticesMr: [
      "बारीक बियाणे असल्याने २.५ किलो बियाण्यात ४ पट वाळू मिसळून समप्रमाणात पेरणी करावी.",
      "पेरणीनंतर १५ दिवसांनी पहिली विरळणी करून झाडांमधील अंतर १० सें.मी. ठेवावे.",
      "फुलोरा अवस्थेत पाण्याचा ताण टाळण्यासाठी तुषार सिंचनाचा हलका फेर द्यावा.",
    ],
    recommendedPracticesEn: [
      "Mix seed with 4x dry sand to ensure uniform sowing at 2.5 kg/acre.",
      "Thinning at 15 DAS to maintain plant-to-plant distance of 10 cm.",
      "Light sprinkler irrigation at 50% flowering to boost capsule formation.",
    ],
  },
  {
    id: "sunflower",
    nameEn: "Sunflower",
    nameMr: "सूर्यफूल",
    variety: "मॉडर्न (Modern) / फुले भास्कर",
    durationDays: "८० - ८५ दिवस (80-85 Days)",
    rainfallNeedMm: "२५० - ३५० मिमी",
    suitabilityConditionEn: "Wide climate adaptability, deep taproot pulls moisture from subsoil.",
    suitabilityConditionMr: "खोल मुळांमुळे जमिनीतील ओलावा शोषून घेण्याची क्षमता, कोणत्याही हंगामात पेरणीयोग्य.",
    mahabeejStockQtl: 350,
    depotLocation: "Dindori Agri Service Hub, Nashik",
    depotLocationMr: "दिंडोरी तालुका कृषी सेवा केंद्र, नाशिक",
    subsidyRate: "राष्ट्रीय तेलबिया योजना ६०% अनुदान",
    standardPricePerKg: 180,
    subsidizedPricePerKg: 72,
    universityAdvisory: "सूर्यफूल संशोधन केंद्र, लातूर (VNMKV)",
    recommendedPracticesMr: [
      "पेरणीपूर्वी इमिडाक्लोप्रिड ५ ग्रॅम प्रति किलो बियाण्यावर प्रक्रिया करावी (मावा प्रतिबंध).",
      "फुलोऱ्याच्या वेळी मधमाश्यांच्या परागीभवनासाठी सकाळी हलक्या हाताने फुलांवरून हात फिरवावा.",
      "बोरोन (०.२%) फवारणी दाणे भरण्याच्या काळात करावी.",
    ],
    recommendedPracticesEn: [
      "Seed treatment with Imidacloprid @ 5g/kg to prevent early sucking pests.",
      "Hand rubbing on flower discs during 7-9 AM to assist natural bee pollination.",
      "Spray Boron @ 0.2% (2g/L) during ray floret opening to prevent hollow seeds.",
    ],
  },
];

interface Props {
  selectedTaluka?: string;
  selectedDistrict?: string;
}

export default function ContingencyCropPlanner({
  selectedTaluka = "Niphad (निफाड)",
  selectedDistrict = "Nashik (नाशिक)",
}: Props) {
  const { language } = useTranslation();
  const isMr = language === "mr";

  const [activeCropId, setActiveCropId] = useState<string>("horsegram");
  const [issuedOrder, setIssuedOrder] = useState<string | null>(null);
  const [isIssuing, setIsIssuing] = useState(false);
  const [notificationDispatched, setNotificationDispatched] = useState(false);

  const selectedCrop =
    CONTINGENCY_CROPS.find((c) => c.id === activeCropId) || CONTINGENCY_CROPS[0];

  const handleIssueReleaseOrder = () => {
    setIsIssuing(true);
    setTimeout(() => {
      const orderNo = `MAHA-SEED-ALLOC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      setIssuedOrder(orderNo);
      setIsIssuing(false);
    }, 700);
  };

  const handleBroadcastContingency = () => {
    setNotificationDispatched(true);
    // Broadcast notification to localStorage for farmers
    try {
      const alertPayload = {
        id: `contingency-plan-${Date.now()}`,
        blockName: selectedTaluka.split(" ")[0].replace(/[^a-zA-Z]/g, ""),
        districtName: selectedDistrict.split(" ")[0].replace(/[^a-zA-Z]/g, ""),
        message: isMr
          ? `[अधिकृत आपत्कालीन पीक योजना] ${selectedTaluka} तालुक्यात पावसाच्या खंडामुळे कृषी विभागाने ${selectedCrop.nameMr} (${selectedCrop.variety}) चे महाबीज प्रमाणित बियाणे ${selectedCrop.subsidyRate} वर ${selectedCrop.depotLocationMr} येथे उपलब्ध केले आहे.`
          : `[Official Contingency Plan] Due to dry spell in ${selectedTaluka}, Agriculture Dept has released subsidized ${selectedCrop.nameEn} (${selectedCrop.variety}) at ${selectedCrop.depotLocation}.`,
        timestamp: new Date().toLocaleTimeString(isMr ? "mr-IN" : "en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sender: isMr ? "तालुका कृषी अधिकारी (TAO)" : "Taluka Agriculture Officer (TAO)",
        farmerCount: 14850,
      };
      const existing = JSON.parse(
        localStorage.getItem("varshamitra:broadcast-alerts") || "[]"
      );
      localStorage.setItem(
        "varshamitra:broadcast-alerts",
        JSON.stringify([alertPayload, ...existing.slice(0, 5)])
      );
      window.dispatchEvent(new Event("varshamitra:new-broadcast"));
    } catch {
      // ignore storage error
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border-3 border-[#172B4D] bg-[#172B4D] p-5 text-white shadow-[4px_4px_0px_#123C32]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6A52E] px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#172B4D]">
                <Sprout size={13} />
                {isMr ? "आपत्कालीन पीक आराखडा २०२६" : "Agro-Climatic Contingency Plan 2026"}
              </span>
              <span className="font-mono text-xs text-white/80">
                {selectedDistrict} • {selectedTaluka}
              </span>
            </div>
            <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
              {isMr
                ? "पावसाचा खंड व आपत्कालीन पेरणी नियोजन कक्ष"
                : "Monsoon Deficit Contingency Sowing & Seed Depot Desk"}
            </h2>
            <p className="font-sans text-xs text-white/80 max-w-3xl">
              {isMr
                ? "दीर्घ पावसाचा खंड किंवा पेरणी खोळंबल्यास कृषी विद्यापीठांनी शिफारस केलेली पर्यायी कमी कालावधीची पिके, महाबीज प्रमाणित साठा आणि थेट ५०% अनुदान वाटप प्रणाली."
                : "Official university-calibrated short-duration contingency crops, certified Mahabeej depot inventory management, and 50% NFSM subsidized dispatch for dry-spell stricken talukas."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleBroadcastContingency}
              disabled={notificationDispatched}
              className={`flex items-center gap-2 rounded-lg border-2 border-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_#000] transition ${
                notificationDispatched
                  ? "bg-[#3B8B61] text-white cursor-default"
                  : "bg-[#E6A52E] text-[#172B4D] hover:bg-[#F4B43E]"
              }`}
            >
              {notificationDispatched ? (
                <>
                  <CheckCircle2 size={14} />
                  <span>{isMr ? "अधिसूचना प्रसारित केली!" : "Plan Broadcasted!"}</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>{isMr ? "शेतकऱ्यांना SMS / ॲपवर पाठवा" : "Broadcast Plan to Farmers"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Crop Selector on Left, Deep Inspection & Depot on Right */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: 4 Contingency Crops Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#123C32]">
              {isMr ? "पर्यायी आपत्कालीन पिके (४ शिफारसी)" : "Recommended Contingency Crops (4)"}
            </span>
            <span className="font-mono text-[11px] text-[#252923]/60">
              {isMr ? "तपशिलासाठी निवडा" : "Click to review"}
            </span>
          </div>

          {CONTINGENCY_CROPS.map((crop) => {
            const isSelected = crop.id === activeCropId;
            return (
              <div
                key={crop.id}
                onClick={() => setActiveCropId(crop.id)}
                className={`cursor-pointer rounded-xl border-2 p-4 transition ${
                  isSelected
                    ? "border-[#123C32] bg-white shadow-[4px_4px_0px_#123C32]"
                    : "border-[#123C32]/25 bg-white/70 hover:bg-white hover:border-[#123C32]/60"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-bold text-[#123C32]">
                        {isMr ? crop.nameMr : crop.nameEn}
                      </span>
                      <span className="rounded bg-[#123C32]/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#123C32]">
                        {crop.variety}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-[#252923]/80">
                      {isMr ? crop.suitabilityConditionMr : crop.suitabilityConditionEn}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block font-mono text-xs font-black text-[#3B8B61]">
                      {crop.durationDays}
                    </span>
                    <span className="font-mono text-[10px] text-[#252923]/60">
                      {crop.rainfallNeedMm}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#123C32]/10 pt-2 font-mono text-[11px]">
                  <span className="flex items-center gap-1 text-[#172B4D]">
                    <PackageCheck size={13} className="text-[#3B8B61]" />
                    <span>
                      {isMr ? "महाबीज साठा:" : "Mahabeej Stock:"}{" "}
                      <strong>{crop.mahabeejStockQtl} Qtl</strong>
                    </span>
                  </span>
                  <span className="font-bold text-[#C7473B]">
                    ₹{crop.subsidizedPricePerKg}/kg{" "}
                    <span className="line-through text-[#252923]/40">₹{crop.standardPricePerKg}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Crop Detailed Technical Dossier & Mahabeej Allocation */}
        <div className="lg:col-span-7 rounded-xl border-3 border-[#123C32] bg-white p-6 shadow-[5px_5px_0px_#123C32] space-y-6">
          {/* Header of Dossier */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#123C32]/15 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#123C32] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                  {isMr ? "विद्यापीठ प्रमाणित शिफारस" : "University Certified Specification"}
                </span>
                <span className="font-mono text-xs font-semibold text-[#123C32]">
                  {selectedCrop.universityAdvisory}
                </span>
              </div>
              <h3 className="mt-1 font-display text-2xl font-black text-[#123C32]">
                {isMr ? selectedCrop.nameMr : selectedCrop.nameEn}{" "}
                <span className="text-lg font-normal text-[#252923]/70">
                  ({selectedCrop.variety})
                </span>
              </h3>
            </div>

            <div className="text-right">
              <span className="font-mono text-[10px] uppercase text-[#252923]/60 block">
                {isMr ? "अनुदानित शासकीय दर" : "Subsidized Govt Rate"}
              </span>
              <p className="font-mono text-2xl font-black text-[#3B8B61]">
                ₹{selectedCrop.subsidizedPricePerKg}{" "}
                <span className="text-xs font-normal text-[#252923]">/ kg</span>
              </p>
              <span className="font-mono text-[10px] font-bold text-[#172B4D]">
                {selectedCrop.subsidyRate}
              </span>
            </div>
          </div>

          {/* Quick Metrics 3-Col Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border-2 border-[#123C32]/20 bg-[#F4F0E5] p-3 text-center">
              <span className="font-mono text-[10px] uppercase text-[#252923]/60 block">
                {isMr ? "पक्वता कालावधी" : "Crop Duration"}
              </span>
              <p className="mt-0.5 font-mono text-sm font-black text-[#123C32]">
                {selectedCrop.durationDays}
              </p>
            </div>
            <div className="rounded-lg border-2 border-[#123C32]/20 bg-[#F4F0E5] p-3 text-center">
              <span className="font-mono text-[10px] uppercase text-[#252923]/60 block">
                {isMr ? "आवश्यक पर्जन्यमान" : "Moisture Threshold"}
              </span>
              <p className="mt-0.5 font-mono text-sm font-black text-[#123C32]">
                {selectedCrop.rainfallNeedMm}
              </p>
            </div>
            <div className="rounded-lg border-2 border-[#123C32]/20 bg-[#F4F0E5] p-3 text-center">
              <span className="font-mono text-[10px] uppercase text-[#252923]/60 block">
                {isMr ? "उपलब्ध प्रमाणित साठा" : "Depot Inventory"}
              </span>
              <p className="mt-0.5 font-mono text-sm font-black text-[#3B8B61]">
                {selectedCrop.mahabeejStockQtl} Quintals
              </p>
            </div>
          </div>

          {/* University Recommended Agronomic Protocols */}
          <div className="rounded-xl border-2 border-[#123C32]/20 bg-white p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Droplets size={16} className="text-[#123C32]" />
              <h4 className="font-display text-sm font-bold text-[#123C32]">
                {isMr
                  ? "कृषी विद्यापीठ आपत्कालीन कृषी-सल्ला व ओलावा संवर्धन पद्धती"
                  : "MPKV Recommended In-situ Moisture & Agronomic Protocols"}
              </h4>
            </div>
            <ul className="space-y-2 text-xs font-sans text-[#252923]">
              {(isMr
                ? selectedCrop.recommendedPracticesMr
                : selectedCrop.recommendedPracticesEn
              ).map((practice, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#123C32] font-mono text-[10px] font-bold text-white">
                    {idx + 1}
                  </span>
                  <span>{practice}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mahabeej Depot Details & Release Allocation */}
          <div className="rounded-xl border-2 border-[#172B4D]/30 bg-[#172B4D]/5 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-[#172B4D]" />
                <span className="font-mono text-xs font-bold text-[#172B4D]">
                  {isMr ? "अधिकृत महाबीज वितरण केंद्र:" : "Designated Mahabeej Hub:"}
                </span>
              </div>
              <span className="font-mono text-xs font-semibold text-[#172B4D]">
                {isMr ? selectedCrop.depotLocationMr : selectedCrop.depotLocation}
              </span>
            </div>

            {issuedOrder ? (
              <div className="rounded-lg border-2 border-[#3B8B61] bg-[#3B8B61]/10 p-3 space-y-1">
                <div className="flex items-center gap-2 text-[#3B8B61]">
                  <ShieldCheck size={18} />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    {isMr
                      ? "बियाणे वाटप आदेश यशस्वीरीत्या जारी करण्यात आला!"
                      : "Official Seed Release Sanctioned!"}
                  </span>
                </div>
                <p className="font-mono text-xs text-[#252923]">
                  {isMr ? "आदेश क्रमांक:" : "Sanction Order #:"}{" "}
                  <strong className="text-[#123C32]">{issuedOrder}</strong>
                </p>
                <p className="font-sans text-[11px] text-[#252923]/80">
                  {isMr
                    ? `५०% अनुदान सवलतीत ${selectedCrop.nameMr} (${selectedCrop.variety}) चे ${selectedCrop.mahabeejStockQtl} क्विंटल बियाणे निफाड व परिसरातील शेतकऱ्यांसाठी राखीव करण्यात आले आहे.`
                    : `${selectedCrop.mahabeejStockQtl} Quintals of ${selectedCrop.nameEn} (${selectedCrop.variety}) allocated to designated depot under NFSM 50% subsidy window.`}
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="text-xs font-sans text-[#252923]/80">
                  {isMr
                    ? "तालुका कृषी अधिकाऱ्यांच्या डिजिटल स्वाक्षरीने बियाणे वाटप कोटा त्वरित खुला करा."
                    : "Authorize emergency seed release quota under TAO administrative seal."}
                </div>
                <button
                  onClick={handleIssueReleaseOrder}
                  disabled={isIssuing}
                  className="flex items-center gap-2 rounded-lg border-2 border-[#123C32] bg-[#123C32] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[2px_2px_0px_#252923] hover:bg-[#172B4D] transition disabled:opacity-50"
                >
                  <PackageCheck size={14} />
                  <span>
                    {isIssuing
                      ? isMr
                        ? "आदेश तयार करत आहे..."
                        : "Issuing Sanction..."
                      : isMr
                      ? "बियाणे वाटप आदेश जारी करा (Issue Sanction)"
                      : "Issue Certified Seed Release Order"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
