import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PatientAppointmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PATIENT") {
    redirect("/dashboard");
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    include: {
      appointments: {
        include: { doctor: true },
        orderBy: [{ date: 'asc' }, { time: 'asc' }]
      }
    }
  });

  if (!patient) redirect("/dashboard");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = patient.appointments.filter(a => new Date(a.date) >= today && a.status !== "CANCELLED");
  const past = patient.appointments.filter(a => new Date(a.date) < today || a.status === "CANCELLED");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
          <p className="text-muted-foreground">Manage your upcoming and past consultations.</p>
        </div>
        <Link href="/patient/appointments/new">
          <Button>Book New Appointment</Button>
        </Link>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Upcoming Appointments</h2>
          {upcoming.length === 0 ? (
            <Card className="bg-slate-50 border-dashed">
              <CardContent className="py-10 text-center text-muted-foreground">
                You have no upcoming appointments.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcoming.map(apt => (
                <Card key={apt.id} className="border-l-4 border-l-blue-600 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Consultation</CardTitle>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {apt.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User className="h-4 w-4" />
                      Dr. {apt.doctor.name} ({apt.doctor.specialization})
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CalendarIcon className="h-4 w-4" />
                      {format(new Date(apt.date), "EEEE, MMMM do, yyyy")}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4" />
                      {apt.time}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Past Appointments</h2>
          {past.length === 0 ? (
            <Card className="bg-slate-50 border-dashed">
              <CardContent className="py-10 text-center text-muted-foreground">
                No past appointments found.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {past.map(apt => (
                <Card key={apt.id} className="opacity-75 bg-slate-50">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base text-slate-700">Dr. {apt.doctor.name}</CardTitle>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        apt.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                    <CardDescription>{format(new Date(apt.date), "MMM do, yyyy")} at {apt.time}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
