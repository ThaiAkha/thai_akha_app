/**
 * Manager Reports - tipi e helper condivisi dai 4 report (driver · market · agency · POS).
 * (Componenti UI condivisi: sharedUi.tsx - separati per il fast refresh.)
 * Estratto da ManagerReports.tsx (#16 split monstre) a comportamento invariato.
 */

export type ReportType = 'driver' | 'market_teacher' | 'market_logistic' | 'agency' | 'classes' | 'salary';
export type DriverView = 'active' | 'archive';

// Kitchen (teacher) and Logistic share market_runs — identical report, only shopper_role differs.
export const isMarketType = (t: ReportType): t is 'market_teacher' | 'market_logistic' => t === 'market_teacher' || t === 'market_logistic';
export const marketScope = (t: ReportType): 'teacher' | 'logistics' => (t === 'market_teacher' ? 'teacher' : 'logistics');

export const SESSION_LABEL: Record<string, string> = { morning_class: 'Morning', evening_class: 'Evening' };
export const cap = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function mondayOf(d: Date): Date { const day = (d.getDay() + 6) % 7; const m = new Date(d); m.setDate(d.getDate() - day); m.setHours(0, 0, 0, 0); return m; }
export const isoDate = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
export const fmtRange = (a: Date, b: Date) => `${a.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – ${b.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
export const monthStartEnd = (key: string): { start: string; end: string } => {
    const [y, m] = key.split('-').map(Number);
    const start = `${key}-01`;
    const end = new Date(Date.UTC(y, m, 0)).toISOString().split('T')[0]; // last day of month
    return { start, end };
};

export type PdfMode = 'print' | 'download';

/**
 * Consegna il PDF di render-report: download (link temporaneo) o stampa (iframe nascosto).
 * Stessa meccanica per driver/market/agency: prima era copiata 4 volte.
 */
export function deliverPdf(blob: Blob, mode: PdfMode, filename: string): void {
    const url = URL.createObjectURL(blob);
    if (mode === 'download') {
        const a = document.createElement('a'); a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
    } else {
        const iframe = document.createElement('iframe'); iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'; iframe.src = url;
        iframe.onload = () => { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); };
        document.body.appendChild(iframe); setTimeout(() => { iframe.remove(); URL.revokeObjectURL(url); }, 60000);
    }
}

/** Messaggio d'errore leggibile da una edge function (body JSON `message` se c'e'). */
export async function edgeErrorMessage(error: { message: string; context?: { json?: () => Promise<{ message?: string }> } }): Promise<string> {
    let detail = error.message;
    const ctx = error.context;
    if (ctx?.json) { try { detail = (await ctx.json())?.message ?? detail; } catch { /* ignore */ } }
    return detail;
}

