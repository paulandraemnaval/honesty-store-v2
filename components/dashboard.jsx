"use client";
import React, { useEffect } from "react";
import { SectionCards } from "./dashboard-cards";
import { IncomeChart } from "./area-chart";
import { RevenueChart } from "./bar-chart";
import { useQuery } from "@tanstack/react-query";
import { dashboardGET } from "@/lib/utils";
import { useGlobalContext } from "@/contexts/global-context";
import { toast } from "sonner";

export default function Dashboard() {
  const { setDashboard } = useGlobalContext();
  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardGET(),
    onError: (error) => {
      toast.error("Failed to fetch dashboard data");
    },
  });

  useEffect(() => {
    if (isSuccess) {
      setDashboard((prev) => ({
        ...prev,
        categories: data?.data?.categories,
        products: data?.data?.products,
        profit: data?.data?.profit,
        sales: data?.data?.sales,
        totalProfit: data?.data?.totalProfit,
        totalSales: data?.data?.totalSales,
      }));
    }
  }, [isSuccess]);

  const {
    categories,
    products,
    profit: profitHist,
    sales: salesHist,
    totalProfit,
    totalSales,
  } = data?.data || {};

  return (
    <div className="flex flex-col gap-4 w-full px-6 py-4">
      <SectionCards
        categories={categories}
        products={products}
        totalProfit={totalProfit}
        totalSales={totalSales}
        isLoading={isLoading}
      />
      <div className="grid grid-rows-1 grid-cols-2 gap-4">
        <IncomeChart profitHist={profitHist} isLoading={isLoading} />
        <RevenueChart salesHist={salesHist} isLoading={isLoading} />
      </div>
    </div>
  );
}
