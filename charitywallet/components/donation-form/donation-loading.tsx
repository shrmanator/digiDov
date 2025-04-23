import React from "react";
import { Skeleton }   from "@/components/ui/skeleton";
import { Separator }  from "@/components/ui/separator";

export function DonationLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Skeleton className="mb-2 h-5 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
      <div className="flex items-center">
        <Separator className="flex-1" />
        <span className="mx-2 text-sm font-medium text-muted-foreground">OR</span>
        <Separator className="flex-1" />
      </div>
      <div>
        <Skeleton className="mb-2 h-5 w-1/2" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}
