# Manual Testing Checklist for Two Phones
**App:** Our Little Room (Disguised as "Daily Planner")

Follow this step-by-step test script using two smartphones (**Phone A** and **Phone B**) to verify the complete end-to-end functionality of "Our Little Room".

---

## 📋 Pre-Test Setup
- [ ] Deployed app URL is accessible on both phones over HTTPS.
- [ ] Both phones have added the app to their Home Screen as a PWA ("Daily Planner").
  - On iOS: Safari $\rightarrow$ Share $\rightarrow$ "Add to Home Screen".
  - On Android: Chrome $\rightarrow$ "Install App".

---

## 🔍 Phase 1: Decoy Screen & Secret Gesture Verification

### Test 1.1: Functional Daily Planner (Decoy Verification)
- [ ] **Action:** Open the app from the Home Screen on Phone A.
- [ ] **Expected:** App displays as a neutral "Daily Planner" with existing tasks.
- [ ] **Action:** Add a new task: "Buy groceries" with High priority. Check it off. Delete an old task.
- [ ] **Expected:** Tasks persist cleanly in local storage. There is zero indication of a chat application or hidden room.

### Test 1.2: Secret Gesture Trigger
- [ ] **Action:** Tap the header title *"Daily Planner"* quickly **3 times**.
- [ ] **Expected:** The title primes silently (no visual alert that would tip off an onlooker).
- [ ] **Action:** Within 4 seconds, press and hold the **first task** in the list for **700ms**.
- [ ] **Expected:** The decoy screen slides away, revealing the **Room Setup & PIN Unlock** screen.

---

## 🔐 Phase 2: Room Creation, Pairing & Device Approval

### Test 2.1: First-Time Room Creation (Phone A)
- [ ] **Action:** On Phone A's setup screen, review the suggested 4-word passphrase (e.g. `velvet whisper morning gentle`).
- [ ] **Action:** Note down the 4 words. Enter a 6-digit PIN (e.g. `123456`) and confirm it.
- [ ] **Action:** Tap **"Create Our Room"**.
- [ ] **Expected:** Phone A derives the keys via Argon2id/HKDF, binds an ECDSA keypair, and immediately opens the chat room as **Device 1 (Approved)**.

### Test 2.2: Second Device Pairing (Phone B)
- [ ] **Action:** On Phone B, open Daily Planner and trigger the secret gesture (3 title taps + 700ms long-press on task 1).
- [ ] **Action:** Enter the exact same 4-word passphrase created on Phone A.
- [ ] **Action:** Choose Phone B's personal 6-digit PIN (e.g. `654321`).
- [ ] **Action:** Tap **"Join Room"**.
- [ ] **Expected:** Phone B shows a modal: *"Waiting for Partner Approval: Ask your partner to approve your device on their phone"*.

### Test 2.3: Cryptographic Device Approval
- [ ] **Action:** On Phone A (which is currently open in the room), observe the screen.
- [ ] **Expected:** A popup appears: *"New Device Request: Device B wants to join your room"*.
- [ ] **Action:** On Phone A, enter Phone A's 6-digit PIN (`123456`) and tap **"Approve Device"**.
- [ ] **Expected:** Phone B immediately unlocks and enters the room! Both phones are now paired.

### Test 2.4: Third Device Rejection (2-Device Strict Enforcement)
- [ ] **Action:** Attempt to pair a third device or incognito browser window using the same passphrase.
- [ ] **Expected:** The server rejects the join attempt with an error (*"Room is full. Maximum 2 devices already paired"*).

---

## 💬 Phase 3: Realtime E2EE Chat, Reactions & Receipts

### Test 3.1: Text Messaging & End-to-End Encryption
- [ ] **Action:** Send a message from Phone A: *"Good morning honey! ☀️"*.
- [ ] **Expected:** Phone A shows message optimistically. Phone B receives and decrypts the message within 3 seconds.
- [ ] **Verification:** Open Supabase SQL Editor $\rightarrow$ run `SELECT ciphertext, iv FROM messages ORDER BY created_at DESC LIMIT 1;`.
- [ ] **Expected:** The database contains strictly random ciphertext and IV bytes. The text "Good morning honey!" is nowhere in the database or server logs.

### Test 3.2: Double-Tap Heart Reaction & Seen Status
- [ ] **Action:** Double-tap Phone A's message on Phone B.
- [ ] **Expected:** A floating heart animation bursts and a ❤️ reaction badge appears on the bubble for both devices.
- [ ] **Action:** Look at Phone A's outgoing bubble.
- [ ] **Expected:** A tiny heart icon appears next to the timestamp on Phone A, confirming Phone B has seen the message.

### Test 3.3: Reply, Edit, and Unsend
- [ ] **Action:** Long-tap or tap the options menu ($\dots$) on Phone B's message and select **Reply**.
- [ ] **Expected:** A reply banner docks above the chat input with the quoted snippet.
- [ ] **Action:** Send a reply. Tap options $\rightarrow$ **Edit**. Edit the text to *"Updated note"*.
- [ ] **Expected:** The bubble updates immediately and displays an `(edited)` indicator.
- [ ] **Action:** Tap options on Phone A's own message $\rightarrow$ **Unsend**.
- [ ] **Expected:** The message content is wiped from ciphertext; both screens display *"This message was unsent"*.

---

## 🧸 Phase 4: Cute Stickers & Sticker Reactions

### Test 4.1: Sticker Picker & Full-Size Message
- [ ] **Action:** Tap the smiley face 😊 in the chat input.
- [ ] **Expected:** The Sticker Picker drawer opens with 5 mood tabs (`Sweet`, `Silly`, `Sorry`, `Miss You`, `Goodnight`).
- [ ] **Action:** Browse the tabs and tap a sticker from `Sweet`.
- [ ] **Expected:** Sends a full-size (144px) transparent SVG bear sticker message to the chat.

### Test 4.2: Surprise Button & Sticker of the Day
- [ ] **Action:** Open sticker picker. Tap the **"Surprise!"** dice button.
- [ ] **Expected:** Instantly dispatches a random sticker from the selected mood.
- [ ] **Action:** Inspect the **"Sticker of the Day"** banner at the top of the picker.
- [ ] **Expected:** Shows today's unique unlocked sticker (deterministic by date).

### Test 4.3: Sticker Reactions
- [ ] **Action:** Tap the options menu on a message $\rightarrow$ **Sticker React**.
- [ ] **Action:** Pick a sticker.
- [ ] **Expected:** A mini sticker avatar badge attaches to the bottom of the message bubble.

---

## 📷 Phase 5: Encrypted Photos & Disappearing Messages

### Test 5.1: Client-Side Compression & Photo Upload
- [ ] **Action:** Tap the camera icon 📷 in the chat input. Choose a high-resolution camera photo (e.g. 5MB+).
- [ ] **Expected:** Client compresses the photo to $\le$ 200KB before encryption, encrypts it with AES-256-GCM, and uploads to private Supabase storage.
- [ ] **Action:** On Phone B, observe the photo thumbnail render with rounded corners.
- [ ] **Verification:** Check Supabase Storage bucket `room-media`. The uploaded file is an unreadable `.enc` binary blob.

### Test 5.2: Photo Lightbox & Download
- [ ] **Action:** Tap the photo bubble on Phone B.
- [ ] **Expected:** Opens the dark fullscreen **Photo Lightbox**.
- [ ] **Action:** Double-tap anywhere on the image to send a heart. Tap the download icon.
- [ ] **Expected:** Downloads the decrypted image to the phone's gallery with a neutral filename (`photo-*.jpg`).

### Test 5.3: Disappearing Messages Timer
- [ ] **Action:** Open Room Settings (gear icon in header). Set **Disappearing Messages** to **"1 Hour"** (or test with 1m in test suite).
- [ ] **Action:** Send a message.
- [ ] **Expected:** A small clock icon appears next to the timestamp indicating the message will disappear.

---

## 🔔 Phase 6: Coded Signals & Decoy Push Notifications

### Test 6.1: Enabling Push Subscriptions
- [ ] **Action:** On Phone B, open Room Settings $\rightarrow$ tap **"Enable Push Notifications"**.
- [ ] **Action:** Allow notification permissions when prompted by the operating system.
- [ ] **Expected:** Status changes to **"Subscribed"**.

### Test 6.2: Sending a Coded Signal
- [ ] **Action:** Lock Phone B (screen off or showing phone home screen).
- [ ] **Action:** On Phone A, tap the bell icon 🔔 in the chat input to open the **Coded Signals** drawer.
- [ ] **Action:** Tap Slot 4 (*"Can't talk right now ⏳"* / Decoy: *"Planner: Break reminder"*).
- [ ] **Action:** Observe Phone B's lock screen.
- [ ] **CRITICAL VERIFICATION:**
  - Phone B displays a neutral notification with title: **"Daily Planner"** and body: **"Planner: Break reminder"**.
  - **Zero mention of "Our Little Room", love notes, or secret text is visible.**

### Test 6.3: Tapping Decoy Notification
- [ ] **Action:** Tap the notification on Phone B's lock screen.
- [ ] **CRITICAL VERIFICATION:**
  - The phone unlocks and opens the **Daily Planner decoy screen** (the to-do list).
  - It does **NOT** open the chat room. The secret gesture is still required to enter the room.

### Test 6.4: Quiet Hours
- [ ] **Action:** In Room Settings on Phone A, enable **Quiet Hours** and set the window to include the current time.
- [ ] **Action:** Attempt to send a coded signal from Phone A.
- [ ] **Expected:** A banner indicates the signal was suppressed due to active quiet hours.

---

## 🛡️ Phase 7: Panic Quick-Hide, Auto-Lock & 5-Strike Wipe

### Test 7.1: Accelerometer Shake Quick-Hide
- [ ] **Action:** While inside the unlocked chat room, vigorously shake the phone.
- [ ] **Expected:** Instantly switches back to the Daily Planner decoy screen and purges in-memory keys.

### Test 7.2: Triple-Tap Quick-Hide
- [ ] **Action:** Re-enter the room. Tap 3 times quickly on the background area.
- [ ] **Expected:** Immediately switches back to the Daily Planner.

### Test 7.3: 30-Second Background Auto-Lock
- [ ] **Action:** Re-enter the room. Switch to another app or minimize the browser for 35 seconds.
- [ ] **Action:** Switch back to the app.
- [ ] **Expected:** The room has automatically locked; entering the 6-digit PIN is required to regain access.

### Test 7.4: 5-Strike PIN Security Wipe
- [ ] **Action:** Trigger the secret gesture to open the PIN screen.
- [ ] **Action:** Intentionally enter an incorrect 6-digit PIN 5 times in a row.
- [ ] **Expected:**
  - Each wrong attempt decrements the remaining attempts counter (`4 left`, `3 left`, `2 left`, `1 left`).
  - Upon the 5th failed attempt, the app displays: *"Local security wipe triggered. Keys cleared."*
  - All local keys and credentials in `localStorage` and `IndexedDB` are permanently deleted.
  - Re-accessing the room now requires re-entering the 4-word passphrase and obtaining partner approval from the other phone.
