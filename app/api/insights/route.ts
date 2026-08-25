import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Insight = {
  id: string;
  type:
    | "warning"
    | "success"
    | "info"
    | "trend";
  title: string;
  description: string;
  value?: string;
  priority: number;
};

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

    const now = new Date();

    const currentStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const currentEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );

    const previousStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const previousEnd = currentStart;

    const [
      currentTransactions,
      previousTransactions,
      currentBudgets,
      goals,
    ] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: currentStart,
            lt: currentEnd,
          },
        },
        include: {
          category: true,
        },
      }),

      prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: previousStart,
            lt: previousEnd,
          },
        },
        include: {
          category: true,
        },
      }),

      prisma.budget.findMany({
        where: {
          userId,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
        include: {
          category: true,
        },
      }),

      prisma.goal.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    // --------------------------------------------------
    // Income / expenses
    // --------------------------------------------------

    let currentIncome = 0;
    let currentExpenses = 0;

    let previousIncome = 0;
    let previousExpenses = 0;

    for (const transaction of currentTransactions) {
      const amount = Number(
        transaction.amount
      );

      if (transaction.type === "INCOME") {
        currentIncome += amount;
      } else {
        currentExpenses += amount;
      }
    }

    for (const transaction of previousTransactions) {
      const amount = Number(
        transaction.amount
      );

      if (transaction.type === "INCOME") {
        previousIncome += amount;
      } else {
        previousExpenses += amount;
      }
    }

    const insights: Insight[] = [];

    // --------------------------------------------------
    // 1. Spending trend
    // --------------------------------------------------

    if (previousExpenses > 0) {
      const change =
        ((currentExpenses -
          previousExpenses) /
          previousExpenses) *
        100;

      if (change >= 20) {
        insights.push({
          id: "expense-spike",
          type: "warning",
          title: "Spending is rising",
          description:
            "Your expenses are significantly higher than last month.",
          value: `+${Math.round(change)}%`,
          priority: 100,
        });
      } else if (change <= -20) {
        insights.push({
          id: "expense-drop",
          type: "success",
          title: "Great spending control",
          description:
            "You're spending considerably less than last month.",
          value: `${Math.round(change)}%`,
          priority: 80,
        });
      } else {
        insights.push({
          id: "expense-stable",
          type: "info",
          title: "Spending is stable",
          description:
            "Your spending is broadly in line with last month.",
          value: `${
            change >= 0 ? "+" : ""
          }${Math.round(change)}%`,
          priority: 30,
        });
      }
    }

    // --------------------------------------------------
    // 2. Biggest spending category
    // --------------------------------------------------

    const categoryMap = new Map<
      string,
      {
        name: string;
        icon: string | null;
        amount: number;
      }
    >();

    for (const transaction of currentTransactions) {
      if (transaction.type !== "EXPENSE") {
        continue;
      }

      const amount = Number(
        transaction.amount
      );

      const category = transaction.category;

      const existing = categoryMap.get(
        category.id
      );

      if (existing) {
        existing.amount += amount;
      } else {
        categoryMap.set(category.id, {
          name: category.name,
          icon: category.icon,
          amount,
        });
      }
    }

    const categories = Array.from(
      categoryMap.values()
    ).sort(
      (a, b) => b.amount - a.amount
    );

    const biggestCategory = categories[0];

    if (
      biggestCategory &&
      currentExpenses > 0
    ) {
      const percentage =
        (biggestCategory.amount /
          currentExpenses) *
        100;

      insights.push({
        id: "top-category",
        type: "info",
        title: "Biggest spending category",
        description: `${biggestCategory.name} is taking the largest share of your expenses this month.`,
        value: `${Math.round(
          percentage
        )}%`,
        priority: 70,
      });
    }

    // --------------------------------------------------
    // 3. Budget warnings
    // --------------------------------------------------

    for (const budget of currentBudgets) {
      const spent = currentTransactions
        .filter(
          (transaction) =>
            transaction.type ===
              "EXPENSE" &&
            transaction.categoryId ===
              budget.categoryId
        )
        .reduce(
          (sum, transaction) =>
            sum +
            Number(transaction.amount),
          0
        );

      const budgetAmount = Number(
        budget.amount
      );

      if (budgetAmount <= 0) {
        continue;
      }

      const percentage =
        (spent / budgetAmount) * 100;

      if (percentage >= 100) {
        insights.push({
          id: `budget-over-${budget.id}`,
          type: "warning",
          title: `${budget.category.name} budget exceeded`,
          description: `You've spent more than your ${budget.category.name} budget this month.`,
          value: `${Math.round(
            percentage
          )}%`,
          priority: 95,
        });
      } else if (percentage >= 80) {
        insights.push({
          id: `budget-near-${budget.id}`,
          type: "warning",
          title: `${budget.category.name} is near its limit`,
          description: `You've already used most of your ${budget.category.name} budget.`,
          value: `${Math.round(
            percentage
          )}%`,
          priority: 90,
        });
      }
    }

    // --------------------------------------------------
    // 4. Savings insight
    // --------------------------------------------------

    if (currentIncome > 0) {
      const savings =
        currentIncome - currentExpenses;

      const savingsRate =
        (savings / currentIncome) * 100;

      if (savingsRate >= 30) {
        insights.push({
          id: "strong-savings",
          type: "success",
          title: "Excellent savings rate",
          description:
            "You're keeping a strong portion of your income this month.",
          value: `${Math.round(
            savingsRate
          )}% saved`,
          priority: 85,
        });
      } else if (savingsRate < 0) {
        insights.push({
          id: "negative-savings",
          type: "warning",
          title:
            "You're spending more than you earn",
          description:
            "Your expenses currently exceed your income this month.",
          value: `${Math.round(
            Math.abs(savingsRate)
          )}% deficit`,
          priority: 100,
        });
      } else if (savingsRate < 15) {
        insights.push({
          id: "low-savings",
          type: "info",
          title: "Savings could improve",
          description:
            "A little more room between your income and expenses would strengthen your savings.",
          value: `${Math.round(
            savingsRate
          )}% saved`,
          priority: 65,
        });
      }
    }

    // --------------------------------------------------
    // 5. Goal progress
    // Prisma Goal uses:
    // target
    // current
    // --------------------------------------------------

    const activeGoals = goals.filter(
      (goal) =>
        Number(goal.current) <
        Number(goal.target)
    );

    const completedGoals = goals.filter(
      (goal) =>
        Number(goal.current) >=
        Number(goal.target)
    );

    if (completedGoals.length > 0) {
      insights.push({
        id: "goal-completed",
        type: "success",
        title: "Goal achieved",
        description: `You've completed ${
          completedGoals.length
        } financial goal${
          completedGoals.length === 1
            ? ""
            : "s"
        }. Keep the momentum going.`,
        value: `${completedGoals.length} completed`,
        priority: 75,
      });
    }

    if (activeGoals.length > 0) {
      const closestGoal = [
        ...activeGoals,
      ].sort((a, b) => {
        const aProgress =
          Number(a.current) /
          Number(a.target);

        const bProgress =
          Number(b.current) /
          Number(b.target);

        return bProgress - aProgress;
      })[0];

      const progress =
        (Number(closestGoal.current) /
          Number(closestGoal.target)) *
        100;

      insights.push({
        id: "goal-progress",
        type: "info",
        title: "Keep your goal moving",
        description: `${closestGoal.name} is making progress. You're getting closer to the target.`,
        value: `${Math.round(
          progress
        )}%`,
        priority: 60,
      });
    }

    // --------------------------------------------------
    // 6. No data fallback
    // --------------------------------------------------

    if (
      currentExpenses === 0 &&
      currentIncome === 0
    ) {
      insights.push({
        id: "no-data",
        type: "info",
        title: "Start tracking your money",
        description:
          "Add a few transactions and SpendWise will start generating personalized insights.",
        priority: 50,
      });
    }

    // --------------------------------------------------
    // Sort insights by priority
    // --------------------------------------------------

    insights.sort(
      (a, b) =>
        b.priority - a.priority
    );

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return NextResponse.json({
      period: {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },

      summary: {
        currentIncome,
        currentExpenses,
        previousIncome,
        previousExpenses,
        balance:
          currentIncome -
          currentExpenses,

        savingsRate:
          currentIncome > 0
            ? ((currentIncome -
                currentExpenses) /
                currentIncome) *
              100
            : 0,
      },

      insights: insights.slice(0, 8),

      stats: {
        categoriesTracked:
          categories.length,
        budgetsTracked:
          currentBudgets.length,
        activeGoals:
          activeGoals.length,
        completedGoals:
          completedGoals.length,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/insights:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to generate insights",
      },
      { status: 500 }
    );
  }
}