"use client";

import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function ReceiptClient() {
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex justify-between items-center no-print">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Billing
      </Button>
      <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
        <Printer className="w-4 h-4 mr-2" /> Print Receipt
      </Button>
    </div>
  );
}
