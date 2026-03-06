import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 管理者ユーザー作成
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "管理者",
      hashedPassword: adminPassword,
      role: "ADMIN",
    },
  });

  // 営業ユーザー作成
  const salesPassword = await hash("sales123", 12);
  const sales1 = await prisma.user.upsert({
    where: { email: "tanaka@example.com" },
    update: {},
    create: {
      email: "tanaka@example.com",
      name: "田中太郎",
      hashedPassword: salesPassword,
      role: "USER",
    },
  });

  const sales2 = await prisma.user.upsert({
    where: { email: "suzuki@example.com" },
    update: {},
    create: {
      email: "suzuki@example.com",
      name: "鈴木花子",
      hashedPassword: salesPassword,
      role: "USER",
    },
  });

  // 取引先作成
  const accounts = await Promise.all([
    prisma.account.create({
      data: {
        name: "株式会社ABC商事",
        industry: "商社",
        phone: "03-1234-5678",
        website: "https://abc-shoji.example.com",
        address: "千代田区丸の内1-1-1",
        city: "東京都",
        prefecture: "東京都",
        postalCode: "100-0001",
        annualRevenue: 5000000000,
        employees: 500,
        rating: "HOT",
        ownerId: sales1.id,
      },
    }),
    prisma.account.create({
      data: {
        name: "株式会社テック・イノベーション",
        industry: "IT",
        phone: "06-9876-5432",
        website: "https://tech-innovation.example.com",
        address: "北区梅田2-2-2",
        city: "大阪市",
        prefecture: "大阪府",
        postalCode: "530-0001",
        annualRevenue: 1200000000,
        employees: 150,
        rating: "WARM",
        ownerId: sales1.id,
      },
    }),
    prisma.account.create({
      data: {
        name: "東海建設株式会社",
        industry: "建設",
        phone: "052-111-2222",
        address: "中村区名駅3-3-3",
        city: "名古屋市",
        prefecture: "愛知県",
        postalCode: "450-0002",
        annualRevenue: 8000000000,
        employees: 1200,
        rating: "HOT",
        ownerId: sales2.id,
      },
    }),
    prisma.account.create({
      data: {
        name: "九州食品株式会社",
        industry: "食品",
        phone: "092-333-4444",
        address: "博多区博多駅前4-4-4",
        city: "福岡市",
        prefecture: "福岡県",
        postalCode: "812-0011",
        annualRevenue: 3000000000,
        employees: 800,
        rating: "COLD",
        ownerId: sales2.id,
      },
    }),
  ]);

  // 取引先責任者作成
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        firstName: "一郎",
        lastName: "山田",
        email: "yamada@abc-shoji.example.com",
        phone: "03-1234-5679",
        title: "部長",
        department: "営業部",
        accountId: accounts[0].id,
        ownerId: sales1.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "美咲",
        lastName: "佐藤",
        email: "sato@tech-innovation.example.com",
        phone: "06-9876-5433",
        title: "課長",
        department: "情報システム部",
        accountId: accounts[1].id,
        ownerId: sales1.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "健太",
        lastName: "高橋",
        email: "takahashi@tokai-kensetsu.example.com",
        phone: "052-111-2223",
        title: "取締役",
        department: "経営企画室",
        accountId: accounts[2].id,
        ownerId: sales2.id,
      },
    }),
  ]);

  // 商談作成
  await Promise.all([
    prisma.opportunity.create({
      data: {
        name: "ABC商事 基幹システム導入",
        amount: 50000000,
        stage: "PROPOSAL",
        probability: 60,
        closeDate: new Date("2026-06-30"),
        accountId: accounts[0].id,
        ownerId: sales1.id,
      },
    }),
    prisma.opportunity.create({
      data: {
        name: "テック・イノベーション DX支援",
        amount: 30000000,
        stage: "NEGOTIATION",
        probability: 80,
        closeDate: new Date("2026-04-30"),
        accountId: accounts[1].id,
        ownerId: sales1.id,
      },
    }),
    prisma.opportunity.create({
      data: {
        name: "東海建設 施工管理システム",
        amount: 80000000,
        stage: "NEEDS_ANALYSIS",
        probability: 40,
        closeDate: new Date("2026-09-30"),
        accountId: accounts[2].id,
        ownerId: sales2.id,
      },
    }),
    prisma.opportunity.create({
      data: {
        name: "九州食品 在庫管理クラウド",
        amount: 15000000,
        stage: "CLOSED_WON",
        probability: 100,
        closeDate: new Date("2026-02-28"),
        accountId: accounts[3].id,
        ownerId: sales2.id,
      },
    }),
  ]);

  // リード作成
  await Promise.all([
    prisma.lead.create({
      data: {
        firstName: "次郎",
        lastName: "伊藤",
        email: "ito@newcompany.example.com",
        phone: "03-5555-6666",
        company: "ニューカンパニー株式会社",
        title: "マネージャー",
        status: "NEW",
        source: "WEB",
        industry: "サービス",
        ownerId: sales1.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: "三郎",
        lastName: "渡辺",
        email: "watanabe@startup.example.com",
        phone: "06-7777-8888",
        company: "スタートアップ合同会社",
        title: "代表",
        status: "CONTACTED",
        source: "REFERRAL",
        industry: "IT",
        ownerId: sales2.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: "由美",
        lastName: "中村",
        email: "nakamura@bigcorp.example.com",
        phone: "052-9999-0000",
        company: "ビッグコープ株式会社",
        title: "部長",
        status: "WORKING",
        source: "TRADE_SHOW",
        industry: "製造",
        ownerId: sales1.id,
      },
    }),
  ]);

  console.log("Seed completed successfully!");
  console.log("---");
  console.log("ログイン情報:");
  console.log("  管理者: admin@example.com / admin123");
  console.log("  営業1: tanaka@example.com / sales123");
  console.log("  営業2: suzuki@example.com / sales123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
