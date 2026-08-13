"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type LabTest = {
  id: string;
  testName: string;
  status: string;
  result: string | null;
  createdAt: Date;
  patient: { fullName: string };
  doctor: { name: string };
};

export function LabTestClient({ initialData, userRole }: { initialData: any[], userRole: string }) {
  const [data, setData] = useState<LabTest[]>(initialData);
  const [loading, setLoading] = useState<string | null>(null);
  const [resultInput, setResultInput] = useState("");
  const router = useRouter();

  const handleComplete = async (id: string) => {
    if (!resultInput.trim()) return;
    
    setLoading(id);
    try {
      const res = await fetch(`/api/laboratory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED", result: resultInput }),
      });
      if (res.ok) {
        const updated = await res.json();
        setData(data.map(test => test.id === id ? { ...test, status: updated.status, result: updated.result } : test));
        setResultInput("");
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date Requested</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Test Name</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions / Results</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No lab tests found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>{format(new Date(test.createdAt), "MMM d, yyyy h:mm a")}</TableCell>
                  <TableCell className="font-medium">{test.patient.fullName}</TableCell>
                  <TableCell>{test.testName}</TableCell>
                  <TableCell>Dr. {test.doctor.name}</TableCell>
                  <TableCell>
                    <Badge variant={test.status === "COMPLETED" ? "default" : "secondary"}>
                      {test.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {test.status === "COMPLETED" ? (
                      <span className="text-sm font-medium text-emerald-600">{test.result}</span>
                    ) : (
                      userRole === "ADMIN" || userRole === "RECEPTIONIST" ? (
                        <Dialog>
                          <DialogTrigger render={<Button variant="outline" size="sm" />}>
                            Enter Result
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Enter Lab Results</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Test: {test.testName}</Label>
                                <Label className="text-muted-foreground block">Patient: {test.patient.fullName}</Label>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="result">Result Details</Label>
                                <Input 
                                  id="result" 
                                  placeholder="e.g. Negative, Normal, 120 mg/dL..." 
                                  value={resultInput}
                                  onChange={e => setResultInput(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                onClick={() => handleComplete(test.id)} 
                                disabled={loading === test.id || !resultInput.trim()}
                              >
                                {loading === test.id ? "Saving..." : "Save & Complete"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <span className="text-sm text-muted-foreground">Pending</span>
                      )
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
