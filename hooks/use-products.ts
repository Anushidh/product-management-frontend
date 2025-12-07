"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSession } from "next-auth/react";

export type Product = {
  _id: string;
  name: string;
  price: number;
  description?: string;
  images: string[];
  createdAt?: string;
};

export function useProducts() {
  const { data: session } = useSession();

  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      // send x-user-id header to match backend auth middleware
      const userId = (session?.user as any)?.id ?? "";

      const res = await api.get("/products", {
        headers: {
          "x-user-id": userId,
        },
      });

      return res.data;
    },
    enabled: !!session?.user, // only fetch when logged in
  });
}

// 🔹 Single product by id
export function useProduct(id: string | undefined) {
  const { data: session } = useSession();

  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) throw new Error("Missing product id");

      const userId = (session?.user as any)?.id ?? "";

      const res = await api.get(`/products/${id}`, {
        headers: {
          "x-user-id": userId,
        },
      });

      return res.data;
    },
    enabled: !!session?.user && !!id,
  });
}
// ----------------- NEW: create product mutation -----------------

type CreateProductInput = {
  name: string;
  price: number;
  description: string;
  images: File[];
};

export function useCreateProduct() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      price,
      description,
      images,
    }: CreateProductInput) => {
      const userId = (session?.user as any)?.id;
      if (!userId) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", String(price));
      formData.append("description", description);

      images.forEach((file) => {
        formData.append("images", file); // field name must be "images" (backend multer config)
      });

      const res = await api.post("/products", formData, {
        headers: {
          "x-user-id": userId,
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    },
    onSuccess: () => {
      // refresh products list
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ----------------- UPDATE -----------------

type UpdateProductInput = {
  id: string;
  name: string;
  price: number;
  description: string;
  keptExistingUrls: string[]; // URLs of existing images to keep
  newImages: File[]; // newly added images
};

export function useUpdateProduct() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      price,
      description,
      keptExistingUrls,
      newImages,
    }: UpdateProductInput) => {
      const userId = (session?.user as any)?.id;
      if (!userId) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", String(price));
      formData.append("description", description);
      // This tells backend which old URLs to keep
      formData.append("existingImages", JSON.stringify(keptExistingUrls));

     // These are the new files to upload
      newImages.forEach((file) => {
        formData.append("images", file);
      });

      const res = await api.put(`/products/${id}`, formData, {
        headers: {
          "x-user-id": userId,
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
  });
}

// ----------------- DELETE -----------------

export function useDeleteProduct() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const userId = (session?.user as any)?.id;
      if (!userId) throw new Error("Not authenticated");

      await api.delete(`/products/${id}`, {
        headers: {
          "x-user-id": userId,
        },
      });

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
