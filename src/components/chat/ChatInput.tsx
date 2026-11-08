"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, X, Reply, Edit3, Smile, Camera, Bell, Loader2 } from "lucide-react";
import { DecryptedMessage } from "@/lib/chat/types";

interface ChatInputProps {
  onSendMessage: (text: string) => Promise<{ success: boolean }>;
  onOpenStickers: () => void;
  onOpenSignals: () => void;
  onSendPhoto: (file: File) => Promise<{ success: boolean; error?: string }>;
  replyingTo: DecryptedMessage | null;
  onCancelReply: () => void;
  editingMessage: DecryptedMessage | null;
  onCancelEdit: () => void;
  onSaveEdit: (messageId: string, newText: string) => Promise<{ success: boolean }>;
  onTyping: (isTyping: boolean) => void;
}

export function ChatInput({
  onSendMessage,
  onOpenStickers,
  onOpenSignals,
  onSendPhoto,
  replyingTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  onSaveEdit,
  onTyping,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Focus input on reply or edit
  useEffect(() => {
    if (replyingTo || editingMessage) {
      inputRef.current?.focus();
    }
    if (editingMessage) {
      setText(editingMessage.payload.text);
    }
  }, [replyingTo, editingMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);

    if (editingMessage) {
      const res = await onSaveEdit(editingMessage.id, text.trim());
      if (res.success) {
        setText("");
        onCancelEdit();
      }
    } else {
      const res = await onSendMessage(text.trim());
      if (res.success) {
        setText("");
      }
    }

    setIsSubmitting(false);
    onTyping(false);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so user can choose the same photo again if desired
    e.target.value = "";

    setIsUploadingPhoto(true);
    await onSendPhoto(file);
    setIsUploadingPhoto(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onTyping(e.target.value.length > 0);
  };

  return (
    <footer className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-room-border p-3 z-20">
      {/* Replying Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800">
          <div className="flex items-center gap-1.5 truncate">
            <Reply className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="font-semibold text-rose-600">Replying:</span>
            <span className="truncate italic">"{replyingTo.payload.text}"</span>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 text-rose-400 hover:text-rose-600 rounded-full"
            aria-label="Cancel reply"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editing Banner */}
      {editingMessage && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800">
          <div className="flex items-center gap-1.5 truncate">
            <Edit3 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-semibold text-amber-700">Editing message</span>
          </div>
          <button
            onClick={() => {
              setText("");
              onCancelEdit();
            }}
            className="p-1 text-amber-500 hover:text-amber-700 rounded-full"
            aria-label="Cancel edit"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input Row */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Hidden file picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoSelect}
        />

        {/* Stickers Button */}
        <button
          type="button"
          onClick={onOpenStickers}
          className="w-10 h-10 rounded-2xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-500 flex items-center justify-center transition border border-rose-200/50 shrink-0"
          title="Open Stickers"
          aria-label="Open stickers"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Photo Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingPhoto}
          className="w-10 h-10 rounded-2xl bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-600 flex items-center justify-center transition border border-amber-200/50 shrink-0 disabled:opacity-50"
          title="Send Encrypted Photo"
          aria-label="Send photo"
        >
          {isUploadingPhoto ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </button>

        {/* Coded Signal Button */}
        <button
          type="button"
          onClick={onOpenSignals}
          className="w-10 h-10 rounded-2xl bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-500 flex items-center justify-center transition border border-indigo-200/50 shrink-0"
          title="Send Coded Signal"
          aria-label="Coded signals"
        >
          <Bell className="w-4 h-4" />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleChange}
          placeholder="Send a sweet note..."
          className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 text-slate-800 placeholder-slate-400"
        />

        <button
          type="submit"
          disabled={!text.trim() || isSubmitting}
          className="w-10 h-10 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white flex items-center justify-center transition shadow-soft disabled:opacity-40 disabled:scale-100 shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>
    </footer>
  );
}
