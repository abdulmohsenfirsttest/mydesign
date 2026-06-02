import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AdminSidebar />
      <div className="ml-56">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
