import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, CalendarPlus, Activity } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function PatientProfilePage(props: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const { id } = await props.params;
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      appointments: {
        include: {
          doctor: true,
          medicalRecord: true,
          invoice: true,
        },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!patient) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Patient not found</h2>
        <Link href="/patients">
          <Button>Return to Patients List</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/patients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Patient Profile</h1>
        </div>
        <div className="flex space-x-2">
          {(session.user.role === "ADMIN" || session.user.role === "RECEPTIONIST") && (
            <Link href={`/appointments/new?patientId=${patient.id}`}>
              <Button variant="outline">
                <CalendarPlus className="mr-2 h-4 w-4" /> Book Appointment
              </Button>
            </Link>
          )}
          {(session.user.role === "ADMIN" || session.user.role === "RECEPTIONIST") && (
            <Link href={`/patients/${patient.id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="text-muted-foreground block">Full Name</span>
              <span className="font-medium text-base">{patient.fullName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">IC/Passport Number</span>
              <span className="font-medium">{patient.icNumber}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground block">Date of Birth</span>
                <span className="font-medium">{format(new Date(patient.dob), "PP")}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Gender</span>
                <span className="font-medium">{patient.gender}</span>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground block">Phone Number</span>
              <span className="font-medium">{patient.phone}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Address</span>
              <span className="font-medium">{patient.address || "N/A"}</span>
            </div>
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block">Blood Type</span>
                  <span className="font-medium">{patient.bloodType || "Unknown"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Allergies</span>
                  <span className="font-medium text-destructive">{patient.allergies || "None reported"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical History & Appointments */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Visit History</CardTitle>
          </CardHeader>
          <CardContent>
            {patient.appointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No visit history found.</p>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {patient.appointments.map((apt) => (
                  <div key={apt.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <Activity className="w-5 h-5" />
                    </div>
                    
                    {/* Content */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border shadow-sm bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900">{format(new Date(apt.date), "PPP")} {apt.time}</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          apt.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                          apt.status === "SCHEDULED" ? "bg-blue-100 text-blue-700" :
                          apt.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 mb-2">
                        <strong>Doctor:</strong> {apt.doctor.name}
                      </div>
                      <div className="text-sm text-slate-600 mb-3">
                        <strong>Reason:</strong> {apt.reason || "N/A"}
                      </div>
                      
                      {apt.medicalRecord && (
                        <div className="mt-3 pt-3 border-t text-sm">
                          <div className="mb-1"><strong>Diagnosis:</strong> {apt.medicalRecord.diagnosis}</div>
                          <div className="mb-1"><strong>Prescription:</strong> {apt.medicalRecord.prescription || "None"}</div>
                          <div className="text-muted-foreground text-xs mt-2 italic">{apt.medicalRecord.notes}</div>
                        </div>
                      )}

                      {(!apt.medicalRecord && session.user.role === "DOCTOR") && (
                        <div className="mt-4 pt-3 border-t">
                          <Link href={`/medical-records/new?appointmentId=${apt.id}`}>
                            <Button size="sm" variant="outline" className="w-full">Add Medical Record</Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
