import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardStats } from "./DashboardStats";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Fetch basic stats
  const [
    totalPatients,
    todayAppointments,
    activeDoctors,
    invoices,
    appointmentsByStatus,
    recentPatients,
    recentAppointments
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.appointment.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        }
      }
    }),
    prisma.doctor.count(),
    prisma.invoice.findMany({
      where: { status: "PAID" },
      select: { amount: true }
    }),
    prisma.appointment.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    }),
    prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, fullName: true, createdAt: true }
    }),
    prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        patient: { select: { fullName: true } },
        doctor: { select: { name: true } }
      }
    })
  ]);

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);

  // Chart data for appointments over next 7 days
  const chartData = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    
    const count = await prisma.appointment.count({
      where: {
        date: {
          gte: d,
          lt: new Date(d.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    chartData.push({
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      appointments: count,
    });
  }

  // Format pie chart data
  const statusColors: any = {
    "SCHEDULED": "#3b82f6",
    "COMPLETED": "#22c55e",
    "CANCELLED": "#ef4444",
    "NO_SHOW": "#f59e0b"
  };
  
  const pieData = appointmentsByStatus.map(status => ({
    name: status.status,
    value: status._count.status,
    fill: statusColors[status.status] || "#8884d8"
  }));

  const stats = {
    totalPatients,
    todayAppointments,
    activeDoctors,
    totalRevenue,
  };

  return <DashboardStats 
    stats={stats} 
    chartData={chartData} 
    pieData={pieData}
    recentPatients={recentPatients}
    recentAppointments={recentAppointments}
  />;
}
