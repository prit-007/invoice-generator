## 📁 Folder Structure

```
invoice-system/
├── api/                 # Python FastAPI backend
│   ├── app/
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic models
│   │   ├── routers/         # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── core/            # DB, settings, auth
│   │   └── main.py          # Entry point
│   └── requirements.txt     # Dependencies
│
├── pro/                # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page-level views (Invoices, Customers)
│   │   ├── services/        # API interaction logic
│   │   ├── i18n/            # English & Gujarati language files
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── supabase/                # Supabase SQL and config
│   └── schema.sql           # Full database schema (✅ saved)
│
├── README.md                # 🔽 See below
└── .env                     # Environment variables (both FE + BE)
```