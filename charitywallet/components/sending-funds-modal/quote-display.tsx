"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePayTrieQuote } from "@/hooks/use-paytrie-quotes";

export default function QuoteDisplay() {
  const { quote, isLoading, error } = usePayTrieQuote();

  if (error) {
    return <div className="text-red-600">Error: {error.message}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exchange Rate</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <div className="text-lg font-semibold">
            {quote ? (
              <>1 CAD ≈ {quote.cadusd.toFixed(4)} USD</>
            ) : (
              "No quote available"
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
