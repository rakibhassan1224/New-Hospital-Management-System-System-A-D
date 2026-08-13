"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CreditCard, CheckCircle2, Wallet, Building2, Smartphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export function PatientBillingClient({ initialInvoices }: { initialInvoices: any[] }) {
  const router = useRouter();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Payment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("fpx");

  const openPaymentModal = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedInvoiceId) return;
    
    setProcessingId(selectedInvoiceId);
    setIsModalOpen(false);

    try {
      // Simulate a payment gateway delay for the chosen method
      await new Promise(resolve => setTimeout(resolve, 2000));

      const res = await fetch(`/api/patient/billing/${selectedInvoiceId}/pay`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Payment failed");
      }

      // Update local state
      setInvoices(prev => prev.map(inv => 
        inv.id === selectedInvoiceId ? { ...inv, status: "PAID" } : inv
      ));
      
      router.refresh();
    } catch (error) {
      alert("Failed to process payment. Please try again.");
    } finally {
      setProcessingId(null);
      setSelectedInvoiceId(null);
    }
  };

  const totalUnpaid = invoices.filter(inv => inv.status === "UNPAID").reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">No invoices found.</p>
            ) : (
              <div className="space-y-4">
                {invoices.map(invoice => (
                  <div key={invoice.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="font-semibold">
                        Consultation with Dr. {invoice.appointment.doctorName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(invoice.createdAt), "MMM do, yyyy")}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-bold text-lg">RM {invoice.amount.toFixed(2)}</div>
                      {invoice.status === "PAID" ? (
                        <Button 
                          variant="outline"
                          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                          onClick={() => router.push(`/patient/billing/${invoice.id}/receipt`)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> View Receipt
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => openPaymentModal(invoice.id)}
                          disabled={processingId === invoice.id}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {processingId === invoice.id ? "Processing..." : "Pay Now"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-slate-200 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-600" />
              Account Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Invoices</span>
              <span className="font-medium">{invoices.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Paid</span>
              <span className="font-medium text-emerald-600">
                {invoices.filter(i => i.status === "PAID").length}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Unpaid</span>
              <span className="font-medium text-red-600">
                {invoices.filter(i => i.status === "UNPAID").length}
              </span>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Amount Due</span>
                <span className="text-2xl font-bold text-red-600">RM {totalUnpaid.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Selection Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
            <DialogDescription>
              Choose a secure payment gateway to complete your transaction.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
              <div className="flex items-center space-x-3 border p-3 rounded-md cursor-pointer hover:bg-slate-50">
                <RadioGroupItem value="fpx" id="fpx" />
                <Label htmlFor="fpx" className="flex items-center gap-3 cursor-pointer w-full">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="font-semibold">FPX Online Banking</span>
                    <span className="text-xs text-muted-foreground">Maybank2u, CIMB Clicks, RHB, etc.</span>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 border p-3 rounded-md cursor-pointer hover:bg-slate-50">
                <RadioGroupItem value="tng" id="tng" />
                <Label htmlFor="tng" className="flex items-center gap-3 cursor-pointer w-full">
                  <Smartphone className="w-5 h-5 text-sky-500" />
                  <div className="flex flex-col">
                    <span className="font-semibold">Touch 'n Go eWallet</span>
                    <span className="text-xs text-muted-foreground">Pay with your TNG App</span>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 border p-3 rounded-md cursor-pointer hover:bg-slate-50">
                <RadioGroupItem value="grabpay" id="grabpay" />
                <Label htmlFor="grabpay" className="flex items-center gap-3 cursor-pointer w-full">
                  <Wallet className="w-5 h-5 text-green-600" />
                  <div className="flex flex-col">
                    <span className="font-semibold">GrabPay</span>
                    <span className="text-xs text-muted-foreground">Earn GrabRewards points</span>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 border p-3 rounded-md cursor-pointer hover:bg-slate-50">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer w-full">
                  <CreditCard className="w-5 h-5 text-slate-700" />
                  <div className="flex flex-col">
                    <span className="font-semibold">Credit / Debit Card</span>
                    <span className="text-xs text-muted-foreground">Visa, Mastercard</span>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <CardFooter className="flex justify-between px-0 pb-0">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmPayment} className="bg-blue-600 hover:bg-blue-700">
              Confirm & Pay
            </Button>
          </CardFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
