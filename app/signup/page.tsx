"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result?.error ||
            "Unable to create your account."
        );
        return;
      }

      const loginResult = await signIn(
        "credentials",
        {
          email: trimmedEmail,
          password,
          redirect: false,
        }
      );

      if (!loginResult || loginResult.error) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Signup error:", error);

      setError(
        "Something went wrong. Please try again."
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

            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Start your financial journey.
              </div>

              <h1 className="text-5xl font-bold leading-[1.08] tracking-tight xl:text-6xl">
                Build better
                <span className="block text-emerald-400">
                  money habits.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
                One simple place to track expenses,
                manage budgets, monitor goals, and
                understand where your money goes.
              </p>

              <div className="mt-10 space-y-4">
                <Feature
                  title="Track everything"
                  description="Keep your income and expenses organized."
                />

                <Feature
                  title="Stay on budget"
                  description="Know exactly how much you can spend."
                />

                <Feature
                  title="Reach your goals"
                  description="Turn your plans into measurable progress."
                />
              </div>
            </div>

            <p className="text-sm text-slate-500">
              © 2026 SpendWise. Take control of your money.
            </p>
          </div>
        </section>

        {/* SIGNUP PANEL */}
        <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:min-h-0 lg:px-16">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
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

            <div className="mb-8">
              <p className="mb-3 text-sm font-medium text-emerald-400">
                Create your account
              </p>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Join SpendWise
              </h2>

              <p className="mt-3 text-slate-400">
                Start taking control of your finances today.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* NAME */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Full name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="John Doe"
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

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
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="At least 8 characters"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Repeat your password"
                    required
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 pr-16 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={
                  loading ||
                  !name.trim() ||
                  !email.trim() ||
                  !password ||
                  !confirmPassword
                }
                className="h-12 w-full rounded-xl bg-emerald-500 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Creating your account..."
                  : "Create account"}
              </button>
            </form>

            {/* LOGIN */}
            <p className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-emerald-400 transition hover:text-emerald-300"
              >
                Sign in
              </Link>
            </p>

            <p className="mt-6 text-center text-xs leading-5 text-slate-600">
              By creating an account, you agree to
              SpendWise's terms and privacy policy.
            </p>
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