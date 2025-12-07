"use client";

import { FormEvent, useState, ChangeEvent, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateProduct } from "@/hooks/use-products";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { z } from "zod";
import { X } from "lucide-react";

type FormErrors = {
  name?: string;
  price?: string;
  images?: string;
};

// Zod schema for product form
const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  price: z.coerce.number().positive("Valid price is required"),
  description: z.string().optional(),
  images: z.array(z.instanceof(File)).min(3, "Please select at least 3 images"),
});

export default function NewProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();

  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  // create local preview URLs for selected images
  const previewUrls = useMemo(
    () =>
      images.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [images]
  );

  // cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      previewUrls.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previewUrls]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const incoming = Array.from(files);

    setImages((prev) => {
      // avoid duplicates based on name+size+lastModified
      const existingKeys = new Set(
        prev.map((f) => `${f.name}-${f.size}-${f.lastModified}`)
      );

      const newFiles = incoming.filter((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        return !existingKeys.has(key);
      });

      const updated = [...prev, ...newFiles];

      // clear image-related errors once user adds new files
      setErrors((prevErr) => ({ ...prevErr, images: undefined }));
      return updated;
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => ({ ...prev, images: undefined }));
  };

  const validate = (): boolean => {
    // use Zod to validate full form data
    const result = productSchema.safeParse({
      name,
      price,
      description,
      images,
    });

    if (!result.success) {
      const newErrors: FormErrors = {};

      // Map Zod issues to our FormErrors shape
      for (const issue of result.error.issues) {
        const field = issue.path[0]; // "name" | "price" | "images" | ...

        if (
          (field === "name" || field === "price" || field === "images") &&
          !newErrors[field]
        ) {
          newErrors[field] = issue.message;
        }
      }

      setErrors(newErrors);
      return false;
    }

    // clear errors if everything is valid
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await createProduct.mutateAsync({
        name: name.trim(),
        price: Number(price),
        description: description.trim(),
        images,
      });

      router.push("/dashboard/products");
    } catch (err) {
      console.error(err);
      alert(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Add Product</h2>
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
                  placeholder="Enter product name"
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
                  placeholder="Enter price"
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
                placeholder="Describe the product"
                rows={4}
              />
            </div>

            {/* Images */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Product Images (min 3)
                </label>
                <span className="text-xs text-slate-400">
                  Selected: {images.length}
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

              {/* Previews with remove button */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {previewUrls.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative w-full aspect-video overflow-hidden rounded-md border border-slate-200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 inline-flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="mt-4"
              //   disabled={createProduct.isLoading}
            >
              {/* {createProduct.isLoading ? "Creating..." : "Create Product"} */}
              create product
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
