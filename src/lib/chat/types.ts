export interface PhotoMetadata {
  fileId: string;
  photoIv: string;
  width?: number;
  height?: number;
  size?: number;
  mimeType?: string;
  localUrl?: string;
}

export interface PlaintextMessagePayload {
  text: string;
  stickerId?: string;
  stickerFile?: string;
  photo?: PhotoMetadata;
  replyTo?: {
    id: string;
    senderDeviceId: string;
    snippet: string;
  };
  editedAt?: number;
  isUnsent?: boolean;
  reactions?: Record<string, string>; // deviceId -> emoji, e.g. { "dev-1": "❤️" }
  stickerReactions?: Record<string, string>; // deviceId -> stickerId, e.g. { "dev-1": "sweet-01" }
  seenBy?: Record<string, number>; // deviceId -> timestamp
  extra?: Record<string, unknown>;
}

export interface EncryptedMessageRecord {
  id: string;
  room_id: string;
  sender_device_id: string;
  ciphertext: string;
  iv: string;
  type: "text" | "photo" | "sticker" | "signal" | "system";
  created_at: string;
  expires_at?: string | null;
}

export interface DecryptedMessage extends EncryptedMessageRecord {
  payload: PlaintextMessagePayload;
  decryptedSuccessfully: boolean;
}

export interface RealtimeTypingEvent {
  deviceId: string;
  isTyping: boolean;
  timestamp: number;
}
