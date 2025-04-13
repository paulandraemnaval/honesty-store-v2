"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import Image from "next/image";
import { Button } from "./ui/button";
import ExpriryStatus from "./expiry-status";
import { MoreHorizontal, PackagePlus, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { usePathname } from "next/navigation";
import { AdminProductMore, CustomerProductMore } from "./product-more";
import ExpiryStatus from "./expiry-status";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useGlobalContext } from "@/contexts/global-context";
import { toast } from "sonner";
import { categoriesGET, inventoryGET } from "@/lib/utils";

const ProductsList = ({ ...props }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [hidesentinel, setHideSentinel] = useState(false);
  const pathName = usePathname();
  const sentinelRef = useRef(null);

  const {
    products,
    setProducts,
    setSelectedProduct,
    lastVisible,
    setLastVisible,
    setCategories,
    categories,
  } = useGlobalContext();

  const {
    data: cats,
    isLoading: catLoading,
    isSuccess: catSuccess,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesGET(),
  });

  const {
    mutateAsync,
    isPending,
    data: prodwinv,
    isLoading: prodwinvLoading,
  } = useMutation({
    mutationFn: () => inventoryGET(lastVisible),
    onSuccess: (data) => {
      if (!data.lastVisible) setHideSentinel(true);
      setProducts(data.data);
      setLastVisible(data.lastVisible);
    },
    onError: (error) => {
      setHideSentinel(true);
      toast.error("Error fetching more products");
    },
    queryKey: ["prodwinv"],
  });

  useEffect(() => {
    if (!catLoading && catSuccess) {
      setCategories(cats.data);
    }
  }, [catSuccess]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isPending) {
          mutateAsync();
          console.log("Loading more products...");
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
      observer.disconnect();
    };
  }, [isPending, mutateAsync]);

  function openProductSheet(product) {
    setSelectedProduct(product);
    setIsSheetOpen(true);
  }

  function getProductCategory(categoryId) {
    if (categories) {
      const category = categories.find((cat) => cat.category_id === categoryId);
      return category ? category.category_name : "Uncategorized";
    }
    return "Unknown Category";
  }

  return (
    <>
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full ${props.className} px-6 py-4`}
      >
        {products?.map((prodwinv, index) => (
          <ProductCard
            key={index}
            prod={prodwinv?.product || prodwinv}
            inv={prodwinv?.inventory}
            onViewDetails={() =>
              openProductSheet(prodwinv?.product || prodwinv)
            }
            admin={pathName.includes("admin")}
            category={getProductCategory(
              prodwinv?.product?.product_category || prodwinv?.product_category
            )}
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
      <div className="w-full" ref={sentinelRef} hidden={hidesentinel}></div>
    </>
  );
};

const ProductCard = ({ prod, inv, onViewDetails, admin, category }) => {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-md py-0 gap-0">
      <CardHeader className="relative p-0">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={prod?.product_image_url || "/defaultImages/jolibbee.jpg"}
            alt={"product_image"}
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
      <CardContent className="p-3 h-full">
        {admin && (
          <div className="flex justify-between">
            <p className="text-xs text-muted-foreground">{category}</p>
            {admin && inv ? (
              <p className="text-xs text-muted-foreground">
                {inv?.inventory_total_units} units
              </p>
            ) : null}
          </div>
        )}
        <p className="line-clamp-2 ">{prod?.product_name}</p>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <p className="text-lg font-bold mr-auto">
          {inv
            ? `₱${parseFloat(inv?.inventory_retail_price).toFixed(2)}`
            : "No Inventory"}
        </p>
        {admin ? (
          <AdminButtons expiryDate={inv?.inventory_expiration_date} />
        ) : null}
      </CardFooter>
    </Card>
  );
};

function AdminButtons({ expiryDate }) {
  return (
    <div className="flex gap-2">
      {expiryDate ? <ExpiryStatus expiryDate={expiryDate} /> : null}
      <Button variant="outline" className="icon-button">
        <PackagePlus stroke="white" />
      </Button>
    </div>
  );
}

export default ProductsList;
