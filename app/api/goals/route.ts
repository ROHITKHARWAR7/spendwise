import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function serializeGoal(goal: {
  id: string;
  name: string;
  target: unknown;
  current: unknown;
  deadline: Date | null;
  createdAt: Date;
}) {
  const targetAmount = Number(goal.target);
  const currentAmount = Number(goal.current);

  const percentage =
    targetAmount > 0
      ? Math.min(
          (currentAmount / targetAmount) * 100,
          100
        )
      : 0;

  return {
    id: goal.id,
    name: goal.name,
    targetAmount,
    currentAmount,
    deadline: goal.deadline
      ? goal.deadline.toISOString()
      : null,
    percentage,
    completed:
      currentAmount >= targetAmount,
    createdAt:
      goal.createdAt.toISOString(),
  };
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const goals = await prisma.goal.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      goals.map(serializeGoal)
    );
  } catch (error) {
    console.error(
      "GET /api/goals:",
      error
    );

    return NextResponse.json(
      { error: "Failed to fetch goals" },
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

    const name = String(
      body.name || ""
    ).trim();

    const targetAmount = Number(
      body.targetAmount
    );

    const currentAmount = Number(
      body.currentAmount || 0
    );

    if (!name) {
      return NextResponse.json(
        { error: "Goal name is required" },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(targetAmount) ||
      targetAmount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Valid target amount is required",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(currentAmount) ||
      currentAmount < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Current amount cannot be negative",
        },
        { status: 400 }
      );
    }

    if (currentAmount > targetAmount) {
      return NextResponse.json(
        {
          error:
            "Current amount cannot exceed target amount",
        },
        { status: 400 }
      );
    }

    let deadline: Date | null = null;

    if (body.deadline) {
      const parsedDeadline = new Date(
        body.deadline
      );

      if (
        Number.isNaN(
          parsedDeadline.getTime()
        )
      ) {
        return NextResponse.json(
          {
            error: "Invalid deadline",
          },
          { status: 400 }
        );
      }

      deadline = parsedDeadline;
    }

    const goal = await prisma.goal.create({
      data: {
        name,
        target: targetAmount,
        current: currentAmount,
        deadline,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      serializeGoal(goal),
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/goals:",
      error
    );

    return NextResponse.json(
      { error: "Failed to create goal" },
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

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 }
      );
    }

    const existingGoal =
      await prisma.goal.findFirst({
        where: {
          id: body.id,
          userId: session.user.id,
        },
      });

    if (!existingGoal) {
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      );
    }

    const targetAmount =
      body.targetAmount !== undefined
        ? Number(body.targetAmount)
        : Number(existingGoal.target);

    const currentAmount =
      body.currentAmount !== undefined
        ? Number(body.currentAmount)
        : Number(existingGoal.current);

    if (
      !Number.isFinite(targetAmount) ||
      targetAmount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Valid target amount is required",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(currentAmount) ||
      currentAmount < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Current amount cannot be negative",
        },
        { status: 400 }
      );
    }

    if (currentAmount > targetAmount) {
      return NextResponse.json(
        {
          error:
            "Current amount cannot exceed target amount",
        },
        { status: 400 }
      );
    }

    let deadline =
      existingGoal.deadline;

    if (body.deadline !== undefined) {
      if (!body.deadline) {
        deadline = null;
      } else {
        const parsedDeadline = new Date(
          body.deadline
        );

        if (
          Number.isNaN(
            parsedDeadline.getTime()
          )
        ) {
          return NextResponse.json(
            {
              error: "Invalid deadline",
            },
            { status: 400 }
          );
        }

        deadline = parsedDeadline;
      }
    }

    const name =
      body.name !== undefined
        ? String(body.name).trim()
        : existingGoal.name;

    if (!name) {
      return NextResponse.json(
        { error: "Goal name is required" },
        { status: 400 }
      );
    }

    const goal = await prisma.goal.update({
      where: {
        id: existingGoal.id,
      },
      data: {
        name,
        target: targetAmount,
        current: currentAmount,
        deadline,
      },
    });

    return NextResponse.json(
      serializeGoal(goal)
    );
  } catch (error) {
    console.error(
      "PATCH /api/goals:",
      error
    );

    return NextResponse.json(
      { error: "Failed to update goal" },
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
        { error: "Goal ID is required" },
        { status: 400 }
      );
    }

    const goal =
      await prisma.goal.findFirst({
        where: {
          id: body.id,
          userId: session.user.id,
        },
      });

    if (!goal) {
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      );
    }

    await prisma.goal.delete({
      where: {
        id: goal.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE /api/goals:",
      error
    );

    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 }
    );
  }
}