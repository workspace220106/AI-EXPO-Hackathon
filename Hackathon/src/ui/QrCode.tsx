import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { PALETTE } from '@/theme/palette';

export function QrCode({ value, size = 160 }: { value: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    QRCode.toCanvas(ref.current, value, { width: size, margin: 1, color: { dark: PALETTE.navy, light: PALETTE.pale } }).catch(() => undefined);
  }, [value, size]);
  return <canvas ref={ref} width={size} height={size} role="img" aria-label={`QR code ${value}`} className="border-[3px] border-navy bg-pale" />;
}
