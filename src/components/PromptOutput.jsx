import { Copy, RotateCcw } from "lucide-react";
import { useState } from "react";

const decisionStyle = {
  SAVE_NEW:   "bg-success/20 text-success",
  SAVE_CHILD: "bg-success/20 text-success",
  MERGE:      "bg-violet/20 text-violet",
  SKIP:       "bg-muted/20 text-muted",
};

const decisionLabel = {
  SAVE_NEW:   "✓ Saved to Memory",
  SAVE_CHILD: "✓ Saved to Memory",
  MERGE:      "⟳ Merged with Memory",
  SKIP:       "— Not Saved",
};

export default function PromptOutput({ result, onStartOver }) {
  const [copied, setCopied] = useState(false);

  const memoryDecision = result.memoryDecision || "SKIP";
  const reductionPct = Number(result.reductionPct || 0);

  let reductionClass = "bg-red-400/20 text-red-400";
  if (reductionPct >= 30) {
    reductionClass = "bg-success/20 text-success";
  } else if (reductionPct > 0) {
    reductionClass = "bg-yellow-400/20 text-yellow-400";
  }

  const reductionText =
    reductionPct > 0
      ? `Reduced: ${Math.round(reductionPct)}%`
      : reductionPct === 0
      ? "Reduced: 0%"
      : `Longer: +${Math.abs(Math.round(reductionPct))}%`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.optimizedPrompt || "");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fadeIn rounded-2xl border border-pink/40 bg-surface p-5 shadow-[0_0_30px_rgba(255,45,120,0.25)] md:p-6">
      <h2 className="font-mono text-sm uppercase tracking-widest text-pink">
        OPTIMIZED PROMPT
      </h2>

      <div className="mt-4 rounded-xl border border-pink/30 bg-bg/80 p-4 font-mono text-sm leading-relaxed text-pink-light shadow-[0_0_18px_rgba(255,45,120,0.15)]">
        {result.optimizedPrompt || ""}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono">
        <span className="rounded-full bg-surface-2 px-3 py-1 text-cyan">
          Input: {result.tokenInput ?? 0} tokens
        </span>
        <span className="rounded-full bg-surface-2 px-3 py-1 text-violet">
          Output: {result.tokenOutput ?? 0} tokens
        </span>
        <span className={`rounded-full px-3 py-1 ${reductionClass}`}>
          {reductionText}
        </span>
        <span
          className={`rounded-full px-3 py-1 ${decisionStyle[memoryDecision] || decisionStyle.SKIP}`}
        >
          {decisionLabel[memoryDecision] || decisionLabel.SKIP}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-lg border border-pink/30 px-4 py-2 text-sm text-pink hover:bg-pink/10"
        >
          <Copy size={16} />
          {copied ? "Copied! ✓" : "Copy Prompt"}
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex items-center gap-2 rounded-lg bg-surface-2 px-4 py-2 text-sm text-white hover:bg-border"
        >
          <RotateCcw size={16} />
          Start Over
        </button>
      </div>
    </div>
  );
}