"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (path === "/admin/login") return;
    if (!localStorage.getItem("admin_session")) {
      router.replace("/auth/login");
    }
  }, [path, router]);

  if (path === "/admin/login") {
    return <div className="min-h-screen bg-[#0a0a0a]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AdminSidebar />
      <div className="ml-56">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
