"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactPlanner from "@/components/ContactPlanner";
import SupportUs from "@/components/SupportUs";

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAdminArea = pathname.startsWith("/admin");

  // Admin pages have no public wedding layout.
  if (isAdminArea) {
    return <>{children}</>;
  }

  // Normal wedding website layout.
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow">
        {children}
      </div>

      <Footer />

      <SupportUs />
      <ContactPlanner />
    </div>
  );
}