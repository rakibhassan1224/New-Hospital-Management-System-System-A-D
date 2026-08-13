import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    const orders = await prisma.pharmacyOrder.findMany({
      where: patientId ? { patientId } : undefined,
      include: {
        patient: { select: { fullName: true } },
        doctor: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET Pharmacy Error:", error);
    return NextResponse.json({ error: "Failed to fetch pharmacy orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { patientId, doctorId, medication, dosage } = body;

    if (!patientId || !doctorId || !medication || !dosage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const order = await prisma.pharmacyOrder.create({
      data: {
        patientId,
        doctorId,
        medication,
        dosage,
        status: "PENDING"
      }
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("POST Pharmacy Error:", error);
    return NextResponse.json({ error: "Failed to create pharmacy order" }, { status: 500 });
  }
}
