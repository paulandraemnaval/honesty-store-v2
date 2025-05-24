"use client";
import React, { useEffect } from "react";
import { SectionCards } from "./dashboard-cards";
import { IncomeChart } from "./income-chart";
import { RevenueChart } from "./revenue-chart";
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
        reports: data?.data?.reports,
        suppliers: data?.data?.suppliers,
      }));
    }
  }, [isSuccess]);

  const { products, reports, suppliers } = data?.data || {};

  const totalIncome =
    reports?.reduce((acc, report) => acc + report.report_total_income, 0) || 0;
  const totalRevenue =
    reports?.reduce((acc, report) => acc + report.report_total_revenue, 0) || 0;
  const profitHist =
    reports?.map((report) => ({
      date: new Date(report.report_end_date),
      profit: report.report_total_income,
    })) || [];
  const salesHist =
    reports?.map((report) => ({
      date: new Date(report.report_end_date),
      revenue: report.report_total_revenue,
    })) || [];

  return (
    <div className="flex flex-col gap-4 w-full px-6 py-4">
      <SectionCards
        suppliers={suppliers}
        products={products}
        reports={reports}
        isLoading={isLoading}
        totalProfit={totalIncome}
        totalSales={totalRevenue}
      />
      <div className="grid grid-rows-2 grid-cols-1 lg:grid-rows-1 lg:grid-cols-2 gap-4 w-full ">
        <IncomeChart profitHist={profitHist} isLoading={isLoading} />
        <RevenueChart salesHist={salesHist} isLoading={isLoading} />
      </div>
    </div>
  );
}
