import React from 'react';
import { Package, ShoppingBag } from 'lucide-react';
import { DataExplorerContent, GridCard, DataExplorerRow, DataCardContent, DataRowText } from '../../../components/data-explorer';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../../components/ui/table';
import Badge from '../../../components/ui/badge/Badge';
import Checkbox from '../../../components/form/input/Checkbox';
import { Product } from '../../../hooks/useAdminInventory';

interface InventoryContentProps {
    loading: boolean;
    viewMode: 'table' | 'grid';
    filteredProducts: Product[];
    editingProduct: Product;
    onProductSelect: (p: Product) => void;
    selectedIds: Set<string>;
    onToggleSelectAll: () => void;
    onToggleSelectRow: (p: Product) => void;
}

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
};

const InventoryContent: React.FC<InventoryContentProps> = ({
    loading,
    viewMode,
    filteredProducts,
    editingProduct,
    onProductSelect,
    selectedIds,
    onToggleSelectAll,
    onToggleSelectRow,
}) => {
    return (
        <DataExplorerContent
            loading={loading && filteredProducts.length === 0}
            emptyIcon={<ShoppingBag className="w-12 h-12 opacity-10" />}
            emptyMessage="No products found"
        >
            {filteredProducts.length > 0 && viewMode === 'grid' && (
                <div className="p-5">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredProducts.map((product) => (
                            <GridCard
                                key={product.id}
                                item={product}
                                selected={editingProduct.id === product.id}
                                onClick={() => onProductSelect(product)}
                                imageUrl={product.catalog_image_url}
                                imageIcon={<Package className="w-8 h-8" />}
                                renderFields={(p: any) => (
                                    <DataCardContent
                                        title={p.item_name}
                                        subtitle={p.sku}
                                        badges={
                                            <>
                                                <Badge color="light" size="sm" className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 border-gray-200">
                                                    {p.category_id}
                                                </Badge>
                                                {p.stock_quantity < 5 && (
                                                    <Badge color="error" size="sm" className="text-[10px] font-black uppercase tracking-widest animate-pulse">
                                                        LOW STOCK: {p.stock_quantity}
                                                    </Badge>
                                                )}
                                                {!p.is_active && (
                                                    <Badge color="error" size="sm" className="text-[9px] font-bold">INACTIVE</Badge>
                                                )}
                                            </>
                                        }
                                        footerLeft={
                                            <p className="text-[10px] font-mono font-bold text-gray-400 tracking-tighter uppercase truncate">
                                                ID: {String(p.id).substring(0, 8)}
                                            </p>
                                        }
                                        footerRight={
                                            <p className="text-sm font-black text-brand-600 dark:text-brand-400">
                                                {formatCurrency(p.price_thb)}
                                            </p>
                                        }
                                    />
                                )}
                            />
                        ))}
                    </div>
                </div>
            )}

            <Table className="text-xs">
                <TableHeader className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                    <TableRow>
                        <TableCell isHeader className="px-4 py-3 w-10">
                            <Checkbox
                                checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                                onChange={onToggleSelectAll}
                            />
                        </TableCell>
                        <TableCell isHeader className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">SKU</TableCell>
                        <TableCell isHeader className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Product Name</TableCell>
                        <TableCell isHeader className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Category</TableCell>
                        <TableCell isHeader className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Stock</TableCell>
                        <TableCell isHeader className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Price</TableCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredProducts.map((p, idx) => (
                        <DataExplorerRow
                            key={p.id}
                            idx={idx}
                            selected={editingProduct.id === p.id}
                            onClick={() => onProductSelect(p)}
                        >
                            <TableCell className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                    checked={selectedIds.has(String(p.id))}
                                    onChange={() => onToggleSelectRow(p)}
                                />
                            </TableCell>
                            <TableCell className="px-4 py-3">
                                <DataRowText
                                    description={p.sku}
                                />
                            </TableCell>
                            <TableCell className="px-4 py-3">
                                <DataRowText
                                    title={p.item_name}
                                />
                            </TableCell>
                            <TableCell className="px-4 py-3">
                                <DataRowText
                                    extra={p.category_id}
                                />
                            </TableCell>
                            <TableCell className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-tighter">
                                {p.stock_quantity < 5 ? (
                                    <Badge color="error" size="sm">{p.stock_quantity}</Badge>
                                ) : (
                                    <span className="text-gray-600 dark:text-gray-400">{p.stock_quantity}</span>
                                )}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-right">
                                <DataRowText
                                    title={formatCurrency(p.price_thb)}
                                    className="text-brand-600 dark:text-brand-400"
                                />
                            </TableCell>
                        </DataExplorerRow>
                    ))}
                </TableBody>
            </Table>
        </DataExplorerContent>
    );
};

export default InventoryContent;
