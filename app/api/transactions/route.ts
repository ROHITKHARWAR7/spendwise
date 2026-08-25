import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const transactions =
      await prisma.transaction.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          category: true,
        },
        orderBy: {
          date: "desc",
        },
      });

    const result = transactions.map(
      (transaction) => ({
        id: transaction.id,
        amount: Number(transaction.amount),
        type: transaction.type,
        description: transaction.description,
        date: transaction.date.toISOString(),
        paymentMethod:
          transaction.paymentMethod,
        notes: transaction.notes,
        category: {
          id: transaction.category.id,
          name: transaction.category.name,
          icon: transaction.category.icon,
          color: transaction.category.color,
        },
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "GET /api/transactions:",
      error
    );

    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const amount = Number(body.amount);

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    if (
      body.type !== "EXPENSE" &&
      body.type !== "INCOME"
    ) {
      return NextResponse.json(
        { error: "Invalid transaction type" },
        { status: 400 }
      );
    }

    if (!body.categoryId) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    const category =
      await prisma.category.findUnique({
        where: {
          id: body.categoryId,
        },
      });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const transaction =
      await prisma.transaction.create({
        data: {
          amount,
          type: body.type,
          description:
            body.description || null,
          date: body.date
            ? new Date(body.date)
            : new Date(),
          paymentMethod:
            body.paymentMethod || "UPI",
          notes: body.notes || null,
          userId: session.user.id,
          categoryId: body.categoryId,
        },
        include: {
          category: true,
        },
      });

    return NextResponse.json(
      {
        id: transaction.id,
        amount: Number(transaction.amount),
        type: transaction.type,
        description: transaction.description,
        date: transaction.date.toISOString(),
        paymentMethod:
          transaction.paymentMethod,
        notes: transaction.notes,
        category: {
          id: transaction.category.id,
          name: transaction.category.name,
          icon: transaction.category.icon,
          color: transaction.category.color,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/transactions:",
      error
    );

    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const transaction =
      await prisma.transaction.findFirst({
        where: {
          id: body.id,
          userId: session.user.id,
        },
      });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    await prisma.transaction.delete({
      where: {
        id: transaction.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE /api/transactions:",
      error
    );

    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}