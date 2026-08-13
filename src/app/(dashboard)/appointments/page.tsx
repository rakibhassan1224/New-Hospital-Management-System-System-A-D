import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

export default async function AppointmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  let where: any = {};
  
  if (session.user.role === "DOCTOR") {
    const doctorUser = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
    });
    if (doctorUser) {
      where.doctorId = doctorUser.id;
    }
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: true,
      doctor: true,
    },
    orderBy: [
      { date: "desc" },
      { time: "asc" },
    ],
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        {(session.user.role === "ADMIN" || session.user.role === "RECEPTIONIST") && (
          <Link href="/appointments/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Book Appointment
            </Button>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-md shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No appointments found.
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell className="font-medium">
                    {format(new Date(apt.date), "MMM d, yyyy")} <br/>
                    <span className="text-muted-foreground">{apt.time}</span>
                  </TableCell>
                  <TableCell>
                    <Link href={`/patients/${apt.patientId}`} className="text-primary hover:underline">
                      {apt.patient.fullName}
                    </Link>
                  </TableCell>
                  <TableCell>{apt.doctor.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      apt.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                      apt.status === "SCHEDULED" ? "bg-blue-100 text-blue-700" :
                      apt.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {apt.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {apt.status === "SCHEDULED" && (
                      <form action={async () => {
                        "use server";
                        const { revalidatePath } = await import("next/cache");
                        await prisma.appointment.update({ where: { id: apt.id }, data: { status: "COMPLETED" }});
                        revalidatePath("/appointments");
                      }}>
                        <Button type="submit" variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                          <CheckCircle className="h-4 w-4 mr-1" /> Complete
                        </Button>
                      </form>
                    )}
                    {apt.status === "SCHEDULED" && (
                       <form action={async () => {
                        "use server";
                        const { revalidatePath } = await import("next/cache");
                        await prisma.appointment.update({ where: { id: apt.id }, data: { status: "CANCELLED" }});
                        revalidatePath("/appointments");
                      }}>
                        <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <XCircle className="h-4 w-4 mr-1" /> Cancel
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
