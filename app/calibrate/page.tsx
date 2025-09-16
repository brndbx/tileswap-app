'use client';

import React, { useMemo, useRef, useState } from 'react';

type P = { x: number; y: number };

function dist(a: P, b: P) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export default function CalibratePage() {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgNatural, setImgNatural] = useState<{ w: number; h: number } | null>(null);
  const [points, setPoints] = useState<P[]>([]);
  const [distanceMm, setDistanceMm] = useState<string>('300'); // z.B. 300 mm = 30 cm
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const pxDistance = useMemo(() => {
    return points.length === 2 ? dist(points[0], points[1]) : undefined;
  }, [points]);

  const scalePxPerMm = useMemo(() => {
    const mm = Number(distanceMm.replace(',', '.'));
    if (!pxDistance || !Number.isFinite(mm) || mm <= 0) return undefined;
    return pxDistance / mm;
  }, [pxDistance, distanceMm]);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setResult(null);
    setPoints([]);
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    setImgUrl(f ? URL.createObjectURL(f) : null);
  }

  function imgToNatural(x: number, y: number): P | null {
    const img = imgRef.current;
    if (!img || !imgNatural) return null;
    const rect = img.getBoundingClientRect();
    const sx = imgNatural.w / rect.width;
    const sy = imgNatural.h / rect.height;
    return { x: (x - rect.left) * sx, y: (y - rect.top) * sy };
    // Wir rechnen in Natural-Pixeln (originale Bildauflösung), damit Maßstab konsistent ist
  }

  function onClickOverlay(e: React.MouseEvent<HTMLDivElement>) {
    const p = imgToNatural(e.clientX, e.clientY);
    if (!p) return;
    setPoints(prev => {
      if (prev.length >= 2) return [p]; // nach zwei Klicks neu beginnen
      return [...prev, p];
    });
  }

  async function onAnalyze() {
    if (!file) return alert('Bitte zuerst ein Bild wählen.');
    if (!scalePxPerMm) return alert('Bitte zwei Punkte setzen und reale Distanz in mm angeben.');

    setBusy(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('scale_px_per_mm', String(scalePxPerMm));

      // Optional: Hinweise (werden von der API bevorzugt, falls gesetzt)
      // fd.append('tile_w', ''); fd.append('tile_h', ''); fd.append('grout', '');

      // Die App läuft hinter /nextjs – API daher unter /nextjs/api/analyze
      const res = await fetch('/nextjs/api/analyze', { method: 'POST', body: fd });
      const json = await res.json();
      setResult(json);
    } catch (err: any) {
      setResult({ ok: false, error: String(err?.message || err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Kalibrierung (2-Punkt)</h1>

      <div className="flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2">
          <span className="text-sm">Bild wählen:</span>
          <input type="file" accept="image/*" onChange={onPickFile} />
        </label>

        <label className="inline-flex items-center gap-2">
          <span className="text-sm">Reale Distanz (mm):</span>
          <input
            className="border rounded px-2 py-1 w-28"
            value={distanceMm}
            onChange={e => setDistanceMm(e.target.value)}
            inputMode="numeric"
            placeholder="mm"
          />
        </label>

        <div className="text-sm grid grid-cols-2 gap-x-3">
          <div className="opacity-70">Pixel-Distanz:</div>
          <div className="font-mono">{pxDistance ? pxDistance.toFixed(1) : '—'}</div>
          <div className="opacity-70">px / mm:</div>
          <div className="font-mono">{scalePxPerMm ? scalePxPerMm.toFixed(4) : '—'}</div>
        </div>

        <button
          className="px-3 py-1 rounded bg-black text-white disabled:opacity-40"
          disabled={!file || !scalePxPerMm || busy}
          onClick={onAnalyze}
        >
          {busy ? 'Analysiere…' : 'Analysieren (mit Maßstab)'}
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative border rounded overflow-hidden max-w-full"
        style={{ width: 'min(100%, 900px)' }}
        onClick={onClickOverlay}
      >
        {imgUrl ? (
          <>
            <img
              ref={imgRef}
              src={imgUrl}
              alt="preview"
              className="block max-w-full h-auto select-none"
              onLoad={e => {
                const el = e.currentTarget;
                setImgNatural({ w: el.naturalWidth, h: el.naturalHeight });
              }}
            />
            {/* SVG Overlay zeichnet Linie & Punkte in ViewBox=Naturalgröße, passt sich der IMG-Größe an */}
            {imgNatural && (
              <svg
                className="absolute inset-0 pointer-events-none"
                viewBox={`0 0 ${imgNatural.w} ${imgNatural.h}`}
                preserveAspectRatio="none"
              >
                {points[0] && (
                  <circle cx={points[0].x} cy={points[0].y} r={10} fill="none" strokeWidth={4} stroke="red" />
                )}
                {points[1] && (
                  <>
                    <circle cx={points[1].x} cy={points[1].y} r={10} fill="none" strokeWidth={4} stroke="red" />
                    <line
                      x1={points[0].x} y1={points[0].y}
                      x2={points[1].x} y2={points[1].y}
                      stroke="red" strokeWidth={4}
                    />
                  </>
                )}
              </svg>
            )}
          </>
        ) : (
          <div className="p-12 text-center text-sm opacity-70">Kein Bild ausgewählt</div>
        )}
      </div>

      <div className="mt-2">
        <h2 className="font-medium">Ergebnis</h2>
        <pre className="bg-neutral-100 p-3 rounded overflow-auto text-sm">
{JSON.stringify(result, null, 2)}
        </pre>
      </div>

      <p className="text-xs opacity-70">
        Tipp: Klicke zwei Punkte auf derselben Fuge (oder zwei Fugenlinien) mit bekannter Distanz.
        Die API erhält <code>scale_px_per_mm</code> und gibt zusätzlich mm-Werte zurück.
      </p>
    </div>
  );
}
