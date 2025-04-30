import { useGlobalContext } from "@/contexts/global-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Clock,
  Scale,
  Ruler,
  Calendar,
  PhilippinePeso,
} from "lucide-react";
import Image from "next/image";

export default function CustomerProductMoreContent() {
  const { selectedProduct, products } = useGlobalContext();
  console.log(products);
  const price = products
    .filter(
      (product) =>
        product?.inventory?.product_id === selectedProduct?.product_id
    )[0]
    ?.inventory?.inventory_retail_price.toFixed(2);
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold text-gray-900 pb-4">
          {selectedProduct?.product_name}
        </DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        {/* Product Image */}
        {selectedProduct?.product_image_url && (
          <div className="w-full items-center flex justify-center relative h-48 overflow-hidden">
            <Image
              src={selectedProduct.product_image_url}
              alt={selectedProduct.product_name}
              className=" object-contain rounded-md shadow-xs aspect[3/4] "
              onError={(e) => {
                e.target.src = "/defaultImages/placeholder_image.png";
                e.target.alt = "Product image unavailable";
              }}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Product Price */}
        <div className="border border-textColor p-4 rounded-lg bg-gray-50 w-fit">
          <p className="font-semibold flex items-center justify-center gap-2 text-xl text-textColor">
            <PhilippinePeso /> {price}
          </p>
        </div>

        {/* Product Description */}
        <div className="bg-gray-50 p-4 rounded-lg ">
          <h3 className="font-medium text-gray-900 mb-2">
            Product Description
          </h3>
          <p className="text-gray-600">
            {selectedProduct?.product_description}
          </p>
        </div>

        {/* Product Details */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Product Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Unit of Measure */}
            {selectedProduct?.product_uom && (
              <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
                <Package className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Unit</p>
                  <p className="font-medium">{selectedProduct.product_uom}</p>
                </div>
              </div>
            )}

            {/* Weight */}
            {selectedProduct?.product_weight && (
              <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
                <Scale className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-medium">
                    {selectedProduct.product_weight}g
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
