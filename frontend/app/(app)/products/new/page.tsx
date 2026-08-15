"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Store, Loader2, ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useCategories, useCreateProduct } from "@/lib/hooks/useMarketplace";
import { ImageUploadSection } from "@/components/forms/ImageUploadSection";

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

  const [customCondition, setCustomCondition] = useState("");
  const [customSubCategory, setCustomSubCategory] = useState("");

  const selectedCategory = useMemo(() => {
    if (!categories) return null;
    return categories.find((c) => c.id === formData.category_id) || null;
  }, [categories, formData.category_id]);

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const availableSlots = 5 - selectedImages.length;
      const filesToAdd = filesArray.slice(0, availableSlots);
      
      setSelectedImages((prev) => [...prev, ...filesToAdd]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let uploadedUrls: string[] = [];
    
    if (selectedImages.length > 0) {
      setIsUploading(true);
      try {
        const uploadData = new FormData();
        selectedImages.forEach((file) => {
          uploadData.append("files", file);
        });
        
        const res = await api.post("/marketplace/products/images", uploadData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
        uploadedUrls = res.data;
      } catch (error) {
        console.error("Failed to upload images", error);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const finalCondition = formData.condition === "Other" 
      ? (customCondition.trim() || "Other") 
      : formData.condition;

    let finalDescription = formData.description;
    if (customSubCategory.trim()) {
      finalDescription = finalDescription 
        ? `[Sub-Category: ${customSubCategory.trim()}]\n\n${finalDescription}`
        : `[Sub-Category: ${customSubCategory.trim()}]`;
    }

    createProduct.mutate(
      {
        ...formData,
        condition: finalCondition,
        description: finalDescription || undefined,
        quantity_available: parseFloat(formData.quantity_available),
        price_per_unit: parseFloat(formData.price_per_unit),
        images: uploadedUrls,
      },
      {
        onSuccess: () => {
          router.push("/market");
        },
      }
    );
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Find subcategory object
  const selectedSubCategoryObj = useMemo(() => {
    return selectedCategory?.subcategories.find((s) => s.id === formData.sub_category_id);
  }, [selectedCategory, formData.sub_category_id]);

  const isOtherSubCategorySelected = selectedSubCategoryObj?.name?.toLowerCase() === "other";

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 animate-fade-in">
      <Link 
        href="/market"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </Link>

      <div className="glass-card p-6 md:p-8 rounded-3xl border border-border space-y-8">
        <div className="border-b border-border/80 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              Seller Hub
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
            List a Product<span className="text-primary text-glow-green">.</span>
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Offer your agricultural harvests, processed goods, livestock, seeds, or equipment to verified buyers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-secondary">Product Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Organic Cavendish Bananas - 500kg"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-surface-tertiary border border-border text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary">Category *</label>
              <div className="relative">
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => {
                    setFormData({ ...formData, category_id: e.target.value, sub_category_id: "" });
                    setCustomSubCategory("");
                  }}
                  className="w-full h-12 px-4 appearance-none rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
                  disabled={isCategoriesLoading}
                >
                  <option value="" disabled>
                    {isCategoriesLoading ? "Loading categories from database..." : "Select Category"}
                  </option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>

            {/* Sub-Category */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary">Sub-Category *</label>
              <div className="relative">
                <select
                  required
                  value={formData.sub_category_id}
                  onChange={(e) => updateField("sub_category_id", e.target.value)}
                  disabled={!selectedCategory}
                  className="w-full h-12 px-4 appearance-none rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
                >
                  <option value="" disabled>Select Sub-Category</option>
                  {selectedCategory?.subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Custom Subcategory Input if 'Other' is chosen */}
          {isOtherSubCategorySelected && (
            <div className="p-4 rounded-2xl bg-surface-tertiary/60 border border-primary/30 space-y-2 animate-scale-up">
              <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Specify Custom Sub-Category
              </label>
              <input
                type="text"
                placeholder="e.g. Hydroponic Microgreens, Organic Honeycomb, Solar Dryer"
                value={customSubCategory}
                onChange={(e) => setCustomSubCategory(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-surface-secondary border border-border text-white placeholder:text-text-muted text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {/* Quantity and Unit */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-secondary">Quantity Available *</label>
            <div className="flex w-full">
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                placeholder="e.g. 50"
                value={formData.quantity_available}
                onChange={(e) => updateField("quantity_available", e.target.value)}
                className="flex-1 min-w-0 h-12 px-4 rounded-l-xl bg-surface-tertiary border border-r-0 border-border text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
              <div className="relative shrink-0 w-32">
                <select
                  required
                  value={formData.unit}
                  onChange={(e) => updateField("unit", e.target.value)}
                  className="w-full h-12 px-4 pr-9 appearance-none rounded-r-xl bg-surface-secondary border border-border text-neon-gold font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                >
                  <option value="kg">kg</option>
                  <option value="tons">tons</option>
                  <option value="liters">liters</option>
                  <option value="units">units / pcs</option>
                  <option value="packs">packs</option>
                  <option value="bags">bags</option>
                  <option value="acres">acres</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Price & Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary">Price Per Unit *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold text-xs">
                  {formData.currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  value={formData.price_per_unit}
                  onChange={(e) => updateField("price_per_unit", e.target.value)}
                  className="w-full h-12 pl-14 pr-4 rounded-xl bg-surface-tertiary border border-border text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary">Condition *</label>
              <div className="relative">
                <select
                  required
                  value={formData.condition}
                  onChange={(e) => updateField("condition", e.target.value)}
                  className="w-full h-12 px-4 appearance-none rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  <option value="Fresh Harvest">Fresh Harvest</option>
                  <option value="Dried">Dried</option>
                  <option value="Processed">Processed / Value-added</option>
                  <option value="Frozen / Cold Storage">Frozen / Cold Storage</option>
                  <option value="New">New (Tools/Supplies/Seeds)</option>
                  <option value="Used">Used (Tools/Machinery)</option>
                  <option value="Live">Live (Livestock/Seedlings)</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Custom Condition input if 'Other' selected */}
          {formData.condition === "Other" && (
            <div className="p-4 rounded-2xl bg-surface-tertiary/60 border border-neon-gold/30 space-y-2 animate-scale-up">
              <label className="text-xs font-bold uppercase tracking-wider text-neon-gold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Specify Custom Condition
              </label>
              <input
                type="text"
                placeholder="e.g. Fermented, Raw unrefined, Semi-ripe, Refurbished"
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-surface-secondary border border-border text-white placeholder:text-text-muted text-xs focus:outline-none focus:ring-2 focus:ring-neon-gold"
              />
            </div>
          )}

          {/* Image Upload */}
          <ImageUploadSection 
            selectedImages={selectedImages}
            onImageChange={handleImageChange}
            onRemoveImage={removeImage}
          />

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-secondary">Description (Optional)</label>
            <textarea
              rows={4}
              placeholder="Add more details about the quality grade, cultivation origin, certification, or delivery terms..."
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-tertiary border border-border text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-end">
            <button
              type="submit"
              disabled={createProduct.isPending || isUploading}
              className="btn-primary px-8 h-12 text-sm font-bold flex items-center justify-center gap-2"
            >
              {(createProduct.isPending || isUploading) ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Listing Product...
                </>
              ) : (
                <>
                  <Store className="w-4 h-4" />
                  List Product on Marketplace
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
