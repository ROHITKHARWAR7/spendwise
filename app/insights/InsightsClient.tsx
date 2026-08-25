"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type InsightType =
  | "warning"
  | "success"
  | "info"
  | "trend";

type Insight = {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  value?: string;
  priority: number;
};

type InsightsData = {
  period: {
    month: number;
    year: number;
  };
  summary: {
    currentIncome: number;
    currentExpenses: number;
    previousIncome: number;
    previousExpenses: number;
    balance: number;
    savingsRate: number;
  };
  insights: Insight[];
  stats: {
    categoriesTracked: number;
    budgetsTracked: number;
    activeGoals: number;
    completedGoals: number;
  };
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

export default function InsightsClient() {
  const [data, setData] =
    useState<InsightsData | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const fetchInsights = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          `/api/insights?_=${Date.now()}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        if (!contentType.includes("application/json")) {
          throw new Error(
            "Analytics service returned an invalid response."
          );
        }

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error ||
              `Failed to load insights (${response.status})`
          );
        }

        if (
          !result ||
          typeof result !== "object" ||
          !result.summary ||
          !Array.isArray(result.insights) ||
          !result.stats
        ) {
          throw new Error(
            "Invalid insights response from server."
          );
        }

        setData(result as InsightsData);
      } catch (err) {
        console.error(
          "Insights fetch error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to generate your insights."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const healthScore = useMemo(() => {
    if (!data) return 0;

    let score = 50;

    const savingsRate =
      Number(data.summary.savingsRate) || 0;

    if (savingsRate >= 30) {
      score += 30;
    } else if (savingsRate >= 20) {
      score += 22;
    } else if (savingsRate >= 10) {
      score += 12;
    } else if (savingsRate >= 0) {
      score += 4;
    } else {
      score -= 25;
    }

    if (
      data.summary.previousExpenses > 0 &&
      data.summary.currentExpenses >
        data.summary.previousExpenses
    ) {
      const increase =
        ((data.summary.currentExpenses -
          data.summary.previousExpenses) /
          data.summary.previousExpenses) *
        100;

      if (increase >= 30) {
        score -= 15;
      } else if (increase >= 15) {
        score -= 8;
      }
    }

    score +=
      data.stats.completedGoals * 5;

    score -=
      data.insights.filter(
        (item) => item.type === "warning"
      ).length * 4;

    return Math.max(
      0,
      Math.min(100, Math.round(score))
    );
  }, [data]);

  const healthLabel =
    healthScore >= 80
      ? "Excellent"
      : healthScore >= 65
        ? "Healthy"
        : healthScore >= 45
          ? "Fair"
          : "Needs attention";

  const healthMessage =
    healthScore >= 80
      ? "You're building strong financial habits."
      : healthScore >= 65
        ? "Your finances are moving in a healthy direction."
        : healthScore >= 45
          ? "There are a few areas worth keeping an eye on."
          : "A few changes could significantly improve your financial position.";

  const spendingChange = useMemo(() => {
    if (
      !data ||
      data.summary.previousExpenses <= 0
    ) {
      return null;
    }

    return (
      ((data.summary.currentExpenses -
        data.summary.previousExpenses) /
        data.summary.previousExpenses) *
      100
    );
  }, [data]);

  return (
    <main className="min-h-screen bg-[#08090b] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[18%] top-[-250px] h-[500px] w-[500px] rounded-full bg-emerald-500/[0.045] blur-[130px]" />

        <div className="absolute right-[-200px] top-[30%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.035] blur-[140px]" />

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
              Spend
              <span className="text-emerald-400">
                Wise
              </span>
            </a>

            <p className="mt-1 text-[10px] text-white/25">
              Smart Insights
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/analytics"
              className="hidden rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-2 text-xs text-white/40 transition hover:text-white sm:block"
            >
              Analytics
            </a>

            <a
              href="/dashboard"
              className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-emerald-300"
            >
              Dashboard
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1450px] px-5 py-7 sm:px-7 lg:px-9 lg:py-9">
        {/* Heading */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400">
              Intelligent finance
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Your financial intelligence.
            </h1>

            <p className="mt-2 max-w-xl text-sm text-white/30">
              SpendWise analyzes your activity and
              turns your financial data into useful,
              actionable insights.
            </p>
          </div>

          <button
            onClick={() => fetchInsights(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-2.5 text-xs text-white/45 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
          >
            <span
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            >
              ↻
            </span>

            {refreshing
              ? "Refreshing..."
              : "Refresh insights"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/10 bg-red-400/[0.05] px-4 py-3">
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-400/10 text-xs text-red-300">
                !
              </span>

              <div>
                <p className="text-xs font-medium text-red-200">
                  Unable to load insights
                </p>

                <p className="mt-1 text-[10px] text-red-300/60">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <LoadingState />
        ) : data ? (
          <>
            {/* Health Score */}
            <section className="mt-8 overflow-hidden rounded-3xl border border-emerald-400/10 bg-emerald-400/[0.025] p-6 sm:p-8">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/[0.08] text-sm text-emerald-300">
                      ✦
                    </span>

                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300">
                      Financial health
                    </p>
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                    {healthLabel}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/30">
                    {healthMessage}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <HealthRing
                    score={healthScore}
                  />

                  <div className="hidden sm:block">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/20">
                      Current period
                    </p>

                    <p className="mt-2 text-sm font-medium">
                      {
                        monthNames[
                          data.period.month - 1
                        ]
                      }
                    </p>

                    <p className="text-xs text-white/25">
                      {data.period.year}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Summary */}
            <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Income"
                value={formatCurrency(
                  data.summary.currentIncome
                )}
                icon="↗"
                positive
              />

              <MetricCard
                label="Expenses"
                value={formatCurrency(
                  data.summary.currentExpenses
                )}
                icon="↘"
              />

              <MetricCard
                label="Balance"
                value={formatCurrency(
                  data.summary.balance
                )}
                icon="◈"
                positive={
                  data.summary.balance >= 0
                }
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

            {/* Insights */}
            <section className="mt-8">
              <div>
                <p className="text-sm font-medium">
                  What you should know
                </p>

                <p className="mt-1 text-xs text-white/25">
                  Personalized observations from your
                  financial activity.
                </p>
              </div>

              {data.insights.length === 0 ? (
                <EmptyInsights />
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {data.insights.map(
                    (insight) => (
                      <InsightCard
                        key={insight.id}
                        insight={insight}
                      />
                    )
                  )}
                </div>
              )}
            </section>

            {/* Bottom analytics */}
            <section className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              {/* Spending comparison */}
              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 sm:p-7">
                <p className="text-sm font-medium">
                  Spending comparison
                </p>

                <p className="mt-1 text-xs text-white/25">
                  This month vs previous month
                </p>

                <div className="mt-8 space-y-7">
                  <ComparisonBar
                    label="Current month"
                    value={
                      data.summary.currentExpenses
                    }
                    max={Math.max(
                      data.summary.currentExpenses,
                      data.summary.previousExpenses,
                      1
                    )}
                    amount={formatCurrency(
                      data.summary.currentExpenses
                    )}
                  />

                  <ComparisonBar
                    label="Previous month"
                    value={
                      data.summary.previousExpenses
                    }
                    max={Math.max(
                      data.summary.currentExpenses,
                      data.summary.previousExpenses,
                      1
                    )}
                    amount={formatCurrency(
                      data.summary.previousExpenses
                    )}
                  />
                </div>

                {spendingChange !== null && (
                  <div className="mt-7 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4">
                    <p className="text-[10px] text-white/25">
                      Change in spending
                    </p>

                    <p
                      className={
                        "mt-1 text-lg font-semibold " +
                        (spendingChange > 0
                          ? "text-amber-300"
                          : "text-emerald-300")
                      }
                    >
                      {spendingChange >= 0
                        ? "+"
                        : ""}
                      {Math.round(
                        spendingChange
                      )}
                      %
                    </p>
                  </div>
                )}
              </div>

              {/* Activity */}
              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 sm:p-7">
                <p className="text-sm font-medium">
                  Your financial activity
                </p>

                <p className="mt-1 text-xs text-white/25">
                  What SpendWise is tracking.
                </p>

                <div className="mt-7 space-y-3">
                  <ActivityRow
                    label="Categories tracked"
                    value={String(
                      data.stats
                        .categoriesTracked
                    )}
                    icon="◈"
                  />

                  <ActivityRow
                    label="Active budgets"
                    value={String(
                      data.stats.budgetsTracked
                    )}
                    icon="▣"
                  />

                  <ActivityRow
                    label="Active goals"
                    value={String(
                      data.stats.activeGoals
                    )}
                    icon="◎"
                  />

                  <ActivityRow
                    label="Completed goals"
                    value={String(
                      data.stats.completedGoals
                    )}
                    icon="✓"
                  />
                </div>
              </div>
            </section>
          </>
        ) : (
          <EmptyInsights />
        )}
      </div>
    </main>
  );
}

/* --------------------------------------------- */
/* Loading */
/* --------------------------------------------- */

function LoadingState() {
  return (
    <div className="mt-8 rounded-3xl border border-white/[0.07] bg-white/[0.025] px-6 py-24 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />

      <p className="mt-4 text-xs text-white/25">
        Analyzing your finances...
      </p>
    </div>
  );
}

/* --------------------------------------------- */
/* Health Ring */
/* --------------------------------------------- */

function HealthRing({
  score,
}: {
  score: number;
}) {
  return (
    <div
      className="relative flex h-36 w-36 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(
          rgb(52 211 153) ${score}%,
          rgba(255,255,255,0.04) ${score}% 100%
        )`,
      }}
    >
      <div className="flex h-[116px] w-[116px] items-center justify-center rounded-full bg-[#0b0d0f]">
        <div className="text-center">
          <p className="text-3xl font-semibold tracking-[-0.05em]">
            {score}
          </p>

          <p className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-white/20">
            score
          </p>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------- */
/* Metric */
/* --------------------------------------------- */

function MetricCard({
  label,
  value,
  icon,
  positive,
}: {
  label: string;
  value: string;
  icon: string;
  positive?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="flex items-start justify-between">
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

/* --------------------------------------------- */
/* Insight Card */
/* --------------------------------------------- */

function InsightCard({
  insight,
}: {
  insight: Insight;
}) {
  const config = {
    warning: {
      icon: "!",
      label: "Attention",
      className:
        "border-amber-400/10 bg-amber-400/[0.025]",
      iconClass:
        "bg-amber-400/[0.08] text-amber-300",
    },

    success: {
      icon: "✓",
      label: "Looking good",
      className:
        "border-emerald-400/10 bg-emerald-400/[0.025]",
      iconClass:
        "bg-emerald-400/[0.08] text-emerald-300",
    },

    info: {
      icon: "✦",
      label: "Insight",
      className:
        "border-white/[0.07] bg-white/[0.025]",
      iconClass:
        "bg-white/[0.05] text-white/50",
    },

    trend: {
      icon: "↗",
      label: "Trend",
      className:
        "border-cyan-400/10 bg-cyan-400/[0.025]",
      iconClass:
        "bg-cyan-400/[0.08] text-cyan-300",
    },
  }[insight.type];

  return (
    <div
      className={
        "rounded-3xl border p-5 transition hover:bg-white/[0.04] sm:p-6 " +
        config.className
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm " +
            config.iconClass
          }
        >
          {config.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[9px] uppercase tracking-[0.15em] text-white/20">
                {config.label}
              </p>

              <h3 className="mt-1 text-sm font-medium">
                {insight.title}
              </h3>
            </div>

            {insight.value && (
              <span className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5 text-[10px] font-medium text-white/50">
                {insight.value}
              </span>
            )}
          </div>

          <p className="mt-3 text-xs leading-5 text-white/30">
            {insight.description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------- */
/* Comparison Bar */
/* --------------------------------------------- */

function ComparisonBar({
  label,
  value,
  max,
  amount,
}: {
  label: string;
  value: number;
  max: number;
  amount: string;
}) {
  const percentage =
    max > 0 ? (value / max) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/30">
          {label}
        </span>

        <span className="text-[10px] font-medium text-white/50">
          {amount}
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full rounded-full bg-emerald-400/70 transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

/* --------------------------------------------- */
/* Activity Row */
/* --------------------------------------------- */

function ActivityRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.035] text-xs text-white/30">
          {icon}
        </span>

        <span className="text-xs text-white/35">
          {label}
        </span>
      </div>

      <span className="text-sm font-medium">
        {value}
      </span>
    </div>
  );
}

/* --------------------------------------------- */
/* Empty State */
/* --------------------------------------------- */

function EmptyInsights() {
  return (
    <div className="mt-4 rounded-3xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-20 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] text-xl text-emerald-300">
        ✦
      </div>

      <p className="mt-5 text-sm font-medium">
        Not enough data yet
      </p>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/25">
        Add more transactions, budgets, or goals
        and SpendWise will start finding patterns
        for you.
      </p>
    </div>
  );
}