import React from "react";
import { AlertCircle } from "lucide-react";

export interface ErrorBannerProps {
  message: string;
}

/**
 * Displays an error message in a consistent banner style.
 */
export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message }) => (
  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 rounded p-3 mb-4">
    <AlertCircle className="h-5 w-5 flex-shrink-0" />
    <span className="text-sm font-medium">{message}</span>
  </div>
);
