"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });

      if (!result) {
        setError("Unable to sign in. Please try again.");
        return;
      }

      if (result.error) {
        setError(
          "Invalid email or password. Please try again."
        );
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Something went wrong while signing in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* LEFT BRAND PANEL */}
        <section className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-slate-950 to-blue-500/10" />

          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />

          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            {/* BRAND */}
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 font-black text-slate-950 shadow-lg shadow-emerald-500/20">
                S
              </div>

              <span className="text-xl font-bold tracking-tight">
                SpendWise
              </span>
            </Link>

            {/* HERO */}
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Welcome back to SpendWise.
              </div>

              <h1 className="text-5xl font-bold leading-[1.08] tracking-tight xl:text-6xl">
                Take control of
                <span className="block text-emerald-400">
                  your money.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
                Track your spending, manage budgets, monitor
                your goals, and make smarter financial decisions
                from one simple place.
              </p>

              <div className="mt-10 space-y-4">
                <Feature
                  title="Track everything"
                  description="Keep your income and expenses organized."
                />

                <Feature
                  title="Stay on budget"
                  description="Know exactly where your money is going."
                />

                <Feature
                  title="Reach your goals"
                  description="Turn your financial plans into measurable progress."
                />
              </div>
            </div>

            {/* FOOTER */}
            <p className="text-sm text-slate-500">
              © 2026 SpendWise. Take control of your money.
            </p>
          </div>
        </section>

        {/* LOGIN PANEL */}
        <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:min-h-0 lg:px-16">
          <div className="w-full max-w-md">
            {/* MOBILE LOGO */}
            <div className="mb-8 flex items-center justify-center lg:hidden">
              <Link
                href="/"
                className="flex items-center gap-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 font-black text-slate-950">
                  S
                </div>

                <span className="text-xl font-bold">
                  SpendWise
                </span>
              </Link>
            </div>

            {/* HEADING */}
            <div className="mb-8">
              <p className="mb-3 text-sm font-medium text-emerald-400">
                Welcome back
              </p>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Sign in to SpendWise
              </h2>

              <p className="mt-3 text-slate-400">
                Continue managing your finances with ease.
              </p>
            </div>

            {/* CARD */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-300"
                    >
                      Password
                    </label>

                    <span className="text-xs text-slate-600">
                      Keep it secure
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword ? "text" : "password"
                      }
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 pr-16 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* ERROR */}
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300"
                  >
                    {error}
                  </div>
                )}

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !email.trim() ||
                    !password
                  }
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-emerald-500 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>

              {/* SIGNUP */}
              <div className="mt-7 border-t border-white/10 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Don't have an account?{" "}
                  <Link
                    href="/signup"
                    className="font-semibold text-emerald-400 transition hover:text-emerald-300"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </div>

            {/* BACK */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-slate-600 transition hover:text-slate-300"
              >
                ← Back to SpendWise
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
        ✓
      </div>

      <div>
        <p className="font-medium text-white">
          {title}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}