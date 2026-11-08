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
import { resolveSticker } from "@/lib/stickers/resolver";
import { Sticker } from "./Sticker";
import { StickerReactionPicker } from "@/components/stickers/StickerReactionPicker";
import { PhotoLightbox } from "./PhotoLightbox";
import { useChat } from "@/context/ChatContext";

export interface MessageBubbleProps {
  message: DecryptedMessage;
  isMe: boolean;
  isNew?: boolean;
  isLastInGroup?: boolean;
  onReply: (message: DecryptedMessage) => void;
  onEdit: (message: DecryptedMessage) => void;
  onUnsend: (message: DecryptedMessage) => void;
  onToggleHeart: (messageId: string) => void;
  onToggleStickerReaction?: (messageId: string, stickerId: string) => void;
  onVisible: (messageId: string) => void;
}

function MessageBubbleComponent({
  message,
  isMe,
  isNew = false,
  isLastInGroup = true,
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

  // Double tap to react with heart burst (Phase 3.3)
  const handleTouchOrClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 320) {
      // Double tap detected!
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 650);
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

  const isExpiring = Boolean(message.expires_at);

  if (payload.isUnsent) {
    return (
      <div className={`message-row flex w-full my-1 ${isMe ? "justify-end" : "justify-start"}`}>
        <div className="px-3.5 py-1.5 rounded-2xl border border-blush/60 bg-cream-2/70 text-xs italic text-plum-soft">
          This message was unsent
        </div>
      </div>
    );
  }

  // --- PHOTO MESSAGE ---
  if (message.type === "photo") {
    return (
      <div
        className={`message-row relative flex flex-col group ${isLastInGroup ? "mb-2" : "mb-0.5"} ${
          isMe ? "items-end" : "items-start"
        } ${isNew ? "animate-message-in" : ""}`}
      >
        {/* Reply Reference */}
        {payload.replyTo && (
          <div
            className={`flex items-center gap-1.5 text-[11px] px-3 py-1 mb-1 rounded-xl bg-cream-2/80 text-plum-soft max-w-[80%] truncate ${
              isMe ? "mr-1" : "ml-1"
            }`}
          >
            <Reply className="w-3 h-3 shrink-0 text-plum-soft" />
            <span className="truncate italic font-hand text-[13px]">"{payload.replyTo.snippet}"</span>
          </div>
        )}

        <div className="relative max-w-[78%] select-none">
          {/* Reserved aspect ratio placeholder (Phase 3.2: eliminate layout shift) */}
          <div
            onClick={() => {
              handleTouchOrClick();
              if (photoUrl) setShowLightbox(true);
            }}
            className="w-60 max-w-full aspect-[4/3] rounded-3xl overflow-hidden border border-blush/60 shadow-soft bg-peach/20 backdrop-blur-xs cursor-pointer active:scale-[0.99] transition relative"
          >
            {isLoadingPhoto && !photoUrl ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-plum-soft gap-2 bg-cream-2/60 animate-pulse">
                <Loader2 className="w-6 h-6 animate-spin text-crimson" />
                <span className="text-xs font-hand">decrypting photo...</span>
              </div>
            ) : photoUrl ? (
              <img
                src={photoUrl}
                alt="Shared photo"
                className="w-full h-full object-cover rounded-3xl"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-plum-soft gap-1 bg-cream-2/40">
                <ImageIcon className="w-6 h-6 text-rose" />
                <span className="text-xs">Unable to load photo</span>
              </div>
            )}

            {/* Photo Footer overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2.5 flex items-center justify-between text-[11px] text-white">
              <div className="flex items-center gap-1 font-hand text-[13px]">
                {isExpiring && (
                  <span title="Disappearing photo" className="flex items-center gap-0.5 text-amber-300">
                    <Clock className="w-3 h-3" />
                  </span>
                )}
                <span>{timeStr}</span>
              </div>

              {isMe && (
                <span title={isSeenByPartner ? "Seen by partner" : "Sent"} className="inline-flex items-center ml-0.5">
                  <Heart
                    className={`w-3 h-3 ${
                      isSeenByPartner ? "fill-crimson text-crimson" : "text-white/80"
                    }`}
                  />
                </span>
              )}
            </div>
          </div>

          {/* Double-tap Floating Heart Burst (6 tiny flying hearts - Phase 3.3) */}
          {showHeartBurst && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
              <span className="absolute animate-heart-burst-1 text-crimson text-sm">❤️</span>
              <span className="absolute animate-heart-burst-2 text-rose text-base">💖</span>
              <span className="absolute animate-heart-burst-3 text-crimson text-sm">💕</span>
              <span className="absolute animate-heart-burst-4 text-berry text-xs">💓</span>
              <span className="absolute animate-heart-burst-5 text-peach text-sm">💗</span>
              <span className="absolute animate-heart-burst-6 text-crimson text-lg">❤️</span>
            </div>
          )}

          {/* Persistent Heart Reaction Badge Pop-in (Phase 3.3) */}
          {hasReactions && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggleHeart(message.id);
              }}
              className={`absolute -bottom-2.5 ${
                isMe ? "left-2" : "right-2"
              } bg-surface border border-blush/80 rounded-full px-2 py-0.5 shadow-sm flex items-center gap-0.5 text-xs cursor-pointer active:scale-95 transition animate-pop-in z-10`}
            >
              <span>❤️</span>
              {Object.keys(payload.reactions || {}).length > 1 && (
                <span className="text-[10px] font-bold text-crimson font-body">2</span>
              )}
            </div>
          )}

          {/* Sticker Reaction Badges */}
          {hasStickerReactions && (
            <div
              className={`absolute -bottom-2.5 ${
                isMe ? "left-11" : "right-11"
              } flex items-center gap-1 z-10`}
            >
              {Object.entries(payload.stickerReactions || {}).map(([dev, stId]) => {
                const resolved = resolveSticker(stId);
                return (
                  <div
                    key={dev}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStickerReaction?.(message.id, stId);
                    }}
                    className="w-6 h-6 p-0.5 rounded-full bg-surface border border-blush/80 shadow-sm cursor-pointer active:scale-95 transition flex items-center justify-center overflow-hidden"
                    title={resolved.name}
                  >
                    <Sticker payload={stId} size="small" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Trigger Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`absolute top-2 ${
              isMe ? "-left-9" : "-right-9"
            } w-8 h-8 rounded-full flex items-center justify-center text-plum-soft hover:text-plum hover:bg-cream-2 opacity-0 group-hover:opacity-100 transition`}
            aria-label="Message options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Context Menu Dropdown */}
          {showMenu && (
            <div
              className={`absolute top-8 ${
                isMe ? "right-0" : "left-0"
              } z-30 bg-surface border border-blush shadow-xl rounded-2xl py-1.5 w-36 text-xs text-plum font-body`}
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  onReply(message);
                }}
                className="w-full px-3.5 py-2 hover:bg-cream-2 flex items-center gap-2 transition"
              >
                <Reply className="w-3.5 h-3.5 text-crimson" />
                Reply
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowStickerPicker(true);
                }}
                className="w-full px-3.5 py-2 hover:bg-cream-2 flex items-center gap-2 transition"
              >
                <SmilePlus className="w-3.5 h-3.5 text-peach" />
                Sticker React
              </button>

              {isMe && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onUnsend(message);
                  }}
                  className="w-full px-3.5 py-2 hover:bg-cream-2 flex items-center gap-2 text-crimson transition"
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
  if (message.type === "sticker" || payload.stickerId || payload.stickerFile) {
    return (
      <div
        className={`message-row relative flex flex-col group ${isLastInGroup ? "mb-2" : "mb-0.5"} ${
          isMe ? "items-end" : "items-start"
        } ${isNew ? "animate-message-in" : ""}`}
      >
        <div className="relative select-none" onClick={handleTouchOrClick}>
          <div className="p-1 transition-transform active:scale-95 cursor-pointer flex items-center justify-center">
            <Sticker payload={payload} />
          </div>

          <div
            className={`flex items-center gap-1 font-hand text-[13px] mt-0.5 px-2 ${
              isMe ? "justify-end text-rose" : "justify-start text-plum-soft"
            }`}
          >
            {isExpiring && (
              <span title="Disappearing sticker" className="flex items-center text-amber-500">
                <Clock className="w-2.5 h-2.5" />
              </span>
            )}
            <span>{timeStr}</span>
            {isMe && (
              <span title={isSeenByPartner ? "Seen by partner" : "Sent"} className="inline-flex items-center ml-0.5">
                <Heart
                  className={`w-2.5 h-2.5 ${
                    isSeenByPartner ? "fill-crimson text-crimson" : "text-rose/60"
                  }`}
                />
              </span>
            )}
          </div>

          {/* Double-tap Floating Heart Burst */}
          {showHeartBurst && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
              <span className="absolute animate-heart-burst-1 text-crimson text-sm">❤️</span>
              <span className="absolute animate-heart-burst-2 text-rose text-base">💖</span>
              <span className="absolute animate-heart-burst-3 text-crimson text-sm">💕</span>
              <span className="absolute animate-heart-burst-4 text-berry text-xs">💓</span>
              <span className="absolute animate-heart-burst-5 text-peach text-sm">💗</span>
              <span className="absolute animate-heart-burst-6 text-crimson text-lg">❤️</span>
            </div>
          )}

          {/* Persistent Heart Reaction Badge Pop-in */}
          {hasReactions && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggleHeart(message.id);
              }}
              className={`absolute -bottom-2 ${
                isMe ? "left-2" : "right-2"
              } bg-surface border border-blush/80 rounded-full px-2 py-0.5 shadow-sm flex items-center gap-0.5 text-xs cursor-pointer animate-pop-in z-10`}
            >
              <span>❤️</span>
            </div>
          )}

          {/* Sticker Reaction Badges */}
          {hasStickerReactions && (
            <div
              className={`absolute -bottom-2 ${
                isMe ? "left-10" : "right-10"
              } flex items-center gap-1 z-10`}
            >
              {Object.entries(payload.stickerReactions || {}).map(([dev, stId]) => {
                const resolved = resolveSticker(stId);
                return (
                  <div
                    key={dev}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStickerReaction?.(message.id, stId);
                    }}
                    className="w-6 h-6 p-0.5 rounded-full bg-surface border border-blush/80 shadow-sm cursor-pointer active:scale-95 transition flex items-center justify-center overflow-hidden"
                    title={resolved.name}
                  >
                    <Sticker payload={stId} size="small" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- CODED SIGNAL MESSAGE ---
  if (message.type === "signal") {
    const signalIndex = typeof payload.extra?.signalIndex === "number" ? payload.extra.signalIndex : 0;
    const emoji = ["💧", "📖", "🌙", "🧸", "☕", "🏃"][signalIndex] || "🔔";

    return (
      <div
        className={`message-row relative flex flex-col group ${isLastInGroup ? "mb-2" : "mb-0.5"} ${
          isMe ? "items-end" : "items-start"
        } ${isNew ? "animate-message-in" : ""}`}
      >
        <div
          onClick={handleTouchOrClick}
          className={`px-4 py-3 rounded-2xl border text-xs shadow-soft transition active:scale-[0.99] cursor-pointer max-w-[85%] ${
            isMe
              ? "bg-gradient-to-r from-crimson to-berry text-white border-crimson rounded-br-sm"
              : "bg-surface border-blush text-plum rounded-bl-sm"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{emoji}</span>
            <span className={`font-bold uppercase tracking-wider text-[10px] ${isMe ? "text-cream-2" : "text-berry"}`}>
              Coded Signal
            </span>
          </div>

          <p className="font-semibold text-sm leading-snug font-body">{payload.text}</p>

          <div
            className={`flex items-center justify-end gap-1.5 font-hand text-[13px] mt-2 select-none ${
              isMe ? "text-blush" : "text-plum-soft"
            }`}
          >
            <span>{timeStr}</span>
            {isMe && (
              <span title={isSeenByPartner ? "Seen by partner" : "Sent"} className="inline-flex items-center ml-0.5">
                <Heart
                  className={`w-2.5 h-2.5 ${
                    isSeenByPartner ? "fill-crimson text-crimson" : "text-blush/60"
                  }`}
                />
              </span>
            )}
          </div>
        </div>

        {/* Double-tap Floating Heart Burst */}
        {showHeartBurst && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
            <span className="absolute animate-heart-burst-1 text-crimson text-sm">❤️</span>
            <span className="absolute animate-heart-burst-2 text-rose text-base">💖</span>
            <span className="absolute animate-heart-burst-3 text-crimson text-sm">💕</span>
            <span className="absolute animate-heart-burst-4 text-berry text-xs">💓</span>
            <span className="absolute animate-heart-burst-5 text-peach text-sm">💗</span>
            <span className="absolute animate-heart-burst-6 text-crimson text-lg">❤️</span>
          </div>
        )}
      </div>
    );
  }

  // --- STANDARD TEXT MESSAGE ---
  return (
    <div
      className={`message-row relative flex flex-col group ${isLastInGroup ? "mb-2" : "mb-0.5"} ${
        isMe ? "items-end" : "items-start"
      } ${isNew ? "animate-message-in" : ""}`}
    >
      {/* Reply Reference Bubble */}
      {payload.replyTo && (
        <div
          className={`flex items-center gap-1.5 text-[11px] px-3 py-1 mb-1 rounded-xl bg-cream-2/80 text-plum-soft max-w-[80%] truncate ${
            isMe ? "mr-1" : "ml-1"
          }`}
        >
          <Reply className="w-3 h-3 shrink-0 text-plum-soft" />
          <span className="truncate italic font-hand text-[13px]">"{payload.replyTo.snippet}"</span>
        </div>
      )}

      {/* Main Message Bubble (Phase 1.1 + Phase 3.2: 16px/1.45 Nunito, grouped corners) */}
      <div className="relative max-w-[82%] select-none">
        <div
          onClick={handleTouchOrClick}
          className={`px-4 py-2.5 transition active:scale-[0.99] cursor-pointer break-words text-[16px] leading-[1.45] font-body ${
            isMe
              ? `bg-gradient-to-br from-crimson to-berry text-white ${
                  isLastInGroup ? "rounded-[20px] rounded-br-[6px]" : "rounded-[20px]"
                } shadow-sm`
              : `bg-surface border border-blush text-plum ${
                  isLastInGroup ? "rounded-[20px] rounded-bl-[6px]" : "rounded-[20px]"
                } shadow-bubble`
          }`}
        >
          {payload.text ? (
            <p className="whitespace-pre-wrap">{payload.text}</p>
          ) : (
            <p className="whitespace-pre-wrap italic opacity-70 text-xs">✨</p>
          )}

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

            {/* Seen status: tiny heart (hollow = sent, filled with crimson = seen - Phase 3.3) */}
            {isMe && (
              <span title={isSeenByPartner ? "Seen by partner" : "Sent"} className="inline-flex items-center ml-0.5">
                <Heart
                  className={`w-2.5 h-2.5 ${
                    isSeenByPartner ? "fill-crimson text-crimson" : "text-rose/60"
                  }`}
                />
              </span>
            )}
          </div>
        </div>

        {/* Double-tap Floating Heart Burst (Phase 3.3) */}
        {showHeartBurst && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
            <span className="absolute animate-heart-burst-1 text-crimson text-sm">❤️</span>
            <span className="absolute animate-heart-burst-2 text-rose text-base">💖</span>
            <span className="absolute animate-heart-burst-3 text-crimson text-sm">💕</span>
            <span className="absolute animate-heart-burst-4 text-berry text-xs">💓</span>
            <span className="absolute animate-heart-burst-5 text-peach text-sm">💗</span>
            <span className="absolute animate-heart-burst-6 text-crimson text-lg">❤️</span>
          </div>
        )}

        {/* Persistent Heart Reaction Badge Pop-in (Phase 3.3) */}
        {hasReactions && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleHeart(message.id);
            }}
            className={`absolute -bottom-2.5 ${
              isMe ? "left-2" : "right-2"
            } bg-surface border border-blush/80 rounded-full px-2 py-0.5 shadow-sm flex items-center gap-0.5 text-xs cursor-pointer active:scale-95 transition animate-pop-in z-10`}
          >
            <span>❤️</span>
            {Object.keys(payload.reactions || {}).length > 1 && (
              <span className="text-[10px] font-bold text-crimson font-body">2</span>
            )}
          </div>
        )}

        {/* Sticker Reaction Badges */}
        {hasStickerReactions && (
          <div
            className={`absolute -bottom-2.5 ${
              isMe ? "left-10" : "right-10"
            } flex items-center gap-1 z-10`}
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
                  className="w-6 h-6 p-0.5 rounded-full bg-surface border border-blush/80 shadow-sm cursor-pointer active:scale-95 transition"
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
            isMe ? "-left-9" : "-right-9"
          } w-8 h-8 rounded-full flex items-center justify-center text-plum-soft hover:text-plum hover:bg-cream-2 opacity-0 group-hover:opacity-100 transition`}
          aria-label="Message options"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>

        {/* Context Menu Dropdown */}
        {showMenu && (
          <div
            className={`absolute top-8 ${
              isMe ? "right-0" : "left-0"
            } z-30 bg-surface border border-blush shadow-xl rounded-2xl py-1.5 w-36 text-xs text-plum font-body`}
          >
            <button
              onClick={() => {
                setShowMenu(false);
                onReply(message);
              }}
              className="w-full px-3.5 py-2 hover:bg-cream-2 flex items-center gap-2 transition"
            >
              <Reply className="w-3.5 h-3.5 text-crimson" />
              Reply
            </button>

            <button
              onClick={() => {
                setShowMenu(false);
                setShowStickerPicker(true);
              }}
              className="w-full px-3.5 py-2 hover:bg-cream-2 flex items-center gap-2 transition"
            >
              <SmilePlus className="w-3.5 h-3.5 text-peach" />
              Sticker React
            </button>

            {isMe && (
              <>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(message);
                  }}
                  className="w-full px-3.5 py-2 hover:bg-cream-2 flex items-center gap-2 transition"
                >
                  <Edit3 className="w-3.5 h-3.5 text-plum-soft" />
                  Edit
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onUnsend(message);
                  }}
                  className="w-full px-3.5 py-2 hover:bg-cream-2 flex items-center gap-2 text-crimson transition"
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

// Memoize row component (React.memo with custom comparator - Phase 3.2 60fps guarantee)
export const MessageBubble = React.memo(MessageBubbleComponent, (prev, next) => {
  return (
    prev.message.id === next.message.id &&
    prev.message.created_at === next.message.created_at &&
    prev.message.type === next.message.type &&
    prev.message.payload.text === next.message.payload.text &&
    prev.message.payload.isUnsent === next.message.payload.isUnsent &&
    prev.message.payload.editedAt === next.message.payload.editedAt &&
    prev.isMe === next.isMe &&
    prev.isNew === next.isNew &&
    prev.isLastInGroup === next.isLastInGroup &&
    JSON.stringify(prev.message.payload.reactions) === JSON.stringify(next.message.payload.reactions) &&
    JSON.stringify(prev.message.payload.stickerReactions) === JSON.stringify(next.message.payload.stickerReactions) &&
    JSON.stringify(prev.message.payload.seenBy) === JSON.stringify(next.message.payload.seenBy)
  );
});
