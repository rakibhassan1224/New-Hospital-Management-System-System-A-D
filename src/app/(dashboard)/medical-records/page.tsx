import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default async function MedicalRecordsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "DOCTOR")) {
    redirect("/dashboard");
  }

  let where: any = {};
  
  if (session.user.role === "DOCTOR") {
    const doctorUser = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
    });
    if (doctorUser) {
      where.appointment = {
        doctorId: doctorUser.id
      };
    }
  }

  const records = await prisma.medicalRecord.findMany({
    where,
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
        <h1 className="text-3xl font-bold tracking-tight">Medical Records</h1>
      </div>

      <div className="bg-white rounded-md shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Diagnosis</TableHead>
              <TableHead>Prescription</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No medical records found.
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {format(new Date(record.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Link href={`/patients/${record.appointment.patientId}`} className="text-primary hover:underline">
                      {record.appointment.patient.fullName}
                    </Link>
                  </TableCell>
                  <TableCell>{record.appointment.doctor.name}</TableCell>
                  <TableCell>{record.diagnosis}</TableCell>
                  <TableCell className="truncate max-w-[200px]">{record.prescription || "N/A"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
