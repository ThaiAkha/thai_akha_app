import { useState, useEffect } from 'react';
import { useQuery } from '@thaiakha/shared/query';
import { Copy, Check, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { type MediaAsset } from '@thaiakha/shared';

const FRONT_URL = import.meta.env.VITE_FRONT_APP_URL || 'https://www.thaiakha.com';

interface Usage { label: string; url: string; }

/** Reverse-lookup: which public page(s) use this photo (FK on media_assets.asset_id, text). */
async function findUsage(assetId: string): Promise<Usage[]> {
  if (!assetId) return [];
  const out: Usage[] = [];
  const esc = assetId; // asset_ids are slug-like, safe for the PostgREST filter
  // Le gallerie ora vivono in gallery_items (fonte unica): l'uso "in galleria" si
  // ricava da gallery_items (asset_id = X) → gallery_id → entità (recipe_/class_/slug culture).
  const [rec, news, cult, herb, pages, cats, gal] = await Promise.all([
    supabase.from('recipes').select('name, slug').eq('cover_asset_id', esc),
    supabase.from('akha_news').select('title, slug').eq('cover_asset_id', esc),
    supabase.from('culture_sections').select('title, slug').eq('cover_asset_id', esc),
    supabase.from('herb_teas').select('slug').eq('cover_asset_id', esc),
    supabase.from('site_metadata').select('page_slug').eq('cover_asset_id', esc),
    supabase.from('content_categories').select('title, slug').or(`cover_asset_id.eq.${esc},avatar_asset_id.eq.${esc}`),
    supabase.from('gallery_items').select('gallery_id').eq('asset_id', esc),
  ]);
  (rec.data || []).forEach((r) => out.push({ label: `Recipe · ${r.name}`, url: `${FRONT_URL}/authentic-thai-akha-recipes/${r.slug}` }));
  (news.data || []).forEach((r) => out.push({ label: `News · ${r.title}`, url: `${FRONT_URL}/thai-cooking-tips-news/${r.slug}` }));
  (cult.data || []).forEach((r) => out.push({ label: `Culture · ${r.title}`, url: `${FRONT_URL}/akha-culture-highland-heritage/${r.slug}` }));
  (herb.data || []).forEach((r) => out.push({ label: `Herb tea · ${r.slug}`, url: `${FRONT_URL}/${r.slug}` }));
  (pages.data || []).forEach((r) => out.push({ label: `Page · ${r.page_slug}`, url: `${FRONT_URL}/${r.page_slug}` }));
  (cats.data || []).forEach((r) => out.push({ label: `Category · ${r.title}`, url: `${FRONT_URL}/${r.slug}` }));
  // gallery_items → usage per gallery_id (convenzione: recipe_<slug>[_culture], class_*, slug raw = culture)
  (gal.data || []).forEach((g) => {
    const gid: string = g.gallery_id ?? '';
    if (gid.startsWith('recipe_')) {
      const rslug = gid.replace(/^recipe_/, '').replace(/_culture$/, '');
      out.push({ label: `Recipe gallery · ${rslug}`, url: `${FRONT_URL}/authentic-thai-akha-recipes/${rslug}` });
    } else if (gid.startsWith('class_')) {
      out.push({ label: `Class gallery · ${gid}`, url: FRONT_URL });
    } else if (gid) {
      out.push({ label: `Culture gallery · ${gid}`, url: `${FRONT_URL}/akha-culture-highland-heritage/${gid}` });
    }
  });
  // dedup per url (cover + gallery della stessa entità → una sola voce)
  return Array.from(new Map(out.map(u => [u.url, u])).values());
}

/** Build Pinterest hashtags from free-text tags. */
function toHashtags(tags?: string[] | null): string {
  if (!tags?.length) return '';
  return tags
    .map(t => '#' + t.replace(/[^a-zA-Z0-9]+/g, ''))
    .filter(h => h.length > 1)
    .join(' ');
}

interface FieldRowProps {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
  multiline?: boolean;
  href?: string;
}

function FieldRow({ label, value, onCopy, copied, multiline, href }: FieldRowProps) {
  const empty = !value;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest text-gray-400">{label}</span>
        <div className="flex items-center gap-1">
          {href && value && (
            <a href={href} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-400 hover:text-primary-500 transition-colors" title="Open">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            type="button"
            onClick={onCopy}
            disabled={empty}
            className="p-1 text-gray-400 hover:text-primary-500 disabled:opacity-30 transition-colors"
            title="Copy"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      <p className={`text-xs ${empty ? 'text-gray-300 italic dark:text-gray-600' : 'text-gray-700 dark:text-gray-200'} ${multiline ? 'whitespace-pre-wrap break-words' : 'truncate'}`}>
        {empty ? '— missing —' : value}
      </p>
    </div>
  );
}

const MediaPinterestCard: React.FC<{ asset: MediaAsset }> = ({ asset }) => {
  const title: string = asset.title || '';
  const caption: string = asset.caption || '';
  const altText: string = asset.alt_text || '';
  const imageUrl: string = asset.image_url || '';
  const tags: string[] = Array.isArray(asset.tags) ? asset.tags : [];
  const assetId: string = asset.asset_id || '';

  const hashtags = toHashtags(tags);
  const description = [caption, hashtags].filter(Boolean).join('\n\n');

  const [pickIdx, setPickIdx] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  // Data layer (#86): reverse-lookup in cache per asset (7 tabelle in una Promise.all):
  // riaprire lo stesso asset non rifa' le query, StrictMode non le raddoppia.
  const usageQuery = useQuery({
    queryKey: ['media_asset_usage', assetId] as const,
    queryFn: () => findUsage(assetId).catch((): Usage[] => []),
    enabled: assetId.length > 0,
  });
  const usages: Usage[] = usageQuery.data ?? [];
  const usageLoading = assetId.length > 0 && usageQuery.isPending;

  // Cambio asset: il link scelto riparte dal primo.
  useEffect(() => { setPickIdx(0); }, [assetId]);

  const link = usages.length ? usages[Math.min(pickIdx, usages.length - 1)].url : FRONT_URL;
  const linkIsDerived = usages.length > 0;

  const copy = (key: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(c => (c === key ? null : c)), 1500);
  };

  const copyAll = () => {
    const block = [title, description, `🔗 ${link}`].filter(Boolean).join('\n\n');
    copy('all', block);
  };

  const missing = [!title && 'title', !caption && 'caption', !tags.length && 'tags'].filter(Boolean);

  return (
    <section className="rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50/40 dark:bg-red-500/5 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white">
        <span className="text-base leading-none">📌</span>
        <h3 className="text-xs font-black uppercase tracking-[0.2em]">Pinterest — ready to share</h3>
      </div>

      <div className="p-4 space-y-4">
        <FieldRow label="Pin title" value={title} copied={copied === 'title'} onCopy={() => copy('title', title)} />
        <FieldRow label="Description (caption + hashtags)" value={description} multiline copied={copied === 'desc'} onCopy={() => copy('desc', description)} />
        <FieldRow label="Alt text" value={altText} copied={copied === 'alt'} onCopy={() => copy('alt', altText)} />
        <FieldRow label="Image URL" value={imageUrl} href={imageUrl} copied={copied === 'img'} onCopy={() => copy('img', imageUrl)} />

        {/* Destination link — auto-derived from where the photo is used */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
              <LinkIcon className="w-3 h-3" /> Destination link
            </span>
            <div className="flex items-center gap-1">
              <a href={link} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-400 hover:text-primary-500 transition-colors" title="Open">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button type="button" onClick={() => copy('link', link)} className="p-1 text-gray-400 hover:text-primary-500 transition-colors" title="Copy">
                {copied === 'link' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          {usages.length > 1 ? (
            <select
              value={pickIdx}
              onChange={e => setPickIdx(Number(e.target.value))}
              className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            >
              {usages.map((u, i) => <option key={u.url} value={i}>{u.label}</option>)}
            </select>
          ) : (
            <p className="text-xs text-gray-700 dark:text-gray-200 break-words">{link}</p>
          )}
          <p className="text-xs text-gray-400">
            {usageLoading ? 'Finding pages that use this photo…'
              : linkIsDerived ? `Auto-derived · used in ${usages.length} place${usages.length > 1 ? 's' : ''}`
              : 'Not used on any page yet — falling back to the site'}
          </p>
        </div>

        {missing.length > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-lg px-2 py-1.5">
            For a stronger pin, add: {missing.join(', ')}.
          </p>
        )}

        <button
          type="button"
          onClick={copyAll}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest transition-colors"
        >
          {copied === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied === 'all' ? 'Copied!' : 'Copy all for Pinterest'}
        </button>
      </div>
    </section>
  );
};

export default MediaPinterestCard;
