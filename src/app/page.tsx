"use client";

import React from "react";
import { useRoom } from "@/context/RoomContext";
import { SimpleLogin } from "@/components/auth/SimpleLogin";
import { ChatRoom } from "@/components/chat/ChatRoom";

export default function HomePage() {
  const { isUnlocked, enterRoomWithPassword } = useRoom();

  if (isUnlocked) {
    return <ChatRoom />;
  }

  return (
    <SimpleLogin
      onEnter={async (password, nickname, remember) => {
        return await enterRoomWithPassword(password, nickname, remember);
      }}
    />
  );
}
