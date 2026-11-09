"use client";

import { useState, useEffect } from "react";
import {
  Send,
  MessageSquare,
  Radio,
  PhoneCall,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  Filter,
  FileCheck,
} from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";

interface AdvisoryTemplate {
  id: string;
  crop: string;
  cropEn: string;
  cropMr: string;
  category: "disease" | "drought" | "irrigation" | "nutrition";
  titleEn: string;
  titleMr: string;
  contentEn: string;
  contentMr: string;
  universitySourceEn: string;
  universitySourceMr: string;
}

const UNIVERSITY_TEMPLATES: AdvisoryTemplate[] = [
  {
    id: "onion-purple-blotch",
    crop: "Onion",
    cropEn: "Onion",
    cropMr: "कांदा",
    category: "disease",
    titleEn: "Preventive Spray for Purple Blotch & Thrips in Rabi Onion",
    titleMr: "रब्बी कांद्यावरील जांभळा करपा व थ्रिप्स किडीचे प्रतिबंधात्मक नियंत्रण",
    contentEn:
      "Alert for Niphad taluka: High night humidity & dew favoring purple blotch (Alternaria porri). Spray Difenoconazole 25% EC @ 0.5 ml/L water or Tebuconazole @ 1 ml/L. Add sticker. Control thrips with Fipronil 5% SC @ 1.5 ml/L.",
    contentMr:
      "निफाड तालुका सतर्कता: रात्रीचे धुके व दवबिंदूंमुळे रब्बी कांद्यावर जांभळा करपा व फुलकिडे (थ्रिप्स) प्रादुर्भावाची शक्यता. नियंत्रणासाठी डायफेनोकोनॅझोल २५% EC ०.५ मिली किंवा टेब्युकोनॅझोल १ मिली प्रति लिटर पाण्यात मिसळून फवारावे. सोबत चिकटद्रव्य (Sticker) वापरावे.",
    universitySourceEn: "Mahatma Phule Krishi Vidyapeeth (MPKV), Rahuri",
    universitySourceMr: "महात्मा फुले कृषी विद्यापीठ (MPKV), राहुरी",
  },
  {
    id: "dryspell-potash",
    crop: "Soybean",
    cropEn: "Soybean / Gram",
    cropMr: "सोयाबीन / हरभरा",
    category: "drought",
    titleEn: "Moisture Stress Mitigation via Potassium Nitrate Foliar Spray",
    titleMr: "पावसाचा खंड व ओलावा घट: पोटॅशियम नायट्रेट (13-00-45) फवारणी सल्ला",
    contentEn:
      "Due to prolonged dry spell (>14 days), crops facing moisture stress. Apply foliar spray of Potassium Nitrate (13:00:45) @ 10g/L or Urea @ 20g/L during early morning or evening hours to induce drought tolerance and reduce leaf transpiration.",
    contentMr:
      "१४ दिवसांहून अधिक पावसाच्या खंडामुळे पिकांमध्ये ओलावा घट जाणवत आहे. पाण्याचा ताण सहन करण्यासाठी व पानांतून बाष्पीभवन रोखण्यासाठी सकाळी किंवा संध्याकाळी पोटॅशियम नायट्रेट (१३:००:४५) १० ग्रॅम किंवा युरिया २० ग्रॅम प्रति लिटर पाणी फवारणी करावी.",
    universitySourceEn: "Vasantrao Naik Marathwada Krishi Vidyapeeth (VNMKV)",
    universitySourceMr: "वसंतराव नाईक मराठवाडा कृषी विद्यापीठ (VNMKV), परभणी",
  },
  {
    id: "grapes-downy-mildew",
    crop: "Grapes",
    cropEn: "Grapes",
    cropMr: "द्राक्ष",
    category: "disease",
    titleEn: "Canopy & Downy Mildew Management Post-Pruning",
    titleMr: "द्राक्ष बागेत खरड/गोडी छाटणीनंतर डाऊनी मिल्ड्यू व मणी सेटिंग नियोजन",
    contentEn:
      "For Nashik & Niphad vineyards: In case of overcast sky, apply Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/L. Maintain cluster aeration. Regulate Gibberellic Acid (GA3) dosage carefully as per berry elongation stage.",
    contentMr:
      "नाशिक व निफाड द्राक्ष उत्पादक: ढगाळ वातावरण निर्माण झाल्यास डाऊनी मिल्ड्यू प्रतिबंधासाठी मेटॅलॅक्सिल ८% + मँकोझेब ६४% WP २.५ ग्रॅम प्रति लिटर फवारावे. घडामध्ये हवा खेळती ठेवावी व मणी वाढीनुसार जिब्रेलिक ऍसिड (GA3) चे योग्य नियोजन करावे.",
    universitySourceEn: "National Research Centre for Grapes (ICAR-NRCG), Pune",
    universitySourceMr: "राष्ट्रीय द्राक्ष संशोधन केंद्र (NRC Grapes), पुणे",
  },
  {
    id: "wheat-cri-irrigation",
    crop: "Wheat",
    cropEn: "Wheat",
    cropMr: "गहू",
    category: "irrigation",
    titleEn: "Critical First Irrigation at Crown Root Initiation (CRI) Stage",
    titleMr: "गहू पिकात मुकुट मुळे फुटण्याच्या अवस्थेत (CRI) पहिली महत्त्वाची पाणीपाळी",
    contentEn:
      "Wheat sown 20-22 days ago is entering Crown Root Initiation stage. This stage is most critical for grain tillering. Ensure mandatory light irrigation; water stress now reduces final yield by up to 35%.",
    contentMr:
      "पेरणीनंतर २० ते २२ दिवसांनी गहू पिकाची मुकुट मुळे फुटण्याची (CRI) अतिसंवेदनशील अवस्था सुरू होते. फुटवे चांगल्या संख्येने येण्यासाठी पहिली पाणीपाळी तात्काळ द्यावी. या अवस्थेत पाण्याचा ताण पडल्यास उत्पादनात ३५% पर्यंत घट होऊ शकते.",
    universitySourceEn: "ICAR - Indian Agricultural Research Institute (IARI)",
    universitySourceMr: "भारतीय कृषी संशोधन परिषद (ICAR-IARI) गहू विभाग",
  },
];

interface BroadcastHistoryItem {
  id: string;
  timestampEn: string;
  timestampMr: string;
  titleEn: string;
  titleMr: string;
  cropEn: string;
  cropMr: string;
  talukaEn: string;
  talukaMr: string;
  channels: string[];
  reachCount: number;
  officerSignEn: string;
  officerSignMr: string;
  dltId: string;
}

interface Props {
  initialTaluka?: string;
  initialDistrict?: string;
}

export default function ExpertAdvisoryStudio({
  initialTaluka = "Niphad",
  initialDistrict = "Nashik",
}: Props) {
  const { language } = useTranslation();
  const isMr = language === "mr";

  // Targeting filters
  const [targetTaluka, setTargetTaluka] = useState<string>(initialTaluka);
  const [targetCrop, setTargetCrop] = useState<string>("Onion");
  const [targetStage, setTargetStage] = useState<string>("Vegetative");

  // Advisory content
  const [title, setTitle] = useState<string>(
    isMr ? UNIVERSITY_TEMPLATES[0].titleMr : UNIVERSITY_TEMPLATES[0].titleEn
  );
  const [message, setMessage] = useState<string>(
    isMr ? UNIVERSITY_TEMPLATES[0].contentMr : UNIVERSITY_TEMPLATES[0].contentEn
  );

  // Channels
  const [channelApp, setChannelApp] = useState(true);
  const [channelSms, setChannelSms] = useState(true);
  const [channelVoice, setChannelVoice] = useState(true);

  // Audio Voice Player state
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  // Dispatch state
  const [isDispatching, setIsDispatching] = useState(false);
  const [lastDispatched, setLastDispatched] = useState<BroadcastHistoryItem | null>(null);

  // Sync title and message when language changes
  useEffect(() => {
    const tpl =
      UNIVERSITY_TEMPLATES.find(
        (t) => t.crop.toLowerCase() === targetCrop.toLowerCase()
      ) || UNIVERSITY_TEMPLATES[0];
    setTitle(isMr ? tpl.titleMr : tpl.titleEn);
    setMessage(isMr ? tpl.contentMr : tpl.contentEn);
  }, [isMr]);

  // History log with full bilingual fields
  const [history, setHistory] = useState<BroadcastHistoryItem[]>([
    {
      id: "ADV-DISPATCH-901",
      timestampEn: "Yesterday, 03:45 PM",
      timestampMr: "काल दुपारी ०३:४५",
      titleEn: "Preventive Spray for Purple Blotch & Thrips in Rabi Onion",
      titleMr: "कांद्यावरील करपा प्रतिबंधक फवारणी मार्गदर्शक",
      cropEn: "Onion",
      cropMr: "कांदा (Onion)",
      talukaEn: "Niphad",
      talukaMr: "निफाड",
      channels: ["App Banner", "mKisan SMS", "IVRS Call"],
      reachCount: 14250,
      officerSignEn: "Dilip Patil, Taluka Agriculture Officer, Niphad",
      officerSignMr: "दिलीप पाटील, तालुका कृषी अधिकारी, निफाड",
      dltId: "MH-AGRI-100492",
    },
    {
      id: "ADV-DISPATCH-884",
      timestampEn: "05 Nov 2026",
      timestampMr: "०५ नोव्हेंबर २०२६",
      titleEn: "Dry Spell: Moisture Stress Mitigation via Foliar Spray",
      titleMr: "पावसाचा खंड: पोटॅशियम नायट्रेट ओलावा संवर्धन",
      cropEn: "Soybean",
      cropMr: "सोयाबीन (Soybean)",
      talukaEn: "Baramati",
      talukaMr: "बारामती",
      channels: ["App Banner", "mKisan SMS"],
      reachCount: 11800,
      officerSignEn: "Vijay Deshmukh, Agriculture Officer, Baramati",
      officerSignMr: "विजय देशमुख, कृषी अधिकारी, बारामती",
      dltId: "MH-AGRI-100488",
    },
  ]);

  // Load a template
  const handleSelectTemplate = (template: AdvisoryTemplate) => {
    setTitle(isMr ? template.titleMr : template.titleEn);
    setMessage(isMr ? template.contentMr : template.contentEn);
    setTargetCrop(template.crop);
  };

  // Voice speech synthesis
  const handleToggleVoicePlayback = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Voice synthesis is not supported on this browser.");
      return;
    }

    if (isPlayingVoice) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
      return;
    }

    const textToSpeak = `${title}. ${message}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = isMr ? "mr-IN" : "en-IN";

    // Prefer Marathi or Indian English voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) =>
      isMr
        ? v.lang.includes("mr") || v.lang.includes("hi")
        : v.lang.includes("en-IN") || v.lang.includes("en")
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    utterance.rate = 0.95;

    utterance.onend = () => setIsPlayingVoice(false);
    utterance.onerror = () => setIsPlayingVoice(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingVoice(true);
  };

  // Dispatch advisory
  const handleDispatch = () => {
    setIsDispatching(true);

    setTimeout(() => {
      const selectedChannels: string[] = [];
      if (channelApp) selectedChannels.push(isMr ? "शेतकरी ॲप सूचना" : "Farmer App Alert");
      if (channelSms) selectedChannels.push(isMr ? "mKisan SMS" : "mKisan SMS Gateway");
      if (channelVoice) selectedChannels.push(isMr ? "IVRS कॉल" : "IVRS Voice Outdial");

      const nowTimeEn = new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const nowTimeMr = new Date().toLocaleTimeString("mr-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const newItem: BroadcastHistoryItem = {
        id: `ADV-DISPATCH-${Math.floor(100 + Math.random() * 900)}`,
        timestampEn: nowTimeEn,
        timestampMr: nowTimeMr,
        titleEn: title,
        titleMr: title,
        cropEn: targetCrop,
        cropMr: targetCrop,
        talukaEn: targetTaluka,
        talukaMr: targetTaluka,
        channels: selectedChannels,
        reachCount: 14850,
        officerSignEn: "Dilip Patil, Taluka Agriculture Officer, Niphad",
        officerSignMr: "दिलीप पाटील, तालुका कृषी अधिकारी (TAO), निफाड",
        dltId: `MH-AGRI-${Math.floor(100000 + Math.random() * 900000)}`,
      };

      setHistory([newItem, ...history]);
      setLastDispatched(newItem);
      setIsDispatching(false);

      // Store in localStorage for farmer cockpit banner
      try {
        const farmerPayload = {
          id: newItem.id,
          blockName: targetTaluka,
          districtName: initialDistrict,
          message: `${title}: ${message}`,
          timestamp: isMr ? newItem.timestampMr : newItem.timestampEn,
          sender: isMr ? newItem.officerSignMr : newItem.officerSignEn,
          farmerCount: newItem.reachCount,
        };
        const existing = JSON.parse(
          localStorage.getItem("varshamitra:broadcast-alerts") || "[]"
        );
        localStorage.setItem(
          "varshamitra:broadcast-alerts",
          JSON.stringify([farmerPayload, ...existing.slice(0, 5)])
        );
        window.dispatchEvent(new Event("varshamitra:new-broadcast"));
      } catch {
        // ignore storage error
      }
    }, 900);
  };

  // GSM 7-bit character count
  const charCount = message.length;
  const smsSegments = Math.ceil(charCount / 160) || 1;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border-3 border-[#123C32] bg-[#123C32] p-5 text-white shadow-[4px_4px_0px_#172B4D]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6A52E] px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#123C32]">
                <Radio size={13} className="animate-pulse" />
                {isMr ? "थेट प्रसारण व तज्ज्ञ सल्ला स्टुडिओ" : "Live Expert Advisory Studio"}
              </span>
              <span className="font-mono text-xs text-white/80">
                {isMr ? "तालुका कृषी अधिकारी अधिकृत डेस्क" : "Taluka Agriculture Officer Console"}
              </span>
            </div>
            <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
              {isMr
                ? "हवामान-आधारित शेतकरी सल्ला व बहुमाध्यम प्रसारण कक्ष"
                : "Weather-Triggered Multi-Channel Advisory Broadcast Desk"}
            </h2>
            <p className="font-sans text-xs text-white/80 max-w-3xl">
              {isMr
                ? "तालुका, पीक आणि वाढीच्या अवस्थेनुसार निवडक शेतकऱ्यांना कृषी विद्यापीठ प्रमाणित फवारणी व सिंचन सल्ला एकाच क्लिकवर शेतकरी पोर्टल, शासकीय SMS (mKisan) व मराठी व्हॉईस कॉलद्वारे पोहोचवा."
                : "Targeted agro-climatic advisories dispatched simultaneously to Farmer Cockpits, official mKisan SMS gateways, and automated IVRS voice calls."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/10 px-3 py-2 text-right">
              <span className="font-mono text-[10px] uppercase text-white/70 block">
                {isMr ? "लक्ष्यित शेतकरी संख्या" : "Target Reach"}
              </span>
              <span className="font-mono text-base font-black text-[#E6A52E]">
                {isMr ? "१४,८५० शेतकरी" : "14,850 Farmers"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Left 7 cols Editor & Channels, Right 5 cols Library & Recent Dispatches */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Targeting Filters & Message Studio */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Targeting Matrix */}
          <div className="rounded-xl border-2 border-[#123C32] bg-white p-4 shadow-[3px_3px_0px_#123C32] space-y-3">
            <div className="flex items-center gap-2 border-b border-[#123C32]/10 pb-2">
              <Filter size={15} className="text-[#123C32]" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#123C32]">
                {isMr ? "१. लक्ष्यित शेतकरी गट निकष (Target Audience)" : "1. Target Audience Segmentation"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-mono text-[11px] font-bold text-[#252923]/70 block mb-1">
                  {isMr ? "तालुका (Taluka):" : "Taluka Jurisdiction:"}
                </label>
                <select
                  value={targetTaluka}
                  onChange={(e) => setTargetTaluka(e.target.value)}
                  className="w-full rounded-md border-2 border-[#123C32]/30 bg-[#F4F0E5] px-2.5 py-1.5 font-mono text-xs font-bold text-[#123C32] focus:border-[#123C32] outline-none"
                >
                  <option value="Niphad">{isMr ? "निफाड (Niphad)" : "Niphad"}</option>
                  <option value="Baramati">{isMr ? "बारामती (Baramati)" : "Baramati"}</option>
                  <option value="Igatpuri">{isMr ? "इगतपुरी (Igatpuri)" : "Igatpuri"}</option>
                  <option value="Dindori">{isMr ? "दिंडोरी (Dindori)" : "Dindori"}</option>
                  <option value="Junnar">{isMr ? "जुन्नर (Junnar)" : "Junnar"}</option>
                  <option value="Solapur">{isMr ? "उत्तर सोलापूर (North Solapur)" : "North Solapur"}</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-[11px] font-bold text-[#252923]/70 block mb-1">
                  {isMr ? "पीक (Target Crop):" : "Target Crop:"}
                </label>
                <select
                  value={targetCrop}
                  onChange={(e) => setTargetCrop(e.target.value)}
                  className="w-full rounded-md border-2 border-[#123C32]/30 bg-[#F4F0E5] px-2.5 py-1.5 font-mono text-xs font-bold text-[#123C32] focus:border-[#123C32] outline-none"
                >
                  <option value="Onion">{isMr ? "कांदा (Onion)" : "Onion"}</option>
                  <option value="Soybean">{isMr ? "सोयाबीन (Soybean)" : "Soybean"}</option>
                  <option value="Grapes">{isMr ? "द्राक्ष (Grapes)" : "Grapes"}</option>
                  <option value="Wheat">{isMr ? "गहू (Wheat)" : "Wheat"}</option>
                  <option value="Cotton">{isMr ? "कापूस (Cotton)" : "Cotton"}</option>
                  <option value="All Crops">{isMr ? "सर्व पिके (All Crops)" : "All Crops"}</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-[11px] font-bold text-[#252923]/70 block mb-1">
                  {isMr ? "वाढीची अवस्था (Crop Stage):" : "Growth Stage:"}
                </label>
                <select
                  value={targetStage}
                  onChange={(e) => setTargetStage(e.target.value)}
                  className="w-full rounded-md border-2 border-[#123C32]/30 bg-[#F4F0E5] px-2.5 py-1.5 font-mono text-xs font-bold text-[#123C32] focus:border-[#123C32] outline-none"
                >
                  <option value="Vegetative">{isMr ? "शाकीय वाढ (Vegetative)" : "Vegetative"}</option>
                  <option value="Sowing">{isMr ? "पेरणी / पुनर्लागवड (Sowing/Transplanting)" : "Sowing / Transplanting"}</option>
                  <option value="Flowering">{isMr ? "फुलोरा / मणी सेटिंग (Flowering)" : "Flowering"}</option>
                  <option value="Maturity">{isMr ? "पक्वता / काढणी (Maturity)" : "Maturity / Harvest"}</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Message Composition Area */}
          <div className="rounded-xl border-3 border-[#123C32] bg-white p-5 shadow-[4px_4px_0px_#123C32] space-y-4">
            <div className="flex items-center justify-between border-b border-[#123C32]/10 pb-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#123C32]">
                {isMr ? "२. सल्ला संदेश मसुदा (Advisory Composition)" : "2. Official Advisory Composition"}
              </span>
              <span className="font-mono text-[11px] text-[#252923]/60">
                {isMr ? "मराठी व इंग्रजी द्विभाषिक" : "Marathi & English"}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-mono text-[11px] font-bold text-[#252923]/70 block mb-1">
                  {isMr ? "सल्ला शीर्षक (Subject / Title):" : "Advisory Subject / Title:"}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border-2 border-[#123C32]/30 bg-white px-3 py-2 font-display text-sm font-bold text-[#123C32] focus:border-[#123C32] outline-none"
                  placeholder="Enter advisory subject..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-mono text-[11px] font-bold text-[#252923]/70">
                    {isMr ? "सविस्तर कृषी तांत्रिक शिफारस (Advisory Body):" : "Detailed Technical Advisory Text:"}
                  </label>
                  <span className="font-mono text-[10px] text-[#252923]/60">
                    {charCount} chars • {smsSegments} SMS {smsSegments > 1 ? "parts" : "part"}
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-lg border-2 border-[#123C32]/30 bg-white p-3 font-sans text-xs text-[#252923] focus:border-[#123C32] outline-none"
                  placeholder="Enter detailed agronomic guidance..."
                />
              </div>
            </div>

            {/* Official Digital Endorsement Seal */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#172B4D]/20 bg-[#F4F0E5] p-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-[#172B4D]">
                <ShieldCheck size={16} />
                <span>
                  {isMr ? "अधिकृत स्वाक्षरीकर्ता:" : "Authorized Signatory:"}{" "}
                  <strong>
                    {isMr
                      ? "दिलीप पाटील, तालुका कृषी अधिकारी (TAO), निफाड"
                      : "Dilip Patil, Taluka Agriculture Officer (TAO), Niphad"}
                  </strong>
                </span>
              </div>
              <span className="text-[10px] text-[#252923]/60">
                DLT Registration ID: MH-AGRI-100492
              </span>
            </div>

            {/* 3. Multi-Channel Selector & Dispatch Actions */}
            <div className="border-t border-[#123C32]/10 pt-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#123C32]">
                  {isMr ? "प्रसारण माध्यमे (Dispatch Channels):" : "Dispatch Channels:"}
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer font-mono text-xs">
                    <input
                      type="checkbox"
                      checked={channelApp}
                      onChange={(e) => setChannelApp(e.target.checked)}
                      className="accent-[#123C32]"
                    />
                    <span>{isMr ? "शेतकरी ॲप बॅनर" : "Farmer App Alert"}</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer font-mono text-xs">
                    <input
                      type="checkbox"
                      checked={channelSms}
                      onChange={(e) => setChannelSms(e.target.checked)}
                      className="accent-[#123C32]"
                    />
                    <span>{isMr ? "शासकीय mKisan SMS" : "mKisan SMS"}</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer font-mono text-xs">
                    <input
                      type="checkbox"
                      checked={channelVoice}
                      onChange={(e) => setChannelVoice(e.target.checked)}
                      className="accent-[#123C32]"
                    />
                    <span>{isMr ? "मराठी व्हॉईस कॉल" : "IVRS Voice Call"}</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons: Audio Preview & Live Dispatch */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleToggleVoicePlayback}
                  className={`flex items-center gap-2 rounded-lg border-2 border-[#123C32] px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider transition ${
                    isPlayingVoice
                      ? "bg-[#C7473B] text-white"
                      : "bg-[#F4F0E5] text-[#123C32] hover:bg-[#E5DFCE]"
                  }`}
                >
                  {isPlayingVoice ? (
                    <>
                      <VolumeX size={14} />
                      <span>{isMr ? "व्हॉईस कॉल थांबवा" : "Stop Voice Call"}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={14} />
                      <span>{isMr ? "व्हॉईस कॉल ऑडिओ ऐका (IVRS Preview)" : "Listen Voice Preview"}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDispatch}
                  disabled={isDispatching || (!channelApp && !channelSms && !channelVoice)}
                  className="flex items-center gap-2 rounded-lg border-2 border-[#123C32] bg-[#123C32] px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[2px_2px_0px_#252923] hover:bg-[#172B4D] transition disabled:opacity-50"
                >
                  {isDispatching ? (
                    <>
                      <Clock size={14} className="animate-spin" />
                      <span>{isMr ? "प्रसारण करत आहे..." : "Broadcasting..."}</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>{isMr ? "सर्व माध्यमांवर थेट पाठवा" : "Broadcast to All Channels"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Success Banner */}
            {lastDispatched && (
              <div className="rounded-lg border-2 border-[#3B8B61] bg-[#3B8B61]/10 p-3 space-y-1">
                <div className="flex items-center gap-2 text-[#3B8B61]">
                  <CheckCircle2 size={16} />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    {isMr ? "सल्ला यशस्वीरीत्या प्रसारित करण्यात आला!" : "Advisory Successfully Broadcasted!"}
                  </span>
                </div>
                <p className="font-mono text-xs text-[#252923]">
                  {isMr ? "प्रसारण आयडी:" : "Dispatch ID:"}{" "}
                  <strong>{lastDispatched.id}</strong> •{" "}
                  {lastDispatched.reachCount.toLocaleString("en-IN")}{" "}
                  {isMr ? "शेतकऱ्यांना वितरित" : "farmers reached"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: University Templates & Broadcast Log */}
        <div className="lg:col-span-5 space-y-5">
          {/* Quick-Insert University Advisory Templates */}
          <div className="rounded-xl border-2 border-[#123C32] bg-white p-4 shadow-[3px_3px_0px_#123C32] space-y-3">
            <div className="flex items-center justify-between border-b border-[#123C32]/10 pb-2">
              <div className="flex items-center gap-2">
                <BookOpen size={15} className="text-[#123C32]" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#123C32]">
                  {isMr ? "कृषी विद्यापीठ प्रमाणित मसुदे" : "MPKV Pre-Calibrated Advisories"}
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#252923]/60">
                {isMr ? "वापरण्यासाठी क्लिक करा" : "Click to insert"}
              </span>
            </div>

            <div className="space-y-2">
              {UNIVERSITY_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className="cursor-pointer rounded-lg border border-[#123C32]/20 bg-[#F4F0E5] p-2.5 transition hover:bg-[#E5DFCE] hover:border-[#123C32]"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-[#123C32] px-1.5 py-0.5 font-mono text-[9px] font-bold text-white">
                      {isMr ? tpl.cropMr : tpl.cropEn}
                    </span>
                    <span className="font-mono text-[10px] text-[#252923]/60">
                      {isMr ? tpl.universitySourceMr : tpl.universitySourceEn}
                    </span>
                  </div>
                  <h4 className="mt-1 font-display text-xs font-bold text-[#123C32]">
                    {isMr ? tpl.titleMr : tpl.titleEn}
                  </h4>
                </div>
              ))}
            </div>
          </div>

          {/* Broadcast Dispatch History */}
          <div className="rounded-xl border-2 border-[#123C32] bg-white p-4 shadow-[3px_3px_0px_#123C32] space-y-3">
            <div className="flex items-center justify-between border-b border-[#123C32]/10 pb-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#123C32]">
                {isMr ? "अलिकडील प्रसारण इतिहास" : "Recent Broadcast Dispatches"}
              </span>
              <span className="font-mono text-[10px] text-[#252923]/60">
                {history.length} {isMr ? "नोंदी" : "records"}
              </span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-[#123C32]/15 bg-white p-3 space-y-1 font-sans text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#3B8B61]">
                      {item.id}
                    </span>
                    <span className="font-mono text-[10px] text-[#252923]/60">
                      {isMr ? item.timestampMr : item.timestampEn}
                    </span>
                  </div>
                  <h5 className="font-display font-bold text-[#123C32]">
                    {isMr ? item.titleMr : item.titleEn}
                  </h5>
                  <div className="flex flex-wrap items-center justify-between gap-1 border-t border-[#123C32]/10 pt-1 font-mono text-[10px] text-[#252923]/70">
                    <span>
                      {isMr ? item.cropMr : item.cropEn} • {isMr ? item.talukaMr : item.talukaEn}
                    </span>
                    <span className="font-bold text-[#172B4D]">
                      {item.reachCount.toLocaleString("en-IN")}{" "}
                      {isMr ? "शेतकऱ्यांना पोहोच" : "farmers reached"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
