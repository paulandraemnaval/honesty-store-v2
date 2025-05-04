import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

export function SectionCards({ ...props }) {
  if (props.isLoading) {
    return <CardsSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-6">
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription className="text-black">Total Profit</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums text-textColor">
            ₱{props?.totalProfit?.toFixed(2)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription className="text-black">Total Sales</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums text-textColor">
            ₱{props?.totalSales?.toFixed(2)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription className="text-black">Categories</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums text-textColor">
            {props.categories}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription className="text-black">Products</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums text-textColor">
            {props.products}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

function CardsSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="@container/card">
          <CardHeader className="relative">
            <CardDescription>
              <Skeleton className="h-4 w-20" />
            </CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              <Skeleton className="h-8 w-28 mt-1" />
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
