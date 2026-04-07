import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: "postgresql://postgres:postgres123@localhost:5432/expense_tracker",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.category.deleteMany();
  console.log("Categories cleared!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());