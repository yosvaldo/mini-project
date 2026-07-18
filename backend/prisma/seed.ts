import { PrismaClient } from "../src/generated/prisma/client.js";
import type { Role, TransactionStatus } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient({} as any);

async function main() {
  console.log("Cleaning up active database tables...");
  await prisma.transaction.deleteMany({});
  await prisma.point.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

  const rawData = {
    organizers: [
      { email: "organizer1@harmonilive.id", fullName: "Harmoni Live Indonesia", passwordHash: "$2b$10$abcdefghijklmnopqrstuv", role: "ORGANIZER" as Role, referralCode: "HLI2026" },
      { email: "organizer2@nusantaraconcerts.id", fullName: "Nusantara Concerts", passwordHash: "$2b$10$abcdefghijklmnopqrstuv", role: "ORGANIZER" as Role, referralCode: "NCT2026" }
    ],
    customers: [
      { email: "andi@gmail.com", fullName: "Andi Pratama", passwordHash: "$2b$10$abcdefghijklmnopqrstuv", role: "CUSTOMER" as Role, referralCode: "ANDI01" },
      { email: "budi@gmail.com", fullName: "Budi Santoso", passwordHash: "$2b$10$abcdefghijklmnopqrstuv", role: "CUSTOMER" as Role, referralCode: "BUDI02" },
      { email: "citra@gmail.com", fullName: "Citra Lestari", passwordHash: "$2b$10$abcdefghijklmnopqrstuv", role: "CUSTOMER" as Role, referralCode: "CTRA03" },
      { email: "dimas@gmail.com", fullName: "Dimas Saputra", passwordHash: "$2b$10$abcdefghijklmnopqrstuv", role: "CUSTOMER" as Role, referralCode: "DMAS04" },
      { email: "eka@gmail.com", fullName: "Eka Putri", passwordHash: "$2b$10$abcdefghijklmnopqrstuv", role: "CUSTOMER" as Role, referralCode: "EKAP05" },
      { email: "farhan@gmail.com", fullName: "Farhan Hidayat", passwordHash: "$2b$10$abcdefghijklmnopqrstuv", role: "CUSTOMER" as Role, referralCode: "FRHN06" },
      { email: "gina@gmail.com", fullName: "Gina Maharani", passwordHash: "$2b$10$abcdefghijklmnopqrstuv", role: "CUSTOMER" as Role, referralCode: "GINA07" },
      { email: "hendra@gmail.com", fullName: "Hendra Wijaya", passwordHash: "$2b$10$abcdefghijklmnopqrstuv", role: "CUSTOMER" as Role, referralCode: "HEND08" },
      { email: "intan@gmail.com", fullName: "Intan Permata", passwordHash: "$2b$10$abcdefghijklmnopqrstuv", role: "CUSTOMER" as Role, referralCode: "INTN09" },
      { email: "joko@gmail.com", fullName: "Joko Susilo", passwordHash: "$2b$10$abcdefghijklmnopqrstuv", role: "CUSTOMER" as Role, referralCode: "JOKO10" }
    ],
    events: [
      { idx: 1, title: "Jakarta Summer Fest", location: "Jakarta", price: 750000, date: "2026-08-01" },
      { idx: 2, title: "Rock Revolution", location: "Bandung", price: 550000, date: "2026-08-05" },
      { idx: 3, title: "Jazz Under The Stars", location: "Yogyakarta", price: 450000, date: "2026-08-08" },
      { idx: 4, title: "Pop Nation Live", location: "Surabaya", price: 650000, date: "2026-08-12" },
      { idx: 5, title: "EDM Paradise", location: "Bali", price: 950000, date: "2026-08-15" },
      { idx: 6, title: "Indonesia Indie Fest", location: "Malang", price: 350000, date: "2026-08-18" },
      { idx: 7, title: "Bandung Soundwave", location: "Bandung", price: 500000, date: "2026-08-20" },
      { idx: 8, title: "Harmony of Java", location: "Semarang", price: 400000, date: "2026-08-22" },
      { idx: 9, title: "Makassar Music Night", location: "Makassar", price: 450000, date: "2026-08-25" },
      { idx: 10, title: "Medan Rhythm Fest", location: "Medan", price: 550000, date: "2026-08-28" },
      { idx: 11, title: "Surabaya Beats", location: "Surabaya", price: 700000, date: "2026-09-02" },
      { idx: 12, title: "Borneo Music Carnival", location: "Balikpapan", price: 500000, date: "2026-09-05" },
      { idx: 13, title: "Lombok Sunset Concert", location: "Lombok", price: 650000, date: "2026-09-08" },
      { idx: 14, title: "Festival Harmoni Nusantara", location: "Jakarta", price: 800000, date: "2026-09-10" },
      { idx: 15, title: "Acoustic Evening", location: "Bogor", price: 300000, date: "2026-09-12" },
      { idx: 16, title: "Dream Pop Festival", location: "Bekasi", price: 600000, date: "2026-09-15" },
      { idx: 17, title: "Night Vibes Concert", location: "Depok", price: 500000, date: "2026-09-18" },
      { idx: 18, title: "Indonesia Rock Arena", location: "Jakarta", price: 900000, date: "2026-09-20" },
      { idx: 19, title: "City Music Experience", location: "Tangerang", price: 450000, date: "2026-09-22" },
      { idx: 20, title: "Festival Bintang Timur", location: "Manado", price: 500000, date: "2026-09-25" },
      { idx: 21, title: "Colorful Sounds", location: "Padang", price: 400000, date: "2026-09-28" },
      { idx: 22, title: "Soul & Blues Night", location: "Palembang", price: 450000, date: "2026-10-01" },
      { idx: 23, title: "Mega Pop Show", location: "Jakarta", price: 850000, date: "2026-10-05" },
      { idx: 24, title: "Festival Cinta Musik", location: "Bandung", price: 600000, date: "2026-10-08" },
      { idx: 25, title: "Electro Wave", location: "Surabaya", price: 700000, date: "2026-10-10" },
      { idx: 26, title: "Golden Melody Fest", location: "Yogyakarta", price: 550000, date: "2026-10-12" },
      { idx: 27, title: "Symphony Indonesia", location: "Semarang", price: 500000, date: "2026-10-15" },
      { idx: 28, title: "Kalimantan Live", location: "Samarinda", price: 450000, date: "2026-10-18" },
      { idx: 29, title: "The Ultimate Concert", location: "Jakarta", price: 1000000, date: "2026-10-22" },
      { idx: 30, title: "Closing Music Carnival", location: "Bali", price: 1200000, date: "2026-10-30" }
    ],
    transactions: [
      { idx: 1, organizerIdx: 1, customerIdx: 1, eventIdx: 1 },
      { idx: 2, organizerIdx: 2, customerIdx: 2, eventIdx: 2 },
      { idx: 3, organizerIdx: 1, customerIdx: 3, eventIdx: 3 },
      { idx: 4, organizerIdx: 2, customerIdx: 4, eventIdx: 4 },
      { idx: 5, organizerIdx: 1, customerIdx: 5, eventIdx: 5 },
      { idx: 6, organizerIdx: 2, customerIdx: 6, eventIdx: 6 },
      { idx: 7, organizerIdx: 1, customerIdx: 7, eventIdx: 7 },
      { idx: 8, organizerIdx: 2, customerIdx: 8, eventIdx: 8 },
      { idx: 9, organizerIdx: 1, customerIdx: 9, eventIdx: 9 },
      { idx: 10, organizerIdx: 2, customerIdx: 10, eventIdx: 10 },
      { idx: 11, organizerIdx: 1, customerIdx: 2, eventIdx: 11 },
      { idx: 12, organizerIdx: 2, customerIdx: 3, eventIdx: 12 },
      { idx: 13, organizerIdx: 1, customerIdx: 4, eventIdx: 13 },
      { idx: 14, organizerIdx: 2, customerIdx: 5, eventIdx: 14 },
      { idx: 15, organizerIdx: 1, customerIdx: 6, eventIdx: 15 },
      { idx: 16, organizerIdx: 2, customerIdx: 7, eventIdx: 16 },
      { idx: 17, organizerIdx: 1, customerIdx: 8, eventIdx: 17 },
      { idx: 18, organizerIdx: 2, customerIdx: 9, eventIdx: 18 },
      { idx: 19, organizerIdx: 1, customerIdx: 10, eventIdx: 19 },
      { idx: 20, organizerIdx: 2, customerIdx: 1, eventIdx: 20 },
      { idx: 21, organizerIdx: 1, customerIdx: 3, eventIdx: 21 },
      { idx: 22, organizerIdx: 2, customerIdx: 4, eventIdx: 22 },
      { idx: 23, organizerIdx: 1, customerIdx: 5, eventIdx: 23 },
      { idx: 24, organizerIdx: 2, customerIdx: 6, eventIdx: 24 },
      { idx: 25, organizerIdx: 1, customerIdx: 7, eventIdx: 25 },
      { idx: 26, organizerIdx: 2, customerIdx: 8, eventIdx: 26 },
      { idx: 27, organizerIdx: 1, customerIdx: 9, eventIdx: 27 },
      { idx: 28, organizerIdx: 2, customerIdx: 10, eventIdx: 28 },
      { idx: 29, organizerIdx: 1, customerIdx: 1, eventIdx: 29 },
      { idx: 30, organizerIdx: 2, customerIdx: 2, eventIdx: 30 }
    ]
  };

  console.log("Seeding organizers...");
  const orgMap: Record<number, string> = {};
  let oIdx = 1;
  for (const org of rawData.organizers) {
    const created = await prisma.user.create({
      data: {
        fullName: org.fullName,
        email: org.email,
        password: org.passwordHash,
        role: org.role,
        referralCode: org.referralCode,
      },
    });
    orgMap[oIdx] = created.id;
    oIdx++;
  }

  console.log("Seeding customers...");
  const custMap: Record<number, string> = {};
  let cIdx = 1;
  for (const cust of rawData.customers) {
    const created = await prisma.user.create({
      data: {
        fullName: cust.fullName,
        email: cust.email,
        password: cust.passwordHash,
        role: cust.role,
        referralCode: cust.referralCode,
      },
    });
    custMap[cIdx] = created.id;
    cIdx++;
  }

  console.log("Seeding regional events...");
  const eventMap: Record<number, string> = {};
  for (const ev of rawData.events) {
    const assignedOrgId = ev.idx % 2 === 0 ? orgMap[2] : orgMap[1];
    const created = await prisma.event.create({
      data: {
        organizerId: assignedOrgId, 
        name: ev.title,
        price: ev.price,
        type: "PAID" as any, 
        date: new Date(`${ev.date}T19:00:00Z`),
        location: ev.location,
        description: `Official regional live presentation of ${ev.title} in ${ev.location}.`,
        seats: 300,
      },
    });
    eventMap[ev.idx] = created.id;
  }

  console.log("Seeding historical client transactions...");
  for (const tx of rawData.transactions) {
    const targetEventPrice = rawData.events.find((e) => e.idx === tx.eventIdx)?.price || 0;
    await prisma.transaction.create({
      data: {
        userId: custMap[tx.customerIdx],
        eventId: eventMap[tx.eventIdx],
        quantity: 1,
        basePrice: targetEventPrice,
        discount: 0,
        finalPrice: targetEventPrice,
        status: (tx.idx % 5 === 0 ? "PENDING" : "DONE") as TransactionStatus,
        paymentProof: "https://example.com/proof.jpg",
      },
    });
  }

  console.log("Database successfully populated with professional data records, bro!");
}

main()
  .catch((e) => {
    console.error("Error during seeding process execution:", e);
    (globalThis as any).process.exit(1); 
  })
  .finally(async () => {
    await prisma.$disconnect();
  });