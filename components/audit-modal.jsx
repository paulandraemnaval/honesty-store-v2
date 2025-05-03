"use client";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAudit } from "@/contexts/audit-context";

export default function AuditDialog() {
  const { auditChanges, isSubmitting, hasAuditChanges, handleSubmitAudit } =
    useAudit();

  const totalDeficit = auditChanges.reduce(
    (total, audit) => total + audit.deficit,
    0
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="custom-form-button "
          disabled={!hasAuditChanges}
        >
          Confirm Audit
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="overflow-hidden flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Audit</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <p className="mb-4">
                The following products will have these new unit quantities.
                Please confirm the audit.
              </p>
              <div className="max-h-[60vh] overflow-hidden ">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="">Product</TableHead>
                      <TableHead className="text-right">Old Qty</TableHead>
                      <TableHead className="text-right">New Qty</TableHead>
                      <TableHead className="text-right">Deficit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditChanges.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground"
                        >
                          No changes to audit
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditChanges.map((audit) => (
                        <TableRow key={audit.inventoryId}>
                          <TableCell className="font-medium max-w-[100px] truncate overflow-hidden whitespace-nowrap">
                            {audit.productName}
                          </TableCell>
                          <TableCell className="font-medium text-right">
                            {audit.oldQuantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {audit.newQuantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {audit.deficit}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  {auditChanges.length > 0 && (
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3}>Total Deficit</TableCell>
                        <TableCell className="text-right">
                          {totalDeficit}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="custom-form-button"
            onClick={(e) => {
              e.preventDefault(); // Prevent the dialog from closing automatically
              handleSubmitAudit();
            }}
            disabled={isSubmitting || !hasAuditChanges}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Audit"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
