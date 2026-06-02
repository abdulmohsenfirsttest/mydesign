import DashboardSidebar from "../components/dashboard/DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <DashboardSidebar />
      <div className="ml-56">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
