"use client";

import { CartProvider } from "@/contexts/CartContext";
import { SocketProvider } from "@/contexts/SocketContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SocketProvider>{children}</SocketProvider>
    </CartProvider>
  );
}
