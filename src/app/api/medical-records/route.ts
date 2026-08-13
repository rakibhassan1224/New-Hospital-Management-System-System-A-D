import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { appointmentId, diagnosis, prescription, notes, labTestName, medication, dosage } = body;

    // Make sure the appointment belongs to this doctor
    const doctorUser = await prisma.doctor.findUnique({
      where: { userId: session.user.id },
    });

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment || !doctorUser || appointment.doctorId !== doctorUser.id) {
      return NextResponse.json({ error: "Unauthorized to add record to this appointment" }, { status: 403 });
    }

    // Create the Medical Record and auto-update appointment status to COMPLETED
    const result = await prisma.$transaction(async (tx) => {
      const record = await tx.medicalRecord.create({
        data: {
          appointmentId,
          diagnosis,
          prescription,
          notes,
        },
      });

      await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: "COMPLETED" },
      });

      if (labTestName) {
        await tx.labTest.create({
          data: {
            patientId: appointment.patientId,
            doctorId: doctorUser.id,
            testName: labTestName,
            status: "PENDING"
          }
        });
      }

      if (medication && dosage) {
        await tx.pharmacyOrder.create({
          data: {
            patientId: appointment.patientId,
            doctorId: doctorUser.id,
            medication,
            dosage,
            status: "PENDING"
          }
        });
      }

      return record;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Medical record already exists for this appointment" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create medical record" }, { status: 500 });
  }
}
