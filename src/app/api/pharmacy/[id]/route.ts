import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    const order = await prisma.pharmacyOrder.update({
      where: { id: params.id },
      data: { status }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("PUT Pharmacy Error:", error);
    return NextResponse.json({ error: "Failed to update pharmacy order" }, { status: 500 });
  }
}
