"use client";

import { useEffect, useState, useMemo, FormEvent, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProduct, useUpdateProduct } from "@/hooks/use-products";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { z } from "zod";

type FormErrors = {
  name?: string;
  price?: string;
  images?: string;
};

const editProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  price: z.coerce.number().positive("Valid price is required"),
  description: z.string().optional(),
});

const MAX_IMAGES = 3;

type ImageItem =
  | {
      id: string;
      type: "existing";
      url: string;
    }
  | {
      id: string;
      type: "new";
      url: string;
      file: File;
    };

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const router = useRouter();

  const { data: product, isLoading, isError } = useProduct(productId);
  const updateProduct = useUpdateProduct();

  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  // build preview data (URLs already exist for both)
  const previewItems = useMemo(() => images, [images]);

  // populate initial state from product
  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(String(product.price));
      setDescription(product.description ?? "");
      setImages(
        (product.images ?? []).map((url) => ({
          id: url, // safe enough as unique key
          type: "existing" as const,
          url,
        }))
      );
    }
  }, [product]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const incoming = Array.from(files);

    setImages((prev) => {
      const availableSlots = MAX_IMAGES - prev.length;
      if (availableSlots <= 0) return prev;

      const limited = incoming.slice(0, availableSlots);

      const newItems: ImageItem[] = limited.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        type: "new",
        url: URL.createObjectURL(file),
        file,
      }));

      setErrors((prevErr) => ({ ...prevErr, images: undefined }));
      return [...prev, ...newItems];
    });
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setErrors((prev) => ({ ...prev, images: undefined }));
  };

  const validate = (): boolean => {
    const result = editProductSchema.safeParse({
      name,
      price,
      description,
    });

    const newErrors: FormErrors = {};

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if ((field === "name" || field === "price") && !newErrors[field]) {
          newErrors[field] = issue.message;
        }
      }
    }

    if (images.length < 3) {
      newErrors.images = "At least 3 images are required";
    }

    if (images.length > MAX_IMAGES) {
      newErrors.images = `Maximum ${MAX_IMAGES} images allowed`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    if (!validate()) return;

    // derive what to send
    const keptExistingUrls = images
      .filter((img) => img.type === "existing")
      .map((img) => img.url);

    const newFiles = images
      .filter(
        (img): img is Extract<ImageItem, { type: "new" }> => img.type === "new"
      )
      .map((img) => img.file);

    try {
      await updateProduct.mutateAsync({
        id: productId,
        name: name.trim(),
        price: Number(price),
        description: description.trim(),
        keptExistingUrls,
        newImages: newFiles,
      });

      router.push("/dashboard/products");
    } catch (err) {
      console.error(err);
    }
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Edit Product</h2>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/products")}
        >
          Back to Products
        </Button>
      </div>

      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name + Price in one row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  required
                />
                {errors.name && (
                  <p className="text-xs text-red-400 mt-1">{errors.name}</p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setErrors((prev) => ({ ...prev, price: undefined }));
                  }}
                  required
                />
                {errors.price && (
                  <p className="text-xs text-red-400 mt-1">{errors.price}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Images (existing + new together) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Product Images (max {MAX_IMAGES}, min 3)
                </label>
                <span className="text-xs text-slate-400">
                  Total selected: {images.length}
                </span>
              </div>

              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />

              {errors.images && (
                <p className="text-xs text-red-400 mt-1">{errors.images}</p>
              )}

              {previewItems.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {previewItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative w-full aspect-video overflow-hidden rounded-md border border-slate-200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt="Product image"
                        className="w-full h-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(item.id)}
                        className="absolute top-1 right-1 inline-flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="mt-4">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
