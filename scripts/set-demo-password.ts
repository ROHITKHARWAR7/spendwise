import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const email = "demo@spendwise.app";
  const password = "demo12345";

  const hashedPassword = await bcrypt.hash(
    password,
    12
  );

  const user = await prisma.user.update({
    where: {
      email,
    },
    data: {
      password: hashedPassword,
    },
  });

  console.log("Password set successfully.");
  console.log("User:", user.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });