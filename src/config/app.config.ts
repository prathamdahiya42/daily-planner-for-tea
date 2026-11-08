/**
 * App Configuration: Single source of truth for names, decoy strings, and signal slots.
 * Note: Decoy strings are publicly visible in bundled code and push notifications.
 * The true meaning of coded signals is encrypted inside the room settings.
 */

export interface CodedSignalDef {
  index: number;
  decoyTitle: string;
  decoyBody: string;
  defaultSecretLabel: string;
  iconName: string;
}

export const APP_CONFIG = {
  // Public/decoy identity used in manifests, tab titles, headers, and notifications
  decoyName: "Daily Planner",
  decoyDescription: "Simple, distraction-free daily to-do and checklist",
  decoyThemeColor: "#ffffff",
  decoyBgColor: "#f8fafc",

  // Real app identity (visible ONLY once successfully unlocked inside the room)
  realName: "Our Little Room",
  realDescription: "A private corner for two",
  realThemeColor: "#FFFDF9",

  // Secret trigger defaults
  gesture: {
    titleTapCount: 3,
    taskLongPressMs: 700,
  },

  // Security thresholds
  security: {
    pinLength: 6,
    maxPinAttempts: 5,
    backgroundAutoLockSeconds: 30,
    minPassphraseWords: 4,
    minPassphraseLength: 16,
    argon2: {
      time: 3,
      mem: 65536, // 64 MB
      hashLen: 32,
      parallelism: 1,
    },
    pbkdf2Iterations: 600000, // WebCrypto fallback
  },

  // Coded signal slots (Index 0 through 5)
  // Payload sent over the network contains ONLY { signalIndex: 0..5 }
  // Service Worker and push display the decoy text.
  codedSignals: [
    {
      index: 0,
      decoyTitle: "Daily Planner",
      decoyBody: "Planner: Drink water",
      defaultSecretLabel: "Come talk to me 💕",
      iconName: "Droplet",
    },
    {
      index: 1,
      decoyTitle: "Daily Planner",
      decoyBody: "Planner: Revision time",
      defaultSecretLabel: "I'm online / Here now ✨",
      iconName: "BookOpen",
    },
    {
      index: 2,
      decoyTitle: "Daily Planner",
      decoyBody: "Planner: Sleep early",
      defaultSecretLabel: "Good night my love 🌙",
      iconName: "Moon",
    },
    {
      index: 3,
      decoyTitle: "Daily Planner",
      decoyBody: "Planner: Weekly review",
      defaultSecretLabel: "Miss you so much 🧸",
      iconName: "Heart",
    },
    {
      index: 4,
      decoyTitle: "Daily Planner",
      decoyBody: "Planner: Break reminder",
      defaultSecretLabel: "Can't talk right now ⏳",
      iconName: "Coffee",
    },
    {
      index: 5,
      decoyTitle: "Daily Planner",
      decoyBody: "Planner: Task completed",
      defaultSecretLabel: "Free in 10 minutes 🏃",
      iconName: "CheckCircle",
    },
  ] as const satisfies readonly CodedSignalDef[],
};
