import React from "react";

// Set to "/brand/her.png" once a custom avatar image is placed in public/brand/her.png
export const HER_AVATAR_CUSTOM_IMAGE: string | null = null; // TODO: swap to "/brand/her.png" if uploaded

/**
 * Motif 1: Heart-shaped steam icon (used for typing indicators and loading spinners)
 */
export function HeartSteamIcon({ className = "w-5 h-5", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Delicate swirling steam that culminates into a floating heart */}
      <path
        d="M8.5 19C8 17.5 9 16 10 15C11 14 12 13 11.5 11"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <path
        d="M13.5 19C14.5 17 14 15 13 13.5C12.5 12.5 12.8 11.5 13.5 10.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      {/* Heart at the top of the steam */}
      <path
        d="M12 7.2C11.2 5.5 8.5 5.5 8.5 7.5C8.5 9.5 12 11.5 12 11.5C12 11.5 15.5 9.5 15.5 7.5C15.5 5.5 12.8 5.5 12 7.2Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * Motif 2: Speech bubble with heart (used for empty chat state and unread badges)
 */
export function SpeechBubbleHeartIcon({ className = "w-8 h-8", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Speech bubble rounded body */}
      <path
        d="M16 4C9.37 4 4 8.7 4 14.5C4 17.7 5.7 20.5 8.4 22.3C8.1 24.2 7.1 26.3 6.9 26.7C6.7 27.1 7.1 27.5 7.5 27.3C9.2 26.4 12 24.8 13.2 24.1C14.1 24.7 15 25 16 25C22.63 25 28 20.3 28 14.5C28 8.7 22.63 4 16 4Z"
        fill="var(--cream-2)"
        stroke="var(--blush)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Heart inside the speech bubble */}
      <path
        d="M16 11.2C15.2 9.5 12.5 9.5 12.5 11.5C12.5 13.5 16 16.5 16 16.5C16 16.5 19.5 13.5 19.5 11.5C19.5 9.5 16.8 9.5 16 11.2Z"
        fill="var(--crimson)"
      />
    </svg>
  );
}

/**
 * Matching Avatar badge for "Her" (matching the circular crimson/blush logo aesthetic)
 */
export function HerAvatar({ size = 36, className = "" }: { size?: number; className?: string }) {
  if (HER_AVATAR_CUSTOM_IMAGE) {
    return (
      <img
        src={HER_AVATAR_CUSTOM_IMAGE}
        alt="Her avatar"
        width={size}
        height={size}
        className={`rounded-full object-cover ring-2 ring-crimson ${className}`}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full bg-gradient-to-br from-her/30 via-blush/40 to-rose/30 ring-2 ring-crimson flex items-center justify-center relative shadow-sm shrink-0 overflow-hidden ${className}`}
      title="Her"
    >
      {/* Soft blush halo */}
      <div className="absolute inset-0 bg-radial-gradient from-her/20 to-transparent pointer-events-none" />
      {/* Elegant flower/monogram glyph */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-3/5 h-3/5"
      >
        <circle cx="12" cy="12" r="3" fill="var(--crimson)" />
        <circle cx="12" cy="6.5" r="2.2" fill="var(--rose)" />
        <circle cx="12" cy="17.5" r="2.2" fill="var(--rose)" />
        <circle cx="6.5" cy="12" r="2.2" fill="var(--rose)" />
        <circle cx="17.5" cy="12" r="2.2" fill="var(--rose)" />
      </svg>
    </div>
  );
}
