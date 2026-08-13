import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { ReceiptClient } from "./ReceiptClient";
import { Building2 } from "lucide-react";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PATIENT") {
    redirect("/dashboard");
  }

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      appointment: {
        include: {
          doctor: true,
          patient: true
        }
      }
    }
  });

  if (!invoice || invoice.appointment.patient.userId !== session.user.id || invoice.status !== "PAID") {
    redirect("/patient/billing");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <ReceiptClient />

      <Card className="border-2 p-8 shadow-sm" id="printable-receipt">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-8">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">City Care Hospital Management System</h1>
                <p className="text-sm text-slate-500">123 Health Avenue, Medical District, 50000 KL</p>
                <p className="text-sm text-slate-500">contact@citycare.com | +60 3-1234 5678</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-slate-200 uppercase tracking-wider mb-2">Receipt</h2>
              <p className="text-sm font-medium">Receipt No: <span className="text-slate-500">RCPT-{invoice.id.slice(-6).toUpperCase()}</span></p>
              <p className="text-sm font-medium">Date: <span className="text-slate-500">{format(new Date(), "MMM do, yyyy")}</span></p>
            </div>
          </div>

          {/* Patient Info */}
          <div className="grid grid-cols-2 gap-8 py-8 border-b">
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Billed To</p>
              <h3 className="font-bold text-lg">{invoice.appointment.patient.fullName}</h3>
              <p className="text-slate-600 text-sm">Patient ID: {invoice.appointment.patient.id}</p>
              <p className="text-slate-600 text-sm">IC Number: {invoice.appointment.patient.icNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Payment Details</p>
              <p className="text-slate-900 font-medium text-sm">Method: Online Payment</p>
              <p className="text-slate-600 text-sm">Status: <span className="text-emerald-600 font-bold">PAID</span></p>
            </div>
          </div>

          {/* Line Items */}
          <div className="py-8">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-slate-500 uppercase tracking-wider">
                  <th className="pb-4 font-semibold">Description</th>
                  <th className="pb-4 font-semibold">Date</th>
                  <th className="pb-4 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b">
                  <td className="py-6">
                    <p className="font-bold text-slate-900 text-base">Specialist Consultation</p>
                    <p className="text-slate-500 mt-1">Dr. {invoice.appointment.doctor.name} ({invoice.appointment.doctor.specialization})</p>
                  </td>
                  <td className="py-6 text-slate-600 align-top">
                    {format(new Date(invoice.appointment.date), "MMM do, yyyy")}
                  </td>
                  <td className="py-6 text-right font-medium align-top">
                    RM {invoice.amount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end pt-4">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>RM {invoice.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax (0%)</span>
                <span>RM 0.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 border-t pt-3">
                <span>Total Paid</span>
                <span>RM {invoice.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center text-sm text-slate-400">
            <p>Thank you for choosing City Care Hospital Management System.</p>
            <p>This is a computer-generated receipt. No signature is required.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
