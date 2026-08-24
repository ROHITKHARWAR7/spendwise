"use client";

import { useState } from "react";

type DashboardData = {
  user: {
    id: string;
    name: string | null;
    email: string;
  };

  transactions: Array<{
    id: string;
    amount: number;
    type: "EXPENSE" | "INCOME";
    description: string | null;
    date: string;
    paymentMethod: string;
    notes: string | null;
    userId: string;
    categoryId: string;
    createdAt: string;
    updatedAt: string;
    category: {
      id: string;
      name: string;
      icon: string | null;
      color: string | null;
    };
  }>;

  budgets: Array<{
    id: string;
    amount: number;
    month: number;
    year: number;
    category: {
      id: string;
      name: string;
      icon: string | null;
      color: string | null;
    };
  }>;

  goals: Array<{
    id: string;
    name: string;
    target: number;
    current: number;
    deadline: string | null;
  }>;

  income: number;
  expenses: number;
  balance: number;
  savingsRate: number;
  categorySpending: Record<string, number>;

  weeklySpending: Array<{
    day: string;
    amount: number;
  }>;
};

export default function DashboardClient({
  data,
}: {
  data: DashboardData;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const firstGoal = data.goals[0];

  const goalCurrent = firstGoal ? firstGoal.current : 0;
  const goalTarget = firstGoal ? firstGoal.target : 0;

  const goalPercentage =
    goalTarget > 0
      ? Math.min((goalCurrent / goalTarget) * 100, 100)
      : 0;

  const sidebarClass =
    "fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-white/[0.06] bg-[#090b0d]/95 px-5 py-6 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 " +
    (sidebarOpen ? "translate-x-0" : "-translate-x-full");

  const maxWeeklySpending = Math.max(
    ...data.weeklySpending.map((item) => item.amount),
    1
  );

  return (
    <main className="min-h-screen bg-[#08090b] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[25%] top-[-250px] h-[500px] w-[500px] rounded-full bg-emerald-500/[0.045] blur-[130px]" />

        <div className="absolute right-[-200px] top-[40%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.035] blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside className={sidebarClass}>
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
              >
                <path d="M5 12.5 10 17l9-10" />
              </svg>
            </div>

            <span className="text-[16px] font-semibold tracking-[-0.03em]">
              Spend<span className="text-emerald-400">Wise</span>
            </span>
          </a>

          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white/30 lg:hidden"
          >
            ×
          </button>
        </div>

        <div className="mt-10">
          <p className="px-3 text-[9px] font-medium uppercase tracking-[0.2em] text-white/20">
            Workspace
          </p>

          <nav className="mt-3 space-y-1">
            <NavItem active icon="⌂" label="Overview" href="/dashboard" />
            <NavItem icon="↔" label="Transactions" href="/transactions" />
            <NavItem icon="◫" label="Budgets" href="/budgets" />
            <NavItem icon="◌" label="Analytics" href="/analytics" />
            <NavItem icon="◎" label="Goals" href="/goals" />
          </nav>
        </div>

        <div className="mt-8">
          <p className="px-3 text-[9px] font-medium uppercase tracking-[0.2em] text-white/20">
            Account
          </p>

          <nav className="mt-3 space-y-1">
            <NavItem icon="⚙" label="Settings" href="/settings" />
          </nav>
        </div>

        <div className="mt-auto rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-emerald-600 text-xs font-bold text-black">
              SW
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-medium">
                {data.user.name || "SpendWise User"}
              </p>

              <p className="truncate text-[10px] text-white/25">
                {data.user.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-[250px]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-white/[0.05] bg-[#08090b]/75 backdrop-blur-xl">
          <div className="flex h-[72px] items-center justify-between px-5 sm:px-7 lg:px-9">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-2 text-white/60 lg:hidden"
              >
                ☰
              </button>

              <div>
                <p className="text-xs text-white/25">
                  August 2026
                </p>

                <h1 className="mt-0.5 text-sm font-semibold sm:text-base">
                  Good afternoon 👋
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button className="hidden rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs text-white/45 transition hover:bg-white/[0.05] hover:text-white sm:block">
                This month
                <span className="ml-2 text-white/20">⌄</span>
              </button>

              <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-sm text-white/50 transition hover:bg-white/[0.05]">
                🔔
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="mx-auto max-w-[1450px] px-5 py-7 sm:px-7 lg:px-9 lg:py-9">
          {/* Heading */}
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400">
                Financial overview
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
                Your money at a glance.
              </h2>

              <p className="mt-2 text-sm text-white/30">
                Here&apos;s what your finances look like this month.
              </p>
            </div>

            <a
              href="/transactions"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-emerald-300"
            >
              <span className="text-base leading-none">+</span>
              Add transaction
            </a>
          </div>

          {/* Overview */}
          <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <OverviewCard
              label="Total balance"
              value={formatCurrency(data.balance)}
              change="Live"
              description="current balance"
              icon="◈"
              featured
            />

            <OverviewCard
              label="Total income"
              value={formatCurrency(data.income)}
              change="Live"
              description="this month"
              icon="↗"
            />

            <OverviewCard
              label="Total spending"
              value={formatCurrency(data.expenses)}
              change="Live"
              description="this month"
              icon="↘"
            />

            <OverviewCard
              label="Savings rate"
              value={data.savingsRate.toFixed(1) + "%"}
              change="Live"
              description="of total income"
              icon="◎"
            />
          </section>

          {/* Chart + Budgets */}
          <section className="mt-4 grid gap-4 xl:grid-cols-[1.65fr_1fr]">
            {/* Spending chart */}
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-7">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Spending overview
                  </p>

                  <p className="mt-1 text-xs text-white/25">
                    Recent spending activity
                  </p>
                </div>

                <span className="rounded-lg border border-white/[0.07] px-3 py-1.5 text-[10px] text-white/40">
                  Last 7 days
                </span>
              </div>

              <div className="mt-8 flex h-[260px]">
                <div className="flex w-12 flex-col justify-between pb-6 text-[9px] text-white/15">
                  <span>₹2k</span>
                  <span>₹1.5k</span>
                  <span>₹1k</span>
                  <span>₹500</span>
                  <span>₹0</span>
                </div>

                <div className="relative flex flex-1 flex-col">
                  <div className="absolute inset-0 flex flex-col justify-between pb-6">
                    {[0, 1, 2, 3, 4].map((line) => (
                      <div
                        key={line}
                        className="border-t border-white/[0.045]"
                      />
                    ))}
                  </div>

                  <div className="relative flex flex-1 items-end gap-2 px-2 pb-6 sm:gap-5">
                    {data.weeklySpending.map((item) => {
                      const height =
                        (item.amount / maxWeeklySpending) * 100;

                      return (
                        <div
                          key={item.day}
                          className="group flex h-full flex-1 flex-col justify-end"
                        >
                          <div className="relative flex h-full items-end">
                            <div
                              className="w-full rounded-t-xl bg-white/[0.07] transition-all duration-300 group-hover:bg-emerald-400"
                              style={{
                                height: height + "%",
                              }}
                            >
                              <div className="absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded-lg bg-white px-2 py-1 text-[9px] font-semibold text-black group-hover:block">
                                {formatCurrency(item.amount)}
                              </div>
                            </div>
                          </div>

                          <span className="mt-3 text-center text-[9px] text-white/20">
                            {item.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Budgets */}
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-7">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Monthly budgets
                  </p>

                  <p className="mt-1 text-xs text-white/25">
                    August 2026
                  </p>
                </div>

                <a
                  href="/budgets"
                  className="text-[10px] text-emerald-300 hover:text-emerald-200"
                >
                  Manage →
                </a>
              </div>

              <div className="mt-7 space-y-6">
                {data.budgets.map((budget) => {
                  const budgetAmount = budget.amount;

                  const spent =
                    data.categorySpending[
                      budget.category.name
                    ] || 0;

                  const percentage =
                    budgetAmount > 0
                      ? Math.min(
                          (spent / budgetAmount) * 100,
                          100
                        )
                      : 0;

                  return (
                    <div key={budget.id}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.05] text-sm">
                            {budget.category.icon || "◈"}
                          </div>

                          <div>
                            <p className="text-xs font-medium">
                              {budget.category.name}
                            </p>

                            <p className="mt-0.5 text-[9px] text-white/25">
                              {formatCurrency(spent)} spent
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] text-white/30">
                          {formatCurrency(budgetAmount)}
                        </span>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className={
                            "h-full rounded-full " +
                            (percentage > 80
                              ? "bg-amber-400"
                              : "bg-emerald-400")
                          }
                          style={{
                            width: percentage + "%",
                          }}
                        />
                      </div>

                      <div className="mt-1.5 text-right text-[9px] text-white/20">
                        {Math.round(percentage)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Transactions + Goal */}
          <section className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            {/* Transactions */}
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Recent transactions
                  </p>

                  <p className="mt-1 text-xs text-white/25">
                    Your latest financial activity
                  </p>
                </div>

                <a
                  href="/transactions"
                  className="text-[10px] text-emerald-300"
                >
                  View all →
                </a>
              </div>

              <div className="mt-5 divide-y divide-white/[0.05]">
                {data.transactions.slice(0, 5).map((transaction) => {
                  const amount = transaction.amount;
                  const isIncome =
                    transaction.type === "INCOME";

                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-base">
                          {transaction.category.icon || "◈"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium">
                            {transaction.description ||
                              transaction.category.name}
                          </p>

                          <p className="mt-1 truncate text-[10px] text-white/25">
                            {transaction.category.name} ·{" "}
                            {transaction.paymentMethod}
                          </p>
                        </div>
                      </div>

                      <span
                        className={
                          "shrink-0 text-xs font-medium " +
                          (isIncome
                            ? "text-emerald-300"
                            : "text-white/65")
                        }
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Goal */}
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-7">
              <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-emerald-400/[0.08] blur-[60px]" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Savings goal
                    </p>

                    <p className="mt-1 text-xs text-white/25">
                      {firstGoal?.name || "No goal yet"}
                    </p>
                  </div>

                  {firstGoal && (
                    <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[9px] text-emerald-300">
                      {goalPercentage >= 50
                        ? "On track"
                        : "In progress"}
                    </span>
                  )}
                </div>

                {firstGoal ? (
                  <>
                    <div className="mt-8 flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-semibold tracking-[-0.04em]">
                          {formatCurrency(goalCurrent)}
                        </p>

                        <p className="mt-1 text-[10px] text-white/25">
                          of {formatCurrency(goalTarget)}
                        </p>
                      </div>

                      <span className="text-sm font-medium text-emerald-300">
                        {Math.round(goalPercentage)}%
                      </span>
                    </div>

                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{
                          width: goalPercentage + "%",
                        }}
                      />
                    </div>

                    <div className="mt-5 flex items-center justify-between text-[10px] text-white/25">
                      <span>
                        {formatCurrency(
                          Math.max(
                            goalTarget - goalCurrent,
                            0
                          )
                        )}{" "}
                        remaining
                      </span>

                      <span>
                        {firstGoal.deadline
                          ? new Date(
                              firstGoal.deadline
                            ).toLocaleDateString("en-IN", {
                              month: "short",
                              year: "numeric",
                            })
                          : "No deadline"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="mt-8 rounded-2xl border border-dashed border-white/[0.08] p-6 text-center">
                    <p className="text-xs text-white/35">
                      Create your first savings goal.
                    </p>
                  </div>
                )}

                <a
                  href="/goals"
                  className="mt-7 block rounded-xl border border-white/[0.07] py-2.5 text-center text-[10px] font-medium text-white/50 transition hover:bg-white/[0.04] hover:text-white"
                >
                  View goals
                </a>
              </div>
            </div>
          </section>

          {/* Insight */}
          <section className="mt-4 rounded-3xl border border-emerald-400/10 bg-emerald-400/[0.025] p-5 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.07] text-lg">
                ✦
              </div>

              <div className="flex-1">
                <p className="text-xs font-semibold text-emerald-300">
                  Spending insight
                </p>

                <p className="mt-1 text-xs leading-5 text-white/40">
                  You&apos;ve spent{" "}
                  <span className="font-medium text-white/70">
                    {formatCurrency(data.expenses)}
                  </span>{" "}
                  so far. Your current savings rate is{" "}
                  <span className="font-medium text-emerald-300">
                    {data.savingsRate.toFixed(1)}%
                  </span>
                  .
                </p>
              </div>

              <a
                href="/analytics"
                className="text-[10px] font-medium text-white/45 transition hover:text-white"
              >
                See analytics →
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function NavItem({
  icon,
  label,
  href,
  active = false,
}: {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs transition " +
        (active
          ? "bg-white/[0.07] text-white"
          : "text-white/35 hover:bg-white/[0.04] hover:text-white/75")
      }
    >
      <span className="flex w-4 justify-center text-sm">
        {icon}
      </span>

      <span>{label}</span>

      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
      )}
    </a>
  );
}

function OverviewCard({
  label,
  value,
  change,
  description,
  icon,
  featured = false,
}: {
  label: string;
  value: string;
  change: string;
  description: string;
  icon: string;
  featured?: boolean;
}) {
  return (
    <div
      className={
        "group relative overflow-hidden rounded-2xl border p-5 transition duration-300 " +
        (featured
          ? "border-emerald-400/15 bg-emerald-400/[0.035]"
          : "border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.04]")
      }
    >
      {featured && (
        <div className="absolute right-[-30px] top-[-30px] h-24 w-24 rounded-full bg-emerald-400/[0.08] blur-2xl" />
      )}

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/25">
            {label}
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
            {value}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-md bg-emerald-400/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-300">
              {change}
            </span>

            <span className="text-[9px] text-white/20">
              {description}
            </span>
          </div>
        </div>

        <div
          className={
            "flex h-9 w-9 items-center justify-center rounded-xl border text-sm " +
            (featured
              ? "border-emerald-400/10 bg-emerald-400/[0.08] text-emerald-300"
              : "border-white/[0.06] bg-white/[0.035] text-white/35")
          }
        >
          {icon}
        </div>
      </div>
    </div>
  );
}