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
    const dateStr = searchParams.get("date"); // YYYY-MM-DD
    const doctorId = searchParams.get("doctorId");
    const status = searchParams.get("status");

    let where: any = {};

    if (dateStr) {
      const date = new Date(dateStr);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      where.date = {
        gte: date,
        lt: nextDate,
      };
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (status) {
      where.status = status;
    }

    // Role-based filtering
    if (session.user.role === "DOCTOR") {
      const doctorUser = await prisma.doctor.findUnique({
        where: { userId: session.user.id },
      });
      if (doctorUser) {
        where.doctorId = doctorUser.id;
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, fullName: true, icNumber: true, phone: true } },
        doctor: { select: { id: true, name: true, specialization: true } },
      },
      orderBy: [
        { date: "asc" },
        { time: "asc" },
      ],
    });

    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "RECEPTIONIST" && session.user.role !== "DOCTOR" && session.user.role !== "PATIENT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { patientId, doctorId, date, time, reason } = body;

    // If PATIENT is booking, ensure they are booking for themselves
    if (session.user.role === "PATIENT") {
      const patientProfile = await prisma.patient.findUnique({ where: { userId: session.user.id } });
      if (!patientProfile || patientProfile.id !== patientId) {
         return NextResponse.json({ error: "Unauthorized patient id" }, { status: 403 });
      }
    }

    // Check for double booking
    const appointmentDate = new Date(date);
    
    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date: {
          gte: new Date(appointmentDate.setHours(0,0,0,0)),
          lt: new Date(appointmentDate.setHours(23,59,59,999)),
        },
        time,
        status: {
          notIn: ["CANCELLED"],
        }
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Doctor is already booked for this time slot" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.create({
        data: {
          patientId,
          doctorId,
          date: new Date(date),
          time,
          status: "SCHEDULED",
          reason,
        },
        include: {
          patient: true,
          doctor: true,
        }
      });

      // Automatically generate a RM 150 consultation fee invoice
      const invoice = await tx.invoice.create({
        data: {
          appointmentId: appointment.id,
          amount: 150.0,
          status: "UNPAID",
        }
      });

      return { appointment, invoice };
    });

    return NextResponse.json(result.appointment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to book appointment: " + error.message }, { status: 500 });
  }
}
