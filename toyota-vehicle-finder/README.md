# Toyota Vehicle Finder

A full-stack web application for searching, comparing, and financing Toyota vehicles.

## Features

- 🔍 **Vehicle Search**: Filter by model, price, drivetrain, and fuel economy
- 📊 **Comparison Tool**: Compare up to 3 vehicles side-by-side
- 💰 **Finance Calculator**: Calculate loan and lease payments
- ❤️ **Favorites**: Save and track your favorite vehicles
- 📱 **Responsive Design**: Mobile-friendly interface with Toyota-inspired styling

## Tech Stack

- **Backend**: Python FastAPI with SQLite database
- **Frontend**: Next.js 14 with TypeScript, TailwindCSS, and shadcn/ui
- **Deployment**: Configured for Vercel (frontend) and Render/Railway (backend)

## Quick Start

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Project Structure

```
toyota-vehicle-finder/
├── backend/           # FastAPI backend
├── frontend/          # Next.js frontend
└── README.md
```

## Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import to Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL`

### Backend (Render/Railway)
1. Push to GitHub
2. Deploy with Docker or Python environment
3. Set environment variables as needed

## License

MIT
