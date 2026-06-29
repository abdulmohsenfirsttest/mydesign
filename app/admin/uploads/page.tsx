"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

type Client = { id: string; name: string };
type Project = { id: string; name: string; client_id: string };
type FileRow = { id: string; name: string; size: string; url: string; created_at: string; clients: { name: string } | null; projects: { name: string } | null };

export default function UploadsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from("clients").select("id, name").order("name").then(({ data }) => setClients(data ?? []));
    supabase.from("projects").select("id, name, client_id").order("name").then(({ data }) => setProjects(data ?? []));
    fetchFiles();

    const channel = supabase.channel("admin-files")
      .on("postgres_changes", { event: "*", schema: "public", table: "files" }, fetchFiles)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  function fetchFiles() {
    supabase.from("files").select("*, clients(name), projects(name)").order("created_at", { ascending: false })
      .then(({ data }) => setFiles((data as FileRow[]) ?? []));
  }

  const filteredProjects = selectedClient ? projects.filter(p => p.client_id === selectedClient) : projects;

  async function uploadFiles(fileList: FileList | null) {
    if (!fileList || !selectedClient) return;
    setUploading(true);
    for (const file of Array.from(fileList)) {
      const path = `${selectedClient}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("files").upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from("files").getPublicUrl(path);
        await supabase.from("files").insert({
          client_id: selectedClient,
          project_id: selectedProject || null,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          url: urlData.publicUrl,
        });
      }
    }
    fetchFiles();
    setUploading(false);
  }

  async function deleteFile(id: string, url: string) {
    if (!confirm("Delete this file?")) return;
    setDeleting(id);
    const marker = "/storage/v1/object/public/files/";
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      const path = decodeURIComponent(url.slice(idx + marker.length));
      await supabase.storage.from("files").remove([path]);
    }
    await supabase.from("files").delete().eq("id", id);
    setFiles(prev => prev.filter(f => f.id !== id));
    setDeleting(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    uploadFiles(e.dataTransfer.files);
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Upload Files</h1>
        <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Share files and deliverables directly to a client's portal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="border border-white/[0.08] bg-[#161616] p-6">
          <h2 className="text-white text-sm tracking-widest mb-5" style={{ fontFamily: "var(--font-inter)" }}>UPLOAD TO CLIENT</h2>

          <div className="space-y-3 mb-5">
            <div>
              <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Client</label>
              <select required value={selectedClient} onChange={e => { setSelectedClient(e.target.value); setSelectedProject(""); }}
                className="w-full bg-[#1e1e1e] border border-white/15 text-white/70 text-xs px-3 py-3 focus:outline-none focus:border-white/40" style={{ fontFamily: "var(--font-inter)" }}>
                <option value="">Select client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Project (optional)</label>
              <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-white/15 text-white/70 text-xs px-3 py-3 focus:outline-none focus:border-white/40" style={{ fontFamily: "var(--font-inter)" }}>
                <option value="">No project</option>
                {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <input ref={fileRef} type="file" multiple className="hidden" onChange={e => uploadFiles(e.target.files)} />
          <div onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => selectedClient && fileRef.current?.click()}
            className={`border-2 border-dashed p-10 text-center transition-colors ${selectedClient ? "cursor-pointer" : "cursor-not-allowed opacity-40"} ${dragging ? "border-white/40 bg-white/[0.03]" : "border-white/10 hover:border-white/25"}`}>
            {uploading ? (
              <p className="text-white/50 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Uploading...</p>
            ) : (
              <>
                <svg className="w-8 h-8 text-white/20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                <p className="text-white/30 text-sm mb-1" style={{ fontFamily: "var(--font-inter)" }}>Drag & drop or click to browse</p>
                <p className="text-white/15 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{selectedClient ? "PDF, JPG, PNG, DWG — any size" : "Select a client first"}</p>
              </>
            )}
          </div>
        </div>

        <div className="border border-white/[0.08] bg-[#161616] p-6">
          <h2 className="text-white text-sm tracking-widest mb-5" style={{ fontFamily: "var(--font-inter)" }}>RECENTLY UPLOADED</h2>
          {files.length === 0 ? (
            <p className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>No files uploaded yet.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {files.map(f => (
                <div key={f.id} className="flex items-start justify-between py-3 border-b border-white/[0.06] last:border-0 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-xs mb-0.5 truncate" style={{ fontFamily: "var(--font-inter)" }}>{f.name}</p>
                    <p className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                      {f.clients?.name ?? "—"} {f.projects?.name ? `· ${f.projects.name}` : ""} · {f.size}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/60 transition-colors" title="Open">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    </a>
                    <button onClick={() => deleteFile(f.id, f.url)} disabled={deleting === f.id}
                      className="text-red-400/30 hover:text-red-400/70 transition-colors disabled:opacity-30">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
