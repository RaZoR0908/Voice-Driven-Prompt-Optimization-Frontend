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
      detail: sttLog?.detail || "Transcribed voice input",
      createdAt: sttLog?.createdAt || item.createdAt,
    },
    {
      stepName: "FILTER",
      decision: rawText !== transcript ? "COMPLETED" : "COMPLETED",
      detail: rawText !== transcript ? "Removed filler words" : "No filler words removed",
      createdAt: sttLog?.createdAt || item.createdAt,
    },
    {
      stepName: "TRANSLATE",
      decision: rawText !== transcript ? "COMPLETED" : "COMPLETED",
      detail: rawText !== transcript ? "Hindi → English" : "Already English",
      createdAt: sttLog?.createdAt || item.createdAt,
    },
    {
      stepName: "INTENT",
      decision: intentLog?.decision || "COMPLETED",
      detail: intentLog?.detail || "Extracted intent from transcript",
      createdAt: intentLog?.createdAt || item.createdAt,
    },
    {
      stepName: "CONFIRM",
      decision: item.optimizedPrompt ? "COMPLETED" : "FAILED",
      detail: item.optimizedPrompt ? "User confirmed" : "User rejected",
      createdAt: item.createdAt,
    },
    {
      stepName: "TRANSFORM",
      decision: transformLog?.decision || "COMPLETED",
      detail: transformLog?.detail || "CAVEMAN MODE applied",
      createdAt: transformLog?.createdAt || item.createdAt,
    },
    {
      stepName: "VALIDATION",
      decision: validateLog?.decision || "COMPLETED",
      detail:
        validateLog?.detail || `Token reduction: ${Number.isFinite(reductionPct) ? reductionPct : 0}%`,
      createdAt: validateLog?.createdAt || item.createdAt,
    },
    {
      stepName: "MEMORY",
      decision: memoryLog?.decision || "SKIPPED",
      detail: memoryLog?.detail || "Not saved",
      createdAt: memoryLog?.createdAt || item.createdAt,
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
        const language = normalizeLanguageLabel(item.language);

        return (
          <article
            key={item.messageId}
            className="rounded-2xl border border-border bg-surface/80 p-4 backdrop-blur-md transition hover:border-pink/30 hover:shadow-[0_0_18px_rgba(255,45,120,0.12)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-3xl">
                <p className="font-mono text-xs uppercase tracking-wider text-pink-light">
                  Raw Input
                </p>
                <p className="mt-1 text-sm leading-relaxed text-white/90">
                  {item.rawText || item.transcript || "No raw input provided"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`rounded-full px-3 py-1 text-xs ${languageBadge(language)}`}>
                  Language: {language}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs ${domainBadge(domain)}`}>
                  {domain}
                </span>
                <span className="rounded-full bg-success/15 px-3 py-1 text-xs text-success">
                  {reductionPct}% saved
                </span>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-pink/20 bg-bg/60 p-3">
              <p className="font-mono text-xs uppercase tracking-wider text-muted">
                Optimized Prompt
              </p>
              <p className="mt-1 line-clamp-3 text-sm text-white/80">
                {item.optimizedPrompt || "No optimized prompt available"}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
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
