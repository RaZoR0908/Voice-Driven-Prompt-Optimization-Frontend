import { useEffect, useState } from "react";

const OUTPUT_FORMATS = [
  "bullet_list",
  "paragraph",
  "table",
  "code",
  "numbered_list",
  "short_answer",
];

const AUDIENCES = [
  "general",
  "developer",
  "business",
  "student",
  "expert",
];

const domainColorMap = {
  marketing: "bg-pink/20 text-pink",
  code: "bg-cyan/20 text-cyan",
  writing: "bg-violet/20 text-violet",
};

const formatBadgeMap = {
  bullet_list: "bg-cyan/20 text-cyan",
  paragraph: "bg-violet/20 text-violet",
  table: "bg-pink/20 text-pink",
  code: "bg-success/20 text-success",
  numbered_list: "bg-amber-400/20 text-amber-300",
  short_answer: "bg-surface-2 text-muted",
};

const audienceBadgeMap = {
  general: "bg-surface-2 text-muted",
  developer: "bg-cyan/20 text-cyan",
  business: "bg-pink/20 text-pink",
  student: "bg-violet/20 text-violet",
  expert: "bg-success/20 text-success",
};

function hasNonLatinText(value) {
  return typeof value === "string" && /[^\x00-\x7F]/.test(value);
}

function displayEnglishText(value) {
  if (!value) {
    return "unknown";
  }
  return hasNonLatinText(value) ? "Translation unavailable" : value;
}

function normalizeConstraintList(constraints = []) {
  return constraints.map((constraint) => displayEnglishText(constraint));
}

export default function IntentCard({ intent, onConfirm, onReject }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(intent);
  const [newConstraint, setNewConstraint] = useState("");

  useEffect(() => {
    setDraft(intent);
    setIsEditing(false);
  }, [intent]);

  const addConstraint = () => {
    const value = newConstraint.trim();
    if (!value) {
      return;
    }

    if (!draft.constraints.includes(value)) {
      setDraft((prev) => ({
        ...prev,
        constraints: [...prev.constraints, value],
      }));
    }
    setNewConstraint("");
  };

  const removeConstraint = (idx) => {
    setDraft((prev) => ({
      ...prev,
      constraints: prev.constraints.filter((_, index) => index !== idx),
    }));
  };

  const hasLanguageError =
    hasNonLatinText(draft.intent) ||
    hasNonLatinText(draft.task) ||
    hasNonLatinText(draft.domain) ||
    hasNonLatinText(draft.outputFormat) ||
    hasNonLatinText(draft.audience) ||
    (draft.constraints || []).some(hasNonLatinText);

  const saveEdits = () => {
    setIsEditing(false);
  };

  const domainClass =
    domainColorMap[draft.domain?.toLowerCase()] || "bg-muted/20 text-muted";

  const canConfirm =
    !isEditing &&
    !hasLanguageError;

  const handleConfirm = () => {
    if (!canConfirm) {
      return;
    }
    onConfirm(draft);
  };

  const outputFormatClass =
    formatBadgeMap[draft.outputFormat] || "bg-surface-2 text-muted";
  const audienceClass =
    audienceBadgeMap[draft.audience] || "bg-surface-2 text-muted";

  return (
    <div className="animate-slideUp rounded-2xl border border-pink/20 bg-surface/80 p-5 backdrop-blur-md md:p-6">
      <p className="mb-2 text-sm text-pink-light">
        Is this what you meant? Review, edit if needed, then confirm.
      </p>

      {hasLanguageError && (
        <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          ⚠ Translation error — backend did not normalize language
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-muted">
            INTENT
          </label>
          {isEditing ? (
            <input
              value={draft.intent}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, intent: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-sm text-pink outline-none focus:border-pink"
            />
          ) : (
            <p className="mt-1 inline-flex rounded-md bg-pink/10 px-3 py-1 font-mono text-sm text-pink">
              {displayEnglishText(draft.intent)}
            </p>
          )}
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-muted">
            TASK
          </label>
          {isEditing ? (
            <textarea
              value={draft.task}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, task: e.target.value }))
              }
              rows={3}
              className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-white outline-none focus:border-pink"
            />
          ) : (
            <p className="mt-1 text-sm text-white/90">{displayEnglishText(draft.task)}</p>
          )}
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-muted">
            DOMAIN
          </label>
          {isEditing ? (
            <input
              value={draft.domain}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, domain: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-white outline-none focus:border-pink"
            />
          ) : (
            <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${domainClass}`}>
              {displayEnglishText(draft.domain || "general")}
            </span>
          )}
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-muted">
            CONSTRAINTS
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {draft.constraints?.length ? (
              normalizeConstraintList(draft.constraints).map((constraint, idx) => (
                <span
                  key={`${constraint}-${idx}`}
                  className="inline-flex items-center gap-2 rounded-full border border-pink/30 bg-pink/10 px-3 py-1 text-xs text-pink-light"
                >
                  {constraint}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeConstraint(idx)}
                      className="font-mono text-xs text-pink hover:text-white"
                      aria-label="Remove constraint"
                    >
                      x
                    </button>
                  )}
                </span>
              ))
            ) : (
              <span className="rounded-full bg-muted/20 px-3 py-1 text-xs text-muted">
                No constraints yet
              </span>
            )}
          </div>
          {isEditing && (
            <div className="mt-2 flex gap-2">
              <input
                value={newConstraint}
                onChange={(e) => setNewConstraint(e.target.value)}
                placeholder="Add constraint"
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-white outline-none focus:border-pink"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addConstraint();
                  }
                }}
              />
              <button
                type="button"
                onClick={addConstraint}
                className="rounded-lg border border-pink/40 px-3 py-2 text-xs text-pink hover:bg-pink/10"
              >
                Add
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="font-mono text-xs uppercase tracking-widest text-muted">
              OUTPUT FORMAT
            </label>
            {isEditing ? (
              <select
                value={draft.outputFormat}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, outputFormat: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-white outline-none focus:border-pink"
              >
                {OUTPUT_FORMATS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${outputFormatClass}`}>
                {draft.outputFormat || "paragraph"}
              </span>
            )}
          </div>

          <div>
            <label className="font-mono text-xs uppercase tracking-widest text-muted">
              AUDIENCE
            </label>
            {isEditing ? (
              <select
                value={draft.audience}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, audience: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-white outline-none focus:border-pink"
              >
                {AUDIENCES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${audienceClass}`}>
                {draft.audience || "general"}
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-5 text-sm text-white/80">
        {displayEnglishText(draft.task)} in {displayEnglishText(draft.outputFormat)} format. Confirm?
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!canConfirm}
          onClick={handleConfirm}
          className="rounded-lg bg-success px-4 py-2 text-sm font-semibold text-bg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          CONFIRM
        </button>
        <button
          type="button"
          onClick={isEditing ? saveEdits : () => setIsEditing(true)}
          className="rounded-lg border border-amber-400/50 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-400/10"
        >
          {isEditing ? "💾 Save Edits" : "✏️ EDIT"}
        </button>
        <button
          type="button"
          onClick={onReject}
          className="rounded-lg border border-danger/40 px-4 py-2 text-sm font-semibold text-danger hover:bg-danger/10"
        >
          ❌ REJECT
        </button>
      </div>
    </div>
  );
}
