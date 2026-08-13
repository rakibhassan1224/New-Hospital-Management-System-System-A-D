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
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "RECEPTIONIST")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update invoice status" }, { status: 500 });
  }
}
