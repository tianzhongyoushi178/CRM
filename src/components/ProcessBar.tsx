import { Check } from "lucide-react";

interface StatusDef {
  key: string;
  label: string;
}

interface ProcessBarProps {
  currentStatus: string;
  statuses: StatusDef[];
}

export default function ProcessBar({ currentStatus, statuses }: ProcessBarProps) {
  const currentIndex = statuses.findIndex((s) => s.key === currentStatus);
  const isTerminal =
    currentStatus === "NOT_REQUIRED" || currentStatus === "CANCELLED";

  if (isTerminal) {
    const terminalLabel =
      currentStatus === "NOT_REQUIRED" ? "SE依頼不要" : "キャンセル";
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center">
          {statuses.map((status, index) => (
            <div key={status.key} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center">
                <div className="flex h-9 w-full items-center justify-center rounded bg-gray-200 text-xs font-medium text-gray-500">
                  {status.label}
                </div>
              </div>
              {index < statuses.length - 1 && (
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
          {terminalLabel}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 items-center">
        {statuses.map((status, index) => {
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
            <div key={status.key} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-9 w-full items-center justify-center rounded text-xs font-medium ${bgClass} ${textClass}`}
                >
                  {isCompleted && (
                    <Check size={14} className="mr-1 flex-shrink-0" />
                  )}
                  {status.label}
                </div>
              </div>
              {index < statuses.length - 1 && (
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
    </div>
  );
}
