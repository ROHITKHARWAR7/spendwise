import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(
      request.url
    );

    const requestedMonth = Number(
      searchParams.get("month")
    );

    const requestedYear = Number(
      searchParams.get("year")
    );

    const now = new Date();

    const month =
      requestedMonth >= 1 &&
      requestedMonth <= 12
        ? requestedMonth
        : now.getMonth() + 1;

    const year =
      requestedYear >= 2000 &&
      requestedYear <= 2100
        ? requestedYear
        : now.getFullYear();

    const transactions =
      await prisma.transaction.findMany({
        where: {
          userId: session.user.id,
          date: {
            gte: new Date(
              year,
              month - 1,
              1
            ),
            lt: new Date(
              year,
              month,
              1
            ),
          },
        },
        include: {
          category: true,
        },
        orderBy: {
          date: "asc",
        },
      });

    let totalIncome = 0;
    let totalExpenses = 0;

    const categoryMap = new Map<
      string,
      {
        id: string;
        name: string;
        icon: string | null;
        color: string | null;
        amount: number;
      }
    >();

    const dailyMap = new Map<
      string,
      {
        income: number;
        expenses: number;
      }
    >();

    for (const transaction of transactions) {
      const amount = Number(
        transaction.amount
      );

      if (transaction.type === "INCOME") {
        totalIncome += amount;
      } else {
        totalExpenses += amount;
      }

      if (transaction.type === "EXPENSE") {
        const existing = categoryMap.get(
          transaction.category.id
        );

        if (existing) {
          existing.amount += amount;
        } else {
          categoryMap.set(
            transaction.category.id,
            {
              id: transaction.category.id,
              name: transaction.category.name,
              icon: transaction.category.icon,
              color: transaction.category.color,
              amount,
            }
          );
        }
      }

      const dateKey = transaction.date
        .toISOString()
        .slice(0, 10);

      const daily =
        dailyMap.get(dateKey) || {
          income: 0,
          expenses: 0,
        };

      if (transaction.type === "INCOME") {
        daily.income += amount;
      } else {
        daily.expenses += amount;
      }

      dailyMap.set(dateKey, daily);
    }

    const balance =
      totalIncome - totalExpenses;

    const savingsRate =
      totalIncome > 0
        ? (balance / totalIncome) * 100
        : 0;

    const categorySpending =
      Array.from(categoryMap.values())
        .sort(
          (a, b) => b.amount - a.amount
        )
        .map((category) => ({
          ...category,
          percentage:
            totalExpenses > 0
              ? (category.amount /
                  totalExpenses) *
                100
              : 0,
        }));

    const dailySpending =
      Array.from(dailyMap.entries())
        .sort(([a], [b]) =>
          a.localeCompare(b)
        )
        .map(([date, values]) => ({
          date,
          income: values.income,
          expenses: values.expenses,
        }));

    const highestSpendingCategory =
      categorySpending[0] || null;

    const transactionCount =
      transactions.length;

    const expenseTransactions =
      transactions.filter(
        (transaction) =>
          transaction.type ===
          "EXPENSE"
      );

    const averageExpense =
      expenseTransactions.length > 0
        ? totalExpenses /
          expenseTransactions.length
        : 0;

    return NextResponse.json({
      period: {
        month,
        year,
      },
      summary: {
        totalIncome,
        totalExpenses,
        balance,
        savingsRate,
        transactionCount,
        averageExpense,
      },
      categorySpending,
      dailySpending,
      highestSpendingCategory,
    });
  } catch (error) {
    console.error(
      "GET /api/analytics:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to generate analytics",
      },
      { status: 500 }
    );
  }
}