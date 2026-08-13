import { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Login | City Care Hospital Management System",
  description: "Login to the City Care Hospital Management System",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side: Information/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Abstract shapes for a more professional look */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-600/20 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 font-bold text-2xl mb-12">
            <div className="bg-white p-1.5 rounded-lg">
              <Image src="/logo.png" alt="City Care Logo" width={40} height={40} className="rounded-md" />
            </div>
            <span className="tracking-tight">City Care Hospital Management System</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            Excellence in <br />Healthcare Management
          </h1>
          <p className="text-slate-300 text-lg max-w-md leading-relaxed">
            Experience our next-generation digital infrastructure designed to provide seamless patient care, efficient scheduling, and secure medical records.
          </p>
        </div>
        
        <div className="text-slate-400 text-sm relative z-10 font-medium">
          &copy; {new Date().getFullYear()} City Care Hospital Management System. All rights reserved.
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 font-bold text-2xl mb-10 text-slate-900">
            <Image src="/logo.png" alt="City Care Logo" width={48} height={48} className="rounded-lg shadow-sm" />
            <span>City Care Hospital Management System</span>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
