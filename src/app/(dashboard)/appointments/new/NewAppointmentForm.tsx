"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import Link from "next/link";

export function NewAppointmentForm({ 
  patients, 
  doctors, 
  initialPatientId 
}: { 
  patients: { id: string; fullName: string; icNumber: string }[];
  doctors: { id: string; name: string; specialization: string }[];
  initialPatientId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    patientId: initialPatientId || "",
    doctorId: "",
    date: "",
    time: "",
    reason: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | null) => {
    if (value === null) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to book appointment");
      }

      router.push("/appointments");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate time slots (9 AM to 5 PM, 30 min intervals)
  const timeSlots = [];
  for (let i = 9; i <= 17; i++) {
    timeSlots.push(`${i.toString().padStart(2, '0')}:00`);
    if (i !== 17) {
      timeSlots.push(`${i.toString().padStart(2, '0')}:30`);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="space-y-6 pt-6">
          {error && (
            <div className="p-3 text-sm font-medium text-destructive-foreground bg-destructive/20 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="patientId">Patient <span className="text-red-500">*</span></Label>
              <Select onValueChange={(val) => handleSelectChange("patientId", val)} value={formData.patientId} required>
                <SelectTrigger id="patientId">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.fullName} ({p.icNumber})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="doctorId">Doctor <span className="text-red-500">*</span></Label>
              <Select onValueChange={(val) => handleSelectChange("doctorId", val)} value={formData.doctorId} required>
                <SelectTrigger id="doctorId">
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name} ({d.specialization})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
              <Input id="date" name="date" type="date" required value={formData.date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time Slot <span className="text-red-500">*</span></Label>
              <Select onValueChange={(val) => handleSelectChange("time", val)} value={formData.time} required>
                <SelectTrigger id="time">
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit</Label>
            <Textarea id="reason" name="reason" rows={3} value={formData.reason} onChange={handleChange} placeholder="Briefly describe the symptoms or reason for visit" />
          </div>
          
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Link href="/appointments">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? "Booking..." : (
              <>
                <Save className="mr-2 h-4 w-4" /> Book Appointment
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
