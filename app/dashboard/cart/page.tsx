"use client";

import {
  useCart,
  useUpdateCartItem,
  useRemoveFromCart,
} from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const { data: cart, isLoading, isError } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const router = useRouter();

  const total = useMemo(() => {
    if (!cart || !cart.items) return 0;

    return cart.items.reduce((sum, item) => {
      const product: any = item.productId;
      if (!product) return sum; // skip broken items safely

      const price = product.price ?? 0;
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  const handleQuantityChange = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem.mutate(productId);
    } else {
      updateItem.mutate({ productId, quantity: newQty });
    }
  };

  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading cart...</p>;
  }

  if (isError || !cart) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-400">Failed to load cart.</p>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/products")}
        >
          Back to Products
        </Button>
      </div>
    );
  }

  const hasItems = cart.items && cart.items.length > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Your Cart</h2>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/products")}
        >
          Continue Shopping
        </Button>
      </div>

      {!hasItems && (
        <p className="text-sm text-slate-400">
          Your cart is empty. Go add some products!
        </p>
      )}

      {hasItems && (
        <div className="space-y-4">
          <div className="space-y-3">
            <AnimatePresence>
              {cart.items.map((item) => {
                const product: any = item.productId;

                // 🛡️ If product is missing (null), show a fallback row instead of crashing
                if (!product) {
                  return (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Product unavailable
                        </p>
                        <p className="text-xs text-slate-400">
                          This product no longer exists. Remove it from your
                          cart.
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400"
                        // backend still has raw ObjectId in item.productId in DB
                        onClick={() =>
                          removeItem.mutate(
                            // @ts-ignore
                            (item as any).productId
                          )
                        }
                      >
                        Remove
                      </Button>
                    </motion.div>
                  );
                }

                const price = product.price ?? 0;

                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-4 p-3 border border-slate-800 rounded-lg"
                  >
                    {/* image */}
                    <div className="w-20 h-20 rounded-md overflow-hidden border border-slate-700 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* details */}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-slate-400">
                        ₹{price.toFixed(2)} each
                      </p>
                    </div>

                    {/* quantity controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleQuantityChange(product._id, item.quantity - 1)
                        }
                      >
                        -
                      </Button>
                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleQuantityChange(product._id, item.quantity + 1)
                        }
                      >
                        +
                      </Button>
                    </div>

                    {/* remove */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400"
                      onClick={() => removeItem.mutate(product._id)}
                    >
                      Remove
                    </Button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* total */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <span className="text-sm font-medium">Total</span>
            <span className="text-lg font-semibold">₹{total.toFixed(2)}</span>
          </div>

          {/* fake checkout button just for UI */}
          <Button className="w-full mt-2" disabled>
            Checkout (Demo)
          </Button>
        </div>
      )}
    </div>
  );
}
