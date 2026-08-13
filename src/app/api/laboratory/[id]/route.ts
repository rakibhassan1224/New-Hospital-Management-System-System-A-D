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
    const { status, result } = body;

    const labTest = await prisma.labTest.update({
      where: { id: params.id },
      data: {
        status,
        result
      }
    });

    return NextResponse.json(labTest);
  } catch (error) {
    console.error("PUT Lab Test Error:", error);
    return NextResponse.json({ error: "Failed to update lab test" }, { status: 500 });
  }
}
