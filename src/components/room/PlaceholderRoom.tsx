"use client";

import React, { useState, useEffect } from "react";
import { Lock, EyeOff, Shield, RefreshCw, KeyRound, Sparkles, Check } from "lucide-react";
import { useRoom } from "@/context/RoomContext";
import { encryptPayload, decryptPayload } from "@/lib/crypto/cipher";

export function PlaceholderRoom() {
  const { roomId, deviceId, sessionToken, encKey, lockRoom, quickHide, resetDevice, pendingDeviceRequests } = useRoom();

  const [testInput, setTestInput] = useState("Hello my love! 💕");
  const [encryptedOutput, setEncryptedOutput] = useState<{ ciphertext: string; iv: string } | null>(
    null
  );
  const [decryptedOutput, setDecryptedOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Hook device shake event for quick-hide
  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let lastTime = 0;

    const handleMotion = (e: DeviceMotionEvent) => {
      const current = e.accelerationIncludingGravity;
      if (!current) return;

      const currentTime = Date.now();
      if (currentTime - lastTime > 150) {
        const diffTime = currentTime - lastTime;
        lastTime = currentTime;

        const delta =
          Math.abs((current.x || 0) + (current.y || 0) + (current.z || 0) - lastX - lastY - lastZ);
        const speed = (delta / diffTime) * 10000;

        if (speed > 800) {
          // Shake detected
          quickHide();
        }

        lastX = current.x || 0;
        lastY = current.y || 0;
        lastZ = current.z || 0;
      }
    };

    if (typeof window !== "undefined" && "ondevicemotion" in window) {
      window.addEventListener("devicemotion", handleMotion);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("devicemotion", handleMotion);
      }
    };
  }, [quickHide]);

  const handleTestEncrypt = async () => {
    if (!encKey) return;
    const enc = await encryptPayload(testInput, encKey);
    setEncryptedOutput(enc);
    const dec = await decryptPayload<string>(enc, encKey);
    setDecryptedOutput(dec);
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto min-h-screen bg-room-bg text-room-text flex flex-col font-sans select-none pb-8">
      {/* Top Bar */}
      <header className="px-5 pt-8 pb-4 bg-white/80 backdrop-blur-md border-b border-room-border flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center font-bold">
            🧸
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800">Our Little Room</h1>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              E2EE Active
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick-hide Panic Button */}
          <button
            onClick={quickHide}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            title="Instantly switch back to Daily Planner"
          >
            <EyeOff className="w-3.5 h-3.5" />
            Quick Hide
          </button>

          <button
            onClick={lockRoom}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition"
            aria-label="Lock Room"
            title="Lock room"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-5 space-y-4">
        {/* Room Identity Card */}
        <div className="p-4 rounded-3xl bg-white border border-room-border shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-rose-500" />
              Derived Room ID (Hash)
            </span>
            <button
              onClick={copyRoomId}
              className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3" /> : null}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl font-mono text-[11px] text-slate-600 break-all border border-slate-100 select-all">
            {roomId || "No room id"}
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Device: <code className="text-slate-600">{deviceId ? deviceId.slice(0, 8) + "..." : "Unknown"}</code></span>
            <span>Auth: <span className="text-emerald-600 font-medium">{sessionToken ? "JWT Active" : "Local Only"}</span></span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            This ID is an irreversible HKDF hash. The server never sees your passphrase or
            encryption key.
          </p>
        </div>

        {/* Live Crypto Playground */}
        <div className="p-4 rounded-3xl bg-white border border-room-border shadow-soft space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-800">In-Memory AES-256-GCM Test</h2>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">Test Plaintext:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400"
              />
              <button
                onClick={handleTestEncrypt}
                className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-medium transition active:scale-95"
              >
                Encrypt
              </button>
            </div>
          </div>

          {encryptedOutput && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">
                  Ciphertext (Stored in DB):
                </span>
                <div className="p-2 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[10px] break-all">
                  {encryptedOutput.ciphertext}
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 text-[11px]">IV: {encryptedOutput.iv}</span>
                <span className="text-emerald-600 font-medium">Decrypted: {decryptedOutput}</span>
              </div>
            </div>
          )}
        </div>

        {/* Security Rules Banner */}
        <div className="p-4 rounded-3xl bg-amber-50/70 border border-amber-200/60 text-amber-900 space-y-2">
          <h3 className="text-xs font-bold flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
            Phase 1 Active Protections
          </h3>
          <ul className="text-xs space-y-1 list-disc list-inside text-amber-800/90 leading-relaxed">
            <li>Auto-locks when backgrounded for 30 seconds</li>
            <li>Shake phone or click Quick Hide to jump to Planner</li>
            <li>5 incorrect PIN attempts wipe local keys automatically</li>
            <li>EncKey stored wrapped in IndexedDB/Storage with your PIN</li>
          </ul>
        </div>

        {/* Reset / Unpair Device */}
        <div className="pt-4 text-center">
          <button
            onClick={() => {
              if (confirm("Reset device? You will need the passphrase and PIN to enter again.")) {
                resetDevice();
              }
            }}
            className="text-xs text-slate-400 hover:text-rose-500 transition underline underline-offset-4"
          >
            Reset local device pairing
          </button>
        </div>
      </main>
    </div>
  );
}
