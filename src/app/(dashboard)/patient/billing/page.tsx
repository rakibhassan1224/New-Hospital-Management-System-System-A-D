import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PatientBillingClient } from "./PatientBillingClient";

export default async function PatientBillingPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PATIENT") {
    redirect("/dashboard");
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    include: {
      appointments: {
        include: {
          doctor: true,
          invoice: true
        },
        orderBy: { date: 'desc' }
      }
    }
  });

  if (!patient) redirect("/dashboard");

  // Extract all invoices from the appointments
  const invoices = patient.appointments
    .filter(a => a.invoice)
    .map(a => ({
      ...a.invoice,
      appointment: {
        date: a.date,
        doctorName: a.doctor.name,
        specialization: a.doctor.specialization
      }
    }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Billing</h1>
        <p className="text-muted-foreground">Manage your invoices and make payments.</p>
      </div>

      <PatientBillingClient initialInvoices={invoices} />
    </div>
  );
}
