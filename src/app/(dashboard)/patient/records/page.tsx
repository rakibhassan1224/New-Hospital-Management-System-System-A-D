import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { FileText, FlaskConical } from "lucide-react";

export default async function PatientRecordsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PATIENT") {
    redirect("/dashboard");
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    include: {
      appointments: {
        where: { status: "COMPLETED" },
        include: {
          doctor: true,
          medicalRecord: true
        },
        orderBy: { date: 'desc' }
      },
      labTests: {
        orderBy: { createdAt: 'desc' },
        include: { doctor: true }
      }
    }
  });

  if (!patient) redirect("/dashboard");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Medical Records</h1>
        <p className="text-muted-foreground">View your past consultation notes and laboratory results.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Consultation Reports */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Consultation Reports
          </h2>
          {patient.appointments.filter(a => a.medicalRecord).length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No consultation reports found.
              </CardContent>
            </Card>
          ) : (
            patient.appointments.filter(a => a.medicalRecord).map(apt => (
              <Card key={apt.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {format(new Date(apt.date), "MMMM do, yyyy")}
                  </CardTitle>
                  <CardDescription>Dr. {apt.doctor.name} ({apt.doctor.specialization})</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-semibold text-sm">Diagnosis: </span>
                    <span className="text-sm">{apt.medicalRecord?.diagnosis}</span>
                  </div>
                  {apt.medicalRecord?.prescription && (
                    <div>
                      <span className="font-semibold text-sm">Prescription: </span>
                      <span className="text-sm">{apt.medicalRecord?.prescription}</span>
                    </div>
                  )}
                  {apt.medicalRecord?.notes && (
                    <div>
                      <span className="font-semibold text-sm">Notes: </span>
                      <span className="text-sm italic">{apt.medicalRecord?.notes}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Laboratory Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-emerald-600" />
            Laboratory Results
          </h2>
          {patient.labTests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No laboratory results found.
              </CardContent>
            </Card>
          ) : (
            patient.labTests.map(test => (
              <Card key={test.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{test.testName}</CardTitle>
                      <CardDescription>{format(new Date(test.createdAt), "MMMM do, yyyy")}</CardDescription>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      test.status === "COMPLETED" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {test.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-2">Requested by: Dr. {test.doctor.name}</div>
                  {test.result ? (
                    <div className="p-3 bg-slate-50 border rounded-md">
                      <span className="font-semibold text-sm block mb-1">Result:</span>
                      <span className="text-sm whitespace-pre-wrap">{test.result}</span>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-dashed rounded-md text-sm text-center text-muted-foreground">
                      Result is pending...
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
