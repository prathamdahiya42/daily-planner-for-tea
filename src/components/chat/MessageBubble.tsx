"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Reply,
  Edit3,
  Trash2,
  MoreHorizontal,
  SmilePlus,
  Clock,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { DecryptedMessage } from "@/lib/chat/types";
import { getStickerById } from "@/lib/stickers/stickers";
import { StickerReactionPicker } from "@/components/stickers/StickerReactionPicker";
import { PhotoLightbox } from "./PhotoLightbox";
import { useChat } from "@/context/ChatContext";

interface MessageBubbleProps {
  message: DecryptedMessage;
  isMe: boolean;
  onReply: (message: DecryptedMessage) => void;
  onEdit: (message: DecryptedMessage) => void;
  onUnsend: (message: DecryptedMessage) => void;
  onToggleHeart: (messageId: string) => void;
  onToggleStickerReaction?: (messageId: string, stickerId: string) => void;
  onVisible: (messageId: string) => void;
}

export function MessageBubble({
  message,
  isMe,
  onReply,
  onEdit,
  onUnsend,
  onToggleHeart,
  onToggleStickerReaction,
  onVisible,
}: MessageBubbleProps) {
  const { fetchAndDecryptPhoto } = useChat();

  const [showMenu, setShowMenu] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    message.payload.photo?.localUrl || null
  );
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);

  const lastTapRef = useRef<number>(0);

  // Trigger seen receipt when rendered
  useEffect(() => {
    if (!isMe) {
      onVisible(message.id);
    }
  }, [message.id, isMe, onVisible]);

  // Load photo if type is photo and not yet cached locally
  useEffect(() => {
    if (message.type === "photo" && message.payload.photo && !photoUrl) {
      let isMounted = true;
      setIsLoadingPhoto(true);

      const { fileId, photoIv, mimeType } = message.payload.photo;
      fetchAndDecryptPhoto(fileId, photoIv, mimeType).then((url) => {
        if (isMounted) {
          setPhotoUrl(url);
          setIsLoadingPhoto(false);
        }
      });

      return () => {
        isMounted = false;
      };
    }
  }, [message.type, message.payload.photo, photoUrl, fetchAndDecryptPhoto]);

  // Double tap to react with heart
  const handleTouchOrClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 320) {
      // Double tap detected!
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
      onToggleHeart(message.id);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const { payload } = message;
  const timeStr = new Date(message.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const hasReactions = payload.reactions && Object.keys(payload.reactions).length > 0;
  const hasStickerReactions =
    payload.stickerReactions && Object.keys(payload.stickerReactions).length > 0;
  const isSeenByPartner =
    payload.seenBy &&
    Object.keys(payload.seenBy).some((devId) => devId !== message.sender_device_id);

  // Check if message has an expiry countdown
  const isExpiring = Boolean(message.expires_at);

  if (payload.isUnsent) {
    return (
      <div className={`flex w-full my-1.5 ${isMe ? "justify-end" : "justify-start"}`}>
        <div className="px-4 py-2 rounded-2xl border border-slate-200/70 bg-slate-50/80 text-xs italic text-slate-400">
          This message was unsent
        </div>
      </div>
    );
  }

  // --- PHOTO MESSAGE ---
  if (message.type === "photo") {
    return (
      <div
        className={`relative flex flex-col group my-2 ${
          isMe ? "items-end" : "items-start"
        }`}
      >
        {/* Reply Reference */}
        {payload.replyTo && (
          <div
            className={`flex items-center gap-1.5 text-[11px] px-3 py-1 mb-1 rounded-xl bg-slate-100/90 text-slate-500 max-w-[80%] truncate ${
              isMe ? "mr-1" : "ml-1"
            }`}
          >
            <Reply className="w-3 h-3 shrink-0 text-slate-400" />
            <span className="truncate">"{payload.replyTo.snippet}"</span>
          </div>
        )}

        <div className="relative max-w-[75%] select-none">
          <div
            onClick={() => {
              handleTouchOrClick();
              if (photoUrl) setShowLightbox(true);
            }}
            className="rounded-3xl overflow-hidden border border-rose-100/60 shadow-soft bg-rose-50/40 cursor-pointer active:scale-[0.99] transition relative"
          >
            {isLoadingPhoto && !photoUrl ? (
              <div className="w-56 h-56 flex flex-col items-center justify-center text-slate-400 gap-2 bg-slate-100 animate-pulse">
                <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
                <span className="text-xs">Decrypting photo...</span>
              </div>
            ) : photoUrl ? (
              <img
                src={photoUrl}
                alt="Shared photo"
                className="w-full max-h-72 object-cover rounded-3xl"
                loading="lazy"
              />
            ) : (
              <div className="w-56 h-40 flex flex-col items-center justify-center text-slate-400 gap-1 bg-slate-100">
                <ImageIcon className="w-6 h-6 text-slate-300" />
                <span className="text-xs">Unable to load photo</span>
              </div>
            )}

            {/* Photo Footer overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2.5 flex items-center justify-between text-[10px] text-white/90">
              <div className="flex items-center gap-1">
                {isExpiring && (
                  <span title="Disappearing photo" className="flex items-center gap-0.5 text-amber-300">
                    <Clock className="w-3 h-3" />
                  </span>
                )}
                <span>{timeStr}</span>
              </div>

              {isMe && isSeenByPartner && (
                <span title="Seen by partner" className="inline-flex items-center ml-0.5">
                  <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                </span>
              )}
            </div>
          </div>

          {/* Double-tap Floating Heart Burst Animation */}
          {showHeartBurst && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center animate-bounce z-20">
              <Heart className="w-14 h-14 fill-rose-500 text-rose-500 drop-shadow-xl scale-125 transition-transform" />
            </div>
          )}

          {/* Heart Reactions Badge */}
          {hasReactions && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggleHeart(message.id);
              }}
              className={`absolute -bottom-2 ${
                isMe ? "left-2" : "right-2"
              } bg-white border border-rose-100 rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-0.5 text-[11px] cursor-pointer`}
            >
              <span>❤️</span>
            </div>
          )}

          {/* Sticker Reaction Badges */}
          {hasStickerReactions && (
            <div
              className={`absolute -bottom-2 ${
                isMe ? "left-10" : "right-10"
              } flex items-center gap-1`}
            >
              {Object.entries(payload.stickerReactions || {}).map(([dev, stId]) => {
                const def = getStickerById(stId);
                if (!def) return null;
                return (
                  <div
                    key={dev}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStickerReaction?.(message.id, stId);
                    }}
                    className="w-6 h-6 p-0.5 rounded-full bg-white border border-rose-100 shadow-sm cursor-pointer active:scale-95 transition"
                    title={def.name}
                  >
                    <img src={def.file} alt={def.name} className="w-full h-full object-contain" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Trigger Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`absolute top-2 ${
              isMe ? "-left-8" : "-right-8"
            } p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition`}
            aria-label="Message options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Context Menu Dropdown */}
          {showMenu && (
            <div
              className={`absolute top-8 ${
                isMe ? "right-0" : "left-0"
              } z-30 bg-white border border-slate-200 shadow-xl rounded-2xl py-1.5 w-36 text-xs text-slate-700`}
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  onReply(message);
                }}
                className="w-full px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-slate-700 transition"
              >
                <Reply className="w-3.5 h-3.5 text-rose-500" />
                Reply
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowStickerPicker(true);
                }}
                className="w-full px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-slate-700 transition"
              >
                <SmilePlus className="w-3.5 h-3.5 text-amber-500" />
                Sticker React
              </button>

              {isMe && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onUnsend(message);
                  }}
                  className="w-full px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Unsend
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sticker Reaction Drawer */}
        {showStickerPicker && (
          <StickerReactionPicker
            onSelectReaction={(stId) => onToggleStickerReaction?.(message.id, stId)}
            onClose={() => setShowStickerPicker(false)}
          />
        )}

        {/* Photo Lightbox */}
        {showLightbox && photoUrl && (
          <PhotoLightbox
            photoUrl={photoUrl}
            onClose={() => setShowLightbox(false)}
            onToggleHeart={() => onToggleHeart(message.id)}
            hasHeart={Boolean(payload.reactions && payload.reactions[message.sender_device_id])}
          />
        )}
      </div>
    );
  }

  // --- STICKER MESSAGE ---
  if (message.type === "sticker" && payload.stickerId) {
    const stickerFile = payload.stickerFile || `/stickers/${payload.stickerId}.svg`;

    return (
      <div
        className={`relative flex flex-col group my-2 ${
          isMe ? "items-end" : "items-start"
        }`}
      >
        <div className="relative select-none" onClick={handleTouchOrClick}>
          <div className="w-36 h-36 p-1 transition-transform active:scale-95 cursor-pointer flex items-center justify-center">
            <img
              src={stickerFile}
              alt="Sticker"
              className="w-full h-full object-contain drop-shadow-md"
              loading="lazy"
            />
          </div>

          <div
            className={`flex items-center gap-1 font-hand text-[13px] mt-0.5 px-2 text-plum-soft ${
              isMe ? "justify-end text-rose" : "justify-start"
            }`}
          >
            {isExpiring && (
              <span title="Disappearing sticker" className="flex items-center text-amber-500">
                <Clock className="w-2.5 h-2.5" />
              </span>
            )}
            <span>{timeStr}</span>
            {isMe && isSeenByPartner && (
              <span title="Seen by partner" className="inline-flex items-center ml-0.5">
                <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
              </span>
            )}
          </div>

          {/* Double-tap Floating Heart Burst Animation */}
          {showHeartBurst && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center animate-bounce z-20">
              <Heart className="w-12 h-12 fill-rose-500 text-rose-500 drop-shadow-lg scale-125 transition-transform" />
            </div>
          )}

          {/* Heart Reactions Badge */}
          {hasReactions && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggleHeart(message.id);
              }}
              className={`absolute -bottom-2 ${
                isMe ? "left-2" : "right-2"
              } bg-white border border-rose-100 rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-0.5 text-[11px] cursor-pointer`}
            >
              <span>❤️</span>
            </div>
          )}

          {/* Sticker Reaction Badges */}
          {hasStickerReactions && (
            <div
              className={`absolute -bottom-2 ${
                isMe ? "left-10" : "right-10"
              } flex items-center gap-1`}
            >
              {Object.entries(payload.stickerReactions || {}).map(([dev, stId]) => {
                const def = getStickerById(stId);
                if (!def) return null;
                return (
                  <div
                    key={dev}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStickerReaction?.(message.id, stId);
                    }}
                    className="w-6 h-6 p-0.5 rounded-full bg-white border border-rose-100 shadow-sm cursor-pointer active:scale-95 transition"
                    title={def.name}
                  >
                    <img src={def.file} alt={def.name} className="w-full h-full object-contain" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Trigger Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`absolute top-2 ${
              isMe ? "-left-8" : "-right-8"
            } p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition`}
            aria-label="Message options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Context Menu Dropdown */}
          {showMenu && (
            <div
              className={`absolute top-8 ${
                isMe ? "right-0" : "left-0"
              } z-30 bg-white border border-slate-200 shadow-xl rounded-2xl py-1.5 w-36 text-xs text-slate-700`}
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  onReply(message);
                }}
                className="w-full px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-slate-700 transition"
              >
                <Reply className="w-3.5 h-3.5 text-rose-500" />
                Reply
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowStickerPicker(true);
                }}
                className="w-full px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-slate-700 transition"
              >
                <SmilePlus className="w-3.5 h-3.5 text-amber-500" />
                Sticker React
              </button>

              {isMe && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onUnsend(message);
                  }}
                  className="w-full px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Unsend
                </button>
              )}
            </div>
          )}
        </div>

        {showStickerPicker && (
          <StickerReactionPicker
            onSelectReaction={(stId) => onToggleStickerReaction?.(message.id, stId)}
            onClose={() => setShowStickerPicker(false)}
          />
        )}
      </div>
    );
  }

  // --- CODED SIGNAL MESSAGE ---
  if (message.type === "signal") {
    const signalIndex = typeof payload.extra?.signalIndex === "number" ? payload.extra.signalIndex : 0;
    const emoji = ["💧", "📖", "🌙", "🧸", "☕", "🏃"][signalIndex] || "🔔";

    return (
      <div
        className={`relative flex flex-col group my-2 ${
          isMe ? "items-end" : "items-start"
        }`}
      >
        <div
          onClick={handleTouchOrClick}
          className={`px-4 py-3 rounded-2xl border text-xs shadow-soft transition active:scale-[0.99] cursor-pointer max-w-[85%] ${
            isMe
              ? "bg-amber-500 text-white border-amber-600 rounded-br-sm"
              : "bg-white border-amber-200 text-slate-800 rounded-bl-sm"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{emoji}</span>
            <span className={`font-bold uppercase tracking-wider text-[10px] ${isMe ? "text-amber-100" : "text-amber-600"}`}>
              Coded Signal
            </span>
          </div>

          <p className="font-semibold text-sm leading-snug">{payload.text}</p>

          <div
            className={`flex items-center justify-end gap-1.5 text-[10px] mt-2 select-none ${
              isMe ? "text-amber-100" : "text-slate-400"
            }`}
          >
            <span>{timeStr}</span>
            {isMe && isSeenByPartner && (
              <span title="Seen by partner" className="inline-flex items-center ml-0.5">
                <Heart className="w-2.5 h-2.5 fill-amber-200 text-amber-200" />
              </span>
            )}
          </div>
        </div>

        {/* Double-tap Floating Heart Burst Animation */}
        {showHeartBurst && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center animate-bounce z-20">
            <Heart className="w-12 h-12 fill-rose-500 text-rose-500 drop-shadow-lg scale-125 transition-transform" />
          </div>
        )}
      </div>
    );
  }

  // --- STANDARD TEXT MESSAGE ---
  return (
    <div
      className={`relative flex flex-col group my-1.5 ${
        isMe ? "items-end" : "items-start"
      }`}
    >
      {/* Reply Reference Bubble */}
      {payload.replyTo && (
        <div
          className={`flex items-center gap-1.5 text-[11px] px-3 py-1 mb-1 rounded-xl bg-slate-100/90 text-slate-500 max-w-[80%] truncate ${
            isMe ? "mr-1" : "ml-1"
          }`}
        >
          <Reply className="w-3 h-3 shrink-0 text-slate-400" />
          <span className="truncate">"{payload.replyTo.snippet}"</span>
        </div>
      )}

      {/* Main Message Bubble */}
      <div className="relative max-w-[82%] select-none">
        <div
          onClick={handleTouchOrClick}
          className={`px-4 py-2.5 transition active:scale-[0.99] cursor-pointer break-words text-[16px] leading-[1.45] font-body ${
            isMe
              ? "bg-gradient-to-br from-crimson to-berry text-white rounded-[20px] rounded-br-[6px] shadow-sm"
              : "bg-surface border border-blush text-plum rounded-[20px] rounded-bl-[6px] shadow-bubble"
          }`}
        >
          <p className="whitespace-pre-wrap">{payload.text}</p>

          {/* Timestamp, Disappearing Timer, Edited & Seen Status */}
          <div
            className={`flex items-center justify-end gap-1.5 font-hand text-[13px] mt-0.5 select-none ${
              isMe ? "text-rose/90" : "text-plum-soft"
            }`}
          >
            {isExpiring && (
              <span title="Disappearing message" className="inline-flex items-center opacity-80">
                <Clock className="w-2.5 h-2.5" />
              </span>
            )}
            {payload.editedAt && <span>(edited)</span>}
            <span>{timeStr}</span>

            {/* Seen status shown as a small heart */}
            {isMe && isSeenByPartner && (
              <span title="Seen by partner" className="inline-flex items-center ml-0.5">
                <Heart className="w-2.5 h-2.5 fill-rose text-rose" />
              </span>
            )}
          </div>
        </div>

        {/* Double-tap Floating Heart Burst Animation */}
        {showHeartBurst && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center animate-bounce z-20">
            <Heart className="w-12 h-12 fill-rose-500 text-rose-500 drop-shadow-lg scale-125 transition-transform" />
          </div>
        )}

        {/* Heart Reaction Badge */}
        {hasReactions && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleHeart(message.id);
            }}
            className={`absolute -bottom-2.5 ${
              isMe ? "left-2" : "right-2"
            } bg-white border border-rose-100 rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-0.5 text-[11px] cursor-pointer active:scale-95 transition`}
          >
            <span>❤️</span>
            {Object.keys(payload.reactions || {}).length > 1 && (
              <span className="text-[10px] font-bold text-rose-500">2</span>
            )}
          </div>
        )}

        {/* Sticker Reaction Badges */}
        {hasStickerReactions && (
          <div
            className={`absolute -bottom-2.5 ${
              isMe ? "left-10" : "right-10"
            } flex items-center gap-1`}
          >
            {Object.entries(payload.stickerReactions || {}).map(([dev, stId]) => {
              const def = getStickerById(stId);
              if (!def) return null;
              return (
                <div
                  key={dev}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStickerReaction?.(message.id, stId);
                  }}
                  className="w-6 h-6 p-0.5 rounded-full bg-white border border-rose-100 shadow-sm cursor-pointer active:scale-95 transition"
                  title={def.name}
                >
                  <img src={def.file} alt={def.name} className="w-full h-full object-contain" />
                </div>
              );
            })}
          </div>
        )}

        {/* Action Trigger Button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`absolute top-2 ${
            isMe ? "-left-8" : "-right-8"
          } p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition`}
          aria-label="Message options"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>

        {/* Context Menu Dropdown */}
        {showMenu && (
          <div
            className={`absolute top-8 ${
              isMe ? "right-0" : "left-0"
            } z-30 bg-white border border-slate-200 shadow-xl rounded-2xl py-1.5 w-36 text-xs text-slate-700`}
          >
            <button
              onClick={() => {
                setShowMenu(false);
                onReply(message);
              }}
              className="w-full px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-slate-700 transition"
            >
              <Reply className="w-3.5 h-3.5 text-rose-500" />
              Reply
            </button>

            <button
              onClick={() => {
                setShowMenu(false);
                setShowStickerPicker(true);
              }}
              className="w-full px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-slate-700 transition"
            >
              <SmilePlus className="w-3.5 h-3.5 text-amber-500" />
              Sticker React
            </button>

            {isMe && (
              <>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(message);
                  }}
                  className="w-full px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-slate-700 transition"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  Edit
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onUnsend(message);
                  }}
                  className="w-full px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Unsend
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Sticker Reaction Drawer */}
      {showStickerPicker && (
        <StickerReactionPicker
          onSelectReaction={(stId) => onToggleStickerReaction?.(message.id, stId)}
          onClose={() => setShowStickerPicker(false)}
        />
      )}
    </div>
  );
}
