const STYLES = {
  note: { box: "border-info bg-info-soft", title: "text-info", icon: "ℹ" },
  tip: { box: "border-success bg-success-soft", title: "text-success", icon: "✦" },
  warning: { box: "border-warning bg-warning-soft", title: "text-warning", icon: "!" },
} as const;

export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: keyof typeof STYLES;
  title?: string;
  children: React.ReactNode;
}) {
  const s = STYLES[type] ?? STYLES.note;
  return (
    <aside className={`not-prose rounded-md border-l-4 px-4 py-3 font-ui text-[0.92em] leading-relaxed ${s.box}`}>
      {title && (
        <p className={`mb-1 font-semibold ${s.title}`}>
          <span aria-hidden className="mr-1.5">{s.icon}</span>
          {title}
        </p>
      )}
      <div className="text-fg-prose [&>p+p]:mt-2">{children}</div>
    </aside>
  );
}
