import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(
      categories.map((category) => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
      }))
    );
  } catch (error) {
    console.error("GET /api/categories:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch categories",
      },
      {
        status: 500,
      }
    );
  }
}