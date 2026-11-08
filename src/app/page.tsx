"use client";

import React, { useState, useEffect } from "react";
import { useRoom } from "@/context/RoomContext";
import { SimpleLogin } from "@/components/auth/SimpleLogin";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { DailyPlanner } from "@/components/decoy/DailyPlanner";

export default function HomePage() {
  const { isUnlocked, enterRoomWithPassword } = useRoom();
  const [showSecret, setShowSecret] = useState(false);

  // Check if secret unlock was already triggered in this browser session or query param
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("login") === "1" || searchParams.get("secret") === "1") {
        setShowSecret(true);
        return;
      }
      const sessionUnlocked = sessionStorage.getItem("olr_decoy_unlocked");
      if (sessionUnlocked === "1") {
        setShowSecret(true);
      }
    } catch {}
  }, []);

  // When room is unlocked, show the chat
  if (isUnlocked) {
    return <ChatRoom />;
  }

  // If secret gesture was triggered, show login with smooth scale/fade transition (Phase 2.1)
  if (showSecret) {
    return (
      <div className="w-full min-h-screen animate-entrance">
        <SimpleLogin
          onEnter={async (password, nickname, remember) => {
            return await enterRoomWithPassword(password, nickname, remember);
          }}
          onCancel={() => {
            setShowSecret(false);
            try {
              sessionStorage.removeItem("olr_decoy_unlocked");
            } catch {}
          }}
        />
      </div>
    );
  }

  // Neutral decoy cover screen by default (Rule 2)
  return (
    <DailyPlanner
      onTriggerSecret={() => {
        try {
          sessionStorage.setItem("olr_decoy_unlocked", "1");
        } catch {}
        setShowSecret(true);
      }}
    />
  );
}
