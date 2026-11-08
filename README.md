# Our Little Room (Decoy: Daily Planner)

> A private, end-to-end encrypted chat PWA designed for exactly **TWO people** (a couple). Disguised as a boring "Daily Planner" to anyone else.

---

## 🌟 Key Features

1. **Decoy Screen ("Daily Planner")**:
   - Launches as a fully functional, boring daily to-do list app with local task storage, priorities, and checkmarks.
   - App title, manifest, icon, and push notifications strictly use the neutral "Daily Planner" identity.
   - **Secret Gesture Entry:** Tap the "Daily Planner" header title **3 times**, then **long-press the first task for 700ms** to trigger the PIN unlock screen.

2. **End-to-End Encrypted Chat**:
   - Zero plaintext on server or database. AES-256-GCM encryption with fresh 12-byte random IVs per item.
   - Realtime text messaging with optimistic updates and seen receipts (subtle small heart icon).
   - In-chat reply quotes, message editing, and unsending (wipes ciphertext content).
   - Double-tap any message or sticker to send a floating heart reaction.

3. **Stickers (Core Focus)**:
   - Built-in pack of **40 original bear pair SVG stickers** across 5 moods: `sweet`, `silly`, `sorry`, `missyou`, `goodnight`.
   - **Sticker Picker** with mood tabs and instant full-size transparent rendering (144px).
   - **Surprise Button:** Pick a mood and send a random cute sticker.
   - **Sticker of the Day:** Deterministic daily unlock based on date.
   - **Sticker Reactions:** React with miniature sticker badges in addition to hearts.

4. **Compressed Encrypted Photos**:
   - In-browser `<canvas>` compression reduces photos to $\le$ **~200KB BEFORE encryption**.
   - Encrypted with AES-256-GCM client-side before upload to private Supabase storage.
   - Intimate tap-to-view fullscreen **Photo Lightbox** with double-tap heart and download option.

5. **Disappearing Messages Timer**:
   - Per-chat timer settings: **`Off`**, **`1 Hour`**, **`1 Day`**, or **`1 Week`**.
   - Server-side and client-side automatic pruning removes expired messages and their media files.

6. **Romance & Intimate Customization**:
   - **Relationship Day Counter:** Displays *"Day X of Us 💕"* in header calculated from your anniversary date.
   - **Subtle Presence Glow:** Shows an ambient glowing aura and *"she's here ✨"* / *"he's here ✨"* when your partner has the unlocked app open.
   - **Private Nicknames:** Custom encrypted names visible only inside your room.
   - **5 Warm Background Themes:** Warm Rose, Honey Amber, Soft Lavender, Cloud Peach, and Cozy Midnight.

7. **Coded Signals (Decoy Push Notifications)**:
   - 6 signal slots (index 0–5) with neutral decoy notifications (*"Planner: Drink water"*, *"Planner: Sleep early"*, etc.).
   - The real meaning of each slot is stored encrypted on device and editable in-app.
   - Over-the-wire push carries strictly `{ signalIndex }`. Zero secret text is transmitted.
   - Tapping a notification opens the **Daily Planner decoy screen**, never the chat.
   - **Quiet Hours:** Configurable sleep window suppresses signal notifications overnight.
   - **Auto "I'm online":** Sends a signal when unlocking the app (max once per hour).

8. **Security & Anti-Tamper**:
   - **ECDSA P-256 Device Identity:** Non-extractable device keypairs in IndexedDB. Max 2 devices per room. Second device requires partner PIN approval.
   - **Personal 6-Digit PIN:** Local key wrapped with PBKDF2 (100k rounds) + AES-GCM. 5 failed PIN attempts trigger a complete local security wipe.
   - **Background Auto-Lock:** Locks after 30 seconds in background.
   - **Panic Quick-Hide:** Accelerometer shake or triple-tap on background instantly hides back to the Daily Planner.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS, Lucide React
- **PWA & Offline:** Serwist (Service Worker at `/sw.js`)
- **Cryptography:** WebCrypto API, Argon2id (`hash-wasm`), AES-256-GCM, ECDSA P-256, HKDF-SHA256
- **Push Notifications:** Web Push with VAPID
- **Free-Tier Infrastructure:** Vercel (Hosting) + Supabase (Database & Storage)

---

## 🚀 Deployment Guide (Vercel + Supabase Free Tier)

### Step 1: Set Up Supabase Project

1. Create a free account at [supabase.com](https://supabase.com) and create a new project.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of [`supabase/schema.sql`](./supabase/schema.sql) and run it. This will create:
   - `rooms`, `devices`, `messages`, and `auth_challenges` tables.
   - Row Level Security (RLS) policies for cross-room isolation.
   - Private storage bucket `room-media` with RLS restricted to authenticated room members.
4. Go to **Project Settings $\rightarrow$ API** and note down:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon / public key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role secret** (`SUPABASE_SERVICE_ROLE_KEY`)
   - **JWT Secret** (`SUPABASE_JWT_SECRET`)

### Step 2: Generate Web Push VAPID Keys

Run the following command in your terminal:
```bash
npx web-push generate-vapid-keys
```
This outputs a **Public Key** and **Private Key**.

### Step 3: Configure Environment Variables

Create a `.env.local` file (or configure in Vercel Project Settings $\rightarrow$ Environment Variables):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret-min-32-chars

# Web Push VAPID Keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@ourlittleroom.local
```

### Step 4: Deploy to Vercel

1. Push your repository to GitHub or GitLab.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Add the environment variables from Step 3 into the Vercel dashboard.
4. Click **Deploy**.

---

## 📱 Installation on Phones (PWA)

### Android / Chrome
1. Visit your deployed URL in Chrome.
2. Tap the menu ($\vdots$) $\rightarrow$ **Install App** or tap the **"Install Planner App"** button at the bottom of the Daily Planner screen.
3. The app will install with the name **"Daily Planner"** and a neutral calendar icon.

### iPhone / iPad (iOS 16.4+)
> [!IMPORTANT]
> Apple requires PWAs to be added to the Home Screen to support Web Push notifications.
1. Open your deployed URL in **Safari**.
2. Tap the **Share** button ($\boxuparrow$).
3. Scroll down and tap **"Add to Home Screen"**.
4. Confirm installation. The app icon will appear as **"Daily Planner"**.
5. Launch the app from the Home Screen, trigger the secret gesture, enter the room settings, and tap **"Enable Push Notifications"**.

---

## 🔐 First-Time Room Setup & Pairing

1. **Phone A (Room Creator)**:
   - Open Daily Planner. Tap the header title **"Daily Planner" 3 times**.
   - Long-press the first task for **700ms**.
   - The setup screen appears. The app will generate a 4-word passphrase (e.g. `velvet whisper morning gentle`).
   - Create your personal 6-digit PIN.
   - Tap **"Create Our Room"**. You are now in the room as Device 1!

2. **Phone B (Partner)**:
   - Install and open Daily Planner on Phone B.
   - Perform the same secret gesture (tap title 3 times + long-press first task).
   - Enter the exact same 4-word passphrase and create Phone B's 6-digit PIN.
   - Tap **"Join Room"**. Phone B will show a **"Waiting for Partner Approval"** screen.

3. **Approval on Phone A**:
   - Phone A will automatically display a **"New Device Request"** modal showing Phone B's device ID.
   - Phone A enters their 6-digit PIN to approve Phone B.
   - Phone B is immediately authenticated and granted access.
   - **Both devices are now paired! No third device can ever join.**
