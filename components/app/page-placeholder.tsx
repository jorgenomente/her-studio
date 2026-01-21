export function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card space-y-2 rounded-xl border p-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-muted-foreground text-sm">{description}</p>
      <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-10 text-center text-sm">
        Under construction
      </div>
    </div>
  );
}
