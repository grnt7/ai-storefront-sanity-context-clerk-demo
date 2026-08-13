import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { ChatWidget } from "@/components/chat/chat-widget";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SetupBanner } from "@/components/setup-banner";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <SetupBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <ChatWidget />
    </CartProvider>
  );
}
