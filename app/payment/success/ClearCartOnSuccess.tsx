"use client";

import { useEffect } from "react";

import { useStore } from "@/lib/store";

export function ClearCartOnSuccess() {
  useEffect(() => {
    useStore().clearCart();
  }, []);
  return null;
}