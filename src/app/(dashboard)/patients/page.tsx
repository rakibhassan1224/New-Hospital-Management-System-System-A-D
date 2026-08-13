import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Eye } from "lucide-react";
import { PatientTabs } from "./PatientTabs";

export default async function PatientsPage(props: {
  searchParams: Promise<{ search?: string; page?: string; tab?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const searchParams = await props.searchParams;
  const search = searchParams.search || "";
  const page = parseInt(searchParams.page || "1");
  const tab = searchParams.tab || "all";
  const limit = 10;
  const skip = (page - 1) * limit;

  // Date boundaries for "Today"
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  // Build Prisma Where Clause based on Search and Tab
  const baseWhere: any = search
    ? {
        OR: [
          { fullName: { contains: search } },
          { icNumber: { contains: search } },
          { phone: { contains: search } },
        ],
      }
    : {};

  if (tab === "waiting") {
    baseWhere.appointments = {
      some: {
        status: "SCHEDULED",
        date: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    };
  } else if (tab === "upcoming") {
    baseWhere.appointments = {
      some: {
        status: "SCHEDULED",
        date: {
          gt: endOfToday,
        },
      },
    };
  } else if (tab === "visited") {
    baseWhere.appointments = {
      some: {
        status: "COMPLETED",
      },
    };
  }

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where: baseWhere,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        appointments: {
          orderBy: [{ date: 'asc' }, { time: 'asc' }],
          take: 1,
          where: tab === "visited" 
            ? { status: "COMPLETED" } 
            : { status: "SCHEDULED" },
          include: { doctor: true }
        }
      }
    }),
    prisma.patient.count({ where: baseWhere }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground mt-1">Manage your patient list and track their real-time statuses.</p>
        </div>
        {(session.user.role === "ADMIN" || session.user.role === "RECEPTIONIST") && (
          <Link href="/patients/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Patient
            </Button>
          </Link>
        )}
      </div>

      <PatientTabs defaultTab={tab} />

      <div className="flex items-center space-x-2 bg-white p-4 rounded-md shadow-sm border mt-4">
        <Search className="h-5 w-5 text-gray-400" />
        <form className="flex-1" action="/patients">
          {tab !== "all" && <input type="hidden" name="tab" value={tab} />}
          <Input 
            name="search"
            type="search" 
            placeholder="Search by name, IC number, or phone..." 
            defaultValue={search}
            className="border-0 focus-visible:ring-0 shadow-none px-0"
          />
        </form>
      </div>

      <div className="bg-white rounded-md shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>IC Number</TableHead>
              <TableHead>Phone</TableHead>
              {tab !== "all" && <TableHead>Appointment Details</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tab !== "all" ? 5 : 4} className="text-center h-24 text-muted-foreground">
                  No patients found in this category.
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.fullName}</TableCell>
                  <TableCell>{patient.icNumber}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  
                  {tab !== "all" && (
                    <TableCell>
                      {patient.appointments.length > 0 ? (
                        <div className="text-sm">
                          <span className="font-semibold text-slate-700">Dr. {patient.appointments[0].doctor.name}</span>
                          <br />
                          <span className="text-slate-500">
                            {new Date(patient.appointments[0].date).toLocaleDateString()} at {patient.appointments[0].time}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                  )}

                  <TableCell className="text-right">
                    <Link href={`/patients/${patient.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {page > 1 && (
            <Link href={`/patients?page=${page - 1}${search ? `&search=${search}` : ''}&tab=${tab}`}>
              <Button variant="outline" size="sm">Previous</Button>
            </Link>
          )}
          <span className="flex items-center px-4 text-sm font-medium">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/patients?page=${page + 1}${search ? `&search=${search}` : ''}&tab=${tab}`}>
              <Button variant="outline" size="sm">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
