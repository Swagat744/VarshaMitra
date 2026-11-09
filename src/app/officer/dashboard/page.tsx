"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  BarChart3,
  ArrowRight,
  TrendingUp,
  Layers,
  MapPin,
  RefreshCw,
  Clock,
  Sparkles,
  ExternalLink,
  Info,
  Download,
  Search,
  Filter,
  FileCheck2,
  Radio,
  Sprout,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import { riskColor, riskLabelKey } from "@/lib/utils";
import RiskBadge from "@/components/RiskBadge";
import type { RiskLevel } from "@/types";
import {
  api,
  type RiskSummaryResponse,
  type RiskAssessmentResponse,
  type ForecastSeries,
} from "@/lib/api";
import { ApiUnavailableState, LoadingBlock } from "@/components/ui/States";
import RuralSmsSimulator from "@/components/officer/RuralSmsSimulator";
import PmfbyPanchamaDesk from "@/components/officer/PmfbyPanchamaDesk";
import ExpertAdvisoryStudio from "@/components/officer/ExpertAdvisoryStudio";
import ContingencyCropPlanner from "@/components/officer/ContingencyCropPlanner";

type OfficerTab = "triage" | "pmfby" | "advisory" | "contingency";

export default function OfficerDashboard() {
  const { t, language } = useTranslation();
  const isMr = language === "mr";

  // Tab State
  const [activeTab, setActiveTab] = useState<OfficerTab>("triage");

  // Summary State
  const [summary, setSummary] = useState<RiskSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inspectId, setInspectId] = useState<string | null>(null);

  // Filters State
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Inspector detailed data
  const [inspectRisk, setInspectRisk] = useState<RiskAssessmentResponse | null>(null);
  const [inspectForecast, setInspectForecast] = useState<ForecastSeries | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getRiskSummary(14);
      setSummary(data);
      if (data.items.length > 0 && !inspectId) {
        const priorityBlock =
          data.items.find(
            (b) => b.overall_risk === "critical" || b.overall_risk === "high"
          ) ?? data.items[0];
        setInspectId(priorityBlock.block_id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load officer risk summary";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [inspectId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await api.getRiskSummary(14);
        if (cancelled) return;
        setSummary(data);
        if (data.items.length > 0) {
          const priorityBlock =
            data.items.find(
              (b) => b.overall_risk === "critical" || b.overall_risk === "high"
            ) ?? data.items[0];
          setInspectId(priorityBlock.block_id);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Failed to load officer risk summary";
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!inspectId) return;
    let cancelled = false;

    Promise.resolve().then(() => {
      if (!cancelled) setInspectLoading(true);
    });

    Promise.allSettled([
      api.getClimateRisk(inspectId),
      api.getForecast(inspectId, 14),
    ]).then(([riskRes, fcRes]) => {
      if (cancelled) return;
      if (riskRes.status === "fulfilled") setInspectRisk(riskRes.value);
      if (fcRes.status === "fulfilled") setInspectForecast(fcRes.value);
      setInspectLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [inspectId]);

  // Unique Districts list
  const districtList = useMemo(() => {
    if (!summary?.items) return [];
    const set = new Set<string>();
    summary.items.forEach((item) => {
      if (item.district_name) set.add(item.district_name);
    });
    return Array.from(set).sort();
  }, [summary]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    if (!summary?.items) return [];
    return summary.items.filter((b) => {
      const matchesDistrict =
        selectedDistrict === "all" ||
        b.district_name?.toLowerCase() === selectedDistrict.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.block_name.toLowerCase().includes(q) ||
        b.block_name_mr?.toLowerCase().includes(q) ||
        b.district_name.toLowerCase().includes(q);
      return matchesDistrict && matchesSearch;
    });
  }, [summary, selectedDistrict, searchQuery]);

  // Export to CSV Function
  const handleExportCSV = () => {
    if (!summary?.items?.length) return;
    const headers = [
      "Taluka_ID",
      "Taluka_Name_EN",
      "Taluka_Name_MR",
      "District",
      "Assessed_Risk_Level",
      "Monitored_Cycle_Days",
      "Export_Date",
    ];
    const rows = summary.items.map((i) => [
      i.block_id,
      `"${i.block_name}"`,
      `"${i.block_name_mr || ""}"`,
      `"${i.district_name}"`,
      i.overall_risk ?? "insufficient_data",
      14,
      new Date().toISOString().split("T")[0],
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `VarshaMitra_Taluka_Contingency_Report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F4F0E5]">
        <LoadingBlock label={isMr ? "महाराष्ट्र तालुका हवामान जोखीम संकलन सुरू आहे..." : "Aggregating Maharashtra block risk overview..."} />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="py-12 max-w-xl mx-auto bg-[#F4F0E5]">
        <ApiUnavailableState
          serviceName={isMr ? "अधिकारी नियंत्रण कक्ष (Decision Engine)" : "Officer Decision Engine"}
          error={error ?? undefined}
          onRetry={fetchSummary}
        />
      </div>
    );
  }

  const items = summary.items;
  const counts: Record<RiskLevel, number> = {
    critical: items.filter((i) => i.overall_risk === "critical").length,
    high: items.filter((i) => i.overall_risk === "high").length,
    moderate: items.filter((i) => i.overall_risk === "moderate").length,
    low: items.filter((i) => i.overall_risk === "low").length,
    insufficient_data: items.filter(
      (i) => i.status === "unavailable" || i.overall_risk === "insufficient_data"
    ).length,
  };

  const total = items.length || 1;
  const inspectedItem = items.find((b) => b.block_id === inspectId) ?? items[0];

  const sortedItems = [...filteredItems].sort((a, b) => {
    const order: Record<string, number> = {
      critical: 0,
      high: 1,
      moderate: 2,
      low: 3,
      insufficient_data: 4,
    };
    const rA = a.overall_risk ?? "insufficient_data";
    const rB = b.overall_risk ?? "insufficient_data";
    return (order[rA] ?? 5) - (order[rB] ?? 5);
  });

  return (
    <div className="space-y-6 bg-[#F4F0E5] text-[#252923]">
      {/* ── Executive Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#123C32]/20 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded border border-[#172B4D] bg-[#172B4D] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#F4F0E5]">
              {isMr ? "प्रशासकीय नियंत्रण कक्ष" : "Administrative Cockpit"}
            </span>
            <span className="font-mono text-xs font-semibold text-[#172B4D]">
              {isMr
                ? "महाराष्ट्र शासन कृषी विभाग • तालुका कृषी अधिकारी (TAO) अधिकृत व्यासपीठ"
                : "Government of Maharashtra Dept of Agriculture • TAO Official Portal"}
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-black tracking-tight text-[#172B4D] sm:text-3xl">
            {t("officer.dashboardTitle")}
          </h1>
          <p className="mt-1 font-sans text-xs text-[#252923]/70 sm:text-sm">
            {isMr
              ? "हवामान जोखीम विश्लेषण, पीक नुकसान पंचनामे पडताळणी, थेट शेतकरी सल्ला प्रसारण आणि आपत्कालीन महाबीज बियाणे नियोजन."
              : "Hyperlocal climate triage, digital PMFBY crop-loss verification, university advisory broadcasts, and contingency seed depot allocations."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border-2 border-[#123C32] bg-white px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-[#123C32] shadow-[2px_2px_0px_#123C32] hover:bg-[#F4F0E5] transition"
            title="Download Official Taluka Assessment Report in CSV"
          >
            <Download size={14} />
            <span>{isMr ? "अहवाल डाउनलोड (CSV)" : "Export CSV Report"}</span>
          </button>

          <Link
            href="/officer/risk-map"
            className="flex items-center gap-1.5 rounded-lg border-2 border-[#172B4D] bg-[#172B4D] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-[#F4F0E5] shadow-[2px_2px_0px_#252923] hover:bg-[#123C32] transition"
          >
            <Layers size={14} className="text-[#E6A52E]" />
            <span>{isMr ? "राज्यव्यापी GIS नकाशा" : "Statewide GIS Map"}</span>
          </Link>
          <Link
            href="/officer/insights"
            className="flex items-center gap-1.5 rounded-lg border-2 border-[#172B4D] bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-[#172B4D] shadow-[2px_2px_0px_#172B4D] hover:bg-[#F4F0E5] transition"
          >
            <TrendingUp size={14} />
            <span>{t("nav.insights")}</span>
          </Link>
        </div>
      </div>

      {/* ── 4 Executive Top Tabs ── */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-[#123C32]/15 pb-2">
        <button
          onClick={() => setActiveTab("triage")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition ${
            activeTab === "triage"
              ? "border-2 border-[#123C32] bg-[#123C32] text-white shadow-[2px_2px_0px_#252923]"
              : "border-2 border-transparent bg-white/60 text-[#123C32] hover:bg-white"
          }`}
        >
          <BarChart3 size={15} />
          <span>{isMr ? "१. तालुका जोखीम व नियंत्रण" : "1. Taluka Triage & Jurisdiction"}</span>
        </button>

        <button
          onClick={() => setActiveTab("pmfby")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition ${
            activeTab === "pmfby"
              ? "border-2 border-[#172B4D] bg-[#172B4D] text-white shadow-[2px_2px_0px_#252923]"
              : "border-2 border-transparent bg-white/60 text-[#172B4D] hover:bg-white"
          }`}
        >
          <FileCheck2 size={15} />
          <span>{isMr ? "२. PMFBY पंचनामा व नुकसान भरपाई कक्ष" : "2. PMFBY Verification Desk"}</span>
          <span className="rounded-full bg-[#C7473B] px-1.5 py-0.2 font-mono text-[10px] font-bold text-white">
            {isMr ? "३ प्रलंबित" : "3 Pending"}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("advisory")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition ${
            activeTab === "advisory"
              ? "border-2 border-[#123C32] bg-[#123C32] text-white shadow-[2px_2px_0px_#252923]"
              : "border-2 border-transparent bg-white/60 text-[#123C32] hover:bg-white"
          }`}
        >
          <Radio size={15} />
          <span>{isMr ? "३. तज्ज्ञ सल्ला व थेट प्रसारण स्टुडिओ" : "3. Advisory Broadcast Studio"}</span>
        </button>

        <button
          onClick={() => setActiveTab("contingency")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition ${
            activeTab === "contingency"
              ? "border-2 border-[#172B4D] bg-[#172B4D] text-white shadow-[2px_2px_0px_#252923]"
              : "border-2 border-transparent bg-white/60 text-[#172B4D] hover:bg-white"
          }`}
        >
          <Sprout size={15} />
          <span>{isMr ? "४. आपत्कालीन पीक व महाबीज साठा" : "4. Contingency Sowing & Mahabeej"}</span>
        </button>
      </div>

      {/* ── TAB 1: TALUKA TRIAGE & JURISDICTION ── */}
      {activeTab === "triage" && (
        <div className="space-y-6">
          {/* Key Metrics Summary Strip */}
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border-2 border-[#123C32] bg-white p-4 shadow-[3px_3px_0px_#123C32]">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#123C32]">
                {isMr ? "निगराणीखालील तालुके" : "Monitored Talukas"}
              </span>
              <p className="mt-1 font-mono text-2xl font-black text-[#123C32]">{total}</p>
              <p className="font-mono text-xs font-medium text-[#252923]/80">
                {isMr ? "३६ जिल्ह्यांमध्ये सक्रिय" : "Across 36 Districts"}
              </p>
            </div>

            <div className="rounded-xl border-2 border-[#C7473B] bg-white p-4 shadow-[3px_3px_0px_#C7473B]">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#C7473B]">
                {isMr ? "अति-गंभीर जोखीम तालुके" : "Critical Alert Blocks"}
              </span>
              <p className="mt-1 font-mono text-2xl font-black text-[#C7473B]">
                {counts.critical}
              </p>
              <p className="font-mono text-xs font-medium text-[#252923]/80">
                {Math.round((counts.critical / total) * 100)}% {isMr ? "राज्यातील भाग" : "of state blocks"}
              </p>
            </div>

            <div className="rounded-xl border-2 border-[#E58A38] bg-white p-4 shadow-[3px_3px_0px_#E58A38]">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#E58A38]">
                {isMr ? "उच्च जोखीम तालुके" : "High Risk Blocks"}
              </span>
              <p className="mt-1 font-mono text-2xl font-black text-[#E58A38]">{counts.high}</p>
              <p className="font-mono text-xs font-medium text-[#252923]/80">
                {Math.round((counts.high / total) * 100)}% {isMr ? "राज्यातील भाग" : "of state blocks"}
              </p>
            </div>

            <div className="rounded-xl border-2 border-[#3B8B61] bg-white p-4 shadow-[3px_3px_0px_#3B8B61]">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#3B8B61]">
                {isMr ? "अनुकूल / अल्प जोखीम" : "Favorable / Low Risk"}
              </span>
              <p className="mt-1 font-mono text-2xl font-black text-[#3B8B61]">{counts.low}</p>
              <p className="font-mono text-xs font-medium text-[#252923]/80">
                {Math.round((counts.low / total) * 100)}% {isMr ? "राज्यातील भाग" : "of state blocks"}
              </p>
            </div>
          </div>

          {/* Statewide Proportional Risk Distribution */}
          <div className="rounded-xl border-2 border-[#123C32] bg-white p-6 shadow-[4px_4px_0px_#123C32]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#123C32]/15 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-[#123C32]" />
                <h2 className="font-display text-base font-bold text-[#123C32]">
                  {t("officer.riskDistribution")}
                </h2>
              </div>
              <span className="font-mono text-xs font-medium text-[#252923]">
                {t("officerDashboard.totalCoverage", { count: total })} (14-day evaluation cycle)
              </span>
            </div>

            {/* Proportional distribution bar */}
            <div className="mt-4 flex h-7 overflow-hidden rounded-md border-2 border-[#123C32]">
              {[
                { level: "critical" as RiskLevel, count: counts.critical, bg: "bg-[#C7473B]" },
                { level: "high" as RiskLevel, count: counts.high, bg: "bg-[#E58A38]" },
                { level: "moderate" as RiskLevel, count: counts.moderate, bg: "bg-[#E6B83F]" },
                { level: "low" as RiskLevel, count: counts.low, bg: "bg-[#3B8B61]" },
                {
                  level: "insufficient_data" as RiskLevel,
                  count: counts.insufficient_data,
                  bg: "bg-[#252923]",
                },
              ].map((seg) => {
                const pct = (seg.count / total) * 100;
                if (pct === 0) return null;
                return (
                  <div
                    key={seg.level}
                    className={`${seg.bg} flex items-center justify-center font-mono text-[10px] font-bold text-white transition-all`}
                    style={{ width: `${pct}%` }}
                    title={`${seg.level}: ${seg.count}`}
                  >
                    {pct > 8 && `${seg.count}`}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#C7473B]" />
                <span>Critical: {counts.critical}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#E58A38]" />
                <span>High: {counts.high}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#E6B83F]" />
                <span>Moderate: {counts.moderate}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#3B8B61]" />
                <span>Low: {counts.low}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#252923]" />
                <span>Other: {counts.insufficient_data}</span>
              </div>
            </div>
          </div>

          {/* District Filter & Search Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-[#123C32]/30 bg-white p-3 shadow-[2px_2px_0px_#123C32]">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter size={15} className="text-[#123C32]" />
                <span className="font-mono text-xs font-bold text-[#123C32]">
                  {isMr ? "जिल्हा निवडा:" : "Filter District:"}
                </span>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="rounded-md border-2 border-[#123C32]/30 bg-[#F4F0E5] px-2.5 py-1 font-mono text-xs font-bold text-[#123C32] outline-none"
                >
                  <option value="all">{isMr ? "सर्व ३६ जिल्हे (All Maharashtra)" : "All 36 Districts"}</option>
                  {districtList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#252923]/50"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isMr ? "तालुका किंवा जिल्हा शोधा..." : "Search taluka or district..."}
                  className="w-full rounded-md border-2 border-[#123C32]/30 bg-[#F4F0E5] pl-8 pr-3 py-1 font-mono text-xs text-[#252923] outline-none focus:border-[#123C32]"
                />
              </div>
              <span className="font-mono text-[11px] text-[#252923]/60 shrink-0">
                {filteredItems.length} {isMr ? "तालुके सापडले" : "talukas"}
              </span>
            </div>
          </div>

          {/* 2-Column Split: Taluka Table (Left 7 cols) & Live Inspector (Right 5 cols) */}
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Taluka Table */}
            <div className="lg:col-span-7 rounded-xl border-2 border-[#123C32] bg-white shadow-[4px_4px_0px_#123C32] overflow-hidden">
              <div className="flex items-center justify-between border-b-2 border-[#123C32]/15 bg-[#F4F0E5] px-4 py-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#123C32]">
                  {isMr ? "हस्तक्षेप आवश्यक असणारे तालुके" : "Talukas Requiring Intervention"}
                </span>
                <span className="font-mono text-xs text-[#252923]/60">
                  {isMr ? "तपशिलासाठी पंक्तीवर क्लिक करा" : "Click row to inspect"}
                </span>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full border-collapse text-left font-sans text-xs">
                  <thead>
                    <tr className="border-b-2 border-[#123C32]/15 bg-white font-mono text-[10px] font-bold uppercase tracking-wider text-[#123C32]/70">
                      <th className="p-3">{isMr ? "तालुका / मंडळ" : "Block / Taluka"}</th>
                      <th className="p-3">{isMr ? "जिल्हा" : "District"}</th>
                      <th className="p-3">{isMr ? "जोखीम स्थिती" : "Status"}</th>
                      <th className="p-3">{isMr ? "कृती" : "Action"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#123C32]/10">
                    {sortedItems.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center font-mono text-xs text-[#252923]/60">
                          {isMr ? "कोणतेही तालुके जुळले नाहीत." : "No matching talukas found for this filter."}
                        </td>
                      </tr>
                    ) : (
                      sortedItems.map((b) => {
                        const isInspected = b.block_id === inspectId;
                        return (
                          <tr
                            key={b.block_id}
                            onClick={() => setInspectId(b.block_id)}
                            className={`cursor-pointer transition ${
                              isInspected
                                ? "bg-[#123C32]/10 font-semibold"
                                : "hover:bg-[#F4F0E5]"
                            }`}
                          >
                            <td className="p-3 font-display font-bold text-[#252923]">
                              {isMr ? b.block_name_mr : b.block_name}
                            </td>
                            <td className="p-3 font-mono text-[#252923]/70">
                              {b.district_name}
                            </td>
                            <td className="p-3">
                              <RiskBadge
                                risk={b.overall_risk ?? "insufficient_data"}
                                size="sm"
                              />
                            </td>
                            <td className="p-3 font-mono text-[11px] text-[#123C32] underline">
                              {isMr ? "पहा" : "Inspect"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Inspector Panel */}
            <div className="lg:col-span-5 rounded-xl border-3 border-[#123C32] bg-white p-6 shadow-[6px_6px_0px_#123C32] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#123C32]/15 pb-3">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#123C32]/60">
                    {isMr ? "तालुका सखोल विश्लेषण" : "Taluka Inspector"}
                  </span>
                  <h3 className="font-display text-xl font-black text-[#123C32]">
                    {inspectedItem
                      ? isMr
                        ? inspectedItem.block_name_mr
                        : inspectedItem.block_name
                      : "Select a Block"}
                  </h3>
                  <p className="font-mono text-xs text-[#252923]/60">
                    {inspectedItem?.district_name} District
                  </p>
                </div>
                {inspectLoading && (
                  <RefreshCw size={14} className="animate-spin text-[#123C32]" />
                )}
              </div>

              {inspectedItem && (
                <div className="space-y-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase text-[#252923]/60">
                      {isMr ? "मूल्यांकन केलेली जोखीम श्रेणी:" : "Assessed Risk Tier:"}
                    </span>
                    <div className="mt-1">
                      <RiskBadge
                        risk={inspectedItem.overall_risk ?? "insufficient_data"}
                        size="md"
                        withPrefix
                      />
                    </div>
                  </div>

                  {inspectRisk && (
                    <div className="rounded-lg border-2 border-[#123C32]/20 bg-[#F4F0E5] p-3.5 space-y-2 font-mono text-xs text-[#252923]">
                      <p>
                        <span className="text-[#252923]/60">
                          {isMr ? "मुख्य जोखीम घटक:" : "Primary Driver:"}
                        </span>{" "}
                        <strong>
                          {inspectRisk.risk_drivers?.[0]?.name?.toUpperCase() || "MONITORING"}
                        </strong>
                      </p>
                      <p>
                        <span className="text-[#252923]/60">
                          {isMr ? "मॉडेल विश्वासार्हता:" : "Confidence:"}
                        </span>{" "}
                        <strong>{inspectRisk.confidence.toUpperCase()}</strong>
                      </p>
                      <p>
                        <span className="text-[#252923]/60">
                          {isMr ? "मूल्यांकन चक्र:" : "Evaluation Cycle:"}
                        </span>{" "}
                        <strong>{inspectRisk.assessment_time}</strong>
                      </p>
                    </div>
                  )}

                  <div className="pt-2">
                    <Link
                      href={`/farmer/dashboard?block=${inspectedItem.block_id}`}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-[#123C32] bg-[#123C32] py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F4F0E5] shadow-[2px_2px_0px_#252923] hover:bg-[#172B4D] transition"
                    >
                      <span>{isMr ? "शेतकरी कॉकपिट उघडा" : "Open Farmer Cockpit"}</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rural 2G Feature Phone SMS & WhatsApp Broadcast Console */}
          {inspectedItem && (
            <RuralSmsSimulator
              blockName={isMr ? inspectedItem.block_name_mr : inspectedItem.block_name}
              districtName={inspectedItem.district_name}
              riskLevel={inspectedItem.overall_risk ?? "moderate"}
              primaryDriver={inspectRisk?.risk_drivers?.[0]?.name}
              forecastRainMm={
                inspectForecast?.forecast?.length
                  ? Math.round(
                      inspectForecast.forecast.reduce(
                        (acc, curr) => acc + (curr.precipitation_sum_mm || 0),
                        0
                      ) * 10
                    ) / 10
                  : 14.5
              }
            />
          )}
        </div>
      )}

      {/* ── TAB 2: PMFBY CROP LOSS & PANCHAMA DESK ── */}
      {activeTab === "pmfby" && (
        <PmfbyPanchamaDesk
          selectedTaluka={inspectedItem ? (isMr ? inspectedItem.block_name_mr : inspectedItem.block_name) : "Niphad"}
          selectedDistrict={inspectedItem?.district_name || "Nashik"}
        />
      )}

      {/* ── TAB 3: EXPERT ADVISORY STUDIO ── */}
      {activeTab === "advisory" && (
        <ExpertAdvisoryStudio
          initialTaluka={inspectedItem?.block_name || "Niphad"}
          initialDistrict={inspectedItem?.district_name || "Nashik"}
        />
      )}

      {/* ── TAB 4: CONTINGENCY CROP PLANNER ── */}
      {activeTab === "contingency" && (
        <ContingencyCropPlanner
          selectedTaluka={inspectedItem ? (isMr ? inspectedItem.block_name_mr : inspectedItem.block_name) : "Niphad"}
          selectedDistrict={inspectedItem?.district_name || "Nashik"}
        />
      )}
    </div>
  );
}
