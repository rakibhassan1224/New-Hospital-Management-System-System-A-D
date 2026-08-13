import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PatientProfileForm } from "./PatientProfileForm";

export default async function PatientProfilePage() {
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal and medical information.</p>
      </div>

      <PatientProfileForm patient={patient} />
    </div>
  );
}
