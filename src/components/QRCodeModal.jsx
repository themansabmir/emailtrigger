'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';

export function QRCodeModal({ business, open, onOpenChange }) {
  const qrCodeRef = useRef(null);

  const downloadQRCode = () => {
    if (qrCodeRef.current) {
      const svg = qrCodeRef.current.querySelector('svg');
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngFile;
        const safeBusinessName = business.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        downloadLink.download = `${safeBusinessName}_qr_code.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  if (!business) return null;

  const feedbackUrl = `${window.location.origin}/f/${business.slug}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{business.name}</DialogTitle>
          <DialogDescription>
            Scan this QR code to open the feedback form.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-md" ref={qrCodeRef}>
          <QRCodeSVG value={feedbackUrl} size={256} includeMargin={true} />
        </div>
        <p className="text-sm text-gray-500 text-center truncate bg-gray-100 p-2 rounded-md">
          {feedbackUrl}
        </p>
        <Button onClick={downloadQRCode} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download as PNG
        </Button>
      </DialogContent>
    </Dialog>
  );
}
