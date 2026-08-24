import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, PaymentMethod, TransactionType } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});
async function main() {
  console.log("🌱 Seeding SpendWise database...");

  const user = await prisma.user.upsert({
    where: {
      email: "demo@spendwise.app",
    },
    update: {},
    create: {
      email: "demo@spendwise.app",
      name: "Demo User",
    },
  });

  const categoryData = [
    { name: "Food & Drinks", icon: "🍔", color: "#10b981" },
    { name: "Transport", icon: "🚕", color: "#3b82f6" },
    { name: "Entertainment", icon: "🎬", color: "#a855f7" },
    { name: "Shopping", icon: "🛍️", color: "#f59e0b" },
    { name: "Bills", icon: "📱", color: "#ef4444" },
    { name: "Education", icon: "🎓", color: "#6366f1" },
    { name: "Health", icon: "💊", color: "#ec4899" },
    { name: "Income", icon: "💰", color: "#22c55e" },
  ];

 const categories: Awaited<ReturnType<typeof prisma.category.upsert>>[] = [];

  for (const category of categoryData) {
    const created = await prisma.category.upsert({
      where: {
        name: category.name,
      },
      update: {
        icon: category.icon,
        color: category.color,
      },
      create: category,
    });

    categories.push(created);
  }

  const category = (name: string) => {
    const found = categories.find((item) => item.name === name);

    if (!found) {
      throw new Error(`Category "${name}" not found`);
    }

    return found;
  };

  await prisma.transaction.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.budget.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.goal.deleteMany({
    where: {
      userId: user.id,
    },
  });

  const transactions = [
    {
      amount: 58400,
      type: TransactionType.INCOME,
      description: "Freelance Payment",
      date: new Date("2026-08-22T10:00:00"),
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      categoryId: category("Income").id,
    },
    {
      amount: 280,
      type: TransactionType.EXPENSE,
      description: "Starbucks Coffee",
      date: new Date("2026-08-23T10:42:00"),
      paymentMethod: PaymentMethod.UPI,
      categoryId: category("Food & Drinks").id,
    },
    {
      amount: 420,
      type: TransactionType.EXPENSE,
      description: "Uber",
      date: new Date("2026-08-23T08:15:00"),
      paymentMethod: PaymentMethod.UPI,
      categoryId: category("Transport").id,
    },
    {
      amount: 649,
      type: TransactionType.EXPENSE,
      description: "Netflix",
      date: new Date("2026-08-22T20:30:00"),
      paymentMethod: PaymentMethod.CARD,
      categoryId: category("Entertainment").id,
    },
    {
      amount: 1250,
      type: TransactionType.EXPENSE,
      description: "Amazon Shopping",
      date: new Date("2026-08-21T14:20:00"),
      paymentMethod: PaymentMethod.CARD,
      categoryId: category("Shopping").id,
    },
    {
      amount: 850,
      type: TransactionType.EXPENSE,
      description: "Electricity Bill",
      date: new Date("2026-08-20T11:00:00"),
      paymentMethod: PaymentMethod.UPI,
      categoryId: category("Bills").id,
    },
    {
      amount: 650,
      type: TransactionType.EXPENSE,
      description: "College Course",
      date: new Date("2026-08-19T16:45:00"),
      paymentMethod: PaymentMethod.UPI,
      categoryId: category("Education").id,
    },
    {
      amount: 450,
      type: TransactionType.EXPENSE,
      description: "Lunch",
      date: new Date("2026-08-18T13:15:00"),
      paymentMethod: PaymentMethod.CASH,
      categoryId: category("Food & Drinks").id,
    },
    {
      amount: 380,
      type: TransactionType.EXPENSE,
      description: "Metro",
      date: new Date("2026-08-17T09:20:00"),
      paymentMethod: PaymentMethod.UPI,
      categoryId: category("Transport").id,
    },
  ];

  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: {
        ...transaction,
        userId: user.id,
      },
    });
  }

  const budgets = [
    {
      amount: 5000,
      month: 8,
      year: 2026,
      categoryId: category("Food & Drinks").id,
    },
    {
      amount: 3500,
      month: 8,
      year: 2026,
      categoryId: category("Transport").id,
    },
    {
      amount: 2500,
      month: 8,
      year: 2026,
      categoryId: category("Entertainment").id,
    },
    {
      amount: 5000,
      month: 8,
      year: 2026,
      categoryId: category("Shopping").id,
    },
  ];

  for (const budget of budgets) {
    await prisma.budget.create({
      data: {
        ...budget,
        userId: user.id,
      },
    });
  }

  await prisma.goal.create({
    data: {
      name: "New MacBook Pro",
      target: 150000,
      current: 82500,
      deadline: new Date("2026-12-31"),
      description: "Savings goal for a new MacBook Pro",
      userId: user.id,
    },
  });

  console.log("✅ SpendWise database seeded successfully.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });