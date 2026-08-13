import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LabTestClient } from "./LabTestClient";

export default async function LaboratoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const labTests = await prisma.labTest.findMany({
    include: {
      patient: { select: { fullName: true } },
      doctor: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Laboratory Management</h1>
      </div>
      
      <LabTestClient initialData={labTests} userRole={session.user.role} />
    </div>
  );
}
