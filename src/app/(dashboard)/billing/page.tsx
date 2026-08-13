import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CheckCircle } from "lucide-react";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "RECEPTIONIST")) {
    redirect("/dashboard");
  }

  const invoices = await prisma.invoice.findMany({
    include: {
      appointment: {
        include: {
          patient: true,
          doctor: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
      </div>

      <div className="bg-white rounded-md shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {format(new Date(invoice.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {invoice.appointment.patient.fullName}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700">
                    RM {invoice.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      invoice.status === "PAID" ? "bg-green-100 text-green-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {invoice.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {invoice.status === "UNPAID" && (
                      <form action={async () => {
                        "use server";
                        const { revalidatePath } = await import("next/cache");
                        await prisma.invoice.update({ where: { id: invoice.id }, data: { status: "PAID" }});
                        revalidatePath("/billing");
                      }}>
                        <Button type="submit" variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                          <CheckCircle className="h-4 w-4 mr-1" /> Mark Paid
                        </Button>
                      </form>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
