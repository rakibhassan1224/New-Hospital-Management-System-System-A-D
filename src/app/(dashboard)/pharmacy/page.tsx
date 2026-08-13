import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PharmacyClient } from "./PharmacyClient";

export default async function PharmacyPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const orders = await prisma.pharmacyOrder.findMany({
    include: {
      patient: { select: { fullName: true } },
      doctor: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Pharmacy Management</h1>
      </div>
      
      <PharmacyClient initialData={orders} userRole={session.user.role} />
    </div>
  );
}
