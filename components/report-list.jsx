"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import {
  CalendarIcon,
  Download,
  Trash2,
  FileTextIcon,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Skeleton } from "./ui/skeleton";

import { reportDELETE, reportsGET } from "@/lib/utils";

// Zod schema for report validation
const ReportSchema = z.object({
  report_id: z.string(),
  report_start_date: z.object({
    seconds: z.number(),
  }),
  report_last_updated: z.object({
    seconds: z.number(),
  }),
  report_cash_inflow: z.string().or(z.number()),
  report_cash_outflow: z.string().or(z.number()),
  report_soft_deleted: z.boolean().optional(),
});

const ReportsResponseSchema = z.object({
  reports: z.array(ReportSchema),
});

export default function ReportList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingStates, setDownloadingStates] = useState({});
  const [dateFilter, setDateFilter] = useState("all");

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const reportsPerPage = 5;

  // Fetch reports using React Query
  const {
    data: reportData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["reports"],
    queryFn: () => reportsGET(""),
  });

  const { mutateAsync: deleteReport } = useMutation({
    mutationFn: (id) => reportDELETE(id),
    mutationKey: ["deleteReport"],
    onSuccess: () => {
      refetch();
      toast.success("Report deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeleteInProgress(false);
    },
    onError: (error) => {
      toast.error("Failed to delete report: " + error.message);
      setDeleteInProgress(false);
    },
  });

  const reports = reportData?.reports || [];

  const handleExportPDF = async (reportID, startDate, lastUpdated) => {
    try {
      setDownloadingStates((prevStates) => ({
        ...prevStates,
        [reportID]: true,
      }));

      console.log("Downloading report", reportID);
      const response = await fetch(`/api/admin/sheets/${reportID}`);
      const blob = await response.blob();

      if (response.ok && blob.size > 0) {
        const buffer = Buffer.from(await blob.arrayBuffer());
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([buffer]));
        link.download = `Financial Report from ${startDate} to ${lastUpdated}.pdf`;
        link.click();
      } else {
        toast.error("Failed to download report");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingStates((prevStates) => ({
        ...prevStates,
        [reportID]: false,
      }));
    }
  };

  // Filter reports by date if needed
  const filteredReports = reports.filter(
    (report) => report.report_soft_deleted === false
  );

  // Calculate total reports
  const totalReports = filteredReports.length;

  // Find latest report
  const latestReport =
    filteredReports.length > 0
      ? filteredReports.reduce((latest, report) => {
          const currentDate = new Date(
            report.report_last_updated.seconds * 1000
          );
          const latestDate = new Date(
            latest.report_last_updated.seconds * 1000
          );
          return currentDate > latestDate ? report : latest;
        }, filteredReports[0])
      : null;

  // Pagination logic
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports
    .filter((report) => report.report_soft_deleted === false)
    .slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle opening the delete confirmation dialog
  const openDeleteDialog = (report) => {
    setReportToDelete(report);
    setIsDeleteDialogOpen(true);
  };

  // Handle the actual deletion after confirmation
  const handleDeleteConfirmed = async () => {
    if (!reportToDelete) return;

    setDeleteInProgress(true);
    await deleteReport(reportToDelete.report_id);
  };

  if (isLoading) {
    return <ReportSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6 px-6 py-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-muted-foreground">
              All financial reports
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Report</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestReport
                ? format(
                    new Date(latestReport.report_last_updated.seconds * 1000),
                    "MMM d, yyyy"
                  )
                : "No reports"}
            </div>
            <p className="text-xs text-muted-foreground">
              {latestReport
                ? `Cash flow: ${
                    Number(latestReport.report_cash_inflow) -
                    Number(latestReport.report_cash_outflow)
                  }`
                : "No data available"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={dateFilter}
            onValueChange={(value) => {
              setDateFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="quarter">This quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border mb-auto">
        {currentReports.length === 0 ? (
          <div className="py-8 text-center">No reports found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Report Date Range</TableHead>
                <TableHead>Cash Inflow</TableHead>
                <TableHead>Cash Outflow</TableHead>
                <TableHead>Net Cashflow</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentReports.map((report) => {
                const startDate = new Date(
                  report.report_start_date.seconds * 1000
                );
                const lastUpdatedDate = new Date(
                  report.report_last_updated.seconds * 1000
                );

                const formattedStartDate = format(startDate, "MM/dd/yyyy");
                const formattedLastUpdatedDate = format(
                  lastUpdatedDate,
                  "MM/dd/yyyy"
                );

                return (
                  <TableRow key={report.report_id}>
                    <TableCell className="font-medium">{`${formattedStartDate} to ${formattedLastUpdatedDate}`}</TableCell>
                    <TableCell>₱{report.report_cash_inflow}</TableCell>
                    <TableCell>₱{report.report_cash_outflow}</TableCell>
                    <TableCell>
                      ₱{report.report_cash_inflow - report.report_cash_outflow}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="bg-red-500"
                        onClick={() => openDeleteDialog(report)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={downloadingStates[report.report_id]}
                        onClick={() =>
                          handleExportPDF(
                            report.report_id,
                            formattedStartDate,
                            formattedLastUpdatedDate
                          )
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                className={
                  currentPage === 1
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
              let pageNumber;

              // Logic to display page numbers around the current page
              if (totalPages <= 5) {
                pageNumber = idx + 1;
              } else if (currentPage <= 3) {
                pageNumber = idx + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + idx;
              } else {
                pageNumber = currentPage - 2 + idx;
              }

              return (
                <PaginationItem key={idx}>
                  <PaginationLink
                    onClick={() => paginate(pageNumber)}
                    isActive={currentPage === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  currentPage < totalPages && paginate(currentPage + 1)
                }
                className={
                  currentPage === totalPages
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(isOpen) => {
          // Only allow closing if deletion is not in progress
          if (!deleteInProgress) {
            setIsDeleteDialogOpen(isOpen);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this report?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              financial report
              {reportToDelete &&
                ` from ${format(
                  new Date(reportToDelete.report_start_date.seconds * 1000),
                  "MM/dd/yyyy"
                )} 
                to ${format(
                  new Date(reportToDelete.report_last_updated.seconds * 1000),
                  "MM/dd/yyyy"
                )}`}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteInProgress}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault(); // Prevent default close behavior
                handleDeleteConfirmed();
              }}
              disabled={deleteInProgress}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteInProgress ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Report"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-6 py-4">
      {/* Summary Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-36 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Report</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-3 w-40 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Select disabled>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All dates</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border mb-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Report Date Range</TableHead>
              <TableHead>Cash Inflow</TableHead>
              <TableHead>Cash Outflow</TableHead>
              <TableHead>Net Cashflow</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Skeleton className="h-5 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Skeleton className="h-8 w-8 inline-block rounded-md" />
                  <Skeleton className="h-8 w-8 inline-block rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Skeleton */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious className="cursor-not-allowed opacity-50" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>
              <Skeleton className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>
              <Skeleton className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>
              <Skeleton className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext className="cursor-not-allowed opacity-50" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
