"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type PharmacyOrder = {
  id: string;
  medication: string;
  dosage: string;
  status: string;
  createdAt: Date;
  patient: { fullName: string };
  doctor: { name: string };
};

export function PharmacyClient({ initialData, userRole }: { initialData: any[], userRole: string }) {
  const [data, setData] = useState<PharmacyOrder[]>(initialData);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleDispense = async (id: string) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/pharmacy/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DISPENSED" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setData(data.map(order => order.id === id ? { ...order, status: updated.status } : order));
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
              <TableHead>Date Prescribed</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Medication & Dosage</TableHead>
              <TableHead>Prescribed By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No pharmacy orders found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{format(new Date(order.createdAt), "MMM d, yyyy h:mm a")}</TableCell>
                  <TableCell className="font-medium">{order.patient.fullName}</TableCell>
                  <TableCell>
                    <span className="block font-medium">{order.medication}</span>
                    <span className="text-xs text-muted-foreground">{order.dosage}</span>
                  </TableCell>
                  <TableCell>Dr. {order.doctor.name}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === "DISPENSED" ? "default" : "secondary"}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {order.status === "DISPENSED" ? (
                      <span className="text-sm text-emerald-600 font-medium">Dispensed</span>
                    ) : (
                      userRole === "ADMIN" || userRole === "RECEPTIONIST" ? (
                        <Button 
                          onClick={() => handleDispense(order.id)} 
                          disabled={loading === order.id}
                          size="sm"
                        >
                          {loading === order.id ? "Processing..." : "Mark Dispensed"}
                        </Button>
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
