import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewAppointmentForm } from "./NewAppointmentForm";

export default async function NewAppointmentPage(props: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "RECEPTIONIST" && session.user.role !== "DOCTOR")) {
    redirect("/login");
  }

  const { patientId } = await props.searchParams;

  const [patients, doctors] = await Promise.all([
    prisma.patient.findMany({
      select: { id: true, fullName: true, icNumber: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.doctor.findMany({
      select: { id: true, name: true, specialization: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Book Appointment</h1>
      <NewAppointmentForm 
        patients={patients} 
        doctors={doctors} 
        initialPatientId={patientId}
      />
    </div>
  );
}
