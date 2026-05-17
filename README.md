# Velora | Team Task Manager

**A Professional Task Management Platform for Modern Teams.**

Velora is a clean, efficient project management platform designed to help teams stay organized and productive. Built for speed, clarity, and high-performance collaboration.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Velora_Web-6366f1?style=for-the-badge)](https://ais-pre-2i673tjzmbphrtmobnpm4o-818376986416.asia-east1.run.app)

## 🚀 Vision
In an era of fragmented communication, Velora provides the tools to connect individual tasks to overall project health. Our dual-dashboard architecture ensures that Administrators maintain oversight while Team Members stay focused on their assigned tasks.

## ✨ Core Features
- **Admin Dashboard:** Real-time metrics and team workload analysis for managers.
- **Member Dashboard:** Personalized task list with progress tracking.
- **Task Kanban:** Professional drag-and-drop task management with priority levels.
- **Project Management:** Centralized hubs for project collaboration and resource allocation.
- **Reports & Insights:** Data visualization for productivity and trend analysis.
- **Customizable UI:** Professional dark and light themes with customizable accent colors.

## 🛠 Tech Stack
- **Frontend:** React 18+, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Data Viz:** Recharts, D3
- **State:** React Hooks + LocalStorage Persistence

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/velora.git
   cd velora
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Launch dev environment:**
   ```bash
   npm run dev
   ```

## 📄 Documentation
For the full Software Requirements Specification and project details, please refer to:
[PROJECT_REQUIREMENTS.md](./PROJECT_REQUIREMENTS.md)

## 🗺 Roadmap
- [ ] Real-time Collaboration
- [ ] Advanced Search & Filtering
- [ ] Gantt Chart Timeline View
- [ ] Mobile Application (iOS/Android)
- [x] Google Calendar Synchronization

## 🗓️ Google Calendar Integration

Velora supports seamless synchronization of your strategic deadlines with Google Calendar. Follow these steps to configure the integration.

### 1. Google Cloud Console Setup
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project named **Velora**.
3.  Navigate to **APIs & Services > Library** and enable the **Google Calendar API**.
4.  Navigate to **APIs & Services > OAuth consent screen**:
    *   Choose **External**.
    *   App name: `Velora`.
    *   User support email: Your email.
    *   Scopes: Add `https://www.googleapis.com/auth/calendar.events`.
    *   Test users: Add your Gmail address for testing.
5.  Navigate to **APIs & Services > Credentials**:
    *   Click **Create Credentials > OAuth client ID**.
    *   Application type: **Web application**.
    *   Authorized redirect URIs:
        *   Local: `http://localhost:3000/api/calendar/callback`
        *   Production: `https://your-app-name.railway.app/api/calendar/callback`
6.  Copy the **Client ID** and **Client Secret**.

### 2. Environment Variables
Add the following to your backend `.env` file (never expose these to the frontend):

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/callback
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Local Setup
1.  Ensure `SUPABASE_SERVICE_ROLE_KEY` is set to allow the backend to update user tokens.
2.  Restart the server: `npm start`.
3.  Click the **Sync Calendar** icon in the **Upcoming Deadlines** section of your dashboard.

### 4. Deployment (Railway)
1.  Add all environment variables to your Railway project settings.
2.  Ensure `GOOGLE_REDIRECT_URI`, `CLIENT_URL`, and `SERVER_URL` point to your production domain.
3.  The backend will automatically handle token storage and refresh via Supabase.


## ⚖ License
Distributed under the MIT License.

---
*Built for teams that deliver.*
