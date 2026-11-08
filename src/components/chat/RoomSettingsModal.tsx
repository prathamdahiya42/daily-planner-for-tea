"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Heart,
  Calendar,
  Clock,
  Sparkles,
  Shield,
  Palette,
  User,
  Check,
  Bell,
  Moon,
  Smartphone,
} from "lucide-react";
import {
  RoomSettings,
  DisappearingTimer,
  BackgroundTheme,
  BACKGROUND_THEMES,
  calculateDaysTogether,
} from "@/lib/settings/room-settings";
import { APP_CONFIG } from "@/config/app.config";
import { registerPushSubscription, isIosDevice, isPwaStandalone } from "@/lib/push/client-push";
import { useRoom } from "@/context/RoomContext";

interface RoomSettingsModalProps {
  settings: RoomSettings;
  onSave: (newSettings: RoomSettings) => void;
  onClose: () => void;
  roomId: string | null;
}

const SIGNAL_EMOJIS = ["💧", "📖", "🌙", "🧸", "☕", "🏃"];

export function RoomSettingsModal({
  settings,
  onSave,
  onClose,
  roomId,
}: RoomSettingsModalProps) {
  const { sessionToken } = useRoom();
  const [draft, setDraft] = useState<RoomSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);
  const [pushStatus, setPushStatus] = useState<"default" | "granted" | "denied">("default");
  const [isEnablingPush, setIsEnablingPush] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushStatus(Notification.permission);
    }
  }, []);

  const daysCount = draft.togetherSince ? calculateDaysTogether(draft.togetherSince) : null;

  const handleSave = () => {
    onSave(draft);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  const handleEnablePush = async () => {
    if (!sessionToken) return;
    setIsEnablingPush(true);
    const res = await registerPushSubscription(sessionToken);
    setIsEnablingPush(false);
    if (res.success) {
      setPushStatus("granted");
    }
  };

  const handleSignalLabelChange = (index: number, val: string) => {
    setDraft({
      ...draft,
      customSignalLabels: {
        ...draft.customSignalLabels,
        [index]: val,
      },
    });
  };

  const timerOptions: { id: DisappearingTimer; label: string }[] = [
    { id: "off", label: "Off" },
    { id: "1h", label: "1 Hour" },
    { id: "1d", label: "1 Day" },
    { id: "1w", label: "1 Week" },
  ];

  const themes: BackgroundTheme[] = [
    "warm-rose",
    "honey-amber",
    "soft-lavender",
    "cloud-peach",
    "cozy-midnight",
  ];

  const isIos = isIosDevice();
  const isStandalone = isPwaStandalone();

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center text-sm shadow-soft">
              ⚙️
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Our Space Settings</h2>
              <p className="text-[11px] text-slate-400">Encrypted on your device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Day Counter & Anniversary */}
          <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2 text-rose-700 font-semibold text-xs">
              <Calendar className="w-4 h-4 text-rose-500" />
              <span>Special Date & Day Counter</span>
            </div>
            <p className="text-[11px] text-rose-900/70 mb-3">
              Set the day your journey began. A live day counter will appear in your room header.
            </p>
            <input
              type="date"
              value={draft.togetherSince}
              onChange={(e) => setDraft({ ...draft, togetherSince: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            {daysCount !== null && (
              <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-white/80 py-1.5 px-3 rounded-lg border border-rose-200/60 inline-flex">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>Day {daysCount} of Us</span>
              </div>
            )}
          </div>

          {/* Disappearing Messages Timer */}
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-slate-800 font-semibold text-xs">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Disappearing Messages</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              New messages automatically vanish for both of you after this time.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {timerOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDraft({ ...draft, disappearingTimer: opt.id })}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition ${
                    draft.disappearingTimer === opt.id
                      ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Coded Signals Secret Meanings */}
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-slate-800 font-semibold text-xs">
              <Bell className="w-4 h-4 text-amber-600" />
              <span>Coded Signals Secret Meanings</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Define what each signal means to the two of you. These meanings are stored encrypted and never leave your room.
            </p>

            <div className="space-y-2.5">
              {APP_CONFIG.codedSignals.map((sig, idx) => (
                <div key={sig.index} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold flex items-center gap-1.5">
                      <span>{SIGNAL_EMOJIS[idx]}</span>
                      <span>Slot {idx + 1}</span>
                    </span>
                    <span className="text-slate-400 italic">Decoy: "{sig.decoyBody}"</span>
                  </div>
                  <input
                    type="text"
                    maxLength={40}
                    value={draft.customSignalLabels?.[idx] || ""}
                    onChange={(e) => handleSignalLabelChange(idx, e.target.value)}
                    placeholder={sig.defaultSecretLabel}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Quiet Hours & Auto-Online */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span>Quiet Hours</span>
              </div>
              <input
                type="checkbox"
                id="quietHoursToggle"
                checked={draft.quietHoursEnabled}
                onChange={(e) => setDraft({ ...draft, quietHoursEnabled: e.target.checked })}
                className="w-4 h-4 text-rose-500 rounded focus:ring-rose-400 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Suppress coded signal push notifications during your scheduled sleep time.
            </p>

            {draft.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={draft.quietHoursStart}
                    onChange={(e) => setDraft({ ...draft, quietHoursStart: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={draft.quietHoursEnd}
                    onChange={(e) => setDraft({ ...draft, quietHoursEnd: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
            )}

            {/* Auto "I'm online" */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Auto "I'm online" Signal
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Sends signal when unlocking room (max 1/hr)
                </span>
              </div>
              <input
                type="checkbox"
                checked={draft.autoOnlineSignal}
                onChange={(e) => setDraft({ ...draft, autoOnlineSignal: e.target.checked })}
                className="w-4 h-4 text-rose-500 rounded focus:ring-rose-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Web Push Notification Permissions */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                <Bell className="w-4 h-4 text-rose-500" />
                <span>Web Push Notifications</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  pushStatus === "granted"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {pushStatus === "granted" ? "Subscribed" : "Not Active"}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-3">
              Allows your phone to receive decoy push notifications when your partner sends a coded signal.
            </p>

            {pushStatus !== "granted" && (
              <button
                type="button"
                onClick={handleEnablePush}
                disabled={isEnablingPush}
                className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-soft"
              >
                {isEnablingPush ? "Enabling..." : "Enable Push Notifications"}
              </button>
            )}

            {/* iOS requirement note */}
            {isIos && !isStandalone && (
              <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
                <Smartphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>iPhone / iPad note:</strong> iOS 16.4+ requires adding Daily Planner to your Home Screen first (Safari Share → "Add to Home Screen") to enable Push.
                </span>
              </div>
            )}
          </div>

          {/* Private Nicknames */}
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-slate-800 font-semibold text-xs">
              <User className="w-4 h-4 text-purple-500" />
              <span>Private Nicknames</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Names only the two of you see in this room.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Your Nickname
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={draft.myNickname}
                  onChange={(e) => setDraft({ ...draft, myNickname: e.target.value })}
                  placeholder="e.g. Bear"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Partner's Nickname
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={draft.partnerNickname}
                  onChange={(e) => setDraft({ ...draft, partnerNickname: e.target.value })}
                  placeholder="e.g. Honey"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>

            {/* Pronoun for Presence Indicator */}
            <div className="mt-3">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Presence Glow Text
              </label>
              <div className="flex items-center gap-2">
                {(["she", "he", "they"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setDraft({ ...draft, partnerPronoun: p })}
                    className={`flex-1 py-1.5 text-xs rounded-lg border font-medium capitalize transition ${
                      draft.partnerPronoun === p
                        ? "bg-rose-50 border-rose-300 text-rose-700 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-500"
                    }`}
                  >
                    {p === "they" ? "they're here" : `${p}'s here`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Background Theme */}
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-slate-800 font-semibold text-xs">
              <Palette className="w-4 h-4 text-rose-500" />
              <span>Chat Background Theme</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Choose the intimate mood of your room.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {themes.map((themeKey) => {
                const info = BACKGROUND_THEMES[themeKey];
                const isSelected = draft.backgroundTheme === themeKey;
                return (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => setDraft({ ...draft, backgroundTheme: themeKey })}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? "border-rose-500 ring-2 ring-rose-200 bg-rose-50/40"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: info.accentColor }}
                    />
                    <span className="text-xs font-semibold text-slate-700 truncate">
                      {info.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Room Security Badges */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-semibold text-slate-700 block">End-to-End Encrypted</span>
                <span className="text-[10px] text-slate-400">
                  {roomId ? `Room ID: ${roomId.substring(0, 12)}...` : "Private Room"}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active
            </span>
          </div>
        </div>

        {/* Modal Footer / Save */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaved}
            className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-soft transition flex items-center justify-center gap-1.5"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
