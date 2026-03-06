import { Check } from "lucide-react";

interface PhaseProgressBarProps {
  currentStage: string;
}

const stages = [
  { key: "PROSPECTING", label: "見込み" },
  { key: "QUALIFICATION", label: "評価" },
  { key: "NEEDS_ANALYSIS", label: "ニーズ分析" },
  { key: "PROPOSAL", label: "提案" },
  { key: "NEGOTIATION", label: "交渉" },
  { key: "CLOSED_WON", label: "成約" },
] as const;

export default function PhaseProgressBar({
  currentStage,
}: PhaseProgressBarProps) {
  const isClosedLost = currentStage === "CLOSED_LOST";
  const isClosedWon = currentStage === "CLOSED_WON";

  const currentIndex = stages.findIndex((s) => s.key === currentStage);

  if (isClosedLost) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center">
          {stages.map((stage, index) => (
            <div key={stage.key} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center">
                <div className="flex h-9 w-full items-center justify-center rounded bg-gray-200 text-xs font-medium text-gray-500">
                  {stage.label}
                </div>
              </div>
              {index < stages.length - 1 && (
                <div className="flex-shrink-0">
                  <svg
                    width="12"
                    height="36"
                    viewBox="0 0 12 36"
                    className="text-gray-300"
                  >
                    <path
                      d="M0 0 L12 18 L0 36"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
        <span className="ml-3 flex-shrink-0 rounded-full bg-red-100 px-4 py-1.5 text-sm font-bold text-red-700">
          失注
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 items-center">
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          let bgClass = "";
          let textClass = "";

          if (isCompleted) {
            bgClass = "bg-[#0070D2]";
            textClass = "text-white";
          } else if (isCurrent) {
            bgClass = "bg-[#032D60]";
            textClass = "text-white";
          } else {
            bgClass = "bg-gray-200";
            textClass = "text-gray-500";
          }

          return (
            <div key={stage.key} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-9 w-full items-center justify-center rounded text-xs font-medium ${bgClass} ${textClass}`}
                >
                  {isCompleted && (
                    <Check size={14} className="mr-1 flex-shrink-0" />
                  )}
                  {stage.label}
                </div>
              </div>
              {index < stages.length - 1 && (
                <div className="flex-shrink-0">
                  <svg
                    width="12"
                    height="36"
                    viewBox="0 0 12 36"
                    className={
                      isFuture && !isCurrent
                        ? "text-gray-300"
                        : "text-[#0070D2]"
                    }
                  >
                    <path
                      d="M0 0 L12 18 L0 36"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {isClosedWon && (
        <button
          type="button"
          disabled
          className="ml-3 flex-shrink-0 rounded bg-[#0070D2] px-3 py-1.5 text-xs font-medium text-white opacity-60"
        >
          受注確度を完了としてマーク
        </button>
      )}
      {!isClosedWon && (
        <button
          type="button"
          className="ml-3 flex-shrink-0 rounded border border-[#0070D2] bg-white px-3 py-1.5 text-xs font-medium text-[#0070D2] hover:bg-blue-50"
        >
          受注確度を完了としてマーク
        </button>
      )}
    </div>
  );
}
