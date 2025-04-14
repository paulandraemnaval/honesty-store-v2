"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import Image from "next/image";
import { Button } from "./ui/button";
import { MoreHorizontal, PackagePlus } from "lucide-react";
import { Sheet, SheetContent } from "./ui/sheet";
import { usePathname } from "next/navigation";
import { AdminProductMore, CustomerProductMore } from "./product-more";
import ExpiryStatus from "./expiry-status";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useGlobalContext } from "@/contexts/global-context";
import { categoriesGET, inventoryGET } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

const ProductsList = ({ customer }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const sentinelRef = useRef(null);
  const pathName = usePathname();

  const { setSelectedProduct, setCategories, categories, setSuppliers } =
    useGlobalContext();

  // Categories query
  const {
    data: cats,
    isLoading: catLoading,
    isSuccess: catSuccess,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesGET(),
    staleTime: 30 * 60 * 1000,
  });

  const {
    data: sups,
    isLoading: supLoading,
    isSuccess: supSuccess,
  } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => categoriesGET("suppliers"),
    staleTime: 30 * 60 * 1000,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: productsLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: [`products-${customer ? "customer" : "admin"}`],
    queryFn: ({ pageParam = "" }) => inventoryGET(pageParam),
    getNextPageParam: (lastPage) => {
      return lastPage.lastVisible || undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const products = data?.pages.flatMap((page) => page.data) || [];

  useEffect(() => {
    if (!supLoading && supSuccess) {
      setSuppliers(sups.data);
    }
  }, [supSuccess, sups?.data, supLoading, setSuppliers]);

  useEffect(() => {
    if (!catLoading && catSuccess) {
      setCategories(cats.data);
    }
  }, [catSuccess, cats?.data, catLoading, setCategories]);

  // Intersection observer for infinite scroll
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
      { rootMargin: "150px", threshold: 0.2 } // Load a bit earlier for smoother experience
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

  if (isError) {
    return (
      <div className="p-8 text-center">
        Error loading products. Please try again.
      </div>
    );
  }

  return (
    <>
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full px-6 py-4`}
      >
        {productsLoading && !products.length ? (
          <ProductListSkeleton />
        ) : (
          products.map((prodwinv, index) => {
            if (!prodwinv.inventory && customer) return null;

            return (
              <ProductCard
                key={`${
                  prodwinv?.product?.product_id || prodwinv?.product_id
                }-${index}`}
                prod={prodwinv?.product || prodwinv}
                inv={prodwinv?.inventory}
                onViewDetails={() =>
                  openProductSheet(prodwinv?.product || prodwinv)
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
      </div>

      {/* Always show sentinel unless explicitly determined there are no more pages */}
      {hasNextPage !== false && (
        <div className="w-full py-4 flex justify-center" ref={sentinelRef}>
          {isFetchingNextPage && (
            <div className="loader text-sm text-muted-foreground">
              Loading more...
            </div>
          )}
        </div>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full p-4 bg-white shadow-md flex items-center">
          {pathName.includes("admin") ? (
            <AdminProductMore />
          ) : (
            <CustomerProductMore />
          )}
        </SheetContent>
      </Sheet>
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
