"use client";

import Image from "next/image";
import { Product } from "@/hooks/use-products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cld } from "@/lib/cloudinary";



type ProductsGridProps = {
  data: Product[];
};

export function ProductsGrid({ data }: ProductsGridProps) {
  const addToCart = useAddToCart();
  const router = useRouter();

  const handleAdd = (productId: string) => {
    addToCart.mutate({ productId });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((product, index) => {
        const mainImage = product.images?.[0]
          ? cld(product.images[0], 400, 300) // width=400, height=300
          : null;

        return (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.25 }}
            whileHover={{ y: -3 }}
          >
            <Card
              className="bg-white border-slate-200 hover:border-sky-500 transition-colors flex flex-col cursor-pointer"
              onClick={() => router.push(`/dashboard/products/${product._id}`)}
            >
              {/* Image */}
              {mainImage && (
                <motion.div
                  className="relative w-full h-36 overflow-hidden rounded-t-md"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              )}

              {/* Name + Price */}
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold line-clamp-1">
                    {product.name}
                  </CardTitle>
                  <p className="text-sm font-medium text-slate-700">
                    ₹{product.price.toFixed(2)}
                  </p>
                </div>
              </CardHeader>

              {/* Add to Cart button */}
              <CardContent className="mt-auto p-3 pt-0">
                <Button
                  className="w-full"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent card click navigation
                    handleAdd(product._id);
                  }}
                >
                  Add to cart
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
