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

  const now = new Date();

  /*
   * -------------------------------------------------------
   * CURRENT MONTH RANGE
   * -------------------------------------------------------
   */

  const currentMonthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0
  );

  const nextMonthStart = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
    0,
    0,
    0,
    0
  );

  /*
   * -------------------------------------------------------
   * TRANSACTIONS
   *
   * We fetch all transactions because:
   * - recent transactions need the latest records
   * - balance/income/expenses need current-month records
   * - weekly spending needs the last 7 days
   * -------------------------------------------------------
   */

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

  /*
   * -------------------------------------------------------
   * CURRENT MONTH TRANSACTIONS
   * -------------------------------------------------------
   */

  const currentMonthTransactions = transactions.filter(
    (transaction) =>
      transaction.date >= currentMonthStart &&
      transaction.date < nextMonthStart
  );

  /*
   * -------------------------------------------------------
   * CURRENT MONTH INCOME
   * -------------------------------------------------------
   */

  const income = currentMonthTransactions
    .filter(
      (transaction) =>
        transaction.type === "INCOME"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  /*
   * -------------------------------------------------------
   * CURRENT MONTH EXPENSES
   * -------------------------------------------------------
   */

  const expenses = currentMonthTransactions
    .filter(
      (transaction) =>
        transaction.type === "EXPENSE"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  /*
   * -------------------------------------------------------
   * CURRENT MONTH BALANCE
   * -------------------------------------------------------
   */

  const balance = income - expenses;

  /*
   * -------------------------------------------------------
   * SAVINGS RATE
   * -------------------------------------------------------
   */

  const savingsRate =
    income > 0
      ? (balance / income) * 100
      : 0;

  /*
   * -------------------------------------------------------
   * CURRENT MONTH CATEGORY SPENDING
   * -------------------------------------------------------
   */

  const categorySpending =
    currentMonthTransactions
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

  /*
   * -------------------------------------------------------
   * LAST 7 DAYS SPENDING
   * -------------------------------------------------------
   *
   * Includes today + previous 6 days.
   */

  const weeklySpending = Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date(now);

      date.setDate(
        now.getDate() - (6 - index)
      );

      const dayStart = new Date(date);

      dayStart.setHours(
        0,
        0,
        0,
        0
      );

      const dayEnd = new Date(date);

      dayEnd.setHours(
        23,
        59,
        59,
        999
      );

      const amount = transactions
        .filter(
          (transaction) =>
            transaction.type === "EXPENSE" &&
            transaction.date >= dayStart &&
            transaction.date <= dayEnd
        )
        .reduce(
          (total, transaction) =>
            total +
            Number(transaction.amount),
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
   * -------------------------------------------------------
   * CURRENT MONTH BUDGETS
   * -------------------------------------------------------
   */

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

  /*
   * -------------------------------------------------------
   * GOALS
   * -------------------------------------------------------
   */

  const goals = await prisma.goal.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  /*
   * -------------------------------------------------------
   * SERIALIZE TRANSACTIONS
   *
   * Prisma Decimal and Date values cannot be passed
   * directly into a Client Component.
   * -------------------------------------------------------
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

  /*
   * -------------------------------------------------------
   * SERIALIZE BUDGETS
   * -------------------------------------------------------
   */

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

  /*
   * -------------------------------------------------------
   * SERIALIZE GOALS
   * -------------------------------------------------------
   */

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

  /*
   * -------------------------------------------------------
   * RETURN DASHBOARD DATA
   * -------------------------------------------------------
   */

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },

    transactions:
      serializedTransactions,

    budgets:
      serializedBudgets,

    goals:
      serializedGoals,

    income,

    expenses,

    balance,

    savingsRate,

    categorySpending,

    weeklySpending,
  };
}