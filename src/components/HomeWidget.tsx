interface HomeWidgetProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
}

export function HomeWidget({ title, children, footer, headerAction }: HomeWidgetProps) {
  return (
    <div className="rounded-xl bg-white shadow-sm border border-[#DDDBDA]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#DDDBDA]">
        <h2 className="font-semibold text-[#3E3E3C]">{title}</h2>
        {headerAction && <div>{headerAction}</div>}
      </div>
      <div className="px-4 py-4">
        {children}
      </div>
      {footer && (
        <div className="border-t border-[#DDDBDA]">
          {footer}
        </div>
      )}
    </div>
  );
}
