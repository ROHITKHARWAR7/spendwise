"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};

type Budget = {
  id: string;
  amount: number;
  month: number;
  year: number;
  spent: number;
  remaining: number;
  percentage: number;
  category: Category;
};

type BudgetForm = {
  amount: string;
  categoryId: string;
  month: number;
  year: number;
};

export default function BudgetsClient() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const now = new Date();

  const [form, setForm] = useState<BudgetForm>({
    amount: "",
    categoryId: "",
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/budgets");

      if (!response.ok) {
        throw new Error("Failed to load budgets");
      }

      const data: Budget[] = await response.json();

      setBudgets(data);

      const uniqueCategories = data.reduce(
        (result: Category[], budget: Budget) => {
          if (
            !result.some(
              (category) =>
                category.id === budget.category.id
            )
          ) {
            result.push(budget.category);
          }

          return result;
        },
        []
      );

      setCategories(uniqueCategories);
    } catch (err) {
      console.error(err);
      setError("Unable to load budgets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const totalBudget = useMemo(
    () =>
      budgets.reduce(
        (sum, budget) => sum + budget.amount,
        0
      ),
    [budgets]
  );

  const totalSpent = useMemo(
    () =>
      budgets.reduce(
        (sum, budget) => sum + budget.spent,
        0
      ),
    [budgets]
  );

  const totalRemaining = totalBudget - totalSpent;

  const overallPercentage =
    totalBudget > 0
      ? Math.min((totalSpent / totalBudget) * 100, 100)
      : 0;

  const openCreateModal = () => {
    setEditingId(null);

    setForm({
      amount: "",
      categoryId: categories[0]?.id || "",
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    setError("");
    setModalOpen(true);
  };

  const openEditModal = (budget: Budget) => {
    setEditingId(budget.id);

    setForm({
      amount: String(budget.amount),
      categoryId: budget.category.id,
      month: budget.month,
      year: budget.year,
    });

    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const amount = Number(form.amount);

    if (!amount || amount <= 0) {
      setError("Enter a valid budget amount.");
      return;
    }

    if (!form.categoryId) {
      setError("Select a category.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/budgets", {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingId,
          amount,
          categoryId: form.categoryId,
          month: form.month,
          year: form.year,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to save budget"
        );
      }

      setModalOpen(false);
      setEditingId(null);

      await fetchBudgets();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save budget."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Delete this budget?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch("/api/budgets", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const result = await response.json();

        throw new Error(
          result.error || "Failed to delete budget"
        );
      }

      setBudgets((current) =>
        current.filter((budget) => budget.id !== id)
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete budget."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#08090b] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[20%] top-[-250px] h-[500px] w-[500px] rounded-full bg-emerald-500/[0.045] blur-[130px]" />

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

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.05] bg-[#08090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1450px] items-center justify-between px-5 sm:px-7 lg:px-9">
          <div>
            <a
              href="/dashboard"
              className="text-sm font-semibold tracking-[-0.03em]"
            >
              Spend<span className="text-emerald-400">Wise</span>
            </a>

            <p className="mt-1 text-[10px] text-white/25">
              Budgets
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/dashboard"
              className="hidden rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-2 text-xs text-white/45 hover:text-white sm:block"
            >
              Dashboard
            </a>

            <button
              onClick={openCreateModal}
              className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-emerald-300"
            >
              + Add budget
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1450px] px-5 py-7 sm:px-7 lg:px-9 lg:py-9">
        {/* Heading */}
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400">
            Financial control
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Stay within your limits.
          </h1>

          <p className="mt-2 text-sm text-white/30">
            Set category limits and keep your spending
            under control.
          </p>
        </div>

        {/* Summary */}
        <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total budget"
            value={formatCurrency(totalBudget)}
            icon="◈"
            featured
          />

          <SummaryCard
            label="Total spent"
            value={formatCurrency(totalSpent)}
            icon="↘"
          />

          <SummaryCard
            label="Remaining"
            value={formatCurrency(totalRemaining)}
            icon="◎"
            danger={totalRemaining < 0}
          />

          <SummaryCard
            label="Used"
            value={`${Math.round(overallPercentage)}%`}
            icon="◫"
          />
        </section>

        {/* Overall progress */}
        <section className="mt-4 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium">
                Overall monthly budget
              </p>

              <p className="mt-1 text-xs text-white/25">
                {formatCurrency(totalSpent)} of{" "}
                {formatCurrency(totalBudget)} used
              </p>
            </div>

            <span
              className={
                "text-sm font-semibold " +
                (overallPercentage > 90
                  ? "text-red-300"
                  : overallPercentage > 75
                    ? "text-amber-300"
                    : "text-emerald-300")
              }
            >
              {Math.round(overallPercentage)}%
            </span>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={
                "h-full rounded-full transition-all " +
                (overallPercentage > 90
                  ? "bg-red-400"
                  : overallPercentage > 75
                    ? "bg-amber-400"
                    : "bg-emerald-400")
              }
              style={{
                width: overallPercentage + "%",
              }}
            />
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-2xl border border-red-400/10 bg-red-400/[0.05] px-4 py-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Budget cards */}
        <section className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                Category budgets
              </p>

              <p className="mt-1 text-xs text-white/25">
                Your spending limits by category
              </p>
            </div>

            <span className="text-[10px] text-white/20">
              {budgets.length} budget
              {budgets.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] px-6 py-20 text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />

              <p className="mt-4 text-xs text-white/25">
                Loading budgets...
              </p>
            </div>
          ) : budgets.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] text-xl">
                ◫
              </div>

              <h3 className="mt-5 text-sm font-medium">
                No budgets yet
              </h3>

              <p className="mt-2 text-xs text-white/25">
                Create a category budget to start tracking
                your spending.
              </p>

              <button
                onClick={openCreateModal}
                className="mt-5 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-emerald-300"
              >
                + Create budget
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {budgets.map((budget) => {
                const percentage = budget.percentage;

                const status =
                  percentage >= 100
                    ? "Over budget"
                    : percentage >= 80
                      ? "Near limit"
                      : "On track";

                const statusClass =
                  percentage >= 100
                    ? "bg-red-400/10 text-red-300"
                    : percentage >= 80
                      ? "bg-amber-400/10 text-amber-300"
                      : "bg-emerald-400/10 text-emerald-300";

                const progressClass =
                  percentage >= 100
                    ? "bg-red-400"
                    : percentage >= 80
                      ? "bg-amber-400"
                      : "bg-emerald-400";

                return (
                  <div
                    key={budget.id}
                    className="group rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:bg-white/[0.035] sm:p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] text-lg">
                          {budget.category.icon || "◈"}
                        </div>

                        <div>
                          <p className="text-xs font-medium">
                            {budget.category.name}
                          </p>

                          <p className="mt-1 text-[9px] text-white/20">
                            {budget.month}/{budget.year}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] ${statusClass}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="mt-7 flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-semibold tracking-[-0.04em]">
                          {formatCurrency(
                            budget.spent
                          )}
                        </p>

                        <p className="mt-1 text-[10px] text-white/25">
                          of{" "}
                          {formatCurrency(
                            budget.amount
                          )}
                        </p>
                      </div>

                      <span className="text-xs text-white/30">
                        {Math.round(percentage)}%
                      </span>
                    </div>

                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className={`h-full rounded-full transition-all ${progressClass}`}
                        style={{
                          width: Math.min(
                            percentage,
                            100
                          ) + "%",
                        }}
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <p
                        className={
                          "text-[10px] " +
                          (budget.remaining < 0
                            ? "text-red-300"
                            : "text-white/25")
                        }
                      >
                        {budget.remaining >= 0
                          ? `${formatCurrency(
                              budget.remaining
                            )} remaining`
                          : `${formatCurrency(
                              Math.abs(
                                budget.remaining
                              )
                            )} over limit`}
                      </p>

                      <div className="flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                        <button
                          onClick={() =>
                            openEditModal(budget)
                          }
                          className="rounded-lg px-2.5 py-1.5 text-[9px] text-white/30 hover:bg-white/[0.05] hover:text-white"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(budget.id)
                          }
                          className="rounded-lg px-2.5 py-1.5 text-[9px] text-white/30 hover:bg-red-400/10 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div
            className="absolute inset-0"
            onClick={() => {
              if (!saving) {
                setModalOpen(false);
              }
            }}
          />

          <div className="relative w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0d0f11] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400">
                  Budget planner
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                  {editingId
                    ? "Edit budget"
                    : "Create budget"}
                </h2>

                <p className="mt-1 text-xs text-white/25">
                  Set a spending limit for a category.
                </p>
              </div>

              <button
                disabled={saving}
                onClick={() => setModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-white/30 hover:text-white"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >
              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
                  Monthly limit
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/30">
                    ₹
                  </span>

                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={form.amount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                    placeholder="5000"
                    className="h-12 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-9 pr-4 text-sm text-white outline-none placeholder:text-white/15 focus:border-emerald-400/30"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
                  Category
                </label>

                <select
                  required
                  disabled={Boolean(editingId)}
                  value={form.categoryId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      categoryId: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-white/[0.07] bg-[#101214] px-4 text-xs text-white outline-none focus:border-emerald-400/30 disabled:opacity-40"
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
                    Month
                  </label>

                  <select
                    disabled={Boolean(editingId)}
                    value={form.month}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        month: Number(
                          event.target.value
                        ),
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-white/[0.07] bg-[#101214] px-4 text-xs text-white outline-none disabled:opacity-40"
                  >
                    {Array.from(
                      { length: 12 },
                      (_, index) => (
                        <option
                          key={index + 1}
                          value={index + 1}
                        >
                          {new Date(
                            2026,
                            index,
                            1
                          ).toLocaleString("en-US", {
                            month: "long",
                          })}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
                    Year
                  </label>

                  <input
                    disabled={Boolean(editingId)}
                    type="number"
                    value={form.year}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        year: Number(
                          event.target.value
                        ),
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-xs text-white outline-none disabled:opacity-40"
                  />
                </div>
              </div>

              <button
                disabled={saving}
                type="submit"
                className="h-12 w-full rounded-xl bg-white text-xs font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update budget"
                    : "Create budget"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  featured = false,
  danger = false,
}: {
  label: string;
  value: string;
  icon: string;
  featured?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={
        "relative overflow-hidden rounded-2xl border p-5 " +
        (featured
          ? "border-emerald-400/15 bg-emerald-400/[0.035]"
          : danger
            ? "border-red-400/10 bg-red-400/[0.025]"
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
              (danger ? "text-red-300" : "")
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