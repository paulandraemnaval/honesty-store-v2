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
import { MoreHorizontalIcon, PackagePlus, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import ProductForm from "./product-form";
import InventoryTable from "./inventory-table";

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
        />
      ))}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full p-4 bg-white shadow-md flex items-center">
          <div className="w-full">
            <div className="flex justify-between items-start mb-4">
              <SheetHeader className="flex flex-col justify-start text-left">
                <SheetTitle className="text-lg font-semibold">
                  Product Details
                </SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  View and edit product details here.
                </SheetDescription>
              </SheetHeader>
            </div>

            <Tabs defaultValue="product" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="product">Edit Product</TabsTrigger>
                <TabsTrigger value="inventory">Browse Inventories</TabsTrigger>
              </TabsList>
              <TabsContent
                value="product"
                className="overflow-y-auto max-h-[80vh]"
              >
                <ProductForm product={selectedProduct} />
              </TabsContent>
              <TabsContent value="inventory">
                <InventoryTable product={selectedProduct} />
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const ProductCard = ({ product, onViewDetails }) => {
  const { name, expiryDate, units, price } = product;

  return (
    <Card className="w-full max-w-xs shadow-xs overflow-hidden gap-2 py-4">
      <CardHeader className="flex flex-row items-center w-full px-4">
        <CardTitle className="text-[0.80rem] font-medium mr-auto">
          {name}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onViewDetails(product)}
        >
          <MoreHorizontalIcon />
        </Button>
      </CardHeader>
      <CardContent className="p-0 mb-2">
        <div className="relative w-full aspect-[4/3]">
          <Image
            src="/defaultImages/jolibbee.jpg"
            alt="Placeholder"
            fill
            className="object-cover"
          />
        </div>
      </CardContent>
      <CardFooter className="px-4">
        <div className="flex flex-1 flex-col mr-auto justify-around h-full">
          <span className="text-xs">{units} units</span>
          <span className="mr-auto ">₱{price}</span>
        </div>
        <div className="flex justify-around h-full items-center gap-2">
          <ExpriryStatus expiryDate={expiryDate} />

          <Button variant="outline" className="icon-button">
            <PackagePlus stroke="white" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductsList;
