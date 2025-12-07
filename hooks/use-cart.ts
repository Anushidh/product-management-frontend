"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSession } from "next-auth/react";
import type { Product } from "./use-products";
import { toast } from "sonner";

export type CartProduct = Product;

export type CartItem = {
  _id: string;
  productId: CartProduct; // populated product
  quantity: number;
};

export type Cart = {
  _id?: string;
  userId: string;
  items: CartItem[];
};

function useAuthHeaders(session: any) {
  const userId = (session?.user as any)?.id;
  if (!userId) return {};

  return {
    "x-user-id": userId,
  };
}

// 🔹 Get cart
export function useCart() {
  const { data: session } = useSession();

  return useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: async () => {
      const headers = useAuthHeaders(session);

      const res = await api.get("/cart", {
        headers,
      });

      // in backend, if no cart -> { userId, items: [] }
      return res.data;
    },
    enabled: !!session?.user,
  });
}

// 🔹 Add to cart
export function useAddToCart() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity = 1,
    }: {
      productId: string;
      quantity?: number;
    }) => {
      const headers = useAuthHeaders(session);

      const res = await api.post(
        "/cart/add",
        { productId, quantity },
        { headers }
      );

      return res.data as Cart;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Product added to cart!");
    },
    onError: () => {
      toast.error("Failed to add product.");
    },
  });
}

// 🔹 Update quantity
export function useUpdateCartItem() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      const headers = useAuthHeaders(session);

      const res = await api.post(
        "/cart/update",
        { productId, quantity },
        { headers }
      );

      return res.data as Cart;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

// 🔹 Remove item
export function useRemoveFromCart() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const headers = useAuthHeaders(session);

      const res = await api.post("/cart/remove", { productId }, { headers });

      return res.data as Cart;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
