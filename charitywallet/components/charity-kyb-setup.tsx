"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { markCharityKycAction } from "@/app/actions/kyc/mark-charity-kyc";

interface CharityKycCheckStepProps {
  onSuccess: () => void;
}

export default function CharityKycCheckStep({
  onSuccess,
}: CharityKycCheckStepProps) {
  const [loading, setLoading] = useState(false);

  const handleIveDoneIt = async () => {
    try {
      setLoading(true);
      await markCharityKycAction();
      toast({
        title: "KYC saved!",
        description: "You may now withdraw funds.",
      });
      onSuccess();
    } catch (err: unknown) {
      console.error("markCharityKycAction failed:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">
        Before you can withdraw, you must complete PayTrie’s KYB/KYC flow.
      </p>
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          onClick={() => window.open("https://business.paytrie.com/", "_blank")}
          className="w-full"
        >
          Go to PayTrie (KYB)
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            window.open("https://app.paytrie.com/LandingLogin", "_blank")
          }
          className="w-full"
        >
          Go to PayTrie (KYC)
        </Button>
        <Button onClick={handleIveDoneIt} disabled={loading} className="w-full">
          {loading ? "Saving…" : "I’ve completed PayTrie registration"}
        </Button>
      </div>
    </div>
  );
}
