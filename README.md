# Smart Jogger’s Companion

A modern, responsive web app for joggers to track their runs, visualize routes, and manage their jogging history. Built with React and Vite, using Material-UI for a beautiful UI.

---

## 🚀 Features
- **Live route tracking** (Geolocation API)
- **Route visualization** (Canvas API)
- **Network status display** (Network Information API)
- **Previous runs history** with lazy loading (Intersection Observer API)
- **Start/Stop/Save Run** workflow
- **Distance, speed, and points (1 per 100m)**
- **View, delete, and clear previous runs**
- **Snackbar notifications** for all actions
- **Export/Import runs as JSON** (optional)
- **PWA: Installable and offline-ready** (optional)
- **Beautiful, responsive Material-UI design with dark mode**

---

## 🛠️ Web APIs Used

### 1. **Geolocation API**
- **Purpose:** Track user’s real-time location while jogging.
- **How:**
  - Used in `Tracker.jsx` via `navigator.geolocation.watchPosition`.
  - Each GPS update adds a new point to the path, updates distance, speed, and points.

### 2. **Canvas API**
- **Purpose:** Draw the jogging route visually.
- **How:**
  - Used in `MapCanvas.jsx` with a `<canvas>` element and 2D context.
  - Draws the path, start/end points, and waypoints.

### 3. **Network Information API**
- **Purpose:** Show network status and connection info.
- **How:**
  - Used in `NetworkStatus.jsx` via `navigator.connection` and `navigator.onLine`.
  - Reactively updates on network changes.

### 4. **Intersection Observer API**
- **Purpose:** Lazy-load previous runs for performance.
- **How:**
  - Used in `PreviousRuns.jsx` with `window.IntersectionObserver`.
  - Loads more run cards as you scroll.

---

## 📦 Getting Started

1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   cd tap-jogger
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the app:**
   ```bash
   npm run dev
   ```
4. **Open in browser:**
   Visit [http://localhost:5173](http://localhost:5173)

---

## 🏃‍♂️ How to Use
- Click **Start** to begin tracking your jog.
- Click **Stop** to end tracking.
- Click **Save Run** to save your route and stats.
- View your route on the map and in the Previous Runs list.
- Click a previous run to view its route and stats.
- Delete or clear runs as needed.
- Use the dark mode toggle for your preferred theme.

---

## 📱 PWA & Mobile
- The app is fully responsive and works great on mobile.
- (Optional) Install as a PWA for offline use and home screen access.

---

## 🌐 Export/Import Runs
- Export all your runs as a JSON file for backup or sharing.
- Import runs from a JSON file to restore your history.

---

## 🖼️ Screenshots
(Add screenshots here if desired)

---

## 📝 Submission
- Built for the TAP Invest assignment.
- Uses at least 3 required Web APIs in a real-world, user-friendly way.

---

## 📄 License
MIT
