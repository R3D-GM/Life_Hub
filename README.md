# LifeHub

### A personal Life Operating System for tracking, understanding, and improving everyday life.

LifeHub started with a simple question:

> **Why can't I have one place to track the different parts of my life?**

I wanted to become more productive and actually understand how I was spending my time and taking care of myself. I tried using different apps, but they usually focused on only one thing — habits, tasks, fitness, finance, or studying.

I wanted something that connected all of these things together.

So instead of looking for another app, I decided to build one.

**LifeHub** is my idea of a personal Life Operating System — a place where I can track the things that matter to me in one system, from the water I drink and the sleep I get to the courses I take, the skills I am learning, my goals, finances, habits, and more.

What started as an idea became a project that I found genuinely interesting to build. I especially liked the idea that small things from everyday life could become useful data over time.

For example, I can:

- 💧 Log the water I drink
- 😴 Track my sleep and automatically calculate sleep duration
- 🎓 Add the university courses I am taking and track their tasks
- 🧠 Track the skills I am learning and my progress
- 🎯 Create goals and break them into milestones
- 📚 Record learning sessions
- 💰 Track income and expenses
- 🔄 Track habits and their streaks
- 🍽️ Record meals and nutrition
- 🏃 Track movement and physical activity
- 📊 See weekly insights about my life
- 📱 Use it from both my computer and phone
- 📴 Continue logging when offline and sync later

The goal is not to make life feel like a spreadsheet.

The goal is to make it easier to **see where my time, energy, money, learning, and attention are going — all in one place.**

---

## ✨ Why I Built LifeHub

I built LifeHub because I wanted a system that was **personal, connected, and actually useful to me**.

Instead of having:

- one app for studying,
- another for habits,
- another for finances,
- another for fitness,
- another for goals,

I wanted to ask:

> **What if all of these parts of life could live together?**

That idea became LifeHub.

It is also a project where I can experiment with things I am learning as a Software Engineering student, while gradually turning the application into something more intelligent.

The long-term vision is for LifeHub to become more than a tracker.

I want it to eventually understand patterns across different parts of life and help me make better decisions about my time, learning, health, goals, and productivity.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Offline storage:** Dexie
- **Backend:** Node.js + TypeScript + Express
- **Database:** PostgreSQL
- **Database access:** `pg` (node-postgres) with parameterized SQL
- **Authentication:** Email/password + JWT
- **Deployment:** Docker Compose
- **PWA:** Service worker + web app manifest

### Database note

The original plan used Prisma. The backend was ultimately built with `pg` (node-postgres) and hand-written parameterized SQL because Prisma's native engine binary could not be downloaded in the build environment.

The application currently uses the SQL migration:

`backend/migrations/001_init.sql`

A Prisma schema is also included as a reference:

`backend/src/prisma/schema.prisma`

Migrating the service layer to Prisma Client is a possible future improvement.

---

## 🚀 Local Development

### 1. PostgreSQL

Install PostgreSQL locally or use Docker.

Create a database matching your `backend/.env` configuration and apply the schema:

```bash
psql "postgresql://postgres:postgres@127.0.0.1:5432/lifehub" -f backend/migrations/001_init.sql"# Life_Hub" 
