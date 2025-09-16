'use client';
import { useSearchParams } from 'next/navigation';

export default function QueryBanner() {
  const sp = useSearchParams();
  const toNum = (s: string | null, def: number) => {
    const n = Number(s);
    return Number.isFinite(n) ? n : def;
  };

  const tile_w = toNum(sp.get('tile_w'), Number(process.env.NEXT_PUBLIC_TILE_W ?? 45));
  const tile_h = toNum(sp.get('tile_h'), Number(process.env.NEXT_PUBLIC_TILE_H ?? 45));
  const grout  = toNum(sp.get('grout'),  Number(process.env.NEXT_PUBLIC_GROUT  ?? 5));

  if (typeof window !== 'undefined') {
    // Debug in der Browser-Konsole
    // (erscheint NICHT bei curl, weil das clientseitig ist)
    console.log('QueryBanner params', { tile_w, tile_h, grout });
  }

  return (
    <div style={{ fontFamily: 'monospace', marginBottom: 8 }}>
      <div>Service: tile_w / tile_h / grout</div>
      <div>{tile_w} / {tile_h} / {grout}</div>
    </div>
  );
}
