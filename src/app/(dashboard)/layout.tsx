"use client";

import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  UserPlus, 
  FileText, 
  CreditCard,
  LogOut,
  Building,
  FlaskConical,
  Stethoscope,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import Image from "next/image";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "RECEPTIONIST", "DOCTOR"] },
  { name: "My Dashboard", href: "/patient/dashboard", icon: LayoutDashboard, roles: ["PATIENT"] },
  { name: "Patients", href: "/patients", icon: Users, roles: ["ADMIN", "RECEPTIONIST", "DOCTOR"] },
  { name: "Appointments", href: "/appointments", icon: Calendar, roles: ["ADMIN", "RECEPTIONIST", "DOCTOR"] },
  { name: "My Appointments", href: "/patient/appointments", icon: Calendar, roles: ["PATIENT"] },
  { name: "Book Appointment", href: "/patient/appointments/new", icon: Calendar, roles: ["PATIENT"] },
  { name: "My Records", href: "/patient/records", icon: FileText, roles: ["PATIENT"] },
  { name: "My Prescriptions", href: "/patient/prescriptions", icon: Stethoscope, roles: ["PATIENT"] },
  { name: "My Billing", href: "/patient/billing", icon: CreditCard, roles: ["PATIENT"] },
  { name: "Laboratory", href: "/laboratory", icon: FlaskConical, roles: ["ADMIN", "RECEPTIONIST", "DOCTOR"] },
  { name: "Pharmacy", href: "/pharmacy", icon: Stethoscope, roles: ["ADMIN", "RECEPTIONIST", "DOCTOR"] },
  { name: "Medical Records", href: "/medical-records", icon: FileText, roles: ["ADMIN", "DOCTOR"] },
  { name: "Billing", href: "/billing", icon: CreditCard, roles: ["ADMIN", "RECEPTIONIST"] },
  { name: "Reports", href: "/reports", icon: BarChart3, roles: ["ADMIN"] },
  { name: "Doctors", href: "/admin/doctors", icon: UserPlus, roles: ["ADMIN"] },
  { name: "Departments", href: "/admin/departments", icon: Building, roles: ["ADMIN"] },
  { name: "My Profile", href: "/patient/profile", icon: Users, roles: ["PATIENT"] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  const role = (session?.user as any)?.role;

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <div className="flex h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col h-full shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3 mb-4">
            <Image src="/logo.png" alt="City Care Logo" width={32} height={32} className="rounded-md" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">City Care Hospital<br />Management System</h1>
          </div>
          <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">Logged in as</p>
            <p className="text-sm font-semibold text-slate-900 truncate">{session?.user?.name}</p>
            <p className="text-xs font-bold text-blue-600 mt-1 uppercase tracking-wider">{role}</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <span className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
