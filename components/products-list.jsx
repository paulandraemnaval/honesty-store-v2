"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Image from "next/image";
import { Button } from "./ui/button";
import ExpriryStatus from "./expiry-status";
import { MoreHorizontal, PackagePlus, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { usePathname } from "next/navigation";
import { AdminProductMore, CustomerProductMore } from "./product-more";
import ExpiryStatus from "./expiry-status";

const products = [
  {
    name: "Lucky Me! Pancit Canton",
    expiryDate: "2025-02-15T00:00:00.000Z",
    units: 120,
    price: 14.5,
    description:
      "A classic Filipino instant noodle favorite, best served hot with calamansi and chili.",
  },
  {
    name: "Purefoods Corned Beef",
    expiryDate: "2025-04-20T00:00:00.000Z",
    units: 80,
    price: 36.75,
    description:
      "Juicy and meaty corned beef made from quality beef cuts, perfect with garlic rice.",
  },
  {
    name: "Century Tuna Hot & Spicy",
    expiryDate: "2026-01-05T00:00:00.000Z",
    units: 150,
    price: 31.0,
    description:
      "Healthy and flavorful tuna with a spicy kick, rich in Omega-3.",
  },
  {
    name: "Del Monte Pineapple Juice",
    expiryDate: "2025-09-25T00:00:00.000Z",
    units: 200,
    price: 23.5,
    description:
      "Refreshing pineapple juice packed with Vitamin C, a perfect drink for hot days.",
  },
  {
    name: "Bear Brand Sterilized Milk",
    expiryDate: "2025-08-20T00:00:00.000Z",
    units: 180,
    price: 28.0,
    description:
      "Fortified with Iron and Zinc, trusted by Filipino families for generations.",
  },
  {
    name: "Lucky Me! Pancit Canton",
    expiryDate: "2025-06-15T00:00:00.000Z",
    units: 120,
    price: 14.5,
    description:
      "A classic Filipino instant noodle favorite, best served hot with calamansi and chili.",
  },
  {
    name: "Purefoods Corned Beef",
    expiryDate: "2025-12-10T00:00:00.000Z",
    units: 80,
    price: 36.75,
    description:
      "Juicy and meaty corned beef made from quality beef cuts, perfect with garlic rice.",
  },
  {
    name: "Century Tuna Hot & Spicy",
    expiryDate: "2026-01-05T00:00:00.000Z",
    units: 150,
    price: 31.0,
    description:
      "Healthy and flavorful tuna with a spicy kick, rich in Omega-3.",
  },
  {
    name: "Del Monte Pineapple Juice",
    expiryDate: "2025-09-25T00:00:00.000Z",
    units: 200,
    price: 23.5,
    description:
      "Refreshing pineapple juice packed with Vitamin C, a perfect drink for hot days.",
  },
  {
    name: "Bear Brand Sterilized Milk",
    expiryDate: "2025-08-20T00:00:00.000Z",
    units: 180,
    price: 28.0,
    description:
      "Fortified with Iron and Zinc, trusted by Filipino families for generations.",
  },
  {
    name: "Lucky Me! Pancit Canton",
    expiryDate: "2025-06-15T00:00:00.000Z",
    units: 120,
    price: 14.5,
    description:
      "A classic Filipino instant noodle favorite, best served hot with calamansi and chili.",
  },
  {
    name: "Purefoods Corned Beef",
    expiryDate: "2025-12-10T00:00:00.000Z",
    units: 80,
    price: 36.75,
    description:
      "Juicy and meaty corned beef made from quality beef cuts, perfect with garlic rice.",
  },
  {
    name: "Century Tuna Hot & Spicy",
    expiryDate: "2026-01-05T00:00:00.000Z",
    units: 150,
    price: 31.0,
    description:
      "Healthy and flavorful tuna with a spicy kick, rich in Omega-3.",
  },
  {
    name: "Del Monte Pineapple Juice",
    expiryDate: "2025-09-25T00:00:00.000Z",
    units: 200,
    price: 23.5,
    description:
      "Refreshing pineapple juice packed with Vitamin C, a perfect drink for hot days.",
  },
  {
    name: "Bear Brand Sterilized Milk",
    expiryDate: "2025-08-20T00:00:00.000Z",
    units: 180,
    price: 28.0,
    description:
      "Fortified with Iron and Zinc, trusted by Filipino families for generations.",
  },
  {
    name: "Lucky Me! Pancit Canton",
    expiryDate: "2025-06-15T00:00:00.000Z",
    units: 120,
    price: 14.5,
    description:
      "A classic Filipino instant noodle favorite, best served hot with calamansi and chili.",
  },
  {
    name: "Purefoods Corned Beef",
    expiryDate: "2025-12-10T00:00:00.000Z",
    units: 80,
    price: 36.75,
    description:
      "Juicy and meaty corned beef made from quality beef cuts, perfect with garlic rice.",
  },
  {
    name: "Century Tuna Hot & Spicy",
    expiryDate: "2026-01-05T00:00:00.000Z",
    units: 150,
    price: 31.0,
    description:
      "Healthy and flavorful tuna with a spicy kick, rich in Omega-3.",
  },
  {
    name: "Del Monte Pineapple Juice",
    expiryDate: "2025-09-25T00:00:00.000Z",
    units: 200,
    price: 23.5,
    description:
      "Refreshing pineapple juice packed with Vitamin C, a perfect drink for hot days.",
  },
  {
    name: "Bear Brand Sterilized Milk",
    expiryDate: "2025-08-20T00:00:00.000Z",
    units: 180,
    price: 28.0,
    description:
      "Fortified with Iron and Zinc, trusted by Filipino families for generations.",
  },
];

const ProductsList = ({ ...props }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const pathName = usePathname();

  const openProductSheet = (product) => {
    setSelectedProduct(product);
    setIsSheetOpen(true);
  };

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full ${props.className} px-6 py-4`}
    >
      {products.map((product, index) => (
        <ProductCard
          key={index}
          product={product}
          onViewDetails={() => openProductSheet(product)}
          admin={pathName.includes("admin")}
          category={"category here"}
        />
      ))}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full p-4 bg-white shadow-md flex items-center">
          {pathName.includes("admin") ? (
            <AdminProductMore />
          ) : (
            <CustomerProductMore />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

const ProductCard = ({ product, onViewDetails, admin, category }) => {
  const { name, expiryDate, units, price } = product;

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-md py-0 gap-0">
      <CardHeader className="relative p-0">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={"/defaultImages/jolibbee.jpg" || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute right-2 top-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8  bg-white/80 backdrop-blur-sm"
              onClick={onViewDetails}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {category && (
          <div className="flex justify-between">
            <p className="text-xs text-muted-foreground">{category}</p>
            {admin ? (
              <p className="text-xs text-muted-foreground">{units} units</p>
            ) : null}
          </div>
        )}
        <p className="line-clamp-2">{name}</p>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <p className="text-lg font-bold mr-auto">₱{price}</p>
        {admin ? <AdminButtons expiryDate={expiryDate} /> : null}
      </CardFooter>
    </Card>
  );
};

function AdminButtons({ expiryDate }) {
  return (
    <div className="flex gap-2">
      <ExpiryStatus expiryDate={expiryDate} />
      <Button variant="outline" className="icon-button">
        <PackagePlus stroke="white" />
      </Button>
    </div>
  );
}

export default ProductsList;
