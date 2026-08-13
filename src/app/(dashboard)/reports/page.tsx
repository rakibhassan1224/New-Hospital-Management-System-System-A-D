import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Users, DollarSign, Activity } from "lucide-react";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch report data
  const [
    totalPatients,
    totalDoctors,
    invoices,
    appointmentsByStatus,
    recentCompletedAppointments
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.doctor.count(),
    prisma.invoice.findMany({
      where: { status: "PAID" },
      select: { amount: true, createdAt: true }
    }),
    prisma.appointment.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    prisma.appointment.findMany({
      where: { status: "COMPLETED" },
      include: {
        doctor: { select: { name: true } },
      },
      orderBy: { date: 'desc' }
    })
  ]);

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);

  // Group appointments by doctor for performance report
  const doctorPerformance = recentCompletedAppointments.reduce((acc: Record<string, number>, curr) => {
    const docName = `Dr. ${curr.doctor.name}`;
    acc[docName] = (acc[docName] || 0) + 1;
    return acc;
  }, {});

  const topDoctors = Object.entries(doctorPerformance)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Reports</h1>
          <p className="text-muted-foreground">Comprehensive overview of hospital performance.</p>
        </div>
        <div className="bg-slate-100 p-2 rounded-md text-sm text-slate-600 border flex items-center gap-2">
          <BarChart3 className="h-4 w-4" /> Confidential Admin Report
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">RM {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">From all paid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patient Base</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{totalPatients}</div>
            <p className="text-xs text-muted-foreground mt-1">Total registered patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Medical Staff</CardTitle>
            <Activity className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700">{totalDoctors}</div>
            <p className="text-xs text-muted-foreground mt-1">Doctors in the system</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Doctor Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Doctors</CardTitle>
            <CardDescription>Based on total completed appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead className="text-right">Completed Appointments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">No data available</TableCell>
                  </TableRow>
                ) : (
                  topDoctors.map(([name, count], i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell className="text-right font-bold text-blue-600">{count}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Appointment Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Conversion</CardTitle>
            <CardDescription>Breakdown of all historical appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointmentsByStatus.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">No data available</TableCell>
                  </TableRow>
                ) : (
                  appointmentsByStatus.map((status, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{status.status}</TableCell>
                      <TableCell className="text-right font-bold">{status._count.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
}
