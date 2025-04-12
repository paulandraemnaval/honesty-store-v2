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
  { product_name: "Apple iPhone 15", oldqty: 120, newqty: 115 },
  { product_name: "Samsung Galaxy S23", oldqty: 80, newqty: 75 },
  { product_name: "Sony WH-1000XM5", oldqty: 45, newqty: 40 },
  { product_name: "Dell XPS 13", oldqty: 30, newqty: 28 },
  { product_name: "Apple MacBook Pro", oldqty: 50, newqty: 47 },
  { product_name: "Google Pixel 8", oldqty: 60, newqty: 55 },
  { product_name: "Logitech MX Master 3", oldqty: 75, newqty: 70 },
  { product_name: "HP Envy 14", oldqty: 40, newqty: 38 },
  { product_name: "Nintendo Switch", oldqty: 90, newqty: 85 },
  { product_name: "Sony PlayStation 5", oldqty: 100, newqty: 95 },
];
export default function AuditDialog() {
  function getDeficit(audit) {
    return audit.oldqty - audit.newqty;
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="custom-form-button">
          Confirm Audit
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Audit</AlertDialogTitle>
          <AlertDialogDescription>
            The following products will have these new unit quantities. Please
            confirm the audit.
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Product</TableHead>
                  <TableHead className="text-right">Old Unit Qty.</TableHead>
                  <TableHead className="text-right">New Unit Qty.</TableHead>
                  <TableHead className="text-right">Deficit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audits.map((audit) => (
                  <TableRow key={audit.product_name}>
                    <TableCell className="font-medium">
                      {audit.product_name}
                    </TableCell>
                    <TableCell className="font-medium text-right">
                      {audit.oldqty}
                    </TableCell>
                    <TableCell className="text-right">{audit.newqty}</TableCell>
                    <TableCell className="text-right">
                      {getDeficit(audit)}
                    </TableCell>
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
