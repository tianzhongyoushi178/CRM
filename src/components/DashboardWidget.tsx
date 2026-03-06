import Link from "next/link";

interface DashboardWidgetProps {
  title: string;
  children: React.ReactNode;
  reportLink?: string;
  className?: string;
}

export default function DashboardWidget({
  title,
  children,
  reportLink,
  className = "",
}: DashboardWidgetProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border p-5 ${className}`}
      style={{ borderColor: "#DDDBDA" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold" style={{ color: "#3E3E3C" }}>
          {title}
        </h3>
        {reportLink && (
          <Link
            href={reportLink}
            className="text-xs font-medium hover:underline"
            style={{ color: "#0070D2" }}
          >
            レポートの表示
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}
