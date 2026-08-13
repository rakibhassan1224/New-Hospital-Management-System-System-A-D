"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export function RegisterForm({ departments }: { departments: { id: string, name: string }[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "RECEPTIONIST", // Default role
    departmentId: "",
    specialization: "",
    icNumber: "",
    dob: "",
    gender: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to register");
      }

      // Automatically redirect to login page after successful registration
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-none shadow-none sm:border sm:shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Create an account
        </CardTitle>
        <CardDescription>
          Enter your information to set up your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm font-medium text-destructive-foreground bg-destructive/20 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              className="focus-visible:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@hms.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="focus-visible:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="focus-visible:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={(val) => handleSelectChange("role", val)} value={formData.role} required>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PATIENT">Patient</SelectItem>
                <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                <SelectItem value="ADMIN">Administrator</SelectItem>
                <SelectItem value="DOCTOR">Doctor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === "DOCTOR" && (
            <>
              <div className="space-y-2 p-4 bg-blue-50 rounded-md border border-blue-100">
                <Label htmlFor="departmentId" className="text-blue-800">Department <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val) => handleSelectChange("departmentId", val)} value={formData.departmentId} required>
                  <SelectTrigger id="departmentId" className="bg-white">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="specialization" className="text-blue-800">Specialization <span className="text-red-500">*</span></Label>
                  <Input
                    id="specialization"
                    name="specialization"
                    placeholder="e.g. Cardiologist"
                    value={formData.specialization}
                    onChange={handleChange}
                    required={formData.role === "DOCTOR"}
                    className="bg-white focus-visible:ring-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          {formData.role === "PATIENT" && (
            <div className="space-y-4 p-4 bg-emerald-50 rounded-md border border-emerald-100">
              <div className="space-y-2">
                <Label htmlFor="icNumber" className="text-emerald-800">ID / Passport Number <span className="text-red-500">*</span></Label>
                <Input
                  id="icNumber"
                  name="icNumber"
                  placeholder="e.g. 900101-14-5123"
                  value={formData.icNumber}
                  onChange={handleChange}
                  required={formData.role === "PATIENT"}
                  className="bg-white focus-visible:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-emerald-800">Date of Birth <span className="text-red-500">*</span></Label>
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleChange}
                    required={formData.role === "PATIENT"}
                    className="bg-white focus-visible:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-emerald-800">Gender <span className="text-red-500">*</span></Label>
                  <Select onValueChange={(val) => handleSelectChange("gender", val)} value={formData.gender} required={formData.role === "PATIENT"}>
                    <SelectTrigger id="gender" className="bg-white">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-emerald-800">Phone Number <span className="text-red-500">*</span></Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 234 567 890"
                  value={formData.phone}
                  onChange={handleChange}
                  required={formData.role === "PATIENT"}
                  className="bg-white focus-visible:ring-emerald-500"
                />
              </div>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
