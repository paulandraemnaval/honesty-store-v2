"use client";
import { Button } from "@/components/ui/button";
import { Table } from "lucide-react";

export default function SheetsButton() {
  function handleSheetsClick() {
    const url =
      "https://docs.google.com/spreadsheets/d/1PYKAm1mg1lbl5Qzn0JpltTpXsYcy3o0fbcQZR5aTnGI/edit?gid=1034794333#gid=1034794333";
    window.open(url, "_blank");
  }
  return (
    <Button
      variant="outline"
      className="sheets-button"
      onClick={handleSheetsClick}
    >
      Google Sheets
      <Table />
    </Button>
  );
}
