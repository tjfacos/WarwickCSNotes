interface PageSectionProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function PageSection({ title, subtitle, className, children }: PageSectionProps) {
  return (
    <section className={className}>
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>}
      {children}
    </section>
  );
}
