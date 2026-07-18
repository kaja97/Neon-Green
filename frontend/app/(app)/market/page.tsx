"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Store, 
  ShoppingBag, 
  Search, 
  Filter, 
  MapPin, 
  Package, 
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Sprout,
  Plus,
  X,
  DollarSign,
  Tag
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/stores/authStore";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

function getImageUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

export default function MarketPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"products" | "farmers">("products");
  
  const [products, setProducts] = useState<any[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/marketplace/categories");
        const data = res.data?.data ?? res.data;
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === "products") {
          const res = await api.get("/marketplace/products");
          const data = res.data?.data ?? res.data;
          setProducts(Array.isArray(data) ? data : []);
        } else {
          const res = await api.get("/marketplace/farmers");
          const data = res.data?.data ?? res.data;
          setFarmers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch marketplace data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    
    // Search by name, description, category
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((p) => 
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q) ||
        p.sub_category?.name?.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category_id === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter((p) => {
      const price = p.price_per_unit || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, priceRange]);

  // Filtered farmers
  const filteredFarmers = useMemo(() => {
    if (!searchQuery.trim()) return farmers;
    const q = searchQuery.toLowerCase().trim();
    return farmers.filter((f) =>
      f.full_name?.toLowerCase().includes(q) ||
      f.farming_method?.toLowerCase().includes(q) ||
      f.projects?.some((p: any) => p.plant_name?.toLowerCase().includes(q))
    );
  }, [farmers, searchQuery]);

  const activeFiltersCount = (selectedCategory ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 100000 ? 1 : 0);

  const clearFilters = () => {
    setSelectedCategory("");
    setPriceRange([0, 100000]);
    setSearchQuery("");
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Store className="w-6 h-6 text-neon-gold" />
            Marketplace
          </h1>
          <p className="text-sm text-text-secondary">
            {user?.role === "vendor" 
              ? "Discover fresh produce directly from farmers" 
              : "Buy and sell agricultural products"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Tab Navigation */}
          <div className="flex p-1 rounded-xl bg-surface-tertiary">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "products"
                  ? "bg-surface-elevated text-neon-gold shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Products
            </button>
            <button
              onClick={() => setActiveTab("farmers")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "farmers"
                  ? "bg-surface-elevated text-neon-gold shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <Sprout className="w-4 h-4" />
              Farmer Directory
            </button>
          </div>
          
          <Link 
            href="/products/new" 
            className="h-10 px-4 bg-neon-gold text-black font-semibold rounded-xl hover:bg-neon-gold/90 transition-all flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            List Product
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === "products" ? "Search by name, description, category..." : "Search farmers by name, method, crops..."}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-tertiary border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-neon-gold/50"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {activeTab === "products" && (
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className={`h-11 px-4 btn-secondary flex items-center gap-2 text-sm whitespace-nowrap relative ${showFilters ? "ring-2 ring-neon-gold/50" : ""}`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neon-gold text-black text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && activeTab === "products" && (
          <div className="glass-card p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-neon-gold" />
                Filter Products
              </h3>
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-neon-gold hover:underline">
                  Clear all
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-medium flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Category
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-10 px-3 pr-8 rounded-lg bg-surface-tertiary border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-gold/50 appearance-none cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                </div>
              </div>

              {/* Min Price */}
              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-medium flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Min Price
                </label>
                <input
                  type="number"
                  min={0}
                  value={priceRange[0] || ""}
                  onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                  placeholder="0"
                  className="w-full h-10 px-3 rounded-lg bg-surface-tertiary border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-gold/50"
                />
              </div>

              {/* Max Price */}
              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-medium flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Max Price
                </label>
                <input
                  type="number"
                  min={0}
                  value={priceRange[1] >= 100000 ? "" : priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 100000])}
                  placeholder="No max"
                  className="w-full h-10 px-3 rounded-lg bg-surface-tertiary border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-gold/50"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      {!isLoading && activeTab === "products" && (searchQuery || activeFiltersCount > 0) && (
        <div className="text-sm text-text-muted">
          Showing <span className="text-white font-semibold">{filteredProducts.length}</span> of {products.length} products
          {searchQuery && <span> matching &quot;<span className="text-neon-gold">{searchQuery}</span>&quot;</span>}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card p-4 space-y-4 animate-pulse">
              <div className="w-full h-40 bg-surface-tertiary rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 bg-surface-tertiary rounded w-3/4"></div>
                <div className="h-3 bg-surface-tertiary rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === "products" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-text-muted">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>{searchQuery || activeFiltersCount > 0 ? "No products match your filters." : "No products available right now."}</p>
              {(searchQuery || activeFiltersCount > 0) && (
                <button onClick={clearFilters} className="mt-2 text-neon-gold hover:underline text-sm">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Link href={`/market/products/${product.id}`} key={product.id} className="glass-card overflow-hidden group flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-neon-gold/20 transition-all duration-300">
                <div className="h-48 bg-surface-tertiary relative overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img src={getImageUrl(product.images[0])} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                      <Store className="w-8 h-8 opacity-20 group-hover:scale-110 transition-transform" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-surface-elevated/80 backdrop-blur-md rounded-md text-xs font-semibold text-neon-gold">
                    {product.currency} {product.price_per_unit} / {product.unit}
                  </div>
                  {product.category?.name && (
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-md text-[10px] font-medium text-text-secondary">
                      {product.category.name}
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-white mb-1 group-hover:text-neon-gold transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-2 mb-4 flex-1">
                    {product.description || "No description provided."}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                    <div className="text-sm text-text-muted">
                      Qty: {product.quantity_available} {product.unit}
                    </div>
                    <span className="text-neon-gold hover:text-neon-gold/80 transition-colors p-2">
                      <ChevronRight className="w-5 h-5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFarmers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-text-muted">
              <Sprout className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No farmers available in the directory.</p>
            </div>
          ) : (
            filteredFarmers.map((farmer) => (
              <div key={farmer.farmer_profile_id} className="glass-card p-5 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center text-lg font-bold">
                    {farmer.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{farmer.full_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-surface-tertiary text-[10px] text-text-secondary capitalize">
                        {farmer.farming_method}
                      </span>
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {farmer.experience_years} yrs exp
                      </span>
                    </div>
                  </div>
                </div>
                
                {farmer.projects && farmer.projects.length > 0 ? (
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                      Active Crops
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {farmer.projects.map((p: any) => (
                        <span key={p.id} className="px-2 py-1 rounded bg-primary/10 text-primary text-xs">
                          {p.plant_name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-text-muted italic">No active crops listed.</p>
                  </div>
                )}
                
                <button className="w-full mt-2 h-10 btn-secondary text-sm">
                  View Profile & Connect
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
