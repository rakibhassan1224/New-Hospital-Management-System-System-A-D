import { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";
import Image from "next/image";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Sign Up | City Care Hospital Management System",
  description: "Create a new account at City Care Hospital Management System",
};

export default async function RegisterPage() {
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen flex flex-row-reverse">
      {/* Right side: Information/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Abstract shapes for a more professional look */}
        <div className="absolute top-0 left-0 -ml-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-80 h-80 rounded-full bg-cyan-600/20 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 font-bold text-2xl mb-12">
            <div className="bg-white p-1.5 rounded-lg">
              <Image src="/logo.png" alt="City Care Logo" width={40} height={40} className="rounded-md" />
            </div>
            <span className="tracking-tight">City Care Hospital Management System</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            Join our network of <br />healthcare professionals.
          </h1>
          <p className="text-slate-300 text-lg max-w-md leading-relaxed">
            Register to access advanced scheduling, patient records, and integrated billing tools designed to empower your practice.
          </p>
        </div>
        
        <div className="text-slate-400 text-sm relative z-10 font-medium">
          &copy; {new Date().getFullYear()} City Care Hospital Management System. All rights reserved.
        </div>
      </div>

      {/* Left side: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 font-bold text-2xl mb-10 text-slate-900">
            <Image src="/logo.png" alt="City Care Logo" width={48} height={48} className="rounded-lg shadow-sm" />
            <span>City Care Hospital Management System</span>
          </div>
          <RegisterForm departments={departments} />
        </div>
      </div>
    </div>
  );
}
