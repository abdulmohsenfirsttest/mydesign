export default function ReviewsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-foreground mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Design Reviews</h1>
        <p className="text-muted-2 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Review and approve design concepts from your team.</p>
      </div>

      <div className="border border-soft bg-surface p-12 text-center">
        <p className="text-muted-4 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No design reviews yet.</p>
      </div>
    </div>
  );
}
