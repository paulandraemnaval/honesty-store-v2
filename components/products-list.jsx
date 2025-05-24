"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import Image from "next/image";
import { Button } from "./ui/button";
import { MoreHorizontal, PackagePlus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { usePathname } from "next/navigation";
import { AdminProductMore, CustomerProductMore } from "./product-more";
import ExpiryStatus from "./expiry-status";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useGlobalContext } from "@/contexts/global-context";
import { categoriesGET, inventoryGET, supplierGET } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import InventoryForm from "./inventory-form";
import { Dialog, DialogContent } from "./ui/dialog";

const ProductsList = ({ customer }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sheetType, setSheetType] = useState("details");
  const sentinelRef = useRef(null);
  const pathName = usePathname();

  const {
    setSelectedProduct,
    setCategories,
    categories,
    setSuppliers,
    setCatLoading,
    setSupLoading,
    setProducts,
    filteredProducts,
    setSelectedCategory,
    setSelectedSupplier,
  } = useGlobalContext();

  const {
    data: cats,
    isLoading: localCatLoading,
    isSuccess: catSuccess,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesGET(),
    staleTime: 30 * 60 * 1000,
  });

  const {
    data: sups,
    isLoading: localSupLoading,
    isSuccess: supSuccess,
  } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => supplierGET(),
    staleTime: 30 * 60 * 1000,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching: productsLoading,
    isSuccess: prodSuccess,
  } = useInfiniteQuery({
    queryKey: ["products"],
    queryFn: ({ pageParam = "" }) => inventoryGET(pageParam),
    getNextPageParam: (lastPage) => {
      return lastPage.lastVisible || undefined;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!productsLoading && prodSuccess) {
      setProducts(data.pages.flatMap((page) => page.data));
    }
  }, [data]);

  useEffect(() => {
    if (!localSupLoading && supSuccess) {
      setSupLoading(localSupLoading);
      setSuppliers(sups.data);
    }
  }, [supSuccess, sups?.data, localSupLoading, setSuppliers]);

  useEffect(() => {
    if (!localCatLoading && catSuccess) {
      setCategories(cats.data);
      setCatLoading(localCatLoading);
    }
  }, [catSuccess, cats?.data, localCatLoading, setCategories]);

  useEffect(() => {
    setSelectedCategory(null);
    setSelectedSupplier(null);
  }, [isSheetOpen]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          console.log("Loading more products...");
          fetchNextPage();
        }
      },
      { rootMargin: "150px", threshold: 0.2 }
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  function openProductSheet(product) {
    setSelectedProduct(product);
    setSheetType("details");
    setIsSheetOpen(true);
  }

  function openProductDialog(product) {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  }

  function openInventorySheet(product) {
    setSelectedProduct(product);
    setSheetType("inventory");
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
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full px-6 py-4`}
      >
        {productsLoading && !filteredProducts?.length ? (
          <ProductListSkeleton />
        ) : (
          filteredProducts?.map((prodwinv, index) => {
            if (!prodwinv.inventory && customer) return null;
            if (!prodwinv.inventory && hasNextPage) return null;

            return (
              <ProductCard
                key={`${
                  prodwinv?.product?.product_id || prodwinv?.product_id
                }-${index}`}
                prod={prodwinv?.product || prodwinv}
                inv={prodwinv?.inventory}
                onViewDetails={() =>
                  pathName.includes("admin")
                    ? openProductSheet(prodwinv?.product || prodwinv)
                    : openProductDialog(prodwinv?.product || prodwinv)
                }
                onInventoryAction={() =>
                  openInventorySheet(prodwinv?.product || prodwinv)
                }
                admin={pathName.includes("admin")}
                category={getProductCategory(
                  prodwinv?.product?.product_category ||
                    prodwinv?.product_category
                )}
              />
            );
          })
        )}

        {!productsLoading && !filteredProducts?.length ? (
          <div className="col-span-full flex items-center justify-center h-48 text-muted-foreground text-lg font-semibold">
            No products found.
          </div>
        ) : null}
      </div>

      {hasNextPage !== false && (
        <div className="w-full py-4 flex justify-center" ref={sentinelRef}>
          {isFetchingNextPage && (
            <div className="loader text-sm text-muted-foreground">
              Loading more...
            </div>
          )}
        </div>
      )}

      {pathName.includes("admin") ? (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="w-full p-4 bg-white shadow-md">
            {sheetType === "details" ? (
              <AdminProductMore setIsSheetOpen={setIsSheetOpen} />
            ) : (
              <InventoryForm mode="add" />
            )}
          </SheetContent>
        </Sheet>
      ) : null}

      {!pathName.includes("admin") ? (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-full max-w-2xl p-4 bg-white shadow-md">
            <CustomerProductMore />
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
};

function ProductListSkeleton() {
  return (
    <>
      {Array(10)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="h-fit">
            <CardHeader className="p-0">
              <Skeleton className="h-52 w-full rounded-none" />
            </CardHeader>
            <CardContent className=" space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
    </>
  );
}

const ProductCard = ({
  prod,
  inv,
  onViewDetails,
  onInventoryAction,
  admin,
  category,
}) => {
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
              className="h-8 w-8 bg-white/80 backdrop-blur-sm"
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
          <AdminButtons
            expiryDate={inv?.inventory_expiration_date}
            onInventoryAction={onInventoryAction}
          />
        ) : null}
      </CardFooter>
    </Card>
  );
};

function AdminButtons({ expiryDate, onInventoryAction }) {
  return (
    <div className="flex gap-2">
      {expiryDate ? <ExpiryStatus expiryDate={expiryDate} /> : null}
      <Button
        variant="outline"
        className="custom-form-button"
        onClick={onInventoryAction}
      >
        <PackagePlus stroke="white" />
      </Button>
    </div>
  );
}

export default ProductsList;
