"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Store, 
  MapPin, 
  Mail, 
  Phone, 
  ChevronLeft, 
  ChevronRight, 
  Tag, 
  Package,
  ShoppingBag,
  ShieldCheck
} from "lucide-react";
import api from "@/lib/api";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/marketplace/products/${params.id}`);
        setProduct(res.data?.data ?? res.data);
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (params.id) fetchProduct();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-neon-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Store className="w-16 h-16 text-text-muted opacity-20" />
        <h2 className="text-xl font-semibold text-white">Product not found</h2>
        <button onClick={() => router.back()} className="text-neon-gold hover:underline">
          Go back to marketplace
        </button>
      </div>
    );
  }

  const nextImage = () => {
    if (product.images && product.images.length > 0) {
      setActiveImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
    }
  };

  const prevImage = () => {
    if (product.images && product.images.length > 0) {
      setActiveImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-text-muted hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square bg-surface-tertiary rounded-2xl overflow-hidden glass-card group">
            {product.images && product.images.length > 0 ? (
              <>
                <img 
                  src={product.images[activeImage]} 
                  alt={product.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                
                {product.images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                <Store className="w-16 h-16 opacity-20" />
              </div>
            )}
            
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-surface-elevated/90 backdrop-blur-md rounded-lg font-bold text-neon-gold text-lg shadow-lg border border-border">
              {product.currency} {product.price_per_unit} / {product.unit}
            </div>
          </div>

          {/* Thumbnail Slider */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    activeImage === idx ? "border-neon-gold scale-105" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product & Owner Details */}
        <div className="flex flex-col">
          <div className="space-y-6 flex-1">
            {/* Header Info */}
            <div>
              <div className="flex items-center gap-2 text-neon-gold mb-2 text-sm font-medium">
                <Tag className="w-4 h-4" />
                {product.category?.name} {product.sub_category ? `• ${product.sub_category.name}` : ""}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                {product.title}
              </h1>
              
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1.5 rounded-lg bg-surface-tertiary border border-border text-sm flex items-center gap-1.5 text-text-secondary">
                  <Package className="w-4 h-4" />
                  Available: <strong className="text-white">{product.quantity_available} {product.unit}</strong>
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-surface-tertiary border border-border text-sm flex items-center gap-1.5 text-text-secondary">
                  <ShieldCheck className="w-4 h-4 text-neon-green" />
                  Condition: <strong className="text-white">{product.condition}</strong>
                </span>
              </div>
            </div>

            <div className="w-full h-px bg-border"></div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Product Description</h3>
              <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                {product.description || "No description provided by the seller."}
              </p>
            </div>

            <div className="w-full h-px bg-border"></div>

            {/* Seller Info */}
            <div className="glass-card p-6 bg-gradient-to-br from-surface-elevated to-surface-primary">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-neon-blue" />
                Seller Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center text-xl font-bold shadow-lg">
                    {product.seller_info?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">{product.seller_info?.name || "Unknown Seller"}</div>
                    <div className="text-sm text-text-muted flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-neon-green" /> Verified Partner
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {product.seller_info?.phone && (
                    <a href={`tel:${product.seller_info.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-surface-tertiary hover:bg-surface-elevated transition-colors border border-border/50 group">
                      <div className="w-8 h-8 rounded-full bg-neon-green/10 flex items-center justify-center group-hover:bg-neon-green/20 transition-colors">
                        <Phone className="w-4 h-4 text-neon-green" />
                      </div>
                      <span className="text-sm text-text-secondary group-hover:text-white transition-colors">{product.seller_info.phone}</span>
                    </a>
                  )}
                  {product.seller_info?.email && (
                    <a href={`mailto:${product.seller_info.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-surface-tertiary hover:bg-surface-elevated transition-colors border border-border/50 group">
                      <div className="w-8 h-8 rounded-full bg-neon-blue/10 flex items-center justify-center group-hover:bg-neon-blue/20 transition-colors">
                        <Mail className="w-4 h-4 text-neon-blue" />
                      </div>
                      <span className="text-sm text-text-secondary group-hover:text-white transition-colors truncate">{product.seller_info.email}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <button className="w-full h-14 btn-primary flex items-center justify-center gap-2 text-lg">
              <ShoppingBag className="w-5 h-5" />
              Contact Seller to Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
