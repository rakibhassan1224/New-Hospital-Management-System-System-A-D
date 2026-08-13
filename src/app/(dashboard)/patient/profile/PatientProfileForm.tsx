"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function PatientProfileForm({ patient }: { patient: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    phone: patient.phone || "",
    address: patient.address || "",
    bloodType: patient.bloodType || "",
    allergies: patient.allergies || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/patient/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="p-3 text-sm font-medium text-destructive-foreground bg-destructive/20 rounded-md">{error}</div>}
          {success && <div className="p-3 text-sm font-medium text-emerald-800 bg-emerald-100 rounded-md">Profile updated successfully!</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={patient.fullName} disabled className="bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>ID / Passport Number</Label>
              <Input value={patient.icNumber} disabled className="bg-slate-50" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" value={formData.address} onChange={handleChange} rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t mt-4">
            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type</Label>
              <Input id="bloodType" name="bloodType" value={formData.bloodType} onChange={handleChange} placeholder="e.g. O+, A-" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Known Allergies</Label>
              <Input id="allergies" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="e.g. Penicillin, Peanuts" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t p-4">
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
