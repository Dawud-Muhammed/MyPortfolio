import { useState, useRef } from 'react';
import { Upload, X, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FileUploaderProps {
  bucket: string;
  folder: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  type?: 'image' | 'document' | 'audio';
  label?: string;
}

export function FileUploader({
  bucket,
  folder,
  value,
  onChange,
  accept = 'image/*',
  type = 'image',
  label = 'Upload File',
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setError('');
    const allowed = type === 'image' ? ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] : type === 'audio' ? ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'] : ['application/pdf'];
    const limit = type === 'image' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (!allowed.includes(file.type)) { setError(`Unsupported file type. Use ${type === 'image' ? 'JPEG, PNG, WebP or AVIF' : type === 'audio' ? 'MP3, WAV, OGG or M4A' : 'PDF'}.`); return; }
    if (file.size > limit) { setError(`Maximum upload size is ${limit / 1024 / 1024} MB.`); return; }
    setUploading(true);
    try {
      const ext = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'application/pdf': 'pdf', 'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a' } as Record<string, string>)[file.type];
      const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
      onChange(urlData.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <label className="text-foreground/70 text-sm font-medium mb-2 block">{label}</label>
      <div className="flex items-center gap-3 flex-wrap">
        {value && (
          <div className="relative shrink-0">
            {type === 'image' ? (
              <img src={value} alt="Preview" className="h-16 w-16 rounded-lg object-cover border border-foreground/10" />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-foreground/5 border border-foreground/10 flex items-center justify-center">
                <FileText size={24} className="text-accent-400" />
              </div>
            )}
            <button
              aria-label="Remove file reference (keeps stored file)"
              type="button"
              onClick={handleClear}
              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-error-500 text-white flex items-center justify-center hover:bg-error-600 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          aria-label={label || 'Choose file'}
          accept={accept}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn-ghost !py-2 !px-3 !text-xs disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : type === 'image' ? (
            <ImageIcon size={14} />
          ) : (
            <Upload size={14} />
          )}
          {uploading ? 'Uploading...' : value ? 'Replace' : 'Upload'}
        </button>
        {error && <p role="alert" className="text-error-400 text-xs w-full mt-1">{error}</p>}
      </div>
      {(
        <input
          aria-label={`${label || 'File'} URL`}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste URL..."
          className="input-field mt-2 !text-xs"
        />
      )}
    </div>
  );
}
