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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const audits = [
  { date: "2024-05-12" },
  { date: "2024-07-28" },
  { date: "2024-09-03" },
  { date: "2024-10-19" },
  { date: "2024-12-01" },
  { date: "2025-01-10" },
  { date: "2025-02-22" },
  { date: "2025-03-15" },
  { date: "2024-08-06" },
  { date: "2024-11-17" },
];

export default function ReportDialog() {
  function getDeficit(audit) {
    return audit.oldqty - audit.newqty;
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="custom-form-button ">
          Create Report
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Report</AlertDialogTitle>
          <AlertDialogDescription>
            The following audits will be used to create the report. Please
            confirm the report
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Audit Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audits.map((audit) => (
                  <TableRow key={audit.product_name}>
                    <TableCell className="font-medium">{audit.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="custom-form-button">
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
