"use client";

import { useState } from "react";

const features = [
  {
    number: "01",
    title: "Know your spending",
    description:
      "See exactly where your money goes with clean, intelligent spending analytics.",
  },
  {
    number: "02",
    title: "Build better habits",
    description:
      "Set monthly budgets and understand your spending patterns before they become problems.",
  },
  {
    number: "03",
    title: "Reach your goals",
    description:
      "Turn your financial goals into measurable progress with simple, visual tracking.",
  },
];

const transactions = [
  {
    name: "Starbucks Coffee",
    category: "Food & Drinks",
    amount: "-₹280",
    icon: "☕",
  },
  {
    name: "Uber",
    category: "Transport",
    amount: "-₹420",
    icon: "🚕",
  },
  {
    name: "Freelance Payment",
    category: "Income",
    amount: "+₹18,500",
    icon: "↗",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[#08090b] text-white selection:bg-emerald-400/30">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-300px] h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-emerald-500/[0.08] blur-[140px]" />
        <div className="absolute right-[-250px] top-[35%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.05] blur-[140px]" />
        <div className="absolute bottom-[-300px] left-[-200px] h-[500px] w-[500px] rounded-full bg-emerald-500/[0.04] blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black shadow-lg shadow-white/10">
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

          <span className="text-[17px] font-semibold tracking-[-0.03em]">
            Spend<span className="text-emerald-400">Wise</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 text-sm text-white/55 md:flex">
          <a
            href="#features"
            className="transition hover:text-white"
          >
            Features
          </a>
          <a
            href="#how"
            className="transition hover:text-white"
          >
            How it works
          </a>
          <a
            href="#preview"
            className="transition hover:text-white"
          >
            Preview
          </a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="/dashboard"
            className="rounded-full px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.05] hover:text-white"
          >
            Sign in
          </a>

          <a
            href="/dashboard"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-300"
          >
            Get started
          </a>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg border border-white/10 p-2 md:hidden"
          aria-label="Toggle menu"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            {menuOpen ? (
              <path d="M6 6l12 12M18 6 6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="mx-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4 text-sm text-white/70">
            <a href="#features" onClick={() => setMenuOpen(false)}>
              Features
            </a>
            <a href="#how" onClick={() => setMenuOpen(false)}>
              How it works
            </a>
            <a href="/dashboard">Get started</a>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3.5 py-2 text-xs font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Your money. Your clarity.
          </div>

          <h1 className="text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-8xl">
            Spend with
            <span className="block bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
              intention.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/45 sm:text-lg">
            A beautifully simple way to understand your spending, control your
            budget, and build a healthier relationship with money.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/dashboard"
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-300 sm:w-auto"
            >
              Start tracking
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </a>

            <a
              href="#preview"
              className="w-full rounded-full border border-white/10 bg-white/[0.03] px-7 py-3.5 text-sm font-medium text-white/70 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white sm:w-auto"
            >
              Explore SpendWise
            </a>
          </div>
        </div>

        {/* Hero dashboard preview */}
        <div
          id="preview"
          className="relative mx-auto mt-20 max-w-5xl lg:mt-24"
        >
          <div className="absolute -inset-10 -z-10 rounded-[50%] bg-emerald-400/[0.08] blur-[90px]" />

          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0e1013]/90 shadow-2xl shadow-black/60 backdrop-blur-2xl">
            {/* Window bar */}
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              </div>

              <div className="hidden rounded-full border border-white/[0.06] px-4 py-1 text-[10px] text-white/25 sm:block">
                app.spendwise
              </div>

              <div className="h-5 w-5" />
            </div>

            <div className="grid gap-0 lg:grid-cols-[190px_1fr]">
              {/* Sidebar */}
              <aside className="hidden border-r border-white/[0.06] p-5 lg:block">
                <div className="mb-8 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-emerald-400" />
                  <span className="text-xs font-semibold">SpendWise</span>
                </div>

                <div className="space-y-1">
                  {["Overview", "Transactions", "Budgets", "Analytics"].map(
                    (item, index) => (
                      <div
                        key={item}
                        className={`rounded-xl px-3 py-2.5 text-[11px] ${
                          index === 0
                            ? "bg-white/[0.07] text-white"
                            : "text-white/35"
                        }`}
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>
              </aside>

              {/* Dashboard */}
              <div className="p-5 sm:p-7">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                      Total balance
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                      ₹42,680
                    </p>
                  </div>

                  <div className="rounded-full bg-emerald-400/10 px-3 py-1.5 text-[10px] font-medium text-emerald-300">
                    +12.4%
                  </div>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <StatCard label="Income" value="₹58,400" positive />
                  <StatCard label="Spent" value="₹15,720" />
                  <StatCard label="Saved" value="₹42,680" positive />
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                  {/* Chart */}
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium">Spending overview</p>
                        <p className="mt-1 text-[10px] text-white/30">
                          Last 7 days
                        </p>
                      </div>

                      <span className="text-[10px] text-white/30">
                        This week
                      </span>
                    </div>

                    <div className="mt-6 flex h-32 items-end gap-2 sm:gap-4">
                      {[35, 52, 40, 76, 58, 88, 64].map((height, i) => (
                        <div
                          key={i}
                          className="group relative flex h-full flex-1 items-end"
                        >
                          <div
                            className={`w-full rounded-t-lg transition ${
                              i === 5
                                ? "bg-emerald-400"
                                : "bg-white/[0.08] group-hover:bg-white/[0.15]"
                            }`}
                            style={{ height: `${height}%` }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex justify-between text-[9px] text-white/20">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>

                  {/* Recent transactions */}
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium">Recent activity</p>
                      <span className="text-[10px] text-emerald-300">
                        View all
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.name}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-sm">
                              {transaction.icon}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-[10px] font-medium">
                                {transaction.name}
                              </p>
                              <p className="mt-0.5 text-[9px] text-white/25">
                                {transaction.category}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 text-[10px] font-medium ${
                              transaction.amount.startsWith("+")
                                ? "text-emerald-300"
                                : "text-white/60"
                            }`}
                          >
                            {transaction.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust line */}
      <section className="border-y border-white/[0.05]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6 py-7 text-[10px] uppercase tracking-[0.18em] text-white/20 sm:gap-x-16">
          <span>Simple</span>
          <span>Private</span>
          <span>Insightful</span>
          <span>Built for you</span>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32"
      >
        <div className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-emerald-400">
            Everything in one place
          </p>

          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
            Money management,
            <br />
            without the noise.
          </h2>

          <p className="mt-5 max-w-lg text-sm leading-6 text-white/40 sm:text-base">
            SpendWise gives you the information you actually need to make
            better financial decisions every day.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.07] md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.number}
              className="group bg-[#0b0d0f] p-8 transition duration-300 hover:bg-[#101316] sm:p-10"
            >
              <span className="text-xs font-medium text-emerald-400/60">
                {feature.number}
              </span>

              <h3 className="mt-16 text-xl font-semibold tracking-[-0.025em]">
                {feature.title}
              </h3>

              <p className="mt-4 text-sm leading-6 text-white/35">
                {feature.description}
              </p>

              <div className="mt-8 h-px w-8 bg-emerald-400/40 transition-all duration-300 group-hover:w-16" />
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how"
        className="border-y border-white/[0.05] bg-white/[0.015]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-emerald-400">
                How it works
              </p>

              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                From spending
                <br />
                to understanding.
              </h2>

              <p className="mt-6 max-w-md text-sm leading-6 text-white/40 sm:text-base">
                Add your transactions, set your limits, and let SpendWise
                turn your financial activity into useful information.
              </p>
            </div>

            <div className="space-y-3">
              <Step
                number="01"
                title="Track"
                text="Add your income and expenses in seconds."
              />
              <Step
                number="02"
                title="Understand"
                text="See patterns through clean, visual analytics."
              />
              <Step
                number="03"
                title="Improve"
                text="Set budgets and make smarter decisions."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-5xl px-6 py-24 text-center lg:py-36">
        <div className="absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/[0.08] blur-[100px]" />

        <p className="text-xs font-medium uppercase tracking-[0.22em] text-emerald-400">
          Start today
        </p>

        <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
          Your money deserves
          <span className="text-white/35"> your attention.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-lg text-sm leading-6 text-white/35 sm:text-base">
          Start understanding your spending and take control of your financial
          future.
        </p>

        <a
          href="/dashboard"
          className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-emerald-300"
        >
          Create your account
          <span>→</span>
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-xs text-white/25 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-white" />
            <span className="font-medium text-white/45">SpendWise</span>
          </div>

          <p>© 2026 SpendWise. Built for better financial decisions.</p>
        </div>
      </footer>
    </main>
  );
}

function StatCard({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
      <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">
        {label}
      </p>
      <p
        className={`mt-2 text-lg font-semibold tracking-[-0.03em] ${
          positive ? "text-emerald-300" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="group flex items-center gap-5 rounded-2xl border border-white/[0.06] bg-[#0b0d0f] p-5 transition hover:border-emerald-400/20 hover:bg-[#0f1214]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] text-xs font-medium text-emerald-400">
        {number}
      </div>

      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-white/30">{text}</p>
      </div>

      <span className="ml-auto text-white/20 transition group-hover:translate-x-1 group-hover:text-emerald-400">
        →
      </span>
    </div>
  );
}