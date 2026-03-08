import { ImageIcon, Eye, EyeOff } from 'lucide-react';
import SectionHeader from '../../ui/SectionHeader';
import Input from '../../../components/form/input/InputField';
import SelectField from '../../../components/form/input/SelectField';
import TextArea from '../../../components/form/input/TextArea';
import DeleteZone from '../../../components/ui/DeleteZone';
import { cn } from '../../../lib/utils';
import { Product, Category } from '../../../hooks/useAdminInventory';

interface InventoryInspectorProps {
    editingProduct: Product;
    onEditingProductChange: (p: Product) => void;
    categories: Category[];
    isEditing: boolean;
    isNew: boolean;
    onDelete: () => void;
}

const InventoryInspector: React.FC<InventoryInspectorProps> = ({
    editingProduct,
    onEditingProductChange,
    categories,
    isEditing,
    isNew,
    onDelete,
}) => {
    const handleChange = (field: keyof Product, value: any) => {
        onEditingProductChange({ ...editingProduct, [field]: value });
    };

    return (
        <div className="flex-1 overflow-auto no-scrollbar">
            <div className="px-6 py-6 bg-gray-50/10">
                <div className="space-y-8">
                    {/* Media Section */}
                    <div className="aspect-video bg-gray-50/50 dark:bg-white/[0.02] rounded-3xl overflow-hidden relative group border border-gray-100 dark:border-white/[0.05] shadow-inner transition-transform duration-500 hover:scale-[1.02]">
                        {editingProduct.catalog_image_url ? (
                            <img src={editingProduct.catalog_image_url} className="w-full h-full object-contain" alt="Preview" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                                <ImageIcon className="w-12 h-12 opacity-20" />
                                <span className="text-[10px] uppercase font-black tracking-[0.2em] opacity-50">No Image Provided</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-6 backdrop-blur-sm">
                            <div className="w-full space-y-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <SectionHeader title="Update Image URL" className="text-white" />
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
                            <SectionHeader title="Product Name" />
                            <Input
                                placeholder="Enter product name..."
                                value={editingProduct.item_name}
                                onChange={(e) => handleChange('item_name', e.target.value)}
                                disabled={!isEditing && !isNew}
                                className={cn(
                                    "text-sm font-medium bg-white dark:bg-gray-800 h-10 px-3 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-500/20 transition-all",
                                    (!isEditing && !isNew) && "opacity-60 cursor-not-allowed bg-gray-50/50"
                                )}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <SectionHeader title="SKU" />
                            <Input
                                placeholder="SKU-CODE"
                                value={editingProduct.sku}
                                onChange={(e) => handleChange('sku', e.target.value)}
                                disabled={!isEditing && !isNew}
                                className={cn(
                                    "text-sm font-medium bg-white dark:bg-gray-800 h-10 px-3 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-500/20 transition-all font-mono uppercase",
                                    (!isEditing && !isNew) && "opacity-60 cursor-not-allowed bg-gray-50/50"
                                )}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <SectionHeader title="Category" />
                            <SelectField
                                value={editingProduct.category_id}
                                onChange={(e) => handleChange('category_id', e.target.value)}
                                disabled={!isEditing && !isNew}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                                ))}
                            </SelectField>
                        </div>

                        <div className="space-y-1.5">
                            <SectionHeader title="Stock Quantity" />
                            <Input
                                type="number"
                                value={editingProduct.stock_quantity}
                                onChange={(e) => handleChange('stock_quantity', parseInt(e.target.value) || 0)}
                                disabled={!isEditing && !isNew}
                                className={cn(
                                    "text-sm font-medium bg-white dark:bg-gray-800 h-10 px-3 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-500/20 transition-all",
                                    (!isEditing && !isNew) && "opacity-60 cursor-not-allowed bg-gray-50/50"
                                )}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <SectionHeader title="Price (THB)" />
                            <Input
                                type="number"
                                value={editingProduct.price_thb}
                                onChange={(e) => handleChange('price_thb', parseFloat(e.target.value) || 0)}
                                disabled={!isEditing && !isNew}
                                className={cn(
                                    "text-sm font-medium bg-white dark:bg-gray-800 h-10 px-3 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-500/20 transition-all",
                                    (!isEditing && !isNew) && "opacity-60 cursor-not-allowed bg-gray-50/50"
                                )}
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <SectionHeader title="Internal Description" />
                            <TextArea
                                rows={4}
                                placeholder="Internal notes/description..."
                                value={editingProduct.description_internal || ''}
                                onChange={(val) => handleChange('description_internal', val)}
                                disabled={!isEditing && !isNew}
                                className={cn(
                                    "w-full text-sm font-medium bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-brand-500/20 transition-all",
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
                                    editingProduct.is_active
                                        ? "bg-green-50/50 border-green-100"
                                        : "bg-red-50/50 border-red-100",
                                    (!isEditing && !isNew) && "opacity-60 cursor-not-allowed"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {editingProduct.is_active ? <Eye className="w-3 h-3 text-green-600" /> : <EyeOff className="w-3 h-3 text-red-600" />}
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Status</span>
                                </div>
                                <span className={cn("text-xs font-bold", editingProduct.is_active ? "text-green-600" : "text-red-600")}>
                                    {editingProduct.is_active ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </button>
                            <button
                                onClick={() => handleChange('is_visible_online', !editingProduct.is_visible_online)}
                                disabled={!isEditing && !isNew}
                                className={cn(
                                    "p-4 rounded-2xl border transition-all flex flex-col gap-1 items-start",
                                    editingProduct.is_visible_online
                                        ? "bg-blue-50/50 border-blue-100"
                                        : "bg-gray-50/50 border-gray-100",
                                    (!isEditing && !isNew) && "opacity-60 cursor-not-allowed"
                                )}
                            >
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Visibility</span>
                                <span className={cn("text-xs font-bold", editingProduct.is_visible_online ? "text-blue-600" : "text-gray-600")}>
                                    {editingProduct.is_visible_online ? 'ONLINE' : 'HIDDEN'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Zone */}
            {isEditing && !isNew && editingProduct.id && (
                <DeleteZone label="DELETE PRODUCT" onDelete={onDelete} />
            )}
        </div>
    );
};

export default InventoryInspector;
