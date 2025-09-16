"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";

const TileSwapApp = dynamic(() => import("./TileSwapApp"), { ssr: false });

function toNumMaybe(v: string | null): number | undefined {
  if (v == null) return undefined;
  // Dezimalkomma erlauben
  const cleaned = v.replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

function pickFirst(sp: URLSearchParams, keys: string[]): string | null {
  for (const k of keys) {
    const v = sp.get(k);
    if (v !== null && v !== "") return v;
  }
  return null;
}

export default function VisualizerClient() {
  const sp = useSearchParams();

  useEffect(() => {
    // Rohdaten einmal in der Browser-Konsole ausgeben
    const entries = Array.from(sp.entries());
    // eslint-disable-next-line no-console
    console.log("Visualizer query entries:", entries);
  }, [sp]);

  const params = useMemo(() => {
    // Akzeptiere mehrere Schreibweisen
    const wRaw = pickFirst(sp as unknown as URLSearchParams, ["tile_w", "tileW", "w", "width"]);
    const hRaw = pickFirst(sp as unknown as URLSearchParams, ["tile_h", "tileH", "h", "height"]);
    const gRaw = pickFirst(sp as unknown as URLSearchParams, ["grout", "grout_w", "g", "gap"]);

    return {
      tile_w: toNumMaybe(wRaw),
      tile_h: toNumMaybe(hRaw),
      grout:  toNumMaybe(gRaw),
    };
  }, [sp]);

  return (
    <div className="p-4 space-y-4">
      <div className="rounded-xl border p-3 bg-white shadow-sm">
        <div className="text-sm font-medium mb-1">Service: tile_w / tile_h / grout</div>
        <div className="text-sm text-gray-700">
          {String(params.tile_w)} / {String(params.tile_h)} / {String(params.grout)}
        </div>
      </div>

      <div className="rounded-xl border p-3">
        <div className="text-xs text-gray-500 mb-1">Debug (alle Query-Parameter):</div>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(Array.from((sp as unknown as URLSearchParams).entries()), null, 2)}
        </pre>
      </div>

      {/* Falls TileSwapApp Props erwartet, hier übergeben */}
      {/* <TileSwapApp initialTileW={params.tile_w} initialTileH={params.tile_h} initialGrout={params.grout} /> */}
      <TileSwapApp />
    </div>
  );
}
