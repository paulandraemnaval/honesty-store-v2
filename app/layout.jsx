import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
export const metadata = {
  // Basic metadata
  title: "Honesty Store IMS | Inventory Management System",
  description:
    "A comprehensive inventory management system for tracking audits, reports, and user accounts.",

  // Open Graph / Facebook metadata
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://honesty-store-ims.vercel.app/",
    title: "Honesty Store IMS | Inventory Management System",
    description:
      "A comprehensive inventory management system for tracking audits, reports, and user accounts.",
    siteName: "Honesty Store IMS",
    images: [
      {
        url: "/metaIcons/open_graph_icon.png",
        width: 1200,
        height: 630,
        alt: "Honesty Store IMS Dashboard Preview",
      },
    ],
  },

  // Twitter metadata
  twitter: {
    card: "summary_large_image",
    title: "Honesty Store IMS | Inventory Management System",
    description:
      "A comprehensive inventory management system for tracking audits, reports, and user accounts.",
    images: ["/metaIcons/open_graph_icon.png"], // You'll need to create this image
    creator: "@polnavs", // Replace with your Twitter handle
  },

  // Icons
  icons: {
    icon: [{ url: "/metaIcons/tab_icon.png", type: "image/png" }],
  },

  // Canonical URL
  alternates: {
    canonical: "https://honesty-store-ims.vercel.app/",
  },

  // Additional metadata
  keywords: "inventory management, audit system, reports, account management",
  authors: [{ name: "Bea Ramirez, Paul Naval, Keith Valdeo" }],
  creator: "Honesty Store Team",
  publisher: "Honesty Store Team",
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL("https://honesty-store-ims.vercel.app"),
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#ffffff",
};

export default function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
      </head>
      <body className="h-[100vh] w-full font-inter">
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster expand={true} richColors position="bottom-center" />
        </QueryClientProvider>
      </body>
    </html>
  );
}
