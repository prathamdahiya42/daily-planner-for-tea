# Security Architecture & Threat Model Review
**Project:** Our Little Room (E2EE Couple Chat disguised as "Daily Planner")

---

## 1. Security Foundations & Threat Model

"Our Little Room" is designed to provide intimate, private communication between exactly two people. The threat model assumes:
1. **Hostile / Untrusted Cloud Provider:** The hosting servers (Vercel, Supabase), network transit (ISP, public Wi-Fi), and push notification infrastructure (Google FCM, Apple APNs) are treated as untrusted eavesdroppers.
2. **Physical Device Inspection / Shoulder Surfing:** An inquisitive third party (roommate, parent, casual observer) may handle or glance at the unlocked or locked phone.
3. **Malicious Actor with Stolen Passphrase:** An adversary possessing the shared 4-word passphrase attempts to intercept or decrypt the couple's communications.

---

## 2. Cryptographic Architecture

```
                    ┌────────────────────────────┐
                    │ Shared 4-Word Passphrase   │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                   ┌─────────────────────────────┐
                   │ Argon2id (hash-wasm)        │
                   │ (PBKDF2 600k fallback)      │
                   └──────────────┬──────────────┘
                                  │ Master 32-Byte Secret
                                  ▼
               ┌──────────────────┴──────────────────┐
               │         HKDF-SHA256 Split           │
               └───────┬──────────────┬──────────────┘
                       │              │              │
                       ▼              ▼              ▼
                  [authKey]       [encKey]       [roomId]
                 (Auth Token)   (256-bit AES)  (Room Hash)
                       │              │              │
                       ▼              │              ▼
             SHA-256 Verifier         │       Database Identifier
             Stored on Server         │        (Never plaintext)
                                      ▼
                        NEVER LEAVES LOCAL DEVICE
                        Wrapped with 6-digit PIN
```

### 2.1 Key Derivation & Split
- **Passphrase KDF:** Derived using Argon2id (`time=3, memory=64MB, parallelism=1, hashLen=32`), with a 600,000-iteration PBKDF2-HMAC-SHA256 WebCrypto fallback.
- **HKDF 3-Way Split:** Master derived bytes are expanded via HKDF-SHA256 with distinct domain separation info strings:
  - `authKey`: Server authenticating token. Stored on server only as `SHA-256(authKey)`.
  - `encKey`: Symmetric AES-256-GCM key used for all message payloads, photo blobs, stickers, reactions, and room settings. **`encKey` never leaves the client device.**
  - `roomId`: SHA-256 room hash identifier. Completely unlinked from any readable room name or phone number.

### 2.2 Client-Side Encryption
- **AES-256-GCM:** Every message text, photo binary, sticker ID, and signal definition is encrypted client-side with a fresh, cryptographically secure 12-byte random IV (`crypto.getRandomValues`) and 128-bit authentication tag.
- **Zero Plaintext Stored:** The database strictly stores:
  `{ id, room_id, sender_device_id, ciphertext, iv, type, created_at, expires_at }`.

### 2.3 Hardware & Device Binding
- **ECDSA P-256 Keypairs:** Generated on each device with `extractable: false` and stored in IndexedDB. Private keys cannot be exported via JavaScript.
- **Challenge-Response Authentication:** Devices authenticate to the Next.js backend by signing an ephemeral nonce with their non-extractable private key.
- **Max 2 Devices Enforced:** The room creator is Device 1. Device 2 requires the shared passphrase AND cryptographic approval by Device 1 (authorized via Device 1's PIN). A 3rd device is strictly barred from joining.

### 2.4 Personal 6-Digit PIN & Anti-Tamper Wiping
- The device's local `encKey` is stored wrapped in `localStorage` using an AES-256-GCM key derived from the user's 6-digit PIN via PBKDF2 (100,000 iterations).
- **5-Strike Wipe:** If 5 incorrect PIN attempts are made, `PinSecurityManager` immediately wipes `encKey`, the wrapped key package, and removes the ECDSA identity from IndexedDB. Re-accessing the room requires entering the 4-word passphrase and obtaining partner approval.

---

## 3. Comprehensive Risk Analysis & Mitigations

| Risk / Attack Vector | Severity | Attack Scenario | Implemented Mitigation |
| :--- | :---: | :--- | :--- |
| **1. Database Breach / Malicious Supabase Admin** | Critical | Attacker dumps Supabase tables or reads storage buckets. | **Zero Plaintext:** All rows and storage files contain only AES-GCM ciphertext. The server has no copy of `encKey`. |
| **2. Passphrase Interception / Third Device Joining** | High | An adversary discovers the 4-word passphrase and attempts to join. | **Two-Device Limit & Partner Approval:** Device 2 cannot access messages without explicit cryptographic approval signed by Device 1. Any subsequent device is rejected. |
| **3. Physical Phone Inspection (Decoy Screen)** | High | Someone picks up the phone and launches the app. | **Boring Decoy:** The app installs and displays as a functioning "Daily Planner" (local to-do list). A complex multi-step secret gesture (3 title taps + 700ms long-press on task 1) is required to reveal the PIN screen. |
| **4. Push Notification Spying (Apple / Google / Lock Screen)** | High | Someone looks at lock screen notifications or inspects push server packets. | **Decoy Notifications & Index Only:** Push payload contains *strictly* `{ signalIndex: 0..5 }`. Zero chat text or secret meanings. Service Worker displays neutral planner reminders (*"Planner: Drink water"*). Clicking opens the Decoy Planner, NOT the chat. |
| **5. Device Theft & Brute Force on PIN** | High | Attacker steals phone and attempts to guess the 6-digit PIN. | **5-Strike Auto-Wipe:** 5 failed attempts wipe all local keys and device identities. PBKDF2 100k rounds slows offline guessing attempts. |
| **6. Browser & Disk Cache Leaks** | Medium | Browser caches decrypted chat messages or photos to disk. | **`Cache-Control: no-store`** on all API endpoints. Decrypted photo blobs are created via in-memory object URLs and revoked upon lock. Service Worker never caches `/api/` data. |
| **7. Shoulder Surfing / Walking Away from Phone** | Medium | User leaves phone unlocked on a desk. | **30s Background Auto-Lock:** App auto-locks after 30 seconds in background. Accelerometer shake or triple-tap triggers instant panic hide back to Daily Planner. |
| **8. Disappearing Messages Forensics** | Medium | Expired photos or messages remain accessible on server or storage. | **Active Pruning & Cleanup:** Expired messages are excluded from queries and purged along with their encrypted storage files via `/api/messages/cleanup`. |
| **9. Search Engine Scraping** | Low | Web crawlers index the room URLs. | **`robots.txt` & Meta Tags:** All pages serve `<meta name="robots" content="noindex, nofollow">`. No public room URLs exist. |

---

## 4. Security Audit Verification

All cryptographic operations have been verified with automated unit tests:
- Key derivation roundtrip and non-extractable ECDSA signature verification.
- Cross-room RLS isolation (proving another room's token gets zero rows).
- Tampered ciphertext rejection (AES-GCM authentication tag verification).
- 5-strike PIN security lockout and local storage purging.
- Quiet hours midnight-spanning calculation accuracy.
