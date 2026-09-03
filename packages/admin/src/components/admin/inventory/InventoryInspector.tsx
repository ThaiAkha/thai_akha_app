import React from 'react';
import { useTranslation } from 'react-i18next';
import { ImageIcon, Eye, EyeOff } from 'lucide-react';
import { SectionTitle } from '../../typography';
import Input from '../../../components/form/input/InputField';
import SelectField from '../../../components/form/input/SelectField';
import TextArea from '../../../components/form/input/TextArea';
import DeleteZone from '../../../components/ui/DeleteZone';
import { cn } from '@thaiakha/shared/lib/utils';
import { Product, Category } from '../../../hooks/useAdminInventory';

interface InventoryInspectorProps {
    editingProduct: Product;
    onEditingProductChange: (p: Product) => void;
    categories: Category[];
    isEditing: boolean;
    isNew: boolean;
    onDelete: () => void;
}

/**
 * Corpo dell'inspector Inventory: vive dentro il Body di DataExplorerInspector, che e'
 * l'unico proprietario dello scroll (#93 B3). Niente contenitore scrollabile annidato.
 * La DeleteZone a 1 step resta (stesso chrome di InspectorDeleteZone, senza conferma).
 */
const InventoryInspector: React.FC<InventoryInspectorProps> = ({
    editingProduct,
    onEditingProductChange,
    categories,
    isEditing,
    isNew,
    onDelete,
}) => {
    const { t } = useTranslation('inventory');
    const handleChange = <K extends keyof Product>(field: K, value: Product[K]) => {
        onEditingProductChange({ ...editingProduct, [field]: value });
    };

    return (
        <>
            <div className="px-6 py-6 bg-gray-50/10 dark:bg-white/[0.02]">
                <div className="space-y-8">
                    {/* Media Section */}
                    <div className="aspect-video bg-gray-50/50 dark:bg-white/[0.02] rounded-3xl overflow-hidden relative group border border-gray-100 dark:border-white/[0.05] shadow-inner transition-transform duration-500 hover:scale-[1.02]">
                        {editingProduct.catalog_image_url ? (
                            <img src={editingProduct.catalog_image_url} className="w-full h-full object-contain" alt="Preview" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-sub gap-3">
                                <ImageIcon className="w-12 h-12 opacity-20" />
                                <span className="text-xs uppercase font-black tracking-[0.2em] opacity-50">{t('inspector.noImage')}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-6 backdrop-blur-sm">
                            <div className="w-full space-y-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <SectionTitle as="h6" tone="sub" className="mb-2 text-white">{t('inspector.updateImageUrl')}</SectionTitle>
                                <Input
                                    placeholder="https://..."
                                    value={editingProduct.catalog_image_url}
                                    onChange={(e) => handleChange('catalog_image_url', e.target.value)}
                                    className="h-10 text-xs bg-white/90 border-none shadow-xl"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="space-y-1.5">
                            <SectionTitle as="h6" tone="sub" className="mb-2">{t('inspector.fieldName')}</SectionTitle>
                            <Input
                                placeholder={t('inspector.placeholderName')}
                                value={editingProduct.item_name}
                                onChange={(e) => handleChange('item_name', e.target.value)}
                                disabled={!isEditing && !isNew}
                                className={cn(
                                    "text-sm font-medium bg-surface dark:bg-surface h-10 px-3 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500/20 transition-all",
                                    (!isEditing && !isNew) && "opacity-60 cursor-not-allowed bg-gray-50/50"
                                )}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <SectionTitle as="h6" tone="sub" className="mb-2">{t('inspector.fieldSku')}</SectionTitle>
                            <Input
                                placeholder="SKU-CODE"
                                value={editingProduct.sku}
                                onChange={(e) => handleChange('sku', e.target.value)}
                                disabled={!isEditing && !isNew}
                                className={cn(
                                    "text-sm font-medium bg-surface dark:bg-surface h-10 px-3 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500/20 transition-all font-mono uppercase",
                                    (!isEditing && !isNew) && "opacity-60 cursor-not-allowed bg-gray-50/50"
                                )}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <SectionTitle as="h6" tone="sub" className="mb-2">{t('inspector.fieldCategory')}</SectionTitle>
                            <SelectField
                                value={editingProduct.category_id}
                                onChange={(e) => handleChange('category_id', e.target.value)}
                                disabled={!isEditing && !isNew}
                            >
                                <option value="">{t('inspector.selectCategory')}</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                                ))}
                            </SelectField>
                        </div>

                        <div className="space-y-1.5">
                            <SectionTitle as="h6" tone="sub" className="mb-2">{t('inspector.fieldStock')}</SectionTitle>
                            <Input
                                type="number"
                                value={editingProduct.stock_quantity}
                                onChange={(e) => handleChange('stock_quantity', parseInt(e.target.value) || 0)}
                                disabled={!isEditing && !isNew}
                                className={cn(
                                    "text-sm font-medium bg-surface dark:bg-surface h-10 px-3 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500/20 transition-all",
                                    (!isEditing && !isNew) && "opacity-60 cursor-not-allowed bg-gray-50/50"
                                )}
                            />
                        </div>

                        <div className="space-y-1.5">
                            {/* #170: soglia di riassortimento, prima viveva solo nel DB (06245 §3) */}
                            <SectionTitle as="h6" tone="sub" className="mb-2">{t('inspector.fieldReorderPoint')}</SectionTitle>
                            <Input
                                type="number"
                                value={editingProduct.reorder_point}
                                onChange={(e) => handleChange('reorder_point', parseInt(e.target.value) || 0)}
                                disabled={!isEditing && !isNew}
                                className={cn(
                                    "text-sm font-medium bg-surface dark:bg-surface h-10 px-3 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500/20 transition-all",
                                    (!isEditing && !isNew) && "opacity-60 cursor-not-allowed bg-gray-50/50"
                                )}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <SectionTitle as="h6" tone="sub" className="mb-2">{t('inspector.fieldPrice')}</SectionTitle>
                            <Input
                                type="number"
                                value={editingProduct.price_thb}
                                onChange={(e) => handleChange('price_thb', parseFloat(e.target.value) || 0)}
                                disabled={!isEditing && !isNew}
                                className={cn(
                                    "text-sm font-medium bg-surface dark:bg-surface h-10 px-3 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500/20 transition-all",
                                    (!isEditing && !isNew) && "opacity-60 cursor-not-allowed bg-gray-50/50"
                                )}
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <SectionTitle as="h6" tone="sub" className="mb-2">{t('inspector.fieldDescription')}</SectionTitle>
                            <TextArea
                                rows={4}
                                placeholder={t('inspector.descPlaceholder')}
                                value={editingProduct.description_internal || ''}
                                onChange={(val) => handleChange('description_internal', val)}
                                disabled={!isEditing && !isNew}
                                className={cn(
                                    "w-full text-sm font-medium bg-surface dark:bg-surface px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-primary-500/20 transition-all",
                                    (!isEditing && !isNew) && "opacity-60 cursor-not-allowed bg-gray-50/50"
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:col-span-2">
                            <button
                                onClick={() => handleChange('is_active', !editingProduct.is_active)}
                                disabled={!isEditing && !isNew}
                                className={cn(
                                    "p-4 rounded-2xl border transition-all flex flex-col gap-1 items-start",
                                    // le tinte -50/50 non avevano un dark:, quindi in dark il fondo
                                    // restava chiaro e nessun testo ci passava: prima la superficie, poi il token
                                    editingProduct.is_active
                                        ? "bg-green-50/50 border-green-100 dark:bg-green-500/10 dark:border-green-500/25"
                                        : "bg-red-50/50 border-red-100 dark:bg-red-500/10 dark:border-red-500/25",
                                    (!isEditing && !isNew) && "opacity-60 cursor-not-allowed"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {editingProduct.is_active ? <Eye className="w-3 h-3 text-success" /> : <EyeOff className="w-3 h-3 text-error" />}
                                    <span className="text-xs font-black uppercase tracking-widest text-sub">{t('inspector.statusLabel')}</span>
                                </div>
                                <span className={cn("text-xs font-bold", editingProduct.is_active ? "text-success" : "text-error")}>
                                    {editingProduct.is_active ? t('inspector.active') : t('inspector.inactive')}
                                </span>
                            </button>
                            <button
                                onClick={() => handleChange('is_visible_online', !editingProduct.is_visible_online)}
                                disabled={!isEditing && !isNew}
                                className={cn(
                                    "p-4 rounded-2xl border transition-all flex flex-col gap-1 items-start",
                                    editingProduct.is_visible_online
                                        ? "bg-blue-50/50 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/25"
                                        : "bg-gray-50/50 border-gray-100 dark:bg-white/[0.05] dark:border-gray-700",
                                    (!isEditing && !isNew) && "opacity-60 cursor-not-allowed"
                                )}
                            >
                                <span className="text-xs font-black uppercase tracking-widest text-sub">{t('inspector.visibilityLabel')}</span>
                                {/* il ramo "nascosto" e' neutro, non un errore: text-body, non text-sub (4.30 sulla tinta) */}
                                <span className={cn("text-xs font-bold", editingProduct.is_visible_online ? "text-info" : "text-body")}>
                                    {editingProduct.is_visible_online ? t('inspector.visOnline') : t('inspector.visHidden')}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Zone */}
            {isEditing && !isNew && editingProduct.id && (
                <DeleteZone label={t('inspector.deleteProduct')} onDelete={onDelete} />
            )}
        </>
    );
};

export default InventoryInspector;
