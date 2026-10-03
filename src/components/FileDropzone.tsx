import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { FileText, UploadCloud, X } from 'lucide-react';

interface FileDropzoneProps {
  files: File[];
  onChange: (files: File[]) => void;
  label?: string;
  resourceType?: string;
  resourceId?: number | null;
}

export default function FileDropzone({ files, onChange, label = 'Lampiran file', resourceType, resourceId }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [savedFiles, setSavedFiles] = useState<any[]>([]);

  useEffect(() => {
    if (!resourceType || !resourceId) { setSavedFiles([]); return; }
    axios.get(`http://localhost:8080/api/attachments/${resourceType}/${resourceId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then((response) => setSavedFiles(response.data.data || []))
      .catch(() => setSavedFiles([]));
  }, [resourceType, resourceId]);

  const addFiles = (incoming: FileList | File[]) => {
    const next = Array.from(incoming);
    onChange([...files, ...next.filter((file) => !files.some((item) => item.name === file.name && item.size === file.size))]);
  };

  return (
    <section>
      <p className="mb-1.5 block text-xs font-semibold text-gray-600">{label}</p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.txt,.zip,.csv,.html,.css,.js,.jsx,.ts,.tsx,.json,.go,.py,.java"
        className="hidden"
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files);
          event.target.value = '';
        }}
      />
      <div
        onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault(); setIsDragging(false); addFiles(event.dataTransfer.files);
        }}
        className={`rounded-xl border-2 border-dashed p-4 text-center transition ${isDragging ? 'border-[#1C4D8D] bg-[#EAF1FA]' : 'border-gray-200 bg-gray-50 hover:border-[#1C4D8D]/50'}`}
      >
        <UploadCloud className="mx-auto text-[#1C4D8D]" size={24} />
        <p className="mt-2 text-xs text-gray-600">Tarik file ke sini atau</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="mt-1 text-xs font-semibold text-[#1C4D8D] hover:underline">
          Pilih file
        </button>
        <p className="mt-1 text-[10px] text-gray-400">Maksimal 20 MB per file. PDF, Office, gambar, ZIP, dan file kode.</p>
      </div>
      {files.length > 0 && <ul className="mt-2 space-y-1.5">
        {files.map((file, index) => <li key={`${file.name}-${file.size}-${index}`} className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs text-gray-600">
          <span className="flex min-w-0 items-center gap-2"><FileText size={14} className="shrink-0 text-[#1C4D8D]" /><span className="truncate">{file.name}</span><span className="shrink-0 text-[10px] text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</span></span>
          <button type="button" onClick={() => onChange(files.filter((_, itemIndex) => itemIndex !== index))} className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500" aria-label={`Hapus ${file.name}`}><X size={14} /></button>
        </li>)}
      </ul>}
      {savedFiles.length > 0 && <div className="mt-3">
        <p className="mb-1.5 text-[11px] font-semibold text-gray-500">File yang sudah tersimpan</p>
        <ul className="space-y-1.5">
          {savedFiles.map((file) => <li key={file.ID} className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs">
            <FileText size={14} className="shrink-0 text-[#1C4D8D]" />
            <a href={`http://localhost:8080${file.FileURL}`} target="_blank" rel="noreferrer" className="truncate text-[#1C4D8D] hover:underline">{file.FileName}</a>
          </li>)}
        </ul>
      </div>}
    </section>
  );
}
