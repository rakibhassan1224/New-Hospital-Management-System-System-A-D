import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update appointment status" }, { status: 500 });
  }
}
