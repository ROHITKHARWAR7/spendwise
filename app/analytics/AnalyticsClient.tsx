"use client";

import { useEffect, useMemo, useState } from "react";

type CategorySpending = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  amount: number;
  percentage: number;
};

type DailySpending = {
  date: string;
  income: number;
  expenses: number;
};

type AnalyticsData = {
  period: {
    month: number;
    year: number;
  };
  summary: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    savingsRate: number;
    transactionCount: number;
    averageExpense: number;
  };
  categorySpending: CategorySpending[];
  dailySpending: DailySpending[];
  highestSpendingCategory: CategorySpending | null;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AnalyticsClient() {
  const currentDate = new Date();

  const [month, setMonth] = useState(
    currentDate.getMonth() + 1
  );

  const [year, setYear] = useState(
    currentDate.getFullYear()
  );

  const [data, setData] =
    useState<AnalyticsData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/analytics?month=${month}&year=${year}`
      );

      if (!response.ok) {
        throw new Error("Failed to load analytics");
      }

      const result = await response.json();

      setData(result);
    } catch (err) {
      console.error(err);
      setError("Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [month, year]);

  const goPreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((current) => current - 1);
    } else {
      setMonth((current) => current - 1);
    }
  };

  const goNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((current) => current + 1);
    } else {
      setMonth((current) => current + 1);
    }
  };

  const chartData = useMemo(() => {
    if (!data) return [];

    return data.dailySpending.map((item) => ({
      ...item,
      day: Number(item.date.slice(8, 10)),
    }));
  }, [data]);

  const maxDailyValue = useMemo(() => {
    if (!chartData.length) return 1;

    return Math.max(
      ...chartData.map((item) =>
        Math.max(item.income, item.expenses)
      ),
      1
    );
  }, [chartData]);

  return (
    <main className="min-h-screen bg-[#08090b] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[20%] top-[-250px] h-[500px] w-[500px] rounded-full bg-emerald-500/[0.045] blur-[130px]" />

        <div className="absolute right-[-200px] top-[35%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.035] blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.05] bg-[#08090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1450px] items-center justify-between px-5 sm:px-7 lg:px-9">
          <div>
            <a
              href="/dashboard"
              className="text-sm font-semibold tracking-[-0.03em]"
            >
              Spend<span className="text-emerald-400">
                Wise
              </span>
            </a>

            <p className="mt-1 text-[10px] text-white/25">
              Analytics
            </p>
          </div>

          <a
            href="/dashboard"
            className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-2 text-xs text-white/45 transition hover:text-white"
          >
            Dashboard
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-[1450px] px-5 py-7 sm:px-7 lg:px-9 lg:py-9">
        {/* Heading */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400">
              Financial intelligence
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Your money, visualized.
            </h1>

            <p className="mt-2 text-sm text-white/30">
              Understand where your money goes and how
              your habits change.
            </p>
          </div>

          {/* Month selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={goPreviousMonth}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-white/35 transition hover:bg-white/[0.05] hover:text-white"
            >
              ←
            </button>

            <div className="min-w-[150px] rounded-xl border border-white/[0.07] bg-white/[0.025] px-5 py-2.5 text-center">
              <p className="text-xs font-medium">
                {monthNames[month - 1]}
              </p>

              <p className="mt-0.5 text-[9px] text-white/25">
                {year}
              </p>
            </div>

            <button
              onClick={goNextMonth}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-white/35 transition hover:bg-white/[0.05] hover:text-white"
            >
              →
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-400/10 bg-red-400/[0.05] px-4 py-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-3xl border border-white/[0.07] bg-white/[0.025] px-6 py-24 text-center">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />

            <p className="mt-4 text-xs text-white/25">
              Analyzing your finances...
            </p>
          </div>
        ) : data ? (
          <>
            {/* Summary cards */}
            <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Income"
                value={formatCurrency(
                  data.summary.totalIncome
                )}
                icon="↗"
                positive
              />

              <MetricCard
                label="Expenses"
                value={formatCurrency(
                  data.summary.totalExpenses
                )}
                icon="↘"
              />

              <MetricCard
                label="Net balance"
                value={formatCurrency(
                  data.summary.balance
                )}
                icon="◈"
                featured
              />

              <MetricCard
                label="Savings rate"
                value={`${Math.round(
                  data.summary.savingsRate
                )}%`}
                icon="◎"
                positive={
                  data.summary.savingsRate >= 0
                }
              />
            </section>

            {/* Charts row */}
            <section className="mt-4 grid gap-4 xl:grid-cols-[1.65fr_1fr]">
              {/* Daily chart */}
              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-7">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Cash flow
                    </p>

                    <p className="mt-1 text-xs text-white/25">
                      Daily income and expenses
                    </p>
                  </div>

                  <div className="flex gap-4 text-[9px] text-white/30">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Income
                    </span>

                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                      Expenses
                    </span>
                  </div>
                </div>

                {chartData.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <div className="mt-8 overflow-x-auto">
                    <div
                      className="flex min-w-[600px] items-end gap-2"
                      style={{ height: 260 }}
                    >
                      {chartData.map((item) => {
                        const incomeHeight =
                          (item.income /
                            maxDailyValue) *
                          100;

                        const expenseHeight =
                          (item.expenses /
                            maxDailyValue) *
                          100;

                        return (
                          <div
                            key={item.date}
                            className="group flex h-full flex-1 items-end justify-center gap-1"
                          >
                            <div className="relative flex h-full w-full max-w-3 items-end">
                              <div
                                className="w-full rounded-t-sm bg-emerald-400/70 transition group-hover:bg-emerald-300"
                                style={{
                                  height:
                                    incomeHeight + "%",
                                }}
                              >
                                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/[0.07] bg-[#111315] px-2.5 py-1.5 text-[9px] text-white/60 shadow-xl group-hover:block">
                                  Income{" "}
                                  {formatCurrency(
                                    item.income
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="relative flex h-full w-full max-w-3 items-end">
                              <div
                                className="w-full rounded-t-sm bg-white/25 transition group-hover:bg-white/40"
                                style={{
                                  height:
                                    expenseHeight + "%",
                                }}
                              >
                                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/[0.07] bg-[#111315] px-2.5 py-1.5 text-[9px] text-white/60 shadow-xl group-hover:block">
                                  Expense{" "}
                                  {formatCurrency(
                                    item.expenses
                                  )}
                                </div>
                              </div>
                            </div>

                            <span className="absolute mt-[280px] text-[8px] text-white/15">
                              {item.day}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Category breakdown */}
              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-7">
                <div>
                  <p className="text-sm font-medium">
                    Spending by category
                  </p>

                  <p className="mt-1 text-xs text-white/25">
                    Where your expenses went
                  </p>
                </div>

                {data.categorySpending.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <div className="mt-7 space-y-5">
                    {data.categorySpending
                      .slice(0, 6)
                      .map((category) => (
                        <div key={category.id}>
                          <div className="flex items-center justify-between">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <span className="text-sm">
                                {category.icon || "◈"}
                              </span>

                              <span className="truncate text-[10px] text-white/50">
                                {category.name}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] font-medium text-white/60">
                                {formatCurrency(
                                  category.amount
                                )}
                              </span>

                              <span className="ml-2 text-[9px] text-white/20">
                                {Math.round(
                                  category.percentage
                                )}
                                %
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                            <div
                              className="h-full rounded-full bg-emerald-400/70"
                              style={{
                                width:
                                  Math.min(
                                    category.percentage,
                                    100
                                  ) + "%",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </section>

            {/* Bottom insights */}
            <section className="mt-4 grid gap-4 lg:grid-cols-3">
              <InsightCard
                label="Top spending category"
                value={
                  data.highestSpendingCategory
                    ?.name || "No data"
                }
                detail={
                  data.highestSpendingCategory
                    ? formatCurrency(
                        data.highestSpendingCategory
                          .amount
                      )
                    : "Start spending to see insights"
                }
                icon={
                  data.highestSpendingCategory?.icon ||
                  "◈"
                }
              />

              <InsightCard
                label="Average expense"
                value={formatCurrency(
                  data.summary.averageExpense
                )}
                detail={`${data.summary.transactionCount} transactions this month`}
                icon="≈"
              />

              <InsightCard
                label="Savings outlook"
                value={
                  data.summary.savingsRate >= 30
                    ? "Excellent"
                    : data.summary.savingsRate >= 15
                      ? "Healthy"
                      : data.summary.savingsRate >= 0
                        ? "Needs attention"
                        : "Overspending"
                }
                detail={`${Math.round(
                  Math.max(
                    data.summary.savingsRate,
                    0
                  )
                )}% of income retained`}
                icon={
                  data.summary.savingsRate >= 15
                    ? "↗"
                    : "!"
                }
              />
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  icon,
  featured = false,
  positive = false,
}: {
  label: string;
  value: string;
  icon: string;
  featured?: boolean;
  positive?: boolean;
}) {
  return (
    <div
      className={
        "relative overflow-hidden rounded-2xl border p-5 " +
        (featured
          ? "border-emerald-400/15 bg-emerald-400/[0.035]"
          : "border-white/[0.07] bg-white/[0.025]")
      }
    >
      {featured && (
        <div className="absolute right-[-25px] top-[-25px] h-20 w-20 rounded-full bg-emerald-400/[0.08] blur-2xl" />
      )}

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/25">
            {label}
          </p>

          <p
            className={
              "mt-3 text-2xl font-semibold tracking-[-0.04em] " +
              (positive
                ? "text-emerald-300"
                : "")
            }
          >
            {value}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.035] text-sm text-white/35">
          {icon}
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: string;
}) {
  return (
    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/25">
            {label}
          </p>

          <p className="mt-3 text-lg font-semibold tracking-[-0.03em]">
            {value}
          </p>

          <p className="mt-1 text-[10px] text-white/25">
            {detail}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.035] text-sm text-emerald-300">
          {icon}
        </div>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[230px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.025] text-lg text-white/20">
          ◇
        </div>

        <p className="mt-4 text-xs text-white/25">
          No data for this month
        </p>
      </div>
    </div>
  );
}