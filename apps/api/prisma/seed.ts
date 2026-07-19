import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

// System default categories — visible to every user (userId = null).
// Users can additionally create their own custom categories.
const SYSTEM_CATEGORIES: { name: string; icon: string; type: TransactionType }[] = [
  { name: 'Salary', icon: 'briefcase', type: 'INCOME' },
  { name: 'Freelance', icon: 'laptop', type: 'INCOME' },
  { name: 'Investments', icon: 'trending-up', type: 'INCOME' },
  { name: 'Other Income', icon: 'plus-circle', type: 'INCOME' },

  { name: 'Groceries', icon: 'shopping-cart', type: 'EXPENSE' },
  { name: 'Dining', icon: 'utensils', type: 'EXPENSE' },
  { name: 'Rent', icon: 'home', type: 'EXPENSE' },
  { name: 'Utilities', icon: 'zap', type: 'EXPENSE' },
  { name: 'Transportation', icon: 'car', type: 'EXPENSE' },
  { name: 'Entertainment', icon: 'film', type: 'EXPENSE' },
  { name: 'Shopping', icon: 'shopping-bag', type: 'EXPENSE' },
  { name: 'Healthcare', icon: 'heart-pulse', type: 'EXPENSE' },
  { name: 'Subscriptions', icon: 'repeat', type: 'EXPENSE' },
  { name: 'Travel', icon: 'plane', type: 'EXPENSE' },
  { name: 'Education', icon: 'book-open', type: 'EXPENSE' },
  { name: 'Other Expense', icon: 'minus-circle', type: 'EXPENSE' },
];

async function main() {
  console.log('Seeding system categories...');
  let created = 0;
  for (const cat of SYSTEM_CATEGORIES) {
    // Prisma composite @@unique constraints don't match rows via `where`
    // when one of the fields is null (userId is null for system categories),
    // so a plain upsert isn't usable here — findFirst + create is the
    // correct, explicit idempotent-seed pattern for this case.
    const existing = await prisma.category.findFirst({
      where: { userId: null, name: cat.name, type: cat.type },
    });
    if (!existing) {
      await prisma.category.create({ data: { ...cat, userId: null, isSystem: true } });
      created++;
    }
  }
  console.log(`Seeded ${created} new system categories (${SYSTEM_CATEGORIES.length - created} already existed).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
