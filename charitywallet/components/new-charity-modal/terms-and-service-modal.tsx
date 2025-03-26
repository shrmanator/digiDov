"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function TermsAndServicesModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-blue-500 underline hover:text-blue-700"
        >
          terms and services
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Terms and Services</DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              By confirming, you agree that the name you provided will be used
              as your digital signature on tax receipts.
            </p>
            <p>
              You also agree to our standard terms and conditions related to the
              use of this platform. This includes how your information is used,
              stored, and disclosed.
            </p>
            <p>
              If you have any questions, please contact support before
              continuing.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
