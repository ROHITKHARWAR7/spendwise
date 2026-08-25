"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};

type Transaction = {
  id: string;
  amount: number;
  type: "EXPENSE" | "INCOME";
  description: string | null;
  date: string;
  paymentMethod: string;
  notes: string | null;
  category: Category;
};

type TransactionForm = {
  amount: string;
  type: "EXPENSE" | "INCOME";
  description: string;
  categoryId: string;
  paymentMethod: string;
  date: string;
  notes: string;
};

export default function TransactionsClient() {
  const [transactions, setTransactions] = useState<
    Transaction[]
  >([]);
  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "ALL" | "EXPENSE" | "INCOME"
  >("ALL");
  const [categoryFilter, setCategoryFilter] =
    useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);

  // NEW: selected transaction for detail modal
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const [form, setForm] = useState<TransactionForm>({
    amount: "",
    type: "EXPENSE",
    description: "",
    categoryId: "",
    paymentMethod: "UPI",
    date: today,
    notes: "",
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        transactionsResponse,
        categoriesResponse,
      ] = await Promise.all([
        fetch("/api/transactions", {
          cache: "no-store",
        }),
        fetch("/api/categories", {
          cache: "no-store",
        }),
      ]);

      const transactionsResult =
        await transactionsResponse.json();

      const categoriesResult =
        await categoriesResponse.json();

      if (!transactionsResponse.ok) {
        throw new Error(
          transactionsResult?.error ||
            "Failed to load transactions"
        );
      }

      if (!categoriesResponse.ok) {
        throw new Error(
          categoriesResult?.error ||
            "Failed to load categories"
        );
      }

      setTransactions(
        Array.isArray(transactionsResult)
          ? transactionsResult
          : []
      );

      setCategories(
        Array.isArray(categoriesResult)
          ? categoriesResult
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load transactions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const query = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        !query ||
        transaction.description
          ?.toLowerCase()
          .includes(query) ||
        transaction.category.name
          .toLowerCase()
          .includes(query);

      const matchesType =
        typeFilter === "ALL" ||
        transaction.type === typeFilter;

      const matchesCategory =
        categoryFilter === "ALL" ||
        transaction.category.id ===
          categoryFilter;

      return (
        Boolean(matchesSearch) &&
        matchesType &&
        matchesCategory
      );
    });
  }, [
    transactions,
    search,
    typeFilter,
    categoryFilter,
  ]);

  const totalIncome = transactions
    .filter(
      (transaction) =>
        transaction.type === "INCOME"
    )
    .reduce(
      (sum, transaction) =>
        sum + transaction.amount,
      0
    );

  const totalExpense = transactions
    .filter(
      (transaction) =>
        transaction.type === "EXPENSE"
    )
    .reduce(
      (sum, transaction) =>
        sum + transaction.amount,
      0
    );

  const balance = totalIncome - totalExpense;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const openModal = () => {
    const expenseCategory =
      categories.find(
        (category) =>
          category.name === "Food & Drinks"
      )?.id;

    const firstExpenseCategory =
      categories.find(
        (category) =>
          category.name !== "Income"
      )?.id;

    setForm({
      amount: "",
      type: "EXPENSE",
      description: "",
      categoryId:
        expenseCategory ||
        firstExpenseCategory ||
        categories[0]?.id ||
        "",
      paymentMethod: "UPI",
      date: new Date()
        .toISOString()
        .slice(0, 10),
      notes: "",
    });

    setError("");
    setModalOpen(true);
  };

  const handleCreateTransaction = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      setError("Enter a valid amount.");
      return;
    }

    if (!form.categoryId) {
      setError("Select a category.");
      return;
    }

    const selectedCategory =
      categories.find(
        (category) =>
          category.id === form.categoryId
      );

    if (!selectedCategory) {
      setError(
        "Selected category is no longer available. Please reopen the form."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        "/api/transactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: Number(form.amount),
            type: form.type,
            description:
              form.description.trim() ||
              null,
            categoryId:
              selectedCategory.id,
            paymentMethod:
              form.paymentMethod,
            date: form.date,
            notes:
              form.notes.trim() || null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Failed to create transaction"
        );
      }

      if (result?.id) {
        setTransactions((current) => [
          result,
          ...current,
        ]);
      }

      setModalOpen(false);

      await fetchTransactions();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create transaction."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Delete this transaction?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        "/api/transactions",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Failed to delete transaction"
        );
      }

      setTransactions((current) =>
        current.filter(
          (transaction) =>
            transaction.id !== id
        )
      );

      // Close detail modal if the deleted
      // transaction was open.
      setSelectedTransaction(null);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete transaction."
      );
    }
  };

  const formCategories = categories.filter(
    (category) =>
      form.type === "INCOME"
        ? category.name === "Income"
        : category.name !== "Income"
  );

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

      {/* Topbar */}
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
              Transactions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/dashboard"
              className="hidden rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-2 text-xs text-white/45 transition hover:bg-white/[0.05] hover:text-white sm:block"
            >
              Dashboard
            </a>

            <button
              onClick={openModal}
              disabled={
                loading ||
                categories.length === 0
              }
              className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Add transaction
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1450px] px-5 py-7 sm:px-7 lg:px-9 lg:py-9">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400">
              Money activity
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Transactions.
            </h1>

            <p className="mt-2 text-sm text-white/30">
              Track every rupee coming in and going out.
            </p>
          </div>
        </div>

        {/* Summary */}
        <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Balance"
            value={formatCurrency(balance)}
            icon="◈"
            featured
          />

          <SummaryCard
            label="Income"
            value={formatCurrency(totalIncome)}
            icon="↗"
          />

          <SummaryCard
            label="Expenses"
            value={formatCurrency(totalExpense)}
            icon="↘"
          />

          <SummaryCard
            label="Transactions"
            value={String(
              transactions.length
            )}
            icon="↔"
          />
        </section>

        {/* Filters */}
        <section className="mt-5 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/20">
                ⌕
              </span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search transactions..."
                className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-10 pr-4 text-xs text-white outline-none placeholder:text-white/20 focus:border-emerald-400/30"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={typeFilter === "ALL"}
                onClick={() =>
                  setTypeFilter("ALL")
                }
              >
                All
              </FilterButton>

              <FilterButton
                active={
                  typeFilter === "EXPENSE"
                }
                onClick={() =>
                  setTypeFilter("EXPENSE")
                }
              >
                Expenses
              </FilterButton>

              <FilterButton
                active={
                  typeFilter === "INCOME"
                }
                onClick={() =>
                  setTypeFilter("INCOME")
                }
              >
                Income
              </FilterButton>

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value
                  )
                }
                className="h-9 rounded-xl border border-white/[0.07] bg-[#101214] px-3 text-[10px] text-white/50 outline-none focus:border-emerald-400/30"
              >
                <option value="ALL">
                  All categories
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-2xl border border-red-400/10 bg-red-400/[0.05] px-4 py-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Transactions */}
        <section className="mt-4 overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025]">
          <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-5 sm:px-7">
            <div>
              <p className="text-sm font-medium">
                All transactions
              </p>

              <p className="mt-1 text-xs text-white/25">
                {
                  filteredTransactions.length
                }{" "}
                result
                {filteredTransactions.length ===
                1
                  ? ""
                  : "s"}
              </p>
            </div>

            <span className="text-[10px] text-white/20">
              Click a transaction for details
            </span>
          </div>

          {loading ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />

              <p className="mt-4 text-xs text-white/25">
                Loading transactions...
              </p>
            </div>
          ) : filteredTransactions.length ===
            0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] text-xl">
                ◇
              </div>

              <h3 className="mt-5 text-sm font-medium">
                No transactions found
              </h3>

              <p className="mt-2 text-xs text-white/25">
                Try changing your filters or
                add a new transaction.
              </p>

              <button
                onClick={openModal}
                disabled={
                  categories.length === 0
                }
                className="mt-5 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                + Add transaction
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {filteredTransactions.map(
                (transaction) => {
                  const isIncome =
                    transaction.type ===
                    "INCOME";

                  return (
                    <button
                      key={transaction.id}
                      type="button"
                      onClick={() =>
                        setSelectedTransaction(
                          transaction
                        )
                      }
                      className="group flex w-full flex-col gap-4 px-5 py-5 text-left transition hover:bg-white/[0.035] sm:flex-row sm:items-center sm:justify-between sm:px-7"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.045] text-lg"
                          style={{
                            border:
                              transaction
                                .category
                                .color
                              ? `1px solid ${transaction.category.color}25`
                              : undefined,
                          }}
                        >
                          {transaction.category
                            .icon || "◈"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-white">
                            {transaction.description ||
                              transaction.category
                                .name}
                          </p>

                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-white/25">
                            <span>
                              {
                                transaction
                                  .category
                                  .name
                              }
                            </span>

                            <span className="text-white/10">
                              •
                            </span>

                            <span>
                              {
                                transaction.paymentMethod
                              }
                            </span>

                            <span className="text-white/10">
                              •
                            </span>

                            <span>
                              {formatDate(
                                transaction.date
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-5 sm:justify-end">
                        <div className="text-left sm:text-right">
                          <p
                            className={
                              "text-sm font-semibold " +
                              (isIncome
                                ? "text-emerald-300"
                                : "text-white/75")
                            }
                          >
                            {isIncome
                              ? "+"
                              : "-"}
                            {formatCurrency(
                              transaction.amount
                            )}
                          </p>

                          <p
                            className={
                              "mt-1 text-[9px] " +
                              (isIncome
                                ? "text-emerald-300/50"
                                : "text-white/20")
                            }
                          >
                            {isIncome
                              ? "Income"
                              : "Expense"}
                          </p>
                        </div>

                        <span className="text-xs text-white/15 transition group-hover:translate-x-0.5 group-hover:text-emerald-300">
                          →
                        </span>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>

      {/* ================================================= */}
      {/* TRANSACTION DETAIL MODAL                          */}
      {/* ================================================= */}

      {selectedTransaction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div
            className="absolute inset-0"
            onClick={() =>
              setSelectedTransaction(null)
            }
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0d0f11] shadow-2xl">
            {/* Modal header */}
            <div className="border-b border-white/[0.06] px-6 py-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400">
                    Transaction details
                  </p>

                  <p className="mt-1 text-[10px] text-white/20">
                    {formatDateTime(
                      selectedTransaction.date
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedTransaction(
                      null
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-white/30 transition hover:bg-white/[0.04] hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="px-6 py-7 text-center">
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-2xl"
                style={{
                  backgroundColor:
                    selectedTransaction.category
                      .color
                      ? `${selectedTransaction.category.color}12`
                      : "rgba(255,255,255,0.04)",
                  border:
                    selectedTransaction.category
                      .color
                      ? `1px solid ${selectedTransaction.category.color}25`
                      : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {selectedTransaction.category
                  .icon || "◈"}
              </div>

              <p
                className={
                  "mt-5 text-4xl font-semibold tracking-[-0.05em] " +
                  (selectedTransaction.type ===
                  "INCOME"
                    ? "text-emerald-300"
                    : "text-white")
                }
              >
                {selectedTransaction.type ===
                "INCOME"
                  ? "+"
                  : "-"}
                {formatCurrency(
                  selectedTransaction.amount
                )}
              </p>

              <p className="mt-2 text-sm text-white/40">
                {selectedTransaction.type ===
                "INCOME"
                  ? "Income"
                  : "Expense"}
              </p>
            </div>

            {/* Details */}
            <div className="px-6 pb-6">
              <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                <DetailRow
                  label="Description"
                  value={
                    selectedTransaction.description ||
                    "No description"
                  }
                />

                <DetailRow
                  label="Category"
                  value={`${selectedTransaction.category.icon || ""} ${selectedTransaction.category.name}`}
                />

                <DetailRow
                  label="Payment method"
                  value={
                    selectedTransaction.paymentMethod
                  }
                />

                <DetailRow
                  label="Date"
                  value={formatDateTime(
                    selectedTransaction.date
                  )}
                />

                <DetailRow
                  label="Transaction ID"
                  value={selectedTransaction.id}
                  mono
                  last={
                    !selectedTransaction.notes
                  }
                />

                {selectedTransaction.notes && (
                  <DetailRow
                    label="Notes"
                    value={
                      selectedTransaction.notes
                    }
                    last
                  />
                )}
              </div>

              {/* Actions */}
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedTransaction(
                      null
                    )
                  }
                  className="flex-1 rounded-xl border border-white/[0.07] bg-white/[0.025] py-3 text-xs font-medium text-white/50 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      selectedTransaction.id
                    )
                  }
                  className="rounded-xl border border-red-400/10 bg-red-400/[0.05] px-5 py-3 text-xs font-medium text-red-300 transition hover:bg-red-400/[0.1]"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* ADD TRANSACTION MODAL                             */}
      {/* ================================================= */}

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div
            className="absolute inset-0"
            onClick={() => {
              if (!submitting) {
                setModalOpen(false);
              }
            }}
          />

          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/[0.08] bg-[#0d0f11] p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400">
                  New transaction
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                  Add transaction
                </h2>

                <p className="mt-1 text-xs text-white/25">
                  Record your latest financial
                  activity.
                </p>
              </div>

              <button
                disabled={submitting}
                onClick={() =>
                  setModalOpen(false)
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-white/30 hover:bg-white/[0.04] hover:text-white"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreateTransaction}
              className="mt-7 space-y-5"
            >
              {/* Type */}
              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
                  Transaction type
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        type: "EXPENSE",
                        categoryId:
                          categories.find(
                            (category) =>
                              category.name ===
                              "Food & Drinks"
                          )?.id ||
                          categories.find(
                            (category) =>
                              category.name !==
                              "Income"
                          )?.id ||
                          "",
                      }))
                    }
                    className={
                      "rounded-xl border py-3 text-xs transition " +
                      (form.type ===
                      "EXPENSE"
                        ? "border-red-400/20 bg-red-400/[0.08] text-red-300"
                        : "border-white/[0.07] bg-white/[0.025] text-white/35")
                    }
                  >
                    Expense
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        type: "INCOME",
                        categoryId:
                          categories.find(
                            (category) =>
                              category.name ===
                              "Income"
                          )?.id || "",
                      }))
                    }
                    className={
                      "rounded-xl border py-3 text-xs transition " +
                      (form.type ===
                      "INCOME"
                        ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"
                        : "border-white/[0.07] bg-white/[0.025] text-white/35")
                    }
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
                  Amount
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/30">
                    ₹
                  </span>

                  <input
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        amount:
                          event.target.value,
                      }))
                    }
                    placeholder="0"
                    className="h-12 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-9 pr-4 text-sm text-white outline-none placeholder:text-white/15 focus:border-emerald-400/30"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
                  Description
                </label>

                <input
                  type="text"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description:
                        event.target.value,
                    }))
                  }
                  placeholder="e.g. Dinner with friends"
                  className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-xs text-white outline-none placeholder:text-white/15 focus:border-emerald-400/30"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
                  Category
                </label>

                <select
                  required
                  value={form.categoryId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      categoryId:
                        event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-white/[0.07] bg-[#101214] px-4 text-xs text-white outline-none focus:border-emerald-400/30"
                >
                  <option value="">
                    Select category
                  </option>

                  {formCategories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.icon}{" "}
                        {category.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Payment + Date */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
                    Payment method
                  </label>

                  <select
                    value={
                      form.paymentMethod
                    }
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        paymentMethod:
                          event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-white/[0.07] bg-[#101214] px-4 text-xs text-white outline-none focus:border-emerald-400/30"
                  >
                    <option value="UPI">
                      UPI
                    </option>
                    <option value="CARD">
                      Card
                    </option>
                    <option value="CASH">
                      Cash
                    </option>
                    <option value="BANK_TRANSFER">
                      Bank transfer
                    </option>
                    <option value="OTHER">
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
                    Date
                  </label>

                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        date:
                          event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-xs text-white outline-none focus:border-emerald-400/30"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
                  Notes
                </label>

                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notes:
                        event.target.value,
                    }))
                  }
                  placeholder="Optional notes..."
                  className="w-full resize-none rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-xs text-white outline-none placeholder:text-white/15 focus:border-emerald-400/30"
                />
              </div>

              <button
                disabled={
                  submitting ||
                  categories.length === 0 ||
                  !form.categoryId
                }
                type="submit"
                className="h-12 w-full rounded-xl bg-white text-xs font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : "Save transaction"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
  last = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={
        "flex items-start justify-between gap-5 px-4 py-4 " +
        (!last
          ? "border-b border-white/[0.05]"
          : "")
      }
    >
      <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-white/20">
        {label}
      </span>

      <span
        className={
          "text-right text-xs text-white/60 " +
          (mono
            ? "max-w-[190px] break-all font-mono text-[9px] text-white/25"
            : "max-w-[220px]")
        }
      >
        {value}
      </span>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  featured = false,
}: {
  label: string;
  value: string;
  icon: string;
  featured?: boolean;
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

          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
            {value}
          </p>
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

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "h-9 rounded-xl border px-3 text-[10px] transition " +
        (active
          ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"
          : "border-white/[0.07] bg-white/[0.025] text-white/35 hover:text-white")
      }
    >
      {children}
    </button>
  );
}