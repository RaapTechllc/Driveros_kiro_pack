# DriverOS - Quick Start Guide

**Get running in under 5 minutes!** ⚡

---

## 🚀 One-Click Deploy (Recommended)

**Using Docker (easiest):**

```bash
# 1. Clone the repo
git clone https://github.com/RaapTechllc/Driveros_kiro_pack.git
cd Driveros_kiro_pack

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Start everything (app + database + redis)
npm run docker:up

# 4. Seed demo data
npm run seed

# 5. Open http://localhost:4005
```

**Done!** Login with: `demo@driveros.app` / `Demo123!@#`

---

## 💻 Local Development (Manual)

**Prerequisites:**
- Node.js 20+
- PostgreSQL
- Redis (optional)

```bash
# 1. Install dependencies
npm install

# 2. Set up database
# Configure DATABASE_URL in .env.local

# 3. Seed demo data
npm run seed

# 4. Start dev server
npm run dev

# 5. Open http://localhost:4005
```

---

## 🎬 Demo Mode

**For judges/investors:**

```bash
# Reset to fresh demo state (perfect for back-to-back demos)
npm run reset

# This will:
# - Clear all data
# - Create demo organization
# - Seed sample data
# - Set up test user (demo@driveros.app / Demo123!@#)
```

**Demo Credentials:**
- Email: `demo@driveros.app`
- Password: `Demo123!@#`

**Demo includes:**
- Organization: "Racer's Edge Motorsports"
- North Star: $5M ARR target
- 3 sample actions (planned, in-progress, completed)
- 2 weekly check-ins with progress
- 3 guardrails (all green)

---

## 🧪 Testing

```bash
# Run all unit tests (212 tests)
npm run test

# Run E2E tests (66 tests)
npm run test:e2e

# Interactive E2E
npm run test:e2e:ui
```

---

## 🛠️ Docker Commands

```bash
# Start services
npm run docker:up

# Stop services
npm run docker:down

# Rebuild and start
npm run docker:build

# View logs
docker-compose logs -f app

# Reset everything
docker-compose down -v && npm run docker:up && npm run seed
```

---

## 📊 Monitoring

**Health Check:**
```bash
curl http://localhost:4005/api/health
```

**Database Connection:**
- Host: localhost
- Port: 5432
- Database: driveros
- User: driveros

**Redis:**
- Host: localhost
- Port: 6379

---

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Change port in docker-compose.yml or:
export PORT=4006
npm run dev
```

**Database connection failed:**
```bash
# Check DATABASE_URL in .env.local
# Ensure PostgreSQL is running
docker-compose ps
```

**Seed data failed:**
```bash
# Check Supabase credentials
# Ensure SUPABASE_SERVICE_ROLE_KEY is set
# Try resetting: npm run reset
```

---

## 📚 Next Steps

- **Documentation:** See [README.md](./README.md)
- **Development Log:** See [DEVLOG.md](./DEVLOG.md)
- **Testing:** See [HACKATHON_REVIEW.md](./HACKATHON_REVIEW.md)
- **Architecture:** See `.kiro/` folder for prompts

---

## 🎯 Quick Demo Script

**3-minute walkthrough for judges:**

1. **Login** (demo@driveros.app)
2. **Dashboard** - Show North Star progress (56% to $5M)
3. **Flash Scan** - Quick business health check (30 seconds)
4. **Pit Stop** - Weekly planning with AI recommendations
5. **Guardrails** - Real-time health monitoring (all green!)
6. **Year Board** - Annual strategic planning

**Key selling points:**
- ✅ 212 unit tests passing
- ✅ 66 E2E tests
- ✅ AI-assisted development (9 custom prompts)
- ✅ WCAG 2.1 AA accessible
- ✅ Security validated (CSV injection, XSS protected)

---

**Questions?** Check [README.md](./README.md) or open an issue!
