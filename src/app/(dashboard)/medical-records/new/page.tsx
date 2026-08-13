"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewMedicalRecordPage(props: { searchParams: Promise<{ appointmentId: string }> }) {
  const router = useRouter();
  const searchParams = use(props.searchParams);
  const appointmentId = searchParams.appointmentId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    appointmentId: appointmentId || "",
    diagnosis: "",
    prescription: "",
    notes: "",
    labTestName: "",
    medication: "",
    dosage: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/medical-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add record");
      }

      router.push("/medical-records");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!appointmentId) {
    return <div>Invalid appointment ID</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add Medical Record</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Consultation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm font-medium text-destructive-foreground bg-destructive/20 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis <span className="text-red-500">*</span></Label>
              <Input id="diagnosis" name="diagnosis" required value={formData.diagnosis} onChange={handleChange} placeholder="e.g. Viral Fever, Hypertension" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Doctor's Notes</Label>
              <Textarea id="notes" name="notes" rows={4} value={formData.notes} onChange={handleChange} placeholder="Observations, advice given, follow-up recommendations" />
            </div>
            
            <div className="p-4 bg-muted/30 rounded-lg space-y-4 border">
              <h3 className="font-semibold text-lg text-primary">Laboratory Request (Optional)</h3>
              <div className="space-y-2">
                <Label htmlFor="labTestName">Test Name</Label>
                <Input id="labTestName" name="labTestName" value={formData.labTestName} onChange={handleChange} placeholder="e.g. Complete Blood Count, X-Ray" />
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg space-y-4 border">
              <h3 className="font-semibold text-lg text-primary">Pharmacy Order (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medication">Medication</Label>
                  <Input id="medication" name="medication" value={formData.medication} onChange={handleChange} placeholder="e.g. Amoxicillin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input id="dosage" name="dosage" value={formData.dosage} onChange={handleChange} placeholder="e.g. 500mg, twice daily" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prescription">Additional Prescription Notes</Label>
                <Textarea id="prescription" name="prescription" rows={2} value={formData.prescription} onChange={handleChange} placeholder="Alternative medication, general instructions" />
              </div>
            </div>

          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Record
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
