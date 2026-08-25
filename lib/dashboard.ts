import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
    },
    include: {
      category: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  const now = new Date();

  const budgets = await prisma.budget.findMany({
    where: {
      userId: user.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
    include: {
      category: true,
    },
  });

  const goals = await prisma.goal.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const income = transactions
    .filter(
      (transaction) =>
        transaction.type === "INCOME"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  const expenses = transactions
    .filter(
      (transaction) =>
        transaction.type === "EXPENSE"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  const balance = income - expenses;

  const savingsRate =
    income > 0 ? (balance / income) * 100 : 0;

  const categorySpending =
    transactions
      .filter(
        (transaction) =>
          transaction.type === "EXPENSE"
      )
      .reduce<Record<string, number>>(
        (result, transaction) => {
          const categoryName =
            transaction.category.name;

          result[categoryName] =
            (result[categoryName] || 0) +
            Number(transaction.amount);

          return result;
        },
        {}
      );

  const weeklySpending = Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date();

      date.setDate(
        date.getDate() - (6 - index)
      );

      const dayStart = new Date(date);

      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(date);

      dayEnd.setHours(23, 59, 59, 999);

      const amount = transactions
        .filter(
          (transaction) =>
            transaction.type === "EXPENSE" &&
            transaction.date >= dayStart &&
            transaction.date <= dayEnd
        )
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount),
          0
        );

      return {
        day: dayStart.toLocaleDateString(
          "en-US",
          {
            weekday: "short",
          }
        ),
        amount,
      };
    }
  );

  /*
   * Convert Prisma Decimal values into numbers
   * before sending the data to a Client Component.
   */

  const serializedTransactions =
    transactions.map((transaction) => ({
      id: transaction.id,
      amount: Number(transaction.amount),
      type: transaction.type,
      description: transaction.description,
      date: transaction.date.toISOString(),
      paymentMethod:
        transaction.paymentMethod,
      notes: transaction.notes,
      userId: transaction.userId,
      categoryId: transaction.categoryId,
      createdAt:
        transaction.createdAt.toISOString(),
      updatedAt:
        transaction.updatedAt.toISOString(),
      category: {
        id: transaction.category.id,
        name: transaction.category.name,
        icon: transaction.category.icon,
        color: transaction.category.color,
      },
    }));

  const serializedBudgets = budgets.map(
    (budget) => ({
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
    })
  );

  const serializedGoals = goals.map(
    (goal) => ({
      id: goal.id,
      name: goal.name,
      target: Number(goal.target),
      current: Number(goal.current),
      deadline: goal.deadline
        ? goal.deadline.toISOString()
        : null,
    })
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    transactions: serializedTransactions,
    budgets: serializedBudgets,
    goals: serializedGoals,
    income,
    expenses,
    balance,
    savingsRate,
    categorySpending,
    weeklySpending,
  };
}