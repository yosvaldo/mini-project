import { prisma } from "../src/libs/prisma.client.js";
import type { Role, TransactionStatus } from "../src/generated/prisma/client.js";

async function main() {
  await prisma.transaction.deleteMany({});
  await prisma.point.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

  const rawData = {
    organizers: [
      { email: "organizer@harmonilive.id", fullName: "Harmoni Live Indonesia", passwordHash: "$2b$10$Rtkm34Q3D0qiakeOX3vROe8F4b5lk8hyg2DAoVnF3zfV0wzlLXSza", role: "ORGANIZER" as Role, referralCode: "HLI2026" },
      { email: "organizer@nusantaraconcerts.id", fullName: "Nusantara Concerts", passwordHash: "$2b$10$Rtkm34Q3D0qiakeOX3vROe8F4b5lk8hyg2DAoVnF3zfV0wzlLXSza", role: "ORGANIZER" as Role, referralCode: "NCT2026" }
    ],
    customers: [
      { email: "andi@gmail.com", fullName: "Andi Pratama", passwordHash: "$2b$10$yBlp0Q2gcGyuEBLZdGKQoOpT/21dbXR3Sp8EhDUu/Yo2Hu6Nxileu", role: "CUSTOMER" as Role, referralCode: "ANDI01" },
      { email: "budi@gmail.com", fullName: "Budi Santoso", passwordHash: "$2b$10$yBlp0Q2gcGyuEBLZdGKQoOpT/21dbXR3Sp8EhDUu/Yo2Hu6Nxileu", role: "CUSTOMER" as Role, referralCode: "BUDI02" },
      { email: "citra@gmail.com", fullName: "Citra Lestari", passwordHash: "$2b$10$yBlp0Q2gcGyuEBLZdGKQoOpT/21dbXR3Sp8EhDUu/Yo2Hu6Nxileu", role: "CUSTOMER" as Role, referralCode: "CTRA03" },
      { email: "dimas@gmail.com", fullName: "Dimas Saputra", passwordHash: "$2b$10$yBlp0Q2gcGyuEBLZdGKQoOpT/21dbXR3Sp8EhDUu/Yo2Hu6Nxileu", role: "CUSTOMER" as Role, referralCode: "DMAS04" },
      { email: "eka@gmail.com", fullName: "Eka Putri", passwordHash: "$2b$10$yBlp0Q2gcGyuEBLZdGKQoOpT/21dbXR3Sp8EhDUu/Yo2Hu6Nxileu", role: "CUSTOMER" as Role, referralCode: "EKAP05" },
      { email: "farhan@gmail.com", fullName: "Farhan Hidayat", passwordHash: "$2b$10$yBlp0Q2gcGyuEBLZdGKQoOpT/21dbXR3Sp8EhDUu/Yo2Hu6Nxileu", role: "CUSTOMER" as Role, referralCode: "FRHN06" },
      { email: "gina@gmail.com", fullName: "Gina Maharani", passwordHash: "$2b$10$yBlp0Q2gcGyuEBLZdGKQoOpT/21dbXR3Sp8EhDUu/Yo2Hu6Nxileu", role: "CUSTOMER" as Role, referralCode: "GINA07" },
      { email: "hendra@gmail.com", fullName: "Hendra Wijaya", passwordHash: "$2b$10$yBlp0Q2gcGyuEBLZdGKQoOpT/21dbXR3Sp8EhDUu/Yo2Hu6Nxileu", role: "CUSTOMER" as Role, referralCode: "HEND08" },
      { email: "intan@gmail.com", fullName: "Intan Permata", passwordHash: "$2b$10$yBlp0Q2gcGyuEBLZdGKQoOpT/21dbXR3Sp8EhDUu/Yo2Hu6Nxileu", role: "CUSTOMER" as Role, referralCode: "INTN09" },
      { email: "joko@gmail.com", fullName: "Joko Susilo", passwordHash: "$2b$10$yBlp0Q2gcGyuEBLZdGKQoOpT/21dbXR3Sp8EhDUu/Yo2Hu6Nxileu", role: "CUSTOMER" as Role, referralCode: "JOKO10" }
    ],
    events: [
      { idx: 1,  title: "Jakarta Summer Fest", location: "Jakarta", price: 750000, date: "2026-09-12", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489030/eventura/events_images/event-1_lf8lrr.jpg` },
      { idx: 2,  title: "Rock Revolution", location: "Bandung", price: 550000, date: "2026-09-19", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489031/eventura/events_images/event-2_dauzbs.jpg` },
      { idx: 3,  title: "Jazz Under The Stars", location: "Yogyakarta", price: 450000, date: "2026-09-26", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489032/eventura/events_images/event-3_zrs8cn.jpg` },
      { idx: 4,  title: "Pop Nation Live", location: "Surabaya", price: 650000, date: "2026-10-03", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489033/eventura/events_images/event-4_i8aulw.jpg` },
      { idx: 5,  title: "EDM Paradise", location: "Bali", price: 950000, date: "2026-10-10", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489035/eventura/events_images/event-5_pphl3m.jpg` },
      { idx: 6,  title: "Indonesia Indie Fest", location: "Yogyakarta", price: 350000, date: "2026-10-17", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489036/eventura/events_images/event-6_l7crke.jpg` },
      { idx: 7,  title: "Bandung Soundwave", location: "Bandung", price: 500000, date: "2026-10-24", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489037/eventura/events_images/event-7_kvom3k.jpg` },
      { idx: 8,  title: "Harmony of Java", location: "Surabaya", price: 400000, date: "2026-10-31", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489038/eventura/events_images/event-8_gsm7d5.jpg` },
      { idx: 9,  title: "Bali Music Night", location: "Bali", price: 450000, date: "2026-11-07", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489039/eventura/events_images/event-9_vls6wm.jpg` },
      { idx: 10, title: "Jakarta Rhythm Fest", location: "Jakarta", price: 0, date: "2026-11-14", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489040/eventura/events_images/event-10_n1pfkh.jpg` },
      { idx: 11, title: "Surabaya Beats", location: "Surabaya", price: 700000, date: "2026-11-21", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489041/eventura/events_images/event-11_qfi6ds.jpg` },
      { idx: 12, title: "Bandung Music Carnival", location: "Bandung", price: 500000, date: "2026-11-28", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489042/eventura/events_images/event-12_lfs5al.jpg` },
      { idx: 13, title: "Bali Sunset Concert", location: "Bali", price: 650000, date: "2026-12-05", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489043/eventura/events_images/event-13_p6hfwh.jpg` },
      { idx: 14, title: "Festival Harmoni Nusantara", location: "Jakarta", price: 800000, date: "2026-12-12", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489044/eventura/events_images/event-14_ejl0jl.jpg` },
      { idx: 15, title: "Acoustic Evening", location: "Yogyakarta", price: 300000, date: "2026-12-19", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489045/eventura/events_images/event-15_uoyu9p.jpg` },
      { idx: 16, title: "Dream Pop Festival", location: "Jakarta", price: 600000, date: "2026-12-26", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489046/eventura/events_images/event-16_ddnfww.jpg` },
      { idx: 17, title: "Night Vibes Concert", location: "Bandung", price: 500000, date: "2026-01-02", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489047/eventura/events_images/event-17_ktyzgr.jpg` },
      { idx: 18, title: "Indonesia Rock Arena", location: "Jakarta", price: 900000, date: "2026-01-09", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489048/eventura/events_images/event-18_au9gcg.jpg` },
      { idx: 19, title: "City Music Experience", location: "Surabaya", price: 450000, date: "2026-01-16", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489049/eventura/events_images/event-19_g6yajs.jpg` },
      { idx: 20, title: "Festival Bintang Timur", location: "Bali", price: 0, date: "2026-01-23", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489050/eventura/events_images/event-20_kwinsy.jpg` },
      { idx: 21, title: "Colorful Sounds", location: "Yogyakarta", price: 400000, date: "2026-01-30", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489051/eventura/events_images/event-21_lzohst.jpg` },
      { idx: 22, title: "Soul & Blues Night", location: "Bandung", price: 450000, date: "2026-02-06", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489052/eventura/events_images/event-22_tergqw.jpg` },
      { idx: 23, title: "Mega Pop Show", location: "Jakarta", price: 850000, date: "2026-02-13", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489053/eventura/events_images/event-23_aqflli.jpg` },
      { idx: 24, title: "Festival Cinta Musik", location: "Bandung", price: 600000, date: "2026-02-20", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489054/eventura/events_images/event-24_badnxr.jpg` },
      { idx: 25, title: "Electro Wave", location: "Surabaya", price: 700000, date: "2026-02-27", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489055/eventura/events_images/event-25_wxpjzw.jpg` },
      { idx: 26, title: "Golden Melody Fest", location: "Yogyakarta", price: 550000, date: "2026-03-06", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489056/eventura/events_images/event-26_sugijf.jpg` },
      { idx: 27, title: "Symphony Indonesia", location: "Surabaya", price: 500000, date: "2026-03-13", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489057/eventura/events_images/event-27_kkodqn.jpg` },
      { idx: 28, title: "Bali Live", location: "Bali", price: 450000, date: "2026-03-20", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489058/eventura/events_images/event-28_y9uug6.jpg` },
      { idx: 29, title: "The Ultimate Concert", location: "Jakarta", price: 1000000, date: "2026-03-27", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489059/eventura/events_images/event-29_upaxtn.jpg` },
      { idx: 30, title: "Closing Music Carnival", location: "Bali", price: 1200000, date: "2026-04-03", imageUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489060/eventura/events_images/event-30_s4xldj.jpg` }
    ],
    transactions: [
      { idx: 1,  customerIdx: 1,  eventIdx: 1,  date: "2026-06-01", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489061/eventura/payment_proofs/proof1_crgnqp.jpg` },
      { idx: 2,  customerIdx: 2,  eventIdx: 2,  date: "2026-06-03", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489062/eventura/payment_proofs/proof2_h82p1i.jpg` },
      { idx: 3,  customerIdx: 3,  eventIdx: 3,  date: "2026-06-05", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489063/eventura/payment_proofs/proof3_msat9m.jpg` },
      { idx: 4,  customerIdx: 4,  eventIdx: 4,  date: "2026-06-07", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489064/eventura/payment_proofs/proof4_ondusa.jpg` },
      { idx: 5,  customerIdx: 5,  eventIdx: 5,  date: "2026-06-09", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489065/eventura/payment_proofs/proof5_ao5b5d.jpg` },
      { idx: 6,  customerIdx: 6,  eventIdx: 6,  date: "2026-06-11", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489066/eventura/payment_proofs/proof6_lezaz1.jpg` },
      { idx: 7,  customerIdx: 7,  eventIdx: 7,  date: "2026-06-13", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489067/eventura/payment_proofs/proof7_disowi.jpg` },
      { idx: 8,  customerIdx: 8,  eventIdx: 8,  date: "2026-06-15", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489068/eventura/payment_proofs/proof8_sdmycg.jpg` },
      { idx: 9,  customerIdx: 9,  eventIdx: 9,  date: "2026-06-17", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489069/eventura/payment_proofs/proof9_gy6oa9.jpg` },
      { idx: 10, customerIdx: 10, eventIdx: 10, date: "2026-06-19", status: "DONE", proofUrl: null },
      { idx: 11, customerIdx: 2,  eventIdx: 11, date: "2026-06-21", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489070/eventura/payment_proofs/proof11_yvw0dr.jpg` },
      { idx: 12, customerIdx: 3,  eventIdx: 12, date: "2026-06-23", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489071/eventura/payment_proofs/proof12_td7jkh.jpg` },
      { idx: 13, customerIdx: 4,  eventIdx: 13, date: "2026-06-25", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489072/eventura/payment_proofs/proof13_csq7yh.jpg` },
      { idx: 14, customerIdx: 5,  eventIdx: 14, date: "2026-06-27", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489073/eventura/payment_proofs/proof14_pryne6.jpg` },
      { idx: 15, customerIdx: 6,  eventIdx: 15, date: "2026-06-29", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489074/eventura/payment_proofs/proof15_hnvqrz.jpg` },
      { idx: 16, customerIdx: 7,  eventIdx: 16, date: "2026-07-02", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489075/eventura/payment_proofs/proof16_pgottf.jpg` },
      { idx: 17, customerIdx: 8,  eventIdx: 17, date: "2026-07-04", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489076/eventura/payment_proofs/proof17_z2jvix.jpg` },
      { idx: 18, customerIdx: 9,  eventIdx: 18, date: "2026-07-06", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489077/eventura/payment_proofs/proof18_hnm5vy.jpg` },
      { idx: 19, customerIdx: 10, eventIdx: 19, date: "2026-07-08", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489078/eventura/payment_proofs/proof19_dhi0u9.jpg` },
      { idx: 20, customerIdx: 1,  eventIdx: 20, date: "2026-07-10", status: "DONE", proofUrl: null },
      { idx: 21, customerIdx: 3,  eventIdx: 21, date: "2026-07-12", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489079/eventura/payment_proofs/proof21_l9uhbh.jpg` },
      { idx: 22, customerIdx: 4,  eventIdx: 22, date: "2026-07-14", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489080/eventura/payment_proofs/proof22_tl8v4j.jpg` },
      { idx: 23, customerIdx: 5,  eventIdx: 23, date: "2026-07-16", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489080/eventura/payment_proofs/proof23_skipwo.jpg` },
      { idx: 24, customerIdx: 6,  eventIdx: 24, date: "2026-07-18", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489081/eventura/payment_proofs/proof24_dsodya.jpg` },
      { idx: 25, customerIdx: 7,  eventIdx: 25, date: "2026-07-20", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489082/eventura/payment_proofs/proof25_zknjvo.jpg` },
      { idx: 26, customerIdx: 8,  eventIdx: 26, date: "2026-07-22", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489083/eventura/payment_proofs/proof26_vjwbqk.jpg` },
      { idx: 27, customerIdx: 9,  eventIdx: 27, date: "2026-07-24", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489084/eventura/payment_proofs/proof27_ipqbaf.jpg` },
      { idx: 28, customerIdx: 10, eventIdx: 28, date: "2026-07-26", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489085/eventura/payment_proofs/proof28_ls2a5y.jpg` },
      { idx: 29, customerIdx: 1,  eventIdx: 29, date: "2026-07-28", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489086/eventura/payment_proofs/proof29_rlz3oh.jpg` },
      { idx: 30, customerIdx: 2,  eventIdx: 30, date: "2026-07-30", status: "DONE", proofUrl: `https://res.cloudinary.com/jkqcg6ur/image/upload/v1785489087/eventura/payment_proofs/proof30_f3f6zq.jpg` }
    ]
  };

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

  const eventMap: Record<number, string> = {};
  for (const ev of rawData.events) {
    const assignedOrgId = ev.idx % 2 === 0 ? orgMap[2] : orgMap[1];
    const created = await prisma.event.create({
      data: {
        organizerId: assignedOrgId,
        name: ev.title,
        price: ev.price,
        type: ev.price > 0 ? "PAID" : "FREE",
        date: new Date(`${ev.date}T19:00:00Z`),
        location: ev.location,
        seats: 300,
        imageUrl: ev.imageUrl,
      },
    });
    eventMap[ev.idx] = created.id;
  }

  for (const tx of rawData.transactions) {
    const targetEvent = rawData.events.find((e) => e.idx === tx.eventIdx);
    const targetEventPrice = targetEvent?.price || 0;
    const isFreeEvent = targetEventPrice === 0;

    await prisma.transaction.create({
      data: {
        userId: custMap[tx.customerIdx],
        eventId: eventMap[tx.eventIdx],
        quantity: 1,
        basePrice: targetEventPrice,
        discount: 0,
        finalPrice: targetEventPrice,
        status: isFreeEvent ? "DONE" : (tx.status as TransactionStatus),
        paymentProof: isFreeEvent ? null : tx.proofUrl,
        createdAt: new Date(`${tx.date}T10:00:00Z`),
      },
    });
  }
}

main()
  .catch((e) => {
    console.error("Error during seeding process execution:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });