"use client";

import { useParams, useRouter } from "next/navigation";
import { useProduct } from "@/hooks/use-products";
import { useAddToCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { X } from "lucide-react";
import { cld } from "@/lib/cloudinary";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const router = useRouter();

  const { data: product, isLoading, isError } = useProduct(productId);
  const addToCart = useAddToCart();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleAdd = () => {
    if (!product) return;
    addToCart.mutate({ productId: product._id });
  };

  const openModal = (index: number) => {
    setActiveIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const showPrev = () => {
    if (!product?.images?.length) return;
    setActiveIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const showNext = () => {
    if (!product?.images?.length) return;
    setActiveIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading product...</p>;
  }

  if (isError || !product) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-400">Failed to load product.</p>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/products")}
        >
          Back to Products
        </Button>
      </div>
    );
  }

  const hasImages = product.images && product.images.length > 0;
  const mainImage = hasImages ? product.images[activeIndex] : undefined;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Product Details</h2>
        <div className="flex gap-2">
          {/* <Button
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/products/${product._id}/edit`)
            }
          >
            Edit
          </Button> */}
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/products")}
          >
            Back to Products
          </Button>
        </div>
      </div>

      {/* Main card with Flipkart-style layout */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-6">
          <div className="grid gap-8 md:grid-cols-2">
            {/* LEFT: image gallery */}
            <div className="space-y-4">
              {/* Main image */}
              {mainImage && (
                <motion.div
                  className="relative w-full aspect-square border border-slate-200 rounded-md overflow-hidden cursor-pointer bg-slate-50"
                  whileHover={{ scale: 1.01 }}
                  onClick={() => openModal(activeIndex)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cld(mainImage, 800, 800)}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              )}

              {/* Thumbnails */}
              {hasImages && product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      className={`relative h-16 w-16 rounded-md border overflow-hidden bg-slate-50 ${
                        idx === activeIndex
                          ? "border-sky-500 ring-2 ring-sky-200"
                          : "border-slate-200"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cld(url, 150, 150)}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: details + actions */}
            <div className="space-y-4">
              <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
                {product.name}
              </h1>

              <p className="text-2xl font-bold text-slate-900">
                ₹{product.price.toFixed(2)}
              </p>

              {product.description && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              )}

              <div className="pt-4 flex flex-wrap gap-3">
                <Button onClick={handleAdd}>Add to cart</Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/dashboard/products/${product._id}/edit`)
                  }
                >
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal stays same */}
      <AnimatePresence>
        {isModalOpen && hasImages && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="relative max-w-3xl w-full mx-4 bg-white border border-slate-800 rounded-xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 18 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ✅ TOP-RIGHT CLOSE BUTTON */}
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 z-50 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="relative w-full aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cld(product.images[activeIndex], 1200, 800)}
                  alt={`Large view ${activeIndex + 1}`}
                  className="w-full h-full object-cover bg-black"
                />
              </div>

              <div className="absolute inset-y-0 left-0 flex items-center">
                <button
                  onClick={showPrev}
                  className="mx-2 rounded-full bg-black/60 px-3 py-2 text-slate-50 text-sm hover:bg-black/80"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                  onClick={showNext}
                  className="mx-2 rounded-full bg-black/60 px-3 py-2 text-slate-50 text-sm hover:bg-black/80"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800 bg-slate-950/90 text-xs text-slate-300">
                <span>
                  Image {activeIndex + 1} of {product.images.length}
                </span>
               
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
