"use client";

import { useState } from "react";

type SettingsSection =
  | "profile"
  | "preferences"
  | "notifications"
  | "security"
  | "data";

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: "SpendWise User",
    email: "user@example.com",
  });

  const [preferences, setPreferences] = useState({
    currency: "INR",
    dateFormat: "DD MMM YYYY",
    weekStarts: "Monday",
    defaultType: "EXPENSE",
  });

  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    spendingInsights: true,
    goalReminders: true,
    weeklySummary: true,
    transactionAlerts: false,
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  const handleSave = () => {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const navigation = [
    {
      id: "profile" as SettingsSection,
      label: "Profile",
      description: "Personal information",
      icon: "◎",
    },
    {
      id: "preferences" as SettingsSection,
      label: "Preferences",
      description: "Customize your experience",
      icon: "⚙",
    },
    {
      id: "notifications" as SettingsSection,
      label: "Notifications",
      description: "Alerts and reminders",
      icon: "♢",
    },
    {
      id: "security" as SettingsSection,
      label: "Security",
      description: "Password and account security",
      icon: "◇",
    },
    {
      id: "data" as SettingsSection,
      label: "Data & Privacy",
      description: "Manage your financial data",
      icon: "▣",
    },
  ];

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
              Settings
            </p>
          </div>

          <a
            href="/dashboard"
            className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-2 text-xs text-white/45 transition hover:bg-white/[0.05] hover:text-white"
          >
            ← Dashboard
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-5 py-7 sm:px-7 lg:px-9 lg:py-10">
        {/* Page heading */}
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400">
            Account control
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Settings.
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-white/30">
            Manage your profile, preferences, notifications,
            security, and financial data.
          </p>
        </div>

        {/* Layout */}
        <div className="mt-8 grid gap-5 lg:grid-cols-[250px_1fr]">
          {/* Sidebar */}
          <aside className="h-fit rounded-3xl border border-white/[0.07] bg-white/[0.025] p-2">
            <div className="p-3">
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/20">
                Settings
              </p>
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const active =
                  activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setActiveSection(item.id)
                    }
                    className={
                      "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition " +
                      (active
                        ? "bg-white/[0.07] text-white"
                        : "text-white/35 hover:bg-white/[0.035] hover:text-white/70")
                    }
                  >
                    <span
                      className={
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm " +
                        (active
                          ? "border-emerald-400/10 bg-emerald-400/[0.08] text-emerald-300"
                          : "border-white/[0.06] bg-white/[0.025] text-white/30")
                      }
                    >
                      {item.icon}
                    </span>

                    <span className="min-w-0">
                      <span className="block text-xs font-medium">
                        {item.label}
                      </span>

                      <span className="mt-0.5 block truncate text-[9px] text-white/20">
                        {item.description}
                      </span>
                    </span>

                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Account status */}
            <div className="mx-2 mb-2 mt-4 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.025] p-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-emerald-600 text-[9px] font-bold text-black">
                  SW
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[10px] font-medium text-white/70">
                    Personal account
                  </p>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                    <span className="text-[8px] text-emerald-300/60">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0">
            {activeSection === "profile" && (
              <ProfileSection
                profile={profile}
                setProfile={setProfile}
                onSave={handleSave}
              />
            )}

            {activeSection === "preferences" && (
              <PreferencesSection
                preferences={preferences}
                setPreferences={setPreferences}
                onSave={handleSave}
              />
            )}

            {activeSection === "notifications" && (
              <NotificationsSection
                notifications={notifications}
                setNotifications={setNotifications}
                onSave={handleSave}
              />
            )}

            {activeSection === "security" && (
              <SecuritySection
                security={security}
                setSecurity={setSecurity}
                onSave={handleSave}
              />
            )}

            {activeSection === "data" && (
              <DataSection
                showDeleteConfirm={
                  showDeleteConfirm
                }
                setShowDeleteConfirm={
                  setShowDeleteConfirm
                }
              />
            )}

            {/* Save notification */}
            {saved && (
              <div className="fixed bottom-5 right-5 z-[200] flex items-center gap-3 rounded-2xl border border-emerald-400/15 bg-[#101412]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/10 text-sm text-emerald-300">
                  ✓
                </div>

                <div>
                  <p className="text-xs font-medium">
                    Changes saved
                  </p>

                  <p className="mt-0.5 text-[9px] text-white/25">
                    Your settings have been updated.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ======================================================= */
/* PROFILE */
/* ======================================================= */

function ProfileSection({
  profile,
  setProfile,
  onSave,
}: {
  profile: {
    name: string;
    email: string;
  };
  setProfile: React.Dispatch<
    React.SetStateAction<{
      name: string;
      email: string;
    }>
  >;
  onSave: () => void;
}) {
  return (
    <SettingsCard
      eyebrow="Your account"
      title="Profile"
      description="Update the personal information associated with your SpendWise account."
    >
      <div className="flex flex-col gap-6 border-b border-white/[0.06] pb-7 sm:flex-row sm:items-center">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-300 to-emerald-600 text-xl font-bold text-black shadow-lg shadow-emerald-500/10">
            {getInitials(profile.name)}
          </div>

          <button
            type="button"
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-lg border border-[#0d0f11] bg-white text-xs text-black transition hover:bg-emerald-300"
          >
            ✎
          </button>
        </div>

        <div>
          <p className="text-sm font-medium">
            Profile photo
          </p>

          <p className="mt-1 max-w-sm text-xs leading-5 text-white/25">
            Your profile photo helps personalize your
            SpendWise account.
          </p>

          <button
            type="button"
            className="mt-3 rounded-lg border border-white/[0.07] px-3 py-1.5 text-[10px] text-white/40 transition hover:bg-white/[0.04] hover:text-white"
          >
            Change photo
          </button>
        </div>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <InputField
          label="Full name"
          value={profile.name}
          onChange={(value) =>
            setProfile((current) => ({
              ...current,
              name: value,
            }))
          }
          placeholder="Your name"
        />

        <InputField
          label="Email address"
          type="email"
          value={profile.email}
          onChange={(value) =>
            setProfile((current) => ({
              ...current,
              email: value,
            }))
          }
          placeholder="you@example.com"
        />
      </div>

      <div className="mt-7 flex justify-end">
        <SaveButton onClick={onSave} />
      </div>
    </SettingsCard>
  );
}

/* ======================================================= */
/* PREFERENCES */
/* ======================================================= */

function PreferencesSection({
  preferences,
  setPreferences,
  onSave,
}: {
  preferences: {
    currency: string;
    dateFormat: string;
    weekStarts: string;
    defaultType: string;
  };
  setPreferences: React.Dispatch<
    React.SetStateAction<{
      currency: string;
      dateFormat: string;
      weekStarts: string;
      defaultType: string;
    }>
  >;
  onSave: () => void;
}) {
  return (
    <SettingsCard
      eyebrow="Personalize"
      title="Preferences"
      description="Choose how SpendWise displays and handles your financial information."
    >
      <div className="space-y-7">
        <SettingSelect
          label="Currency"
          description="Currency used throughout your dashboard."
          value={preferences.currency}
          onChange={(value) =>
            setPreferences((current) => ({
              ...current,
              currency: value,
            }))
          }
          options={[
            ["INR", "₹ Indian Rupee (INR)"],
            ["USD", "$ US Dollar (USD)"],
            ["EUR", "€ Euro (EUR)"],
            ["GBP", "£ British Pound (GBP)"],
            ["AED", "د.إ UAE Dirham (AED)"],
          ]}
        />

        <SettingSelect
          label="Date format"
          description="How transaction dates appear across the app."
          value={preferences.dateFormat}
          onChange={(value) =>
            setPreferences((current) => ({
              ...current,
              dateFormat: value,
            }))
          }
          options={[
            ["DD MMM YYYY", "25 Aug 2026"],
            ["MMM DD, YYYY", "Aug 25, 2026"],
            ["DD/MM/YYYY", "25/08/2026"],
            ["MM/DD/YYYY", "08/25/2026"],
          ]}
        />

        <SettingSelect
          label="Week starts on"
          description="Used for weekly spending reports and analytics."
          value={preferences.weekStarts}
          onChange={(value) =>
            setPreferences((current) => ({
              ...current,
              weekStarts: value,
            }))
          }
          options={[
            ["Monday", "Monday"],
            ["Sunday", "Sunday"],
            ["Saturday", "Saturday"],
          ]}
        />

        <SettingSelect
          label="Default transaction type"
          description="The transaction type selected when opening Add transaction."
          value={preferences.defaultType}
          onChange={(value) =>
            setPreferences((current) => ({
              ...current,
              defaultType: value,
            }))
          }
          options={[
            ["EXPENSE", "Expense"],
            ["INCOME", "Income"],
          ]}
        />
      </div>

      <div className="mt-8 flex justify-end border-t border-white/[0.06] pt-6">
        <SaveButton onClick={onSave} />
      </div>
    </SettingsCard>
  );
}

/* ======================================================= */
/* NOTIFICATIONS */
/* ======================================================= */

function NotificationsSection({
  notifications,
  setNotifications,
  onSave,
}: {
  notifications: {
    budgetAlerts: boolean;
    spendingInsights: boolean;
    goalReminders: boolean;
    weeklySummary: boolean;
    transactionAlerts: boolean;
  };
  setNotifications: React.Dispatch<
    React.SetStateAction<{
      budgetAlerts: boolean;
      spendingInsights: boolean;
      goalReminders: boolean;
      weeklySummary: boolean;
      transactionAlerts: boolean;
    }>
  >;
  onSave: () => void;
}) {
  const items = [
    {
      key: "budgetAlerts" as const,
      title: "Budget alerts",
      description:
        "Get notified when you're approaching or exceeding a budget.",
    },
    {
      key: "spendingInsights" as const,
      title: "Spending insights",
      description:
        "Receive useful observations about your spending habits.",
    },
    {
      key: "goalReminders" as const,
      title: "Goal reminders",
      description:
        "Stay on track with reminders about your savings goals.",
    },
    {
      key: "weeklySummary" as const,
      title: "Weekly summary",
      description:
        "Receive a weekly overview of your financial activity.",
    },
    {
      key: "transactionAlerts" as const,
      title: "Transaction alerts",
      description:
        "Get notified whenever a new transaction is recorded.",
    },
  ];

  return (
    <SettingsCard
      eyebrow="Stay informed"
      title="Notifications"
      description="Choose which financial updates and reminders you want to receive."
    >
      <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
        {items.map((item, index) => (
          <div
            key={item.key}
            className={
              "flex items-center justify-between gap-5 px-4 py-5 sm:px-5 " +
              (index !== items.length - 1
                ? "border-b border-white/[0.05]"
                : "")
            }
          >
            <div className="min-w-0">
              <p className="text-xs font-medium">
                {item.title}
              </p>

              <p className="mt-1 max-w-lg text-[10px] leading-5 text-white/25">
                {item.description}
              </p>
            </div>

            <Toggle
              enabled={notifications[item.key]}
              onChange={() =>
                setNotifications((current) => ({
                  ...current,
                  [item.key]:
                    !current[item.key],
                }))
              }
            />
          </div>
        ))}
      </div>

      <div className="mt-7 flex justify-end">
        <SaveButton onClick={onSave} />
      </div>
    </SettingsCard>
  );
}

/* ======================================================= */
/* SECURITY */
/* ======================================================= */

function SecuritySection({
  security,
  setSecurity,
  onSave,
}: {
  security: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  setSecurity: React.Dispatch<
    React.SetStateAction<{
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }>
  >;
  onSave: () => void;
}) {
  return (
    <SettingsCard
      eyebrow="Account protection"
      title="Security"
      description="Keep your SpendWise account secure by regularly updating your password."
    >
      <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.025] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/[0.07] text-sm text-emerald-300">
            ✓
          </div>

          <div>
            <p className="text-xs font-medium">
              Account security
            </p>

            <p className="mt-1 text-[10px] leading-5 text-white/25">
              Your account is protected. Use a strong,
              unique password that you don't reuse elsewhere.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-7">
        <p className="text-sm font-medium">
          Change password
        </p>

        <p className="mt-1 text-xs text-white/25">
          Enter your current password and choose a new one.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        <PasswordField
          label="Current password"
          value={security.currentPassword}
          onChange={(value) =>
            setSecurity((current) => ({
              ...current,
              currentPassword: value,
            }))
          }
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <PasswordField
            label="New password"
            value={security.newPassword}
            onChange={(value) =>
              setSecurity((current) => ({
                ...current,
                newPassword: value,
              }))
            }
          />

          <PasswordField
            label="Confirm new password"
            value={security.confirmPassword}
            onChange={(value) =>
              setSecurity((current) => ({
                ...current,
                confirmPassword: value,
              }))
            }
          />
        </div>
      </div>

      <div className="mt-7 flex justify-end border-t border-white/[0.06] pt-6">
        <SaveButton
          onClick={onSave}
          label="Update password"
        />
      </div>

      <div className="mt-8 border-t border-white/[0.06] pt-7">
        <p className="text-sm font-medium">
          Active sessions
        </p>

        <p className="mt-1 text-xs text-white/25">
          Devices currently signed in to your account.
        </p>

        <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-sm">
              ◫
            </div>

            <div>
              <p className="text-xs font-medium">
                Current browser
              </p>

              <p className="mt-1 text-[9px] text-emerald-300/60">
                Active now
              </p>
            </div>
          </div>

          <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[9px] text-emerald-300">
            This device
          </span>
        </div>
      </div>
    </SettingsCard>
  );
}

/* ======================================================= */
/* DATA & PRIVACY */
/* ======================================================= */

function DataSection({
  showDeleteConfirm,
  setShowDeleteConfirm,
}: {
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (
    value: boolean
  ) => void;
}) {
  return (
    <div className="space-y-5">
      <SettingsCard
        eyebrow="Your information"
        title="Data & Privacy"
        description="Manage your financial data and understand how it is handled."
      >
        <div className="space-y-3">
          <ActionRow
            icon="↓"
            title="Export your data"
            description="Download your transactions and financial information."
            action="Export"
            onClick={() =>
              alert(
                "Data export will be connected to the API."
              )
            }
          />

          <ActionRow
            icon="↻"
            title="Refresh account data"
            description="Reload your latest information from the database."
            action="Refresh"
            onClick={() =>
              window.location.reload()
            }
          />
        </div>
      </SettingsCard>

      <div className="overflow-hidden rounded-3xl border border-red-400/10 bg-red-400/[0.025] p-5 sm:p-7">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-red-300/70">
            Danger zone
          </p>

          <h2 className="mt-2 text-lg font-semibold">
            Delete account
          </h2>

          <p className="mt-2 max-w-xl text-xs leading-5 text-white/30">
            Permanently delete your SpendWise account,
            transactions, budgets, goals, and associated
            data. This action cannot be undone.
          </p>
        </div>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() =>
              setShowDeleteConfirm(true)
            }
            className="mt-6 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-2.5 text-xs font-medium text-red-300 transition hover:bg-red-400/[0.1]"
          >
            Delete account
          </button>
        ) : (
          <div className="mt-6 rounded-2xl border border-red-400/10 bg-black/20 p-4">
            <p className="text-xs font-medium text-red-300">
              Are you absolutely sure?
            </p>

            <p className="mt-1 text-[10px] leading-5 text-white/25">
              This will permanently remove your account
              and all financial records.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setShowDeleteConfirm(false)
                }
                className="rounded-xl border border-white/[0.07] px-4 py-2.5 text-[10px] text-white/40 transition hover:bg-white/[0.04] hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  alert(
                    "Account deletion will be connected to the API."
                  )
                }
                className="rounded-xl bg-red-400 px-4 py-2.5 text-[10px] font-semibold text-black transition hover:bg-red-300"
              >
                Yes, delete my account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ======================================================= */
/* REUSABLE COMPONENTS */
/* ======================================================= */

function SettingsCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-7">
      <div className="border-b border-white/[0.06] pb-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
          {title}
        </h2>

        <p className="mt-1.5 max-w-xl text-xs leading-5 text-white/25">
          {description}
        </p>
      </div>

      <div className="pt-6">{children}</div>
    </section>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-xs text-white outline-none placeholder:text-white/15 transition focus:border-emerald-400/30 focus:bg-white/[0.035]"
      />
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
        {label}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 pr-12 text-xs text-white outline-none placeholder:text-white/15 transition focus:border-emerald-400/30"
        />

        <button
          type="button"
          onClick={() =>
            setVisible((current) => !current)
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 transition hover:text-white/60"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

function SettingSelect({
  label,
  description,
  value,
  onChange,
  options,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-medium">
          {label}
        </p>

        <p className="mt-1 max-w-md text-[10px] leading-5 text-white/25">
          {description}
        </p>
      </div>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-10 w-full rounded-xl border border-white/[0.07] bg-[#101214] px-3 text-[10px] text-white/60 outline-none transition focus:border-emerald-400/30 sm:w-[210px]"
      >
        {options.map(([optionValue, label]) => (
          <option
            key={optionValue}
            value={optionValue}
          >
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className={
        "relative h-6 w-11 shrink-0 rounded-full border transition " +
        (enabled
          ? "border-emerald-400/20 bg-emerald-400"
          : "border-white/[0.08] bg-white/[0.05]")
      }
    >
      <span
        className={
          "absolute top-1 h-4 w-4 rounded-full transition " +
          (enabled
            ? "left-6 bg-black"
            : "left-1 bg-white/30")
        }
      />
    </button>
  );
}

function ActionRow({
  icon,
  title,
  description,
  action,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.035] text-sm text-white/40">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium">
            {title}
          </p>

          <p className="mt-1 text-[10px] leading-5 text-white/25">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClick}
        className="rounded-xl border border-white/[0.07] px-4 py-2.5 text-[10px] font-medium text-white/45 transition hover:bg-white/[0.05] hover:text-white"
      >
        {action}
      </button>
    </div>
  );
}

function SaveButton({
  onClick,
  label = "Save changes",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-emerald-300"
    >
      {label}
    </button>
  );
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "SW";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}