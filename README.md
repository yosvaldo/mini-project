# 🎟️ Eventura — Event Management & Ticketing Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Railway](https://img.shields.io/badge/Railway-131415?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/)

**Eventura** is a full-stack web application designed for organizing events, managing ticket purchases, applying dynamic referral incentives, and processing payment verifications with automated email notifications.

---

## ✨ Features

### 👤 User & Auth Management
- **Role-Based Access Control (RBAC):** Customer and Event Organizer account types.
- **Referral System:** Automatically generates a unique referral code for every registering user.
- **Incentive Engine:** 
  - Referrers earn **10,000 reward points** (valid for 3 months).
  - Reffered new users receive a **10% discount coupon** (valid for 3 months).

### 🎫 Event & Transaction Pipeline
- **Dynamic City & Category Filtering:** Search and filter upcoming live concerts and events by city with dynamic empty state handling.
- **Backend Checkout Calculation:** Secure server-side calculation for base prices, coupon discounts, and point deductions (prevents price manipulation).
- **Payment Proof Uploads:** Cloudinary CDN integration for payment receipt management.
- **Organizer Verification Dashboard:** Organizers can verify payment proofs and update transaction statuses (`PENDING`, `DONE`, or `REJECTED`).
- **Inventory & Balance Recovery:** Rejection automatically restores event seats, unused coupons, and point balances.

### 📧 Email Notifications
- **Handlebars Template Engine:** Modular, responsive HTML email rendering.
- **Nodemailer Integration:** Automated transactional email delivery for:
  - Welcome emails containing registration bonuses & unique referral codes.
  - Payment proof submission confirmations.
  - Approved ticket pass confirmations featuring full transaction summaries.

---

## 🛠️ Tech Stack & Deployment Architecture

### **Frontend & Interface**
* **Framework:** React.js, React Router DOM
* **State Management:** Zustand
* **Styling & UI:** Tailwind CSS, Lucide React Icons
* **Document Head:** React Helmet Async
* **Hosting Platform:** [Vercel](https://vercel.com/)

### **Backend Service**
* **Runtime & Framework:** Node.js, Express.js (TypeScript)
* **Architecture:** RESTful APIs, Service-Controller Pattern, Middleware Chain
* **Validation:** Zod Schema Validation
* **Templating & Mailing:** Handlebars, Nodemailer via SMTP
* **Hosting Platform:** [Railway](https://railway.app/)

### **Database & Infrastructure**
* **Database:** Managed PostgreSQL on [Neon.tech](https://neon.tech/) (Serverless Postgres)
* **ORM:** Prisma ORM
* **Media Storage:** [Cloudinary](https://cloudinary.com/) (Payment receipts & event banners)
