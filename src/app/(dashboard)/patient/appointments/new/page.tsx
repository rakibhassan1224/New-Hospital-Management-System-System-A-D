import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PatientBookingForm } from "./PatientBookingForm";

export default async function BookAppointmentPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PATIENT") {
    redirect("/dashboard");
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id }
  });

  if (!patient) {
    redirect("/dashboard");
  }

  const doctors = await prisma.doctor.findMany({
    include: {
      department: true
    }
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Book an Appointment</h1>
        <p className="text-muted-foreground">Select a doctor and time for your consultation.</p>
      </div>

      <PatientBookingForm patientId={patient.id} doctors={doctors} />
    </div>
  );
}
