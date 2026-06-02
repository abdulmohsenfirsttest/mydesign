import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/10 pt-14 pb-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-white font-bold text-sm" style={{ fontFamily: "var(--font-playfair)" }}>
                  my
                </span>
              </div>
              <div className="leading-tight">
                <p className="text-white text-sm font-semibold" style={{ fontFamily: "var(--font-inter)" }}>Design &amp;</p>
                <p className="text-white text-sm font-semibold" style={{ fontFamily: "var(--font-inter)" }}>Build</p>
              </div>
            </div>
            <p className="text-white/40 text-xs mb-4 tracking-wide" style={{ fontFamily: "var(--font-inter)" }}>
              Follow Us on Socials
            </p>
            <div className="flex items-center gap-4">
              {["f", "ig", "yelp"].map((icon) => (
                <div key={icon} className="w-7 h-7 border border-white/20 flex items-center justify-center hover:border-white/60 cursor-pointer transition-colors">
                  <span className="text-white/40 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{icon[0].toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm tracking-widest mb-5" style={{ fontFamily: "var(--font-inter)" }}>
              Contact Us
            </h4>
            <div className="space-y-2 text-white/40 text-xs leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
              <p>7203 Prince Muhammad Ibn Saad, Al Aqiq,<br />Riyadh, Saudi Arabia</p>
              <p>info@mysaudi.co</p>
              <p>+966 500 866 685</p>
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm tracking-widest mb-5" style={{ fontFamily: "var(--font-inter)" }}>
              Explore
            </h4>
            <div className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/#services", label: "Services" },
                { href: "/projects", label: "Projects" },
                { href: "/#contact", label: "Contact" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-white/40 text-xs hover:text-white transition-colors tracking-wide"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-5 gap-3">
          <div className="flex gap-6 text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
            <span className="hover:text-white/40 cursor-pointer transition-colors">Accessibility Statement</span>
            <span className="hover:text-white/40 cursor-pointer transition-colors">Privacy Policy</span>
          </div>
          <p className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
            © 2035 by MyDesign.
          </p>
        </div>
      </div>
    </footer>
  );
}
