"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar, Activity, CreditCard, UserPlus, Clock } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { format } from "date-fns";

interface DashboardProps {
  stats: {
    totalPatients: number;
    todayAppointments: number;
    activeDoctors: number;
    totalRevenue: number;
  };
  chartData: { name: string; appointments: number }[];
  pieData: { name: string; value: number; fill: string }[];
  recentPatients: { id: string; fullName: string; createdAt: Date }[];
  recentAppointments: { id: string; patient: { fullName: string }; doctor: { name: string }; createdAt: Date }[];
}

export function DashboardStats({ stats, chartData, pieData, recentPatients, recentAppointments }: DashboardProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      
      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50 border-blue-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{stats.totalPatients}</div>
            <p className="text-xs text-blue-600 mt-1">Registered in system</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">{stats.todayAppointments}</div>
            <p className="text-xs text-emerald-600 mt-1">Scheduled for today</p>
          </CardContent>
        </Card>
        <Card className="bg-indigo-50 border-indigo-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-900">Active Doctors</CardTitle>
            <Activity className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-700">{stats.activeDoctors}</div>
            <p className="text-xs text-indigo-600 mt-1">Available staff</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700">RM {stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-amber-600 mt-1">From paid invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Appointments Overview (Next 7 Days)</CardTitle>
            <CardDescription>Daily breakdown of upcoming appointments</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Appointments by Status</CardTitle>
            <CardDescription>Overall breakdown of all appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Recently Registered Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPatients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent patients found.</p>
              ) : (
                recentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{patient.fullName}</span>
                      <span className="text-xs text-muted-foreground">ID: {patient.id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(patient.createdAt), "MMM d, h:mm a")}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-600" />
              Recently Booked Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent appointments found.</p>
              ) : (
                recentAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{apt.patient.fullName}</span>
                      <span className="text-xs text-muted-foreground">with Dr. {apt.doctor.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(apt.createdAt), "MMM d, h:mm a")}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
