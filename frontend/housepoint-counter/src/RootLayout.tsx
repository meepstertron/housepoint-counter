import CustomSidebar from "@/components/sidebar";
import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[auto,1fr]">
      <CustomSidebar />
      <main className="overflow-auto ">{children}</main>
      <Toaster />
    </div>
  );
}
