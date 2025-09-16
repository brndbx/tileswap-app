import { NextResponse } from "next/server";

export const runtime = "nodejs"; // sicher Node-Runtime

function toNumMaybe(v: FormDataEntryValue | null): number | undefined {
  if (v == null) return undefined;
  const s = String(v).trim().replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function extractFromFilename(name: string) {
  // Beispiele:
  //   img_30x60_g2.jpg
  //   tile-20x20-grout1.5.png
  //   60x120.jpg
  const out: { tile_w?: number; tile_h?: number; grout?: number } = {};

  // 30x60, 20X20, 60x120.5
  const mWH = name.match(/(\d+(?:[.,]\d+)?)\s*[xX]\s*(\d+(?:[.,]\d+)?)/);
  if (mWH) {
    const w = Number(mWH[1].replace(",", "."));
    const h = Number(mWH[2].replace(",", "."));
    if (Number.isFinite(w)) out.tile_w = w;
    if (Number.isFinite(h)) out.tile_h = h;
  }

  // grout / g Nummer (g2, grout2, gap2.5)
  const mG = name.match(/(?:grout|gap|g)[ _-]?(\d+(?:[.,]\d+)?)/i);
  if (mG) {
    const g = Number(mG[1].replace(",", "."));
    if (Number.isFinite(g)) out.grout = g;
  }

  return out;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    // optionale numerische Felder zulassen
    const hinted = {
      tile_w: toNumMaybe(form.get("tile_w")),
      tile_h: toNumMaybe(form.get("tile_h")),
      grout:  toNumMaybe(form.get("grout")),
    };

    let fromName = {};
    let meta: any = null;

    if (file) {
      const name = (file as any).name ?? "unknown";
      const type = file.type || "application/octet-stream";
      const size = file.size || 0;
      fromName = extractFromFilename(name);
      meta = { name, type, size };
    }

    const params = {
      tile_w: hinted.tile_w ?? (fromName as any).tile_w ?? undefined,
      tile_h: hinted.tile_h ?? (fromName as any).tile_h ?? undefined,
      grout:  hinted.grout  ?? (fromName as any).grout  ?? undefined,
    };

    return NextResponse.json({
      ok: true,
      meta,
      params,
      note: "Numerik aus Formularfeldern und/oder Dateiname extrahiert. Echte CV-Erkennung kann später ergänzt werden.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}

// Optional: GET für schnelle Prüfung
export async function GET() {
  return NextResponse.json({ ok: true, hello: "analyze" });
}
