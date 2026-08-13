import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { Stethoscope } from "lucide-react";

export default async function PatientPrescriptionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PATIENT") {
    redirect("/dashboard");
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    include: {
      pharmacyOrders: {
        orderBy: { createdAt: 'desc' },
        include: { doctor: true }
      }
    }
  });

  if (!patient) redirect("/dashboard");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Prescriptions</h1>
        <p className="text-muted-foreground">View your medication history and current prescriptions.</p>
      </div>

      <div className="grid gap-4">
        {patient.pharmacyOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No prescriptions found.
            </CardContent>
          </Card>
        ) : (
          patient.pharmacyOrders.map(order => (
            <Card key={order.id} className="flex flex-col md:flex-row justify-between md:items-center">
              <div className="flex-1">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-indigo-600" />
                    <CardTitle className="text-xl text-indigo-900">{order.medication}</CardTitle>
                  </div>
                  <CardDescription>
                    Prescribed on {format(new Date(order.createdAt), "MMMM do, yyyy")} by Dr. {order.doctor.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="font-medium text-slate-700">Dosage Instructions:</div>
                    <div className="text-sm bg-slate-50 p-3 rounded-md border">{order.dosage}</div>
                  </div>
                </CardContent>
              </div>
              <div className="p-6 md:border-l flex md:flex-col items-center justify-between md:justify-center gap-4 bg-slate-50/50 md:min-w-[200px]">
                <div className="text-sm font-medium text-slate-500">Status</div>
                <span className={`px-4 py-1.5 rounded-full font-bold text-sm ${
                  order.status === "DISPENSED" 
                    ? "bg-indigo-100 text-indigo-700" 
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {order.status}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
