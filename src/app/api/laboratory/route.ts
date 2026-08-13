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

    const labTests = await prisma.labTest.findMany({
      where: patientId ? { patientId } : undefined,
      include: {
        patient: { select: { fullName: true } },
        doctor: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(labTests);
  } catch (error) {
    console.error("GET Lab Tests Error:", error);
    return NextResponse.json({ error: "Failed to fetch lab tests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { patientId, doctorId, testName } = body;

    if (!patientId || !doctorId || !testName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const labTest = await prisma.labTest.create({
      data: {
        patientId,
        doctorId,
        testName,
        status: "PENDING"
      }
    });

    return NextResponse.json(labTest, { status: 201 });
  } catch (error) {
    console.error("POST Lab Test Error:", error);
    return NextResponse.json({ error: "Failed to create lab test" }, { status: 500 });
  }
}
