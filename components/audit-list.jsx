import React from "react";

import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { Minus, Plus } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
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

const AuditList = ({ props }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 w-full px-6 py-4`}>
      {products.map((product, index) => (
        <AuditItem key={index} product={product} />
      ))}
    </div>
  );
};

const AuditItem = ({ product }) => {
  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="px-4 h-full">
        <div className="flex items-center h-full gap-6">
          <div className="relative h-22 w-22  object-fit aspect-[4/3] ">
            <Image
              src="/defaultImages/Jolibbee.jpg"
              alt="product_image"
              fill
              className="rounded-md border shadow-2xs"
            />
          </div>
          <div className="flex flex-col pt-6 pb-4 w-full">
            <span className="text-sm text-gray-500">{product.name}</span>
            <span className="font-semibold text-lg">{product.units} units</span>
            <div className="w-full flex justify-end items-center gap-2">
              <Button variant="outline" size="icon">
                <Plus className="h-2 " />
              </Button>
              <Input className="w-18" type="number" placeholder="0" />
              <Button variant="outline" size="icon">
                <Minus />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditList;
