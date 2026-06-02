export default function Footer() {
  return (
    <footer className="py-8 px-6 bg-neutral-950 border-t border-neutral-800">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-white font-bold">
          My<span className="text-indigo-400">Design</span>
        </span>
        <p className="text-neutral-600 text-sm">
          &copy; {new Date().getFullYear()} MyDesign. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
