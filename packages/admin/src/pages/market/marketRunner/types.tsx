/**
 * Market Runner - tipi (riga lista, run, contatto negozio) + icona per negozio.
 * Estratti da MarketRunner.tsx (#16 split monstre) a comportamento invariato.
 * Estensione .tsx di proposito: getShopIcon ritorna JSX (icone lucide). Non "correggere" in .ts.
 */
import { Store, Utensils, Wheat, Egg, Apple, Fish, Beef, Soup } from 'lucide-react';

export interface ShoppingItem {
    id: string;
    name: string;
    unit: string;
    quantity: number;
    target_shop: string;
    is_bought?: boolean;
    actual_price?: number;
}

export interface MarketRun {
    id: string;
    run_date: string;
    items_snapshot: ShoppingItem[];
    status: string;
}

export interface ShopContact {
    shop_name: string;
    line_id: string | null;
    phone_number: string | null;
}

/**
 * Utility to map dynamic shop names to appropriate Lucide Icons
 */
export const getShopIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('veg') || n.includes('lady')) return <Utensils className="w-5 h-5" />;
    if (n.includes('meat') || n.includes('butcher')) return <Beef className="w-5 h-5" />;
    if (n.includes('curry') || n.includes('paste')) return <Soup className="w-5 h-5" />;
    if (n.includes('rice') || n.includes('noodle')) return <Wheat className="w-5 h-5" />;
    if (n.includes('egg') || n.includes('tofu')) return <Egg className="w-5 h-5" />;
    if (n.includes('fruit')) return <Apple className="w-5 h-5" />;
    if (n.includes('sea') || n.includes('fish')) return <Fish className="w-5 h-5" />;
    if (n.includes('makro') || n.includes('lotus') || n.includes('7-11')) return <Store className="w-5 h-5" />;
    return <Store className="w-5 h-5" />;
};
