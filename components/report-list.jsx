"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  DownloadIcon,
  SearchIcon,
  ChevronDownIcon,
  FileTextIcon,
  ClipboardListIcon,
  Download,
  Delete,
  View,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sample data for demonstration
const reports = [
  {
    id: "REP-001",
    creationDate: new Date(2025, 3, 10),
    auditsCount: 24,
    dateSpan: { start: new Date(2025, 3, 1), end: new Date(2025, 3, 7) },
    status: "Completed",
  },
  {
    id: "REP-002",
    creationDate: new Date(2025, 3, 8),
    auditsCount: 18,
    dateSpan: { start: new Date(2025, 2, 25), end: new Date(2025, 3, 3) },
    status: "Completed",
  },
  {
    id: "REP-003",
    creationDate: new Date(2025, 3, 5),
    auditsCount: 32,
    dateSpan: { start: new Date(2025, 2, 20), end: new Date(2025, 2, 28) },
    status: "Completed",
  },
  {
    id: "REP-004",
    creationDate: new Date(2025, 3, 1),
    auditsCount: 15,
    dateSpan: { start: new Date(2025, 2, 15), end: new Date(2025, 2, 22) },
    status: "Completed",
  },
  {
    id: "REP-005",
    creationDate: new Date(2025, 2, 25),
    auditsCount: 27,
    dateSpan: { start: new Date(2025, 2, 10), end: new Date(2025, 2, 17) },
    status: "Completed",
  },
];

export default function ReportList() {
  const [searchTerm, setSearchTerm] = useState("");

  // Stats for summary cards
  const totalReports = reports.length;
  const totalAudits = reports.reduce(
    (sum, report) => sum + report.auditsCount,
    0
  );
  const latestReport = reports.reduce(
    (latest, report) =>
      report.creationDate > latest.creationDate ? report : latest,
    reports[0]
  );

  return (
    <div className="flex flex-col gap-6 px-6 py-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
            <ClipboardListIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAudits}</div>
            <p className="text-xs text-muted-foreground">Across all reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Report</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(latestReport.creationDate, "MMM d, yyyy")}
            </div>
            <p className="text-xs text-muted-foreground">
              {latestReport.auditsCount} audits included
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Select defaultValue="all">
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

      {/* Reports Table */}
      <div className="rounded-md border mb-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Report ID</TableHead>
              <TableHead>Creation Date</TableHead>
              <TableHead>No. of Audits</TableHead>
              <TableHead>Date Span</TableHead>
              <TableHead className="text-right  pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.id}</TableCell>
                <TableCell>
                  {format(report.creationDate, "MMM d, yyyy")}
                </TableCell>
                <TableCell>{report.auditsCount}</TableCell>
                <TableCell>
                  {format(report.dateSpan.start, "MMM d")} -{" "}
                  {format(report.dateSpan.end, "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="bg-red-500"
                  >
                    <Trash2 />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
