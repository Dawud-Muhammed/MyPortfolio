import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { useWebsiteSettings, useProfile } from '../lib/queries';

export function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const { data: settings } = useWebsiteSettings();
  const { data: profile } = useProfile();

  if (!settings?.whatsapp_enabled || !settings?.whatsapp_number) return null;

  const ownerName = (profile?.name || settings?.site_name || '').split(' ')[0];
  const defaultMessage = `Hi ${ownerName}! I came across your portfolio and wanted to connect.`;
  const messageText = settings.whatsapp_message || defaultMessage;
  const waUrl = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(messageText)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {showTooltip && (
        <div className="glass-strong rounded-2xl p-4 max-w-xs animate-scale-in relative">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-2 right-2 text-foreground/40 hover:text-foreground"
          >
            <X size={16} />
          </button>
          <p className="text-sm text-foreground font-medium mb-1">Let's talk!</p>
          <p className="text-xs text-foreground/60">Have a project in mind? Send me a message on WhatsApp.</p>
        </div>
      )}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        className="h-14 w-14 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-lg shadow-[#25D366]/30 hover:scale-110 transition-transform animate-bounce-subtle"
        aria-label="WhatsApp"
      >
        <MessageCircle size={26} fill="white" />
      </a>
    </div>
  );
}
