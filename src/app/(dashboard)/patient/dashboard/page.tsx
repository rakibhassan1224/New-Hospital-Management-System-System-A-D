import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, FlaskConical, Stethoscope } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function PatientDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PATIENT") {
    redirect("/dashboard");
  }

  // Get patient profile
  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    include: {
      appointments: {
        where: { status: "SCHEDULED" },
        include: { doctor: { select: { name: true, specialization: true } } },
        orderBy: { date: 'asc' },
        take: 3
      },
      labTests: {
        orderBy: { createdAt: 'desc' },
        include: { doctor: { select: { name: true } } },
        take: 3
      },
      pharmacyOrders: {
        orderBy: { createdAt: 'desc' },
        include: { doctor: { select: { name: true } } },
        take: 3
      }
    }
  });

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold">Profile Not Found</h2>
        <p className="text-muted-foreground">Your patient profile is still being set up.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {patient.fullName}</h1>
          <p className="text-muted-foreground">Here is an overview of your medical care.</p>
        </div>
        <Link href="/patient/appointments/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Calendar className="mr-2 h-4 w-4" /> Book Appointment
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>Your next scheduled visits</CardDescription>
          </CardHeader>
          <CardContent>
            {patient.appointments.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground bg-slate-50 rounded-md">
                No upcoming appointments.
              </div>
            ) : (
              <div className="space-y-4">
                {patient.appointments.map(apt => (
                  <div key={apt.id} className="flex flex-col p-4 border rounded-lg bg-emerald-50/30">
                    <div className="font-semibold text-lg text-emerald-900">
                      {format(new Date(apt.date), "EEEE, MMMM do, yyyy")} at {apt.time}
                    </div>
                    <div className="text-sm text-emerald-700 mt-1">
                      Dr. {apt.doctor.name} ({apt.doctor.specialization})
                    </div>
                    {apt.reason && (
                      <div className="text-sm text-muted-foreground mt-2 italic">
                        "{apt.reason}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {/* Recent Lab Tests */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FlaskConical className="h-5 w-5 text-blue-600" />
                Recent Lab Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.labTests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent lab tests.</p>
              ) : (
                <div className="space-y-3">
                  {patient.labTests.map(test => (
                    <div key={test.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium text-sm">{test.testName}</div>
                        <div className="text-xs text-muted-foreground">Req by Dr. {test.doctor.name}</div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          test.status === "COMPLETED" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          {test.status}
                        </span>
                        {test.result && <div className="text-xs mt-1 font-semibold text-blue-800">{test.result}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Pharmacy Orders */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="h-5 w-5 text-indigo-600" />
                Recent Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.pharmacyOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent prescriptions.</p>
              ) : (
                <div className="space-y-3">
                  {patient.pharmacyOrders.map(order => (
                    <div key={order.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium text-sm">{order.medication}</div>
                        <div className="text-xs text-muted-foreground">{order.dosage}</div>
                      </div>
                      <div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          order.status === "DISPENSED" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
