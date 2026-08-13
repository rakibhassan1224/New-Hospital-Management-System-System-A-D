import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the invoice belongs to this patient
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        appointment: {
          include: { patient: true }
        }
      }
    });

    if (!invoice || invoice.appointment.patient.userId !== session.user.id) {
      return NextResponse.json({ error: "Invoice not found or unauthorized" }, { status: 404 });
    }

    if (invoice.status === "PAID") {
      return NextResponse.json({ error: "Invoice is already paid" }, { status: 400 });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { status: "PAID" }
    });

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error("Payment Error:", error);
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}
