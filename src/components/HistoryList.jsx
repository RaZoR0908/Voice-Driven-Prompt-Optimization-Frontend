import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getDecisionLogs } from "../api";
import DecisionLog from "./DecisionLog";

const domainClassMap = {
  marketing: "bg-pink/20 text-pink",
  code: "bg-cyan/20 text-cyan",
  writing: "bg-violet/20 text-violet",
  data: "bg-orange-400/20 text-orange-300",
  research: "bg-yellow-400/20 text-yellow-200",
  other: "bg-surface-2 text-muted",
};

const languageClassMap = {
  English: "bg-cyan/20 text-cyan",
  Hindi: "bg-orange-400/20 text-orange-300",
  Hinglish: "bg-violet/20 text-violet",
};

function domainBadge(domain) {
  const value = String(domain || "other").toLowerCase();
  return domainClassMap[value] || domainClassMap.other;
}

function normalizeLanguageLabel(label) {
  if (!label) return "English";
  const normalized = {
    English: "English",
    Hindi: "Hindi",
    Hinglish: "Hinglish",
    en: "English",
    hi: "Hindi",
    hinglish: "Hinglish",
  };
  return normalized[label] || "English";
}

function languageBadge(language) {
  const label = normalizeLanguageLabel(language);
  return languageClassMap[label] || languageClassMap.English;
}

function detectInputLanguage(text) {
  if (!text) return "English";
  const hasHindi = /[\u0900-\u097F]/.test(text);
  const hasHinglish = /[a-zA-Z]/.test(text) && /[\u0900-\u097F]/.test(text);
  
  if (hasHinglish) return "Hinglish";
  if (hasHindi) return "Hindi";
  return "English";
}

function buildTimeline(item, backendLogs = []) {
  const logMap = new Map(
    backendLogs.map((log) => [String(log.stepName || "").toUpperCase(), log])
  );
  const sttLog = logMap.get("STT");
  const intentLog = logMap.get("INTENT");
  const transformLog = logMap.get("TRANSFORM");
  const memoryLog = logMap.get("MEMORY");
  const validateLog = logMap.get("VALIDATE") || logMap.get("VALIDATION");
  const rawText = item.rawText || "";
  const transcript = item.transcript || "";
  const reductionPct = Number(item.reductionPct || 0);

  return [
    {
      stepName: "STT",
      decision: sttLog?.decision || "COMPLETED",
      detail: sttLog?.detail || "Speech-to-text conversion complete",
      createdAt: sttLog?.createdAt || item.createdAt,
    },
    {
      stepName: "LANGUAGE DETECTION",
      decision: "COMPLETED",
      detail: `Detected: ${detectInputLanguage(rawText)} | Normalized to: English`,
      createdAt: sttLog?.createdAt || item.createdAt,
    },
    {
      stepName: "FILTER",
      decision: rawText !== transcript ? "COMPLETED" : "COMPLETED",
      detail: rawText !== transcript ? "Removed filler words and cleaned input" : "No filler words found",
      createdAt: sttLog?.createdAt || item.createdAt,
    },
    {
      stepName: "NORMALIZATION",
      decision: rawText !== transcript ? "COMPLETED" : "COMPLETED",
      detail: rawText !== transcript ? "Translated to English" : "Already in English",
      createdAt: sttLog?.createdAt || item.createdAt,
    },
    {
      stepName: "INTENT EXTRACTION",
      decision: intentLog?.decision || "COMPLETED",
      detail: intentLog?.detail || `Extracted intent: ${item.intent || 'general_request'}`,
      createdAt: intentLog?.createdAt || item.createdAt,
    },
    {
      stepName: "CONFIRMATION",
      decision: item.optimizedPrompt ? "COMPLETED" : "FAILED",
      detail: item.optimizedPrompt ? "User confirmed the extracted intent" : "User rejected",
      createdAt: item.createdAt,
    },
    {
      stepName: "PROMPT OPTIMIZATION",
      decision: transformLog?.decision || "COMPLETED",
      detail: transformLog?.detail || "Applied CAVEMAN MODE - token reduction optimized",
      createdAt: transformLog?.createdAt || item.createdAt,
    },
    {
      stepName: "VALIDATION",
      decision: validateLog?.decision || "COMPLETED",
      detail:
        validateLog?.detail || `Reduction achieved: ${Number.isFinite(reductionPct) ? reductionPct : 0}%`,
      createdAt: validateLog?.createdAt || item.createdAt,
    },
  ];
}

export default function HistoryList({ items }) {
  const [expandedId, setExpandedId] = useState(null);
  const [logsById, setLogsById] = useState({});
  const [loadingById, setLoadingById] = useState({});

  const toggleExpand = async (messageId) => {
    if (expandedId === messageId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(messageId);

    if (!logsById[messageId]) {
      setLoadingById((prev) => ({ ...prev, [messageId]: true }));
      try {
        const response = await getDecisionLogs(messageId);
        setLogsById((prev) => ({ ...prev, [messageId]: response.data || [] }));
      } catch {
        setLogsById((prev) => ({ ...prev, [messageId]: [] }));
      } finally {
        setLoadingById((prev) => ({ ...prev, [messageId]: false }));
      }
    }
  };

  if (!items?.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isExpanded = expandedId === item.messageId;
        const reductionPct = Number(item.reductionPct || 0);
        const timeline = buildTimeline(item, logsById[item.messageId] || []);
        const domain = String(item.domain || "other").toLowerCase();
        const normalizedLanguage = normalizeLanguageLabel(item.language);
        const detectedLanguage = detectInputLanguage(item.rawText);
        const rawInput = item.rawText || item.transcript || "";

        return (
          <article
            key={item.messageId}
            className="rounded-2xl border border-border bg-surface/80 p-4 backdrop-blur-md transition hover:border-pink/30 hover:shadow-[0_0_18px_rgba(255,45,120,0.12)]"
          >
            <div className="space-y-4">
              {/* Raw Input Section */}
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-pink-light">
                  Original Input ({detectedLanguage})
                </p>
                <p className="mt-1 text-sm leading-relaxed text-white/90">
                  {rawInput || "No input provided"}
                </p>
              </div>

              {/* Language Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs ${languageBadge(detectedLanguage)}`}>
                  Detected: {detectedLanguage}
                </span>
                <span className="rounded-full bg-cyan/20 px-3 py-1 text-xs text-cyan">
                  Normalized: English
                </span>
                <span className={`rounded-full px-3 py-1 text-xs ${domainBadge(domain)}`}>
                  {domain}
                </span>
                <span className="rounded-full bg-success/15 px-3 py-1 text-xs text-success">
                  {reductionPct}% saved
                </span>
              </div>

              {/* Normalized Input Section */}
              {detectedLanguage !== "English" && (
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-cyan">
                    Normalized Input (English)
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-white/90">
                    {item.transcript || "Normalization in progress..."}
                  </p>
                </div>
              )}
            </div>

            {/* Optimized Prompt Section */}
            <div className="mt-4 rounded-xl border border-pink/20 bg-bg/60 p-3">
              <p className="font-mono text-xs uppercase tracking-wider text-muted">
                Optimized Prompt (Final)
              </p>
              <p className="mt-1 line-clamp-3 text-sm text-white/80">
                {item.optimizedPrompt || "No optimized prompt available"}
              </p>
            </div>

            {/* Timestamp and Action */}
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-muted">{new Date(item.createdAt).toLocaleString()}</p>
              <button
                type="button"
                onClick={() => toggleExpand(item.messageId)}
                className="inline-flex items-center gap-1 rounded-lg border border-cyan/30 px-3 py-1 text-xs text-cyan hover:bg-cyan/10"
              >
                {isExpanded ? (
                  <>
                    Hide Decision Log <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    View Decision Log <ChevronDown size={14} />
                  </>
                )}
              </button>
            </div>

            {isExpanded && (
              <DecisionLog steps={timeline} loading={Boolean(loadingById[item.messageId])} />
            )}
          </article>
        );
      })}
    </div>
  );
}
