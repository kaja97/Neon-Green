"use client";

import { useState, useEffect } from "react";
import { 
  Store, 
  ShoppingBag, 
  Search, 
  Filter, 
  MapPin, 
  Package, 
  TrendingUp,
  ChevronRight,
  Sprout
} from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/stores/authStore";

export default function MarketPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"products" | "farmers">("products");
  
  const [products, setProducts] = useState<any[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === "products") {
          const res = await api.get("/marketplace/products");
          setProducts(res.data.data || []);
        } else {
          const res = await api.get("/marketplace/farmers");
          setFarmers(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch marketplace data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  return (
    <div className="space-y-6">
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
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-tertiary border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-neon-gold/50"
          />
        </div>
        <button className="h-11 px-4 btn-secondary flex items-center gap-2 text-sm whitespace-nowrap">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

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
          {products.length === 0 ? (
            <div className="col-span-full py-12 text-center text-text-muted">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No products available right now.</p>
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="glass-card overflow-hidden group flex flex-col">
                <div className="h-48 bg-surface-tertiary relative">
                  {/* Placeholder for image */}
                  <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                    <Store className="w-8 h-8 opacity-20" />
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 bg-surface-elevated/80 backdrop-blur-md rounded-md text-xs font-semibold text-neon-gold">
                    {product.currency} {product.price_per_unit} / {product.unit}
                  </div>
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
                    <button className="text-neon-gold hover:text-neon-gold/80 transition-colors p-2">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farmers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-text-muted">
              <Sprout className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No farmers available in the directory.</p>
            </div>
          ) : (
            farmers.map((farmer) => (
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
