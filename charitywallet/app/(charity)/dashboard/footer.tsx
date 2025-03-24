"use client";

import { Mail, Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button"; // shadcn/ui Button component
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DashboardFooter() {
  const [isCopied, setIsCopied] = useState(false);
  const email = "contact@digidov.com";

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(email);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy email", err);
    }
  };

  return (
    <div className="fixed bottom-0 right-0 m-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={handleCopy} variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              <span className="text-xs">{email}</span>
              <span className="ml-2">
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to copy email</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
