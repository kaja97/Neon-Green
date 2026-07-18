"use client";

import { useState, useEffect } from "react";
import { X, Store, Loader2, ChevronDown } from "lucide-react";
import { useUpdateProduct } from "@/lib/hooks/useMarketplace";

export function EditProductModal({ 
  product, 
  onClose,
  categories = []
}: { 
  product: any; 
  onClose: () => void;
  categories?: any[];
}) {
  const updateProduct = useUpdateProduct();

  const [formData, setFormData] = useState({
    title: product?.title || "",
    description: product?.description || "",
    quantity_available: product?.quantity_available || "",
    unit: product?.unit || "kg",
    price_per_unit: product?.price_per_unit || "",
    condition: product?.condition || "Fresh Harvest",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        quantity_available: product.quantity_available || "",
        unit: product.unit || "kg",
        price_per_unit: product.price_per_unit || "",
        condition: product.condition || "Fresh Harvest",
      });
    }
  }, [product]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    updateProduct.mutate(
      {
        id: product.id,
        data: {
          ...formData,
          quantity_available: parseFloat(formData.quantity_available.toString()),
          price_per_unit: parseFloat(formData.price_per_unit.toString()),
        }
      },
      {
        onSuccess: () => {
          onClose();
        }
      }
    );
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-elevated border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-surface-elevated/95 backdrop-blur">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-neon-gold" />
            Edit Product
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-white hover:bg-surface-tertiary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Product Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-neon-gold/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Quantity Available</label>
              <div className="flex w-full">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.quantity_available}
                  onChange={(e) => updateField("quantity_available", e.target.value)}
                  className="flex-1 min-w-0 h-11 px-4 rounded-l-xl bg-surface-tertiary border border-r-0 border-border text-white focus:outline-none focus:ring-2 focus:ring-neon-gold/50 transition-all"
                />
                <div className="relative shrink-0 w-28">
                  <select
                    required
                    value={formData.unit}
                    onChange={(e) => updateField("unit", e.target.value)}
                    className="w-full h-11 px-3 pr-8 appearance-none rounded-r-xl bg-surface-primary border border-border text-neon-gold font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-neon-gold/50 transition-all cursor-pointer"
                  >
                    <option value="kg">kg</option>
                    <option value="tons">tons</option>
                    <option value="liters">liters</option>
                    <option value="units">units</option>
                    <option value="packs">packs</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">Price Per Unit</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-medium">{product.currency || "LKR"}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price_per_unit}
                  onChange={(e) => updateField("price_per_unit", e.target.value)}
                  className="w-full h-11 pl-14 pr-4 rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-neon-gold/50 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Condition</label>
            <div className="relative">
              <select
                required
                value={formData.condition}
                onChange={(e) => updateField("condition", e.target.value)}
                className="w-full h-11 px-4 appearance-none rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-neon-gold/50 transition-all cursor-pointer"
              >
                <option value="Fresh Harvest">Fresh Harvest</option>
                <option value="Dried">Dried</option>
                <option value="Processed">Processed</option>
                <option value="New">New (Tools/Supplies)</option>
                <option value="Used">Used (Tools/Supplies)</option>
                <option value="Live">Live (Livestock)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="w-full h-28 px-4 py-3 rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-neon-gold/50 transition-all resize-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-text-secondary hover:text-white hover:bg-surface-tertiary transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProduct.isPending}
              className="px-6 py-2.5 bg-neon-gold/10 border border-neon-gold/30 text-neon-gold hover:bg-neon-gold/20 rounded-xl transition-colors font-semibold text-sm flex items-center gap-2"
            >
              {updateProduct.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {updateProduct.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
