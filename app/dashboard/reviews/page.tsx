export default function ReviewsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Design Reviews</h1>
        <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Review and approve design concepts from your team.</p>
      </div>

      <div className="border border-white/[0.08] bg-[#161616] p-12 text-center">
        <p className="text-white/25 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No design reviews yet.</p>
      </div>
    </div>
  );
}
