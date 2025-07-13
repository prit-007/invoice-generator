# 🧾 Invoice Management System (Admin Panel)

A full-stack automation system to generate, manage, and track customer invoices, payments, and product maintenance — supporting multilingual UI (English + Gujarati).

---

## 📦 Tech Stack

| Layer     | Technology       |
|-----------|------------------|
| Frontend  | React + i18next  |
| Backend   | Python + FastAPI |
| Database  | Supabase (PostgreSQL) |
| Hosting   | Vercel / Railway / Render |

---

## ✅ Core Features

- 👥 Manage customers with billing/shipping info
- 📄 Generate invoices using dynamic product entries
- 💰 Accept and track payments (partial, refund, advance)
- 📈 View outstanding balances per customer
- 📊 Dashboard: Total revenue, dues, profits
- 🛠️ Track maintenance costs by product
- 🌐 Multilingual UI (English/Gujarati)

---

## 📁 Project Structure

- `backend/`: FastAPI server with REST APIs
- `frontend/`: React admin dashboard with invoice preview
- `supabase/`: PostgreSQL schema (used with Supabase)

---

## 🚀 Getting Started

### 🧠 Prerequisites

- Node.js, Python 3.10+, Supabase CLI
- Supabase project set up with your SQL schema

### 🔧 Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
````

### 🌐 Frontend

```bash
cd frontend
npm install
npm run dev
```

### ⚙️ Environment (.env)

```
SUPABASE_URL=...
SUPABASE_KEY=...
API_BASE_URL=http://localhost:8000
```

---

## ✨ Roadmap

* [ ] Email & WhatsApp invoice delivery
* [ ] AI assistant for dashboard reports (via Gemini/GPT)
* [ ] Scheduled auto-generation of invoices
* [ ] Login/auth with Supabase or custom JWT

---

## 📚 Credits

Built by [Developer’s Paradise](https://github.com/prit-007) to help agencies streamline their billing workflows.
