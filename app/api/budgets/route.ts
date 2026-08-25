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

    const userId = session.user.id;

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
      },
      include: {
        category: true,
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" },
      ],
    });

    const transactions =
      await prisma.transaction.findMany({
        where: {
          userId,
          type: "EXPENSE",
        },
        select: {
          amount: true,
          categoryId: true,
          date: true,
        },
      });

    const result = budgets.map((budget) => {
      const spent = transactions
        .filter((transaction) => {
          const date = new Date(transaction.date);

          return (
            transaction.categoryId ===
              budget.categoryId &&
            date.getMonth() + 1 ===
              budget.month &&
            date.getFullYear() ===
              budget.year
          );
        })
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount),
          0
        );

      const amount = Number(budget.amount);
      const remaining = amount - spent;

      const percentage =
        amount > 0
          ? Math.min((spent / amount) * 100, 100)
          : 0;

      return {
        id: budget.id,
        amount,
        month: budget.month,
        year: budget.year,
        spent,
        remaining,
        percentage,
        category: {
          id: budget.category.id,
          name: budget.category.name,
          icon: budget.category.icon,
          color: budget.category.color,
        },
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "GET /api/budgets:",
      error
    );

    return NextResponse.json(
      { error: "Failed to fetch budgets" },
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

    const userId = session.user.id;
    const body = await request.json();

    const amount = Number(body.amount);
    const month = Number(body.month);
    const year = Number(body.year);

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          error:
            "Valid budget amount is required",
        },
        { status: 400 }
      );
    }

    if (
      !body.categoryId ||
      !month ||
      !year ||
      month < 1 ||
      month > 12
    ) {
      return NextResponse.json(
        {
          error:
            "Category, month and year are required",
        },
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

    const existingBudget =
      await prisma.budget.findFirst({
        where: {
          userId,
          categoryId: body.categoryId,
          month,
          year,
        },
      });

    if (existingBudget) {
      return NextResponse.json(
        {
          error:
            "A budget already exists for this category and month",
        },
        { status: 409 }
      );
    }

    const budget =
      await prisma.budget.create({
        data: {
          amount,
          month,
          year,
          userId,
          categoryId: body.categoryId,
        },
        include: {
          category: true,
        },
      });

    return NextResponse.json(
      {
        id: budget.id,
        amount: Number(budget.amount),
        month: budget.month,
        year: budget.year,
        spent: 0,
        remaining: Number(budget.amount),
        percentage: 0,
        category: {
          id: budget.category.id,
          name: budget.category.name,
          icon: budget.category.icon,
          color: budget.category.color,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/budgets:",
      error
    );

    return NextResponse.json(
      { error: "Failed to create budget" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Budget ID is required" },
        { status: 400 }
      );
    }

    const existingBudget =
      await prisma.budget.findFirst({
        where: {
          id: body.id,
          userId,
        },
      });

    if (!existingBudget) {
      return NextResponse.json(
        { error: "Budget not found" },
        { status: 404 }
      );
    }

    const amount = Number(body.amount);

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          error:
            "Valid budget amount is required",
        },
        { status: 400 }
      );
    }

    const budget =
      await prisma.budget.update({
        where: {
          id: existingBudget.id,
        },
        data: {
          amount,
        },
        include: {
          category: true,
        },
      });

    return NextResponse.json({
      id: budget.id,
      amount: Number(budget.amount),
      month: budget.month,
      year: budget.year,
      category: {
        id: budget.category.id,
        name: budget.category.name,
        icon: budget.category.icon,
        color: budget.category.color,
      },
    });
  } catch (error) {
    console.error(
      "PATCH /api/budgets:",
      error
    );

    return NextResponse.json(
      { error: "Failed to update budget" },
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

    const userId = session.user.id;
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Budget ID is required" },
        { status: 400 }
      );
    }

    const budget =
      await prisma.budget.findFirst({
        where: {
          id: body.id,
          userId,
        },
      });

    if (!budget) {
      return NextResponse.json(
        { error: "Budget not found" },
        { status: 404 }
      );
    }

    await prisma.budget.delete({
      where: {
        id: budget.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE /api/budgets:",
      error
    );

    return NextResponse.json(
      { error: "Failed to delete budget" },
      { status: 500 }
    );
  }
}