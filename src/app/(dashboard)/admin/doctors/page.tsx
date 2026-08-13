import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminDoctorsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const doctors = await prisma.doctor.findMany({
    include: {
      user: true,
      department: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Doctors Directory</h1>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" /> Add Doctor
        </Button>
      </div>

      <div className="bg-white rounded-md shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Availability</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.map((doctor) => (
              <TableRow key={doctor.id}>
                <TableCell className="font-medium">{doctor.name}</TableCell>
                <TableCell>{doctor.user.email}</TableCell>
                <TableCell>{doctor.specialization}</TableCell>
                <TableCell>{doctor.department.name}</TableCell>
                <TableCell>{doctor.availability}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
