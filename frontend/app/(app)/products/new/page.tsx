"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Store, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCategories, useCreateProduct } from "@/lib/hooks/useMarketplace";

export default function NewProductPage() {
  const router = useRouter();
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const createProduct = useCreateProduct();

  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    sub_category_id: "",
    description: "",
    quantity_available: "",
    unit: "kg",
    price_per_unit: "",
    currency: "LKR",
    condition: "Fresh Harvest",
  });

  const selectedCategory = useMemo(() => {
    if (!categories) return null;
    return categories.find((c) => c.id === formData.category_id) || null;
  }, [categories, formData.category_id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate(
      {
        ...formData,
        quantity_available: parseFloat(formData.quantity_available),
        price_per_unit: parseFloat(formData.price_per_unit),
      },
      {
        onSuccess: () => {
          router.push("/marketplace"); // Or wherever the list is
        },
      }
    );
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6 animate-fade-in pb-24">
      <header className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2.5 glass-card-hover rounded-xl text-text-secondary hover:text-white transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2 drop-shadow-md">
            <Store className="w-7 h-7 text-green-400 text-glow-green" />
            List a Product
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Sell your harvest, livestock, tools, or fertilizers to the community.
          </p>
        </div>
      </header>

      <div className="glass-card p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Product Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Fresh Organic Roma Tomatoes"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Category</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => {
                  setFormData({ ...formData, category_id: e.target.value, sub_category_id: "" });
                }}
                className="w-full h-12 px-4 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all disabled:opacity-50"
                disabled={isCategoriesLoading}
              >
                <option value="" disabled>
                  {isCategoriesLoading ? "Loading categories..." : "Select Category"}
                </option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Sub-Category</label>
              <select
                required
                value={formData.sub_category_id}
                onChange={(e) => updateField("sub_category_id", e.target.value)}
                disabled={!selectedCategory}
                className="w-full h-12 px-4 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all disabled:opacity-50"
              >
                <option value="" disabled>Select Sub-Category</option>
                {selectedCategory?.subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-slate-300">Quantity Available</label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                placeholder="e.g. 50"
                value={formData.quantity_available}
                onChange={(e) => updateField("quantity_available", e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-slate-300">Unit</label>
              <select
                required
                value={formData.unit}
                onChange={(e) => updateField("unit", e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="tons">Tons</option>
                <option value="liters">Liters</option>
                <option value="units">Units / Pieces</option>
                <option value="packs">Packs</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-slate-300">Price Per Unit</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">{formData.currency}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  value={formData.price_per_unit}
                  onChange={(e) => updateField("price_per_unit", e.target.value)}
                  className="w-full h-12 pl-16 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-slate-300">Condition</label>
              <select
                required
                value={formData.condition}
                onChange={(e) => updateField("condition", e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
              >
                <option value="Fresh Harvest">Fresh Harvest</option>
                <option value="Dried">Dried</option>
                <option value="Processed">Processed</option>
                <option value="New">New (Tools/Supplies)</option>
                <option value="Used">Used (Tools/Supplies)</option>
                <option value="Live">Live (Livestock)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Description (Optional)</label>
            <textarea
              placeholder="Add more details about the quality, origin, or specifications..."
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="w-full h-32 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all resize-none"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={createProduct.isPending}
              className="w-full md:w-auto px-8 h-12 bg-green-500/10 border border-green-500/20 text-green-400 font-bold rounded-xl hover:bg-green-500/20 transition-all flex items-center justify-center gap-2"
            >
              {createProduct.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Store className="w-5 h-5" />
              )}
              {createProduct.isPending ? "Listing Product..." : "List Product on Marketplace"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
