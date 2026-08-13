import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, departmentId, specialization } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // If role is doctor, we need to create both User and Doctor in a transaction
    if (role === "DOCTOR") {
      if (!departmentId || !specialization) {
        return NextResponse.json({ error: "Doctor requires department and specialization" }, { status: 400 });
      }

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role,
          },
        });

        const doctor = await tx.doctor.create({
          data: {
            userId: user.id,
            name,
            specialization,
            departmentId,
            availability: "Mon-Fri 9AM-5PM", // Default availability
          },
        });

        return { user, doctor };
      });

      return NextResponse.json(result.user, { status: 201 });
    } else if (role === "PATIENT") {
      const { icNumber, dob, gender, phone } = body;
      if (!icNumber || !dob || !gender || !phone) {
        return NextResponse.json({ error: "Patient requires IC number, DOB, gender, and phone" }, { status: 400 });
      }

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role,
          },
        });

        let patient = await tx.patient.findUnique({
          where: { icNumber }
        });

        if (patient) {
          if (patient.userId) {
            throw new Error("Patient profile already linked to another account");
          }
          patient = await tx.patient.update({
            where: { id: patient.id },
            data: { userId: user.id }
          });
        } else {
          patient = await tx.patient.create({
            data: {
              userId: user.id,
              fullName: name,
              icNumber,
              dob: new Date(dob),
              gender,
              phone,
            },
          });
        }

        return { user, patient };
      });

      return NextResponse.json(result.user, { status: 201 });
    } else {
      // For ADMIN and RECEPTIONIST, just create the user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
      });

      return NextResponse.json(user, { status: 201 });
    }
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
