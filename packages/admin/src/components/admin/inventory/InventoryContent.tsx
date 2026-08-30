import React from 'react';
import { Package, ShoppingBag } from 'lucide-react';
import {
    DataExplorerContent,
    GridCard,
    DataExplorerRow,
    DataCardContent,
    DataRowText,
    DataTableHead,
    HeaderCell,
    SelectCell,
    CardGrid,
} from '../../../components/data-explorer';
import { Table, TableBody, TableCell } from '../../../components/ui/table';
import Badge from '../../../components/ui/badge/Badge';
import { Paragraph, SectionTitle } from '../../typography';
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
            isEmpty={filteredProducts.length === 0}
        >
            {filteredProducts.length > 0 && viewMode === 'grid' && (
                <CardGrid padding={5} gap={4}>
                    {filteredProducts.map((product) => (
                        <GridCard
                            key={product.id}
                            item={product}
                            selected={editingProduct.id === product.id}
                            onClick={() => onProductSelect(product)}
                            imageUrl={product.catalog_image_url}
                            imageIcon={<Package className="w-8 h-8" />}
                            renderFields={(p: Product) => (
                                <DataCardContent
                                    title={p.item_name}
                                    subtitle={p.sku}
                                    badges={
                                        <>
                                            <Badge color="light" size="sm" className="text-xs font-bold uppercase tracking-widest bg-gray-100 border-gray-200">
                                                {p.category_id}
                                            </Badge>
                                            {p.stock_quantity < 5 && (
                                                <Badge color="error" size="sm" className="text-xs font-black uppercase tracking-widest animate-pulse">
                                                    LOW STOCK: {p.stock_quantity}
                                                </Badge>
                                            )}
                                            {!p.is_active && (
                                                <Badge color="error" size="sm" className="text-xs font-bold">INACTIVE</Badge>
                                            )}
                                        </>
                                    }
                                    footerLeft={
                                        <SectionTitle tone="sub" className="font-mono tracking-tighter truncate">
                                            ID: {String(p.id).substring(0, 8)}
                                        </SectionTitle>
                                    }
                                    footerRight={
                                        <Paragraph size="sm" className="text-primary-600 dark:text-primary-400 font-black">
                                            {formatCurrency(p.price_thb)}
                                        </Paragraph>
                                    }
                                />
                            )}
                        />
                    ))}
                </CardGrid>
            )}

            {/* Solo in modalita' table: prima era incondizionato e in grid mode la
                tabella compariva SOTTO la griglia (bug, deciso dall'owner 2026-08-28). */}
            {filteredProducts.length > 0 && viewMode === 'table' && (
                <Table className="text-xs">
                    <DataTableHead>
                        <HeaderCell
                            width="w-10"
                            selectAll={{
                                checked: selectedIds.size === filteredProducts.length && filteredProducts.length > 0,
                                onToggle: onToggleSelectAll,
                            }}
                        />
                        <HeaderCell label="SKU" />
                        <HeaderCell label="Product Name" />
                        <HeaderCell label="Category" />
                        <HeaderCell label="Stock" align="center" />
                        <HeaderCell label="Price" align="right" />
                    </DataTableHead>
                    <TableBody>
                        {filteredProducts.map((p, idx) => (
                            <DataExplorerRow
                                key={p.id}
                                idx={idx}
                                selected={editingProduct.id === p.id}
                                onClick={() => onProductSelect(p)}
                            >
                                <SelectCell
                                    className="px-4 py-3"
                                    checked={selectedIds.has(String(p.id))}
                                    onToggle={() => onToggleSelectRow(p)}
                                />
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
                                <TableCell className="px-4 py-3 text-center text-xs font-black uppercase tracking-tighter">
                                    {p.stock_quantity < 5 ? (
                                        <Badge color="error" size="sm">{p.stock_quantity}</Badge>
                                    ) : (
                                        <span className="text-sub">{p.stock_quantity}</span>
                                    )}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-right">
                                    <DataRowText
                                        title={formatCurrency(p.price_thb)}
                                        className="text-primary-600 dark:text-primary-400"
                                    />
                                </TableCell>
                            </DataExplorerRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </DataExplorerContent>
    );
};

export default InventoryContent;
