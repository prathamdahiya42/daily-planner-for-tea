"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Camera, Coffee, Send, X, Reply, Edit3, Loader2 } from "lucide-react";
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea up to 5 lines (~120px) (Phase 3.1)
  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, 120);
    el.style.height = `${Math.max(nextHeight, 42)}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [text]);

  // Focus on reply or edit
  useEffect(() => {
    if (replyingTo || editingMessage) {
      textareaRef.current?.focus();
    }
    if (editingMessage) {
      setText(editingMessage.payload.text);
    }
  }, [replyingTo, editingMessage]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
    if (textareaRef.current) {
      textareaRef.current.style.height = "42px";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Desktop Enter sends (Shift+Enter inserts newline)
    if (e.key === "Enter" && !e.shiftKey) {
      const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;
      if (!isMobile) {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";
    setIsUploadingPhoto(true);
    await onSendPhoto(file);
    setIsUploadingPhoto(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTyping(e.target.value.length > 0);
  };

  return (
    <footer className="sticky bottom-0 glass-chrome border-t border-blush/60 p-2.5 z-20 transition-colors">
      {/* Replying Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-cream-2 border border-blush/60 rounded-xl text-xs text-plum">
          <div className="flex items-center gap-1.5 truncate">
            <Reply className="w-3.5 h-3.5 text-crimson shrink-0" />
            <span className="font-semibold text-crimson">Replying:</span>
            <span className="truncate italic font-hand text-[13px]">"{replyingTo.payload.text}"</span>
          </div>
          <button
            onClick={onCancelReply}
            className="w-7 h-7 flex items-center justify-center text-plum-soft hover:text-plum rounded-full"
            aria-label="Cancel reply"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editing Banner */}
      {editingMessage && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-peach/30 border border-peach rounded-xl text-xs text-plum">
          <div className="flex items-center gap-1.5 truncate">
            <Edit3 className="w-3.5 h-3.5 text-berry shrink-0" />
            <span className="font-semibold text-berry">Editing message</span>
          </div>
          <button
            onClick={() => {
              setText("");
              onCancelEdit();
            }}
            className="w-7 h-7 flex items-center justify-center text-plum-soft hover:text-plum rounded-full"
            aria-label="Cancel edit"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input Row */}
      <form onSubmit={handleSubmit} className="flex items-end gap-1.5">
        {/* Hidden file picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoSelect}
        />

        {/* Stickers Button (Sparkles icon) */}
        <button
          type="button"
          onClick={onOpenStickers}
          className="w-10 h-10 rounded-full hover:bg-cream-2 text-rose hover:text-crimson active:scale-95 flex items-center justify-center transition shrink-0"
          title="Open Stickers"
          aria-label="Open stickers"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Photo Button (Camera icon) */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingPhoto}
          className="w-10 h-10 rounded-full hover:bg-cream-2 text-rose hover:text-berry active:scale-95 flex items-center justify-center transition shrink-0 disabled:opacity-40"
          title="Send Encrypted Photo"
          aria-label="Send photo"
        >
          {isUploadingPhoto ? (
            <Loader2 className="w-4 h-4 animate-spin text-berry" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </button>

        {/* Quick Signal Button (Tea/Coffee icon) */}
        <button
          type="button"
          onClick={onOpenSignals}
          className="w-10 h-10 rounded-full hover:bg-cream-2 text-rose hover:text-crimson active:scale-95 flex items-center justify-center transition shrink-0"
          title="Send Quick Signal"
          aria-label="Quick tea signal"
        >
          <Coffee className="w-4 h-4" />
        </button>

        {/* Auto-expanding <textarea> up to 5 lines then scrolls internally */}
        <div className="flex-1 relative flex items-center min-h-[42px]">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="say something sweet…"
            className="w-full resize-none py-2 px-3.5 text-[16px] leading-[1.4] font-body bg-surface border border-blush/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-crimson/30 focus:border-crimson text-plum placeholder:font-hand placeholder:text-rose placeholder:text-[16px] max-h-[120px] overflow-y-auto scrollbar-none"
          />
        </div>

        {/* Send Button: High-contrast state differentiation */}
        <button
          type="submit"
          disabled={!text.trim() || isSubmitting}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-crimson to-berry text-white flex items-center justify-center transition shadow-soft hover:opacity-95 active:scale-95 disabled:opacity-25 disabled:shadow-none disabled:scale-100 shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>
    </footer>
  );
}
