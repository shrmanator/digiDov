"use client";

import { Mail, Check, Copy } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ModeToggle } from "@/components/mode-toggle";

export default function Footer() {
  const [isCopied, setIsCopied] = useState(false);
  const email = "contact@digidov.com";

  const handleCopy = async (e: React.MouseEvent) => {
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
    <footer className="border-t py-2">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between sm:justify-end">
          <div className="order-2 sm:order-1 relative left-[-8px]">
            <ModeToggle />
          </div>
          {/* Email copy button */}
          <div className="order-1 sm:order-2 text-xs">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 group"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>{email}</span>
                    <span className="inline-flex items-center">
                      {isCopied ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100" />
                      )}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to copy email</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </footer>
  );
}
