"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";

export function DashboardHeader() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        <h1
          className="font-semibold text-lg text-white cursor-pointer hover:text-slate-300 transition"
          onClick={() => router.push("/dashboard/products")}
        >
          Product Dashboard
        </h1>

        <button
          className="text-slate-300 hover:text-white transition"
          onClick={() => router.push("/dashboard/cart")}
        >
          <ShoppingCart className="w-8 h-8" />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-300">
          {session?.user?.email ?? "User"}
        </span>

        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-slate-800 hover:text-white"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
