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
import { Label } from "./ui/label";

const invoices = [
  {
    dateCreated: "2025-04-01T10:30:00Z",
    cashInflow: 1500.0,
    cashOutflow: 500.0,
    firebaseId: "abc123xyz",
  },
  {
    dateCreated: "2025-04-02T14:45:00Z",
    cashInflow: 2000.0,
    cashOutflow: 1200.0,
    firebaseId: "def456uvw",
  },
  {
    dateCreated: "2025-04-03T09:15:00Z",
    cashInflow: 1000.0,
    cashOutflow: 800.0,
    firebaseId: "ghi789rst",
  },
  {
    dateCreated: "2025-04-04T16:00:00Z",
    cashInflow: 2500.0,
    cashOutflow: 950.0,
    firebaseId: "jkl012opq",
  },
  {
    dateCreated: "2025-04-05T11:20:00Z",
    cashInflow: 3000.0,
    cashOutflow: 1800.0,
    firebaseId: "mno345lmn",
  },
];
export function InventoryTable() {
  return (
    <Table>
      <TableCaption>Click on a row to view its details</TableCaption>
      <TableHeader className="w-full">
        <TableRow>
          <TableHead className="w-[100px]">Date Created</TableHead>
          <TableHead>Outflow</TableHead>
          <TableHead>Inflow</TableHead>
          <TableHead className="text-right">ID</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.firebaseId}>
            <TableCell className="font-medium">
              {new Date(invoice.dateCreated).toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </TableCell>
            <TableCell className="font-medium">{invoice.cashInflow}</TableCell>
            <TableCell>{invoice.cashOutflow}</TableCell>
            <TableCell className="text-right">{invoice.firebaseId}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default InventoryTable;
