import React, { useState, useEffect, useMemo } from 'react';
import { AdminPageLayout } from '../components/layout/AdminPageLayout';
import { 
  Typography, 
  Button, 
  Input, 
  Textarea, 
  Card, 
  Badge, 
  Icon, 
  Toggle,
  Divider
} from '../components/ui/index';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface Product {
  id?: string;
  sku: string;
  item_name: string;
  description_internal: string;
  price_thb: number;
  cost_thb: number;
  stock_quantity: number;
  category_id: string;
  sub_category: string;
  catalog_image_url: string;
  is_active: boolean;
  is_visible_online: boolean;
}

interface Category {
  id: string;
  title: string;
  icon_name: string;
}

const EMPTY_PRODUCT: Product = {
  sku: '',
  item_name: '',
  description_internal: '',
  price_thb: 0,
  cost_thb: 0,
  stock_quantity: 0,
  category_id: 'beer',
  sub_category: 'general',
  catalog_image_url: '',
  is_active: true,
  is_visible_online: false
};

const AdminStoreManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  
  // Editor State
  const [editingProduct, setEditingProduct] = useState<Product>(EMPTY_PRODUCT);
  const [isNew, setIsNew] = useState(true);

  // --- 1. INITIAL LOAD ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('shop_akha').select('*').order('item_name'),
        supabase.from('shop_categories').select('*').order('title')
      ]);

      if (prodRes.data) setProducts(prodRes.data);
      if (catRes.data) setCategories(catRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. FILTERING LOGIC ---
  const filteredProducts = useMemo(() => {
    if (selectedCategoryId === 'all') return products;
    return products.filter(p => p.category_id === selectedCategoryId);
  }, [products, selectedCategoryId]);

  // --- 3. ACTIONS ---
  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setIsNew(false);
    // Scroll to top of editor on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setEditingProduct(EMPTY_PRODUCT);
    setIsNew(true);
  };

  const handleSave = async () => {
    if (!editingProduct.item_name || !editingProduct.sku) {
      alert("Please enter at least Name and SKU kha.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('shop_akha')
        .upsert(editingProduct);

      if (error) throw error;
      
      await fetchData(); // Refresh list
      handleReset(); // Clear form
      alert("Product saved successfully kha!");
    } catch (err: any) {
      console.error("Save error:", err);
      alert("Failed to save: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminPageLayout loading={loading} className="p-0">
      <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-80px)] bg-background">
        
          {/* ============================================================
            1. LEFT COLUMN: THE FILTER (20%)
            ============================================================ */}
        <aside className="hidden lg:flex w-[15%] flex-col bg-surface/30 backdrop-blur-sm p-6 space-y-6 shrink-0 border-r border-border">
          <Typography variant="h6" className="uppercase tracking-[0.2em] text-desc/40 ml-2">Categories</Typography>
          
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-300",
                selectedCategoryId === 'all' 
                  ? "bg-title text-surface border-title shadow-xl font-bold" 
                  : "bg-transparent border-transparent text-desc hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <Icon name="apps" />
              <span className="uppercase text-xs tracking-widest">All Items</span>
            </button>

            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-300 group",
                  selectedCategoryId === cat.id 
                    ? "bg-action text-white border-action shadow-action-glow font-bold" 
                    : "bg-transparent border-transparent text-desc hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <div className={cn(
                  "size-8 rounded-lg flex items-center justify-center transition-colors",
                  selectedCategoryId === cat.id ? "bg-white/20" : "bg-black/5 dark:bg-white/10 group-hover:bg-action/20"
                )}>
                  <Icon name={cat.icon_name || 'category'} size="sm" />
                </div>
                <span className="uppercase text-xs tracking-widest truncate">{cat.title}</span>
              </button>
            ))}
          </div>

          <Divider variant="mineral" />

          <div className="mt-auto space-y-4 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
            <div className="flex items-center gap-2 text-primary">
              <Icon name="info" size="sm" />
              <span className="text-[10px] font-black uppercase tracking-widest">Inventory Note</span>
            </div>
            <p className="text-[10px] text-desc/70 leading-relaxed italic">
              Updating stock here affects the POS real-time. Please ensure accuracy before saving kha.
            </p>
          </div>
        </aside>

        {/* ============================================================
            2. CENTER COLUMN: THE CATALOG (60%)
            ============================================================ */}
        <main className="w-full lg:w-[65%] flex flex-col border-r border-border bg-background/50">
          {/* Catalog Header */}
          <div className="p-8 border-b border-border bg-surface/30 backdrop-blur-md flex justify-between items-end shrink-0">
            <div>
              <Typography variant="h3" className="italic uppercase leading-none">Product Catalog</Typography>
              <Typography variant="caption" className="text-desc/60 mt-2 block">
                Managing {filteredProducts.length} items in <span className="text-title font-bold">{selectedCategoryId === 'all' ? 'All Categories' : selectedCategoryId}</span>
              </Typography>
            </div>
            <Badge variant="mineral" className="bg-action/10 text-action border-action/20">
              Live Stock
            </Badge>
          </div>

          {/* Grid Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredProducts.map((product) => {
                const isLowStock = product.stock_quantity < 5;
                const isActive = editingProduct.id === product.id;

                return (
                  <Card 
                    key={product.id}
                    variant="glass"
                    padding="none"
                    className={cn(
                      "group flex flex-col h-full rounded-lg border-2 transition-all duration-500 overflow-hidden",
                      isActive ? "border-action shadow-action-glow" : "border-border hover:border-action/50"
                    )}
                  >
                    {/* Square Image Container */}
                    <div className="relative aspect-square w-full bg-black/5 overflow-hidden">
                      <img 
                        src={product.catalog_image_url || 'https://via.placeholder.com/400'} 
                        className="w-full h-full object-cover"
                        alt={product.item_name}
                      />
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        {!product.is_active && (
                          <Badge variant="outline" className="bg-black/60 backdrop-blur-md text-red-400 border-red-500/50">Inactive</Badge>
                        )}
                        {product.is_visible_online && (
                          <Badge variant="mineral" className="bg-blue-500/80 text-white border-blue-400/50">Web Store</Badge>
                        )}
                      </div>

                      {/* Stock Badge */}
                      <div className={cn(
                        "absolute bottom-4 left-4 px-3 py-1.5 rounded-xl backdrop-blur-md border font-mono font-bold text-sm shadow-xl",
                        isLowStock 
                          ? "bg-red-500/90 text-white border-red-400 animate-pulse" 
                          : "bg-black/60 text-white border-white/20"
                      )}>
                        Stock: {product.stock_quantity}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <Typography variant="h5" className="uppercase tracking-tight leading-tight group-hover:text-action transition-colors">
                          {product.item_name}
                        </Typography>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs font-mono text-desc/60 mb-6">
                        <span>SKU: {product.sku}</span>
                        <span className="text-title font-bold text-lg">{product.price_thb} THB</span>
                      </div>

                      <div className="mt-auto pt-4 border-t border-border flex gap-3">
                        <Button 
                          variant={isActive ? 'action' : 'mineral'} 
                          fullWidth 
                          size="sm" 
                          icon="edit"
                          onClick={() => handleEdit(product)}
                        >
                          {isActive ? 'Editing...' : 'Edit Details'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </main>

        {/* ============================================================
            3. RIGHT COLUMN: THE EDITOR (20%)
            ============================================================ */}
        <aside className="w-full lg:w-[20%] border-l border-border bg-surface/50 backdrop-blur-xl lg:sticky lg:top-0 h-fit lg:h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar p-6 space-y-8 z-30">
          <div className="flex items-center justify-between">
            <Typography variant="h4" className="italic uppercase">
              {isNew ? 'New Product' : 'Edit Product'}
            </Typography>
            {!isNew && (
              <Button variant="mineral" size="xs" onClick={handleReset} icon="add">
                Create New
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {/* Image Preview Area */}
            <div className="group relative aspect-video rounded-[2rem] bg-black/5 dark:bg-white/5 border border-border overflow-hidden flex items-center justify-center">
              {editingProduct.catalog_image_url ? (
                <img 
                  src={editingProduct.catalog_image_url} 
                  className="w-full h-full object-contain" 
                  alt="Preview" 
                />
              ) : (
                <div className="text-center opacity-20">
                  <Icon name="image" size="xl" className="mb-2" />
                  <Typography variant="caption" className="block uppercase tracking-widest">No Image Preview</Typography>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                 <Input 
                  placeholder="Paste Image URL..." 
                  value={editingProduct.catalog_image_url}
                  onChange={(e) => setEditingProduct({...editingProduct, catalog_image_url: e.target.value})}
                  className="bg-surface text-xs"
                 />
              </div>
            </div>

            <Input 
              label="Item Name" 
              placeholder="e.g. Akha Craft Beer" 
              value={editingProduct.item_name}
              onChange={(e) => setEditingProduct({...editingProduct, item_name: e.target.value})}
            />

            <Input 
              label="SKU" 
              placeholder="AKH-BEER-01" 
              value={editingProduct.sku}
              onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Price (THB)" 
                type="number" 
                value={editingProduct.price_thb}
                onChange={(e) => setEditingProduct({...editingProduct, price_thb: Number(e.target.value)})}
              />
              <Input 
                label="Cost (THB)" 
                type="number" 
                value={editingProduct.cost_thb}
                onChange={(e) => setEditingProduct({...editingProduct, cost_thb: Number(e.target.value)})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-desc/60 tracking-widest ml-1">Category</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-title outline-none focus:border-action transition-all"
                  value={editingProduct.category_id}
                  onChange={(e) => setEditingProduct({...editingProduct, category_id: e.target.value})}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-surface text-title">{cat.title}</option>
                  ))}
                </select>
              </div>
              <Input 
                label="Current Stock" 
                type="number" 
                value={editingProduct.stock_quantity}
                onChange={(e) => setEditingProduct({...editingProduct, stock_quantity: Number(e.target.value)})}
              />
            </div>

            <Textarea 
              label="Internal Description" 
              rows={3}
              value={editingProduct.description_internal}
              onChange={(e) => setEditingProduct({...editingProduct, description_internal: e.target.value})}
              placeholder="Staff notes about sourcing or ingredients..."
            />

            <Divider variant="mineral" />

            <div className="grid grid-cols-2 gap-4">
              <Card variant="glass" padding="sm" className="flex items-center justify-between gap-3 rounded-2xl bg-white/5">
                <Typography variant="caption" className="font-bold uppercase">Active</Typography>
                <Toggle 
                  checked={editingProduct.is_active} 
                  onChange={(val) => setEditingProduct({...editingProduct, is_active: val})} 
                />
              </Card>
              <Card variant="glass" padding="sm" className="flex items-center justify-between gap-3 rounded-2xl bg-white/5">
                <Typography variant="caption" className="font-bold uppercase">Online</Typography>
                <Toggle 
                  checked={editingProduct.is_visible_online} 
                  onChange={(val) => setEditingProduct({...editingProduct, is_visible_online: val})} 
                />
              </Card>
            </div>

            <Button 
              variant="action" 
              fullWidth 
              size="xl" 
              icon={isSaving ? 'sync' : 'save'}
              isLoading={isSaving}
              onClick={handleSave}
              className="shadow-action-glow rounded-2xl"
            >
              {isNew ? 'Create Product' : 'Save Changes'}
            </Button>
          </div>
        </aside>

      </div>
    </AdminPageLayout>
  );
};

export default AdminStoreManager;