import { CheckCircle2, TriangleAlert, XCircle } from "lucide-react";

const colorForDecision = (decision) => {
  const value = (decision || "").toLowerCase();
  if (value.includes("error") || value.includes("fail")) {
    return "bg-danger/20 text-danger border-danger/40";
  }
  if (value.includes("warn") || value.includes("low")) {
    return "bg-amber-400/20 text-amber-300 border-amber-400/40";
  }
  if (value.includes("success") || value.includes("save") || value.includes("ok")) {
    return "bg-success/20 text-success border-success/40";
  }
  return "bg-cyan/20 text-cyan border-cyan/40";
};

function getDecisionIcon(decision) {
  const value = (decision || "").toLowerCase();
  if (value.includes("error") || value.includes("fail")) {
    return <XCircle size={16} className="text-danger" />;
  }
  if (value.includes("warn") || value.includes("low") || value.includes("skip")) {
    return <TriangleAlert size={16} className="text-amber-300" />;
  }
  return <CheckCircle2 size={16} className="text-success" />;
}

export default function DecisionLog({ steps, loading }) {
  if (loading) {
    return (
      <div className="mt-3 animate-pulse rounded-lg border border-border bg-surface-2 p-4 text-sm text-muted">
        Loading decision logs...
      </div>
    );
  }

  if (!steps?.length) {
    return (
      <div className="mt-3 rounded-lg border border-border bg-surface-2 p-4 text-sm text-muted">
        No decision logs for this message.
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3 border-l border-border pl-4">
      {steps.map((step, index) => (
        <div key={`${step.stepName}-${index}`} className="relative rounded-lg bg-surface-2 p-3">
          <span className="absolute -left-[22px] top-4 flex h-5 w-5 items-center justify-center rounded-full bg-bg ring-2 ring-border">
            {getDecisionIcon(step.decision)}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-mono text-xs uppercase tracking-wider text-pink-light">
              {step.stepName}
            </h4>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${colorForDecision(step.decision)}`}
            >
              {step.decision}
            </span>
          </div>
          <p className="mt-1 text-sm text-white/90">{step.detail}</p>
          <p className="mt-2 text-xs text-muted">{new Date(step.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
