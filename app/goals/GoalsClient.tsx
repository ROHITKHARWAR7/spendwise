"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  percentage: number;
  completed: boolean;
  createdAt: string;
};

type GoalForm = {
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline: string;
};

export default function GoalsClient() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [contributionOpen, setContributionOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [selectedGoal, setSelectedGoal] =
    useState<Goal | null>(null);

  const [contribution, setContribution] = useState("");

  const [form, setForm] = useState<GoalForm>({
    name: "",
    targetAmount: "",
    currentAmount: "0",
    deadline: "",
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const formatDate = (value: string | null) => {
    if (!value) return "No deadline";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysRemaining = (deadline: string | null) => {
    if (!deadline) return null;

    const today = new Date();
    const target = new Date(deadline);

    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    return Math.ceil(
      (target.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );
  };

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/goals");

      if (!response.ok) {
        throw new Error("Failed to load goals");
      }

      const data = await response.json();

      setGoals(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load goals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const totalTarget = useMemo(
    () =>
      goals.reduce(
        (sum, goal) => sum + goal.targetAmount,
        0
      ),
    [goals]
  );

  const totalSaved = useMemo(
    () =>
      goals.reduce(
        (sum, goal) => sum + goal.currentAmount,
        0
      ),
    [goals]
  );

  const totalRemaining = totalTarget - totalSaved;

  const overallProgress =
    totalTarget > 0
      ? Math.min(
          (totalSaved / totalTarget) * 100,
          100
        )
      : 0;

  const completedGoals = goals.filter(
    (goal) => goal.completed
  ).length;

  const openCreateModal = () => {
    setEditingId(null);

    setForm({
      name: "",
      targetAmount: "",
      currentAmount: "0",
      deadline: "",
    });

    setError("");
    setModalOpen(true);
  };

  const openEditModal = (goal: Goal) => {
    setEditingId(goal.id);

    setForm({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount),
      deadline: goal.deadline
        ? goal.deadline.slice(0, 10)
        : "",
    });

    setError("");
    setModalOpen(true);
  };

  const openContributionModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setContribution("");
    setError("");
    setContributionOpen(true);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const targetAmount = Number(form.targetAmount);
    const currentAmount = Number(form.currentAmount);

    if (!form.name.trim()) {
      setError("Enter a goal name.");
      return;
    }

    if (!targetAmount || targetAmount <= 0) {
      setError("Enter a valid target amount.");
      return;
    }

    if (currentAmount < 0) {
      setError("Current amount cannot be negative.");
      return;
    }

    if (currentAmount > targetAmount) {
      setError(
        "Current amount cannot exceed the target."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/goals", {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingId,
          name: form.name.trim(),
          targetAmount,
          currentAmount,
          deadline: form.deadline || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to save goal"
        );
      }

      setModalOpen(false);
      setEditingId(null);

      await fetchGoals();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save goal."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleContribution = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedGoal) return;

    const amount = Number(contribution);

    if (!amount || amount <= 0) {
      setError("Enter a valid contribution.");
      return;
    }

    const newAmount =
      selectedGoal.currentAmount + amount;

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/goals", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedGoal.id,
          currentAmount: newAmount,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to add contribution"
        );
      }

      setContributionOpen(false);
      setSelectedGoal(null);
      setContribution("");

      await fetchGoals();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to add contribution."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Delete this goal?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch("/api/goals", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to delete goal"
        );
      }

      setGoals((current) =>
        current.filter((goal) => goal.id !== id)
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete goal."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#08090b] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[15%] top-[-250px] h-[500px] w-[500px] rounded-full bg-emerald-500/[0.045] blur-[130px]" />

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
              Goals
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/dashboard"
              className="hidden rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-2 text-xs text-white/45 transition hover:text-white sm:block"
            >
              Dashboard
            </a>

            <button
              onClick={openCreateModal}
              className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-emerald-300"
            >
              + New goal
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1450px] px-5 py-7 sm:px-7 lg:px-9 lg:py-9">
        {/* Heading */}
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400">
            Financial goals
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Build toward something.
          </h1>

          <p className="mt-2 text-sm text-white/30">
            Turn your plans into measurable financial
            progress.
          </p>
        </div>

        {/* Summary */}
        <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total target"
            value={formatCurrency(totalTarget)}
            icon="◎"
            featured
          />

          <SummaryCard
            label="Total saved"
            value={formatCurrency(totalSaved)}
            icon="↗"
            positive
          />

          <SummaryCard
            label="Remaining"
            value={formatCurrency(
              Math.max(totalRemaining, 0)
            )}
            icon="◇"
          />

          <SummaryCard
            label="Completed"
            value={`${completedGoals}/${goals.length}`}
            icon="✓"
            positive={completedGoals > 0}
          />
        </section>

        {/* Overall progress */}
        <section className="mt-4 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium">
                Overall progress
              </p>

              <p className="mt-1 text-xs text-white/25">
                {formatCurrency(totalSaved)} saved of{" "}
                {formatCurrency(totalTarget)}
              </p>
            </div>

            <span className="text-sm font-semibold text-emerald-300">
              {Math.round(overallProgress)}%
            </span>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all"
              style={{
                width: overallProgress + "%",
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

        {/* Goals */}
        <section className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                Your goals
              </p>

              <p className="mt-1 text-xs text-white/25">
                Keep moving toward your targets.
              </p>
            </div>

            <span className="text-[10px] text-white/20">
              {goals.length} goal
              {goals.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] px-6 py-20 text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />

              <p className="mt-4 text-xs text-white/25">
                Loading goals...
              </p>
            </div>
          ) : goals.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] text-xl">
                ◎
              </div>

              <h3 className="mt-5 text-sm font-medium">
                No goals yet
              </h3>

              <p className="mt-2 text-xs text-white/25">
                Create your first financial goal and start
                tracking your progress.
              </p>

              <button
                onClick={openCreateModal}
                className="mt-5 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-emerald-300"
              >
                + Create goal
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {goals.map((goal) => {
                const daysRemaining =
                  getDaysRemaining(goal.deadline);

                const remaining = Math.max(
                  goal.targetAmount -
                    goal.currentAmount,
                  0
                );

                return (
                  <div
                    key={goal.id}
                    className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:bg-white/[0.035] sm:p-6"
                  >
                    {goal.completed && (
                      <div className="absolute right-0 top-0 rounded-bl-2xl bg-emerald-400/[0.1] px-3 py-2 text-[9px] font-medium text-emerald-300">
                        Goal reached ✓
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/[0.07] text-lg text-emerald-300">
                          ◎
                        </div>

                        <div>
                          <p className="text-xs font-medium">
                            {goal.name}
                          </p>

                          <p className="mt-1 text-[9px] text-white/20">
                            {goal.deadline
                              ? formatDate(
                                  goal.deadline
                                )
                              : "No deadline"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                        <button
                          onClick={() =>
                            openEditModal(goal)
                          }
                          className="rounded-lg px-2.5 py-1.5 text-[9px] text-white/30 hover:bg-white/[0.05] hover:text-white"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(goal.id)
                          }
                          className="rounded-lg px-2.5 py-1.5 text-[9px] text-white/30 hover:bg-red-400/10 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-7 flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-semibold tracking-[-0.04em]">
                          {formatCurrency(
                            goal.currentAmount
                          )}
                        </p>

                        <p className="mt-1 text-[10px] text-white/25">
                          of{" "}
                          {formatCurrency(
                            goal.targetAmount
                          )}
                        </p>
                      </div>

                      <span className="text-xs font-medium text-emerald-300">
                        {Math.round(goal.percentage)}%
                      </span>
                    </div>

                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all"
                        style={{
                          width:
                            Math.min(
                              goal.percentage,
                              100
                            ) + "%",
                        }}
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-white/25">
                          {goal.completed
                            ? "Target achieved"
                            : `${formatCurrency(
                                remaining
                              )} remaining`}
                        </p>

                        {!goal.completed &&
                          daysRemaining !== null && (
                            <p
                              className={
                                "mt-1 text-[9px] " +
                                (daysRemaining < 0
                                  ? "text-red-300"
                                  : daysRemaining <=
                                      30
                                    ? "text-amber-300"
                                    : "text-white/15")
                              }
                            >
                              {daysRemaining < 0
                                ? `${Math.abs(
                                    daysRemaining
                                  )} days overdue`
                                : daysRemaining === 0
                                  ? "Due today"
                                  : `${daysRemaining} days remaining`}
                            </p>
                          )}
                      </div>

                      {!goal.completed && (
                        <button
                          onClick={() =>
                            openContributionModal(
                              goal
                            )
                          }
                          className="rounded-xl bg-white px-3 py-2 text-[10px] font-semibold text-black transition hover:bg-emerald-300"
                        >
                          + Add savings
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Create/Edit modal */}
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

          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/[0.08] bg-[#0d0f11] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400">
                  Financial goal
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                  {editingId
                    ? "Edit goal"
                    : "Create a goal"}
                </h2>

                <p className="mt-1 text-xs text-white/25">
                  Define something worth saving for.
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
                  Goal name
                </label>

                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. MacBook Pro"
                  className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-xs text-white outline-none placeholder:text-white/15 focus:border-emerald-400/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
                  Target amount
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
                    value={form.targetAmount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        targetAmount:
                          event.target.value,
                      }))
                    }
                    placeholder="150000"
                    className="h-12 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-9 pr-4 text-sm text-white outline-none placeholder:text-white/15 focus:border-emerald-400/30"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
                  Already saved
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/30">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.currentAmount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        currentAmount:
                          event.target.value,
                      }))
                    }
                    placeholder="0"
                    className="h-12 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-9 pr-4 text-sm text-white outline-none placeholder:text-white/15 focus:border-emerald-400/30"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
                  Deadline
                </label>

                <input
                  type="date"
                  value={form.deadline}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      deadline: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-xs text-white outline-none focus:border-emerald-400/30"
                />
              </div>

              <button
                disabled={saving}
                type="submit"
                className="h-12 w-full rounded-xl bg-white text-xs font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update goal"
                    : "Create goal"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contribution modal */}
      {contributionOpen && selectedGoal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div
            className="absolute inset-0"
            onClick={() => {
              if (!saving) {
                setContributionOpen(false);
              }
            }}
          />

          <div className="relative w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0d0f11] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400">
                  Add savings
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  {selectedGoal.name}
                </h2>

                <p className="mt-1 text-xs text-white/25">
                  Current savings:{" "}
                  {formatCurrency(
                    selectedGoal.currentAmount
                  )}
                </p>
              </div>

              <button
                disabled={saving}
                onClick={() =>
                  setContributionOpen(false)
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-white/30 hover:text-white"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleContribution}
              className="mt-7"
            >
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
                Contribution amount
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/30">
                  ₹
                </span>

                <input
                  autoFocus
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={contribution}
                  onChange={(event) =>
                    setContribution(
                      event.target.value
                    )
                  }
                  placeholder="5000"
                  className="h-12 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-9 pr-4 text-sm text-white outline-none placeholder:text-white/15 focus:border-emerald-400/30"
                />
              </div>

              <div className="mt-4 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] p-4">
                <div className="flex justify-between text-[10px]">
                  <span className="text-white/25">
                    Current
                  </span>

                  <span className="text-white/50">
                    {formatCurrency(
                      selectedGoal.currentAmount
                    )}
                  </span>
                </div>

                <div className="mt-2 flex justify-between text-[10px]">
                  <span className="text-white/25">
                    After contribution
                  </span>

                  <span className="text-emerald-300">
                    {formatCurrency(
                      selectedGoal.currentAmount +
                        (Number(contribution) || 0)
                    )}
                  </span>
                </div>
              </div>

              <button
                disabled={saving}
                type="submit"
                className="mt-5 h-12 w-full rounded-xl bg-white text-xs font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Add contribution"}
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