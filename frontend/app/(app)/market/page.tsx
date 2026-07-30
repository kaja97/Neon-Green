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
  Tag,
  Leaf,
  Calendar
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/stores/authStore";
import { useMarkSoldOut, useUpdateProduct } from "@/lib/hooks/useMarketplace";
import { EditProductModal } from "@/components/EditProductModal";
import { Edit2, ShieldAlert, ShieldCheck } from "lucide-react";

function getApiBase() {
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
}

function getImageUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${getApiBase()}${path}`;
}

export default function MarketPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"products" | "my_products" | "farmers">("products");
  
  const [products, setProducts] = useState<any[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Product Edit
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const markSoldOut = useMarkSoldOut();
  const updateProduct = useUpdateProduct();
  
  // Product filters
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [categories, setCategories] = useState<any[]>([]);

  // Farmer filters
  const [farmerPlantType, setFarmerPlantType] = useState("");
  const [farmerDistrict, setFarmerDistrict] = useState("");

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
        if (activeTab === "products" || activeTab === "my_products") {
          const endpoint = activeTab === "my_products" ? "/marketplace/products/me" : "/marketplace/products";
          const res = await api.get(endpoint);
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

  // Get unique plant types and districts from farmer data for filter dropdowns
  const farmerFilterOptions = useMemo(() => {
    const plantTypes = new Set<string>();
    const districts = new Set<string>();
    
    farmers.forEach((f) => {
      if (f.district) districts.add(f.district);
      f.projects?.forEach((p: any) => {
        if (p.plant_name) plantTypes.add(p.plant_name);
        if (p.plant_category) plantTypes.add(p.plant_category);
        if (p.location_district) districts.add(p.location_district);
      });
    });
    
    return {
      plantTypes: Array.from(plantTypes).sort(),
      districts: Array.from(districts).sort(),
    };
  }, [farmers]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((p) => 
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q) ||
        p.sub_category?.name?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category_id === selectedCategory);
    }

    filtered = filtered.filter((p) => {
      const price = p.price_per_unit || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (activeTab === "my_products" && user) {
      filtered = filtered.filter((p) => p.seller_id === user.id);
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, priceRange, activeTab, user]);

  // Filtered farmers
  const filteredFarmers = useMemo(() => {
    let filtered = [...farmers];
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((f) =>
        f.full_name?.toLowerCase().includes(q) ||
        f.farming_method?.toLowerCase().includes(q) ||
        f.district?.toLowerCase().includes(q) ||
        f.projects?.some((p: any) => 
          p.plant_name?.toLowerCase().includes(q) ||
          p.variety_name?.toLowerCase().includes(q)
        )
      );
    }

    if (farmerPlantType) {
      filtered = filtered.filter((f) =>
        f.projects?.some((p: any) => 
          p.plant_name === farmerPlantType || p.plant_category === farmerPlantType
        )
      );
    }

    if (farmerDistrict) {
      filtered = filtered.filter((f) =>
        f.district === farmerDistrict ||
        f.projects?.some((p: any) => p.location_district === farmerDistrict)
      );
    }

    return filtered;
  }, [farmers, searchQuery, farmerPlantType, farmerDistrict]);

  const activeFiltersCount = (activeTab === "products" || activeTab === "my_products")
    ? (selectedCategory ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 100000 ? 1 : 0)
    : (farmerPlantType ? 1 : 0) + (farmerDistrict ? 1 : 0);

  const clearFilters = () => {
    setSelectedCategory("");
    setPriceRange([0, 100000]);
    setFarmerPlantType("");
    setFarmerDistrict("");
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

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto overflow-hidden">
          <div className="flex p-1 rounded-xl bg-surface-tertiary overflow-x-auto whitespace-nowrap w-full sm:w-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-1 sm:flex-none ${
                activeTab === "products"
                  ? "bg-surface-elevated text-neon-gold shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              Products
            </button>
            {user && (
              <button
                onClick={() => setActiveTab("my_products")}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-1 sm:flex-none ${
                  activeTab === "my_products"
                    ? "bg-surface-elevated text-neon-gold shadow-sm"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                <Store className="w-4 h-4 shrink-0" />
                My Products
              </button>
            )}
            <button
              onClick={() => setActiveTab("farmers")}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-1 sm:flex-none ${
                activeTab === "farmers"
                  ? "bg-surface-elevated text-neon-gold shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <Sprout className="w-4 h-4 shrink-0" />
              Directory
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
              placeholder={(activeTab === "products" || activeTab === "my_products") ? "Search by name, description, category..." : "Search farmers by name, crops, district..."}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-tertiary border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-neon-gold/50"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
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
        </div>

        {/* Product Filter Panel */}
        {showFilters && (activeTab === "products" || activeTab === "my_products") && (
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

        {/* Farmer Filter Panel */}
        {showFilters && activeTab === "farmers" && (
          <div className="glass-card p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-neon-gold" />
                Filter Farmers
              </h3>
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-neon-gold hover:underline">
                  Clear all
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-medium flex items-center gap-1">
                  <Leaf className="w-3 h-3" /> Plant Type / Category
                </label>
                <div className="relative">
                  <select
                    value={farmerPlantType}
                    onChange={(e) => setFarmerPlantType(e.target.value)}
                    className="w-full h-10 px-3 pr-8 rounded-lg bg-surface-tertiary border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-gold/50 appearance-none cursor-pointer"
                  >
                    <option value="">All Plant Types</option>
                    {farmerFilterOptions.plantTypes.map((pt) => (
                      <option key={pt} value={pt}>{pt}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> District / Location
                </label>
                <div className="relative">
                  <select
                    value={farmerDistrict}
                    onChange={(e) => setFarmerDistrict(e.target.value)}
                    className="w-full h-10 px-3 pr-8 rounded-lg bg-surface-tertiary border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-gold/50 appearance-none cursor-pointer"
                  >
                    <option value="">All Locations</option>
                    {farmerFilterOptions.districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      {!isLoading && (searchQuery || activeFiltersCount > 0) && (
        <div className="text-sm text-text-muted">
          Showing <span className="text-white font-semibold">
            {(activeTab === "products" || activeTab === "my_products") ? filteredProducts.length : filteredFarmers.length}
          </span> of {(activeTab === "products" || activeTab === "my_products") ? products.length : farmers.length} items
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
      ) : (activeTab === "products" || activeTab === "my_products") ? (
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
                  
                  {user && product.seller_id === user.id && (
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <button 
                        onClick={(e) => { e.preventDefault(); setEditingProduct(product); }}
                        className="p-2 bg-surface-elevated/90 backdrop-blur-md rounded-lg text-neon-gold hover:bg-neon-gold hover:text-black transition-colors shadow-lg border border-border"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      {product.status === "sold_out" ? (
                        <button 
                          onClick={(e) => { 
                            e.preventDefault(); 
                            if(confirm('List this product again on the marketplace?')) {
                              updateProduct.mutate({ id: product.id, data: { status: "available" } });
                            }
                          }}
                          className="p-2 bg-surface-elevated/90 backdrop-blur-md rounded-lg text-neon-green hover:bg-neon-green hover:text-black transition-colors shadow-lg border border-border"
                          title="Mark as Sold In (Available)"
                          disabled={updateProduct.isPending}
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => { e.preventDefault(); if(confirm('Mark this product as Sold Out?')) markSoldOut.mutate(product.id); }}
                          className="p-2 bg-surface-elevated/90 backdrop-blur-md rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-colors shadow-lg border border-border"
                          title="Mark Sold Out"
                          disabled={markSoldOut.isPending}
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      )}
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
                    <div className="text-sm text-text-muted flex flex-col">
                      <span>Qty: {product.quantity_available} {product.unit}</span>
                    </div>
                    {user && product.seller_id !== user.id ? (
                      <button 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          alert(`Creating transaction to buy ${product.title}... (API Call pending)`);
                          // TODO: Create transaction API call here
                        }}
                        className="px-3 py-1.5 bg-neon-gold text-black text-sm font-bold rounded-lg hover:bg-neon-gold/80 transition-colors shadow-lg"
                      >
                        Buy Now
                      </button>
                    ) : (
                      <span className="text-neon-gold hover:text-neon-gold/80 transition-colors p-2">
                        <ChevronRight className="w-5 h-5" />
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      ) : (
        /* Farmer Directory */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFarmers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-text-muted">
              <Sprout className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>{searchQuery || activeFiltersCount > 0 ? "No farmers match your filters." : "No farmers available in the directory."}</p>
              {(searchQuery || activeFiltersCount > 0) && (
                <button onClick={clearFilters} className="mt-2 text-neon-gold hover:underline text-sm">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filteredFarmers.map((farmer) => (
              <div key={farmer.farmer_profile_id} className="glass-card overflow-hidden group hover:-translate-y-1 hover:shadow-2xl hover:shadow-neon-blue/10 transition-all duration-300">
                {/* Farmer Header */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center text-xl font-bold flex-shrink-0">
                      {farmer.full_name?.charAt(0) || "F"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-lg truncate group-hover:text-neon-blue transition-colors">{farmer.full_name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full bg-surface-tertiary text-[10px] text-text-secondary capitalize">
                          {farmer.farming_method}
                        </span>
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {farmer.experience_years} yrs
                        </span>
                        {farmer.district && (
                          <span className="text-xs text-text-muted flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {farmer.district}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {farmer.bio && (
                    <p className="text-xs text-text-secondary line-clamp-2">{farmer.bio}</p>
                  )}
                </div>
                
                {/* Projects */}
                {farmer.projects && farmer.projects.length > 0 ? (
                  <div className="border-t border-border px-5 py-4">
                    <h4 className="text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wider flex items-center gap-1">
                      <Leaf className="w-3 h-3" />
                      Active Projects ({farmer.projects.length})
                    </h4>
                    <div className="space-y-2">
                      {farmer.projects.slice(0, 3).map((p: any) => (
                        <Link
                          key={p.id}
                          href={`/market/farmers/${farmer.farmer_profile_id}/projects/${p.id}`}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-surface-tertiary/50 hover:bg-surface-tertiary transition-colors group/item"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center flex-shrink-0">
                              <Sprout className="w-4 h-4 text-neon-green" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-white truncate">
                                {p.plant_name}
                                {p.variety_name && <span className="text-text-muted font-normal"> • {p.variety_name}</span>}
                              </div>
                              <div className="text-[10px] text-text-muted flex items-center gap-2">
                                <span className="flex items-center gap-0.5">
                                  <Calendar className="w-2.5 h-2.5" />
                                  {p.planting_date}
                                </span>
                                {p.location_district && (
                                  <span className="flex items-center gap-0.5">
                                    <MapPin className="w-2.5 h-2.5" />
                                    {p.location_district}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-text-muted group-hover/item:text-neon-gold transition-colors flex-shrink-0" />
                        </Link>
                      ))}
                      {farmer.projects.length > 3 && (
                        <p className="text-xs text-text-muted text-center pt-1">
                          +{farmer.projects.length - 3} more projects
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-border px-5 py-4">
                    <p className="text-xs text-text-muted italic">No active projects listed.</p>
                  </div>
                )}
                
                {/* Footer */}
                <div className="border-t border-border px-5 py-3">
                  <Link 
                    href={`/market/farmers/${farmer.farmer_profile_id}`}
                    className="w-full h-9 btn-secondary text-sm flex items-center justify-center gap-2"
                  >
                    View Full Profile
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {editingProduct && (
        <EditProductModal 
          product={editingProduct} 
          categories={categories}
          onClose={() => setEditingProduct(null)} 
        />
      )}
    </div>
  );
}
