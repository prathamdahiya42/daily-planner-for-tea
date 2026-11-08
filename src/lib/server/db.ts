import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface RoomRecord {
  id: string;
  verifier: string;
  created_at: string;
}

export interface DeviceRecord {
  id: string;
  room_id: string;
  public_key: string;
  approved: boolean;
  push_subscription?: unknown;
  created_at: string;
}

export interface MessageRecord {
  id: string;
  room_id: string;
  sender_device_id: string;
  ciphertext: string;
  iv: string;
  type: string;
  created_at: string;
  expires_at?: string | null;
}

export interface AuthChallengeRecord {
  id: string;
  device_id: string;
  nonce: string;
  expires_at: number;
}

// In-Memory Database Store for testing and fallback
class InMemoryDatabase {
  rooms = new Map<string, RoomRecord>();
  devices = new Map<string, DeviceRecord>();
  messages = new Map<string, MessageRecord>();
  challenges = new Map<string, AuthChallengeRecord>();
  mediaFiles = new Map<string, { data: Buffer | Uint8Array; mimeType: string }>();
  failedVerifierAttempts = new Map<string, { count: number; firstAttempt: number }>();

  isRateLimited(ipOrKey: string): boolean {
    const entry = this.failedVerifierAttempts.get(ipOrKey);
    if (!entry) return false;
    const fifteenMinutes = 15 * 60 * 1000;
    if (Date.now() - entry.firstAttempt > fifteenMinutes) {
      this.failedVerifierAttempts.delete(ipOrKey);
      return false;
    }
    return entry.count >= 5;
  }

  recordFailedVerifier(ipOrKey: string): void {
    const entry = this.failedVerifierAttempts.get(ipOrKey);
    if (!entry) {
      this.failedVerifierAttempts.set(ipOrKey, { count: 1, firstAttempt: Date.now() });
    } else {
      entry.count += 1;
    }
  }

  clearRateLimit(ipOrKey: string): void {
    this.failedVerifierAttempts.delete(ipOrKey);
  }
}

// Global singleton for in-memory state during dev/test
const globalMemoryDb = new InMemoryDatabase();

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    url &&
    key &&
    url.startsWith("https://") &&
    !url.includes("your-project") &&
    !key.includes("your-service-role-key")
  );
}

let supabaseAdminClient: SupabaseClient | null = null;
if (isSupabaseConfigured()) {
  supabaseAdminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export const db = {
  isCloudConfigured: isSupabaseConfigured,
  adminClient: supabaseAdminClient,

  // --- Rooms ---
  async getRoom(roomId: string): Promise<RoomRecord | null> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();
      if (error || !data) return null;
      return data as RoomRecord;
    }
    return globalMemoryDb.rooms.get(roomId) || null;
  },

  async createRoom(roomId: string, verifier: string): Promise<RoomRecord> {
    const record: RoomRecord = {
      id: roomId,
      verifier,
      created_at: new Date().toISOString(),
    };

    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient
        .from("rooms")
        .insert(record)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as RoomRecord;
    }

    globalMemoryDb.rooms.set(roomId, record);
    return record;
  },

  // --- Devices ---
  async getDevice(deviceId: string): Promise<DeviceRecord | null> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient
        .from("devices")
        .select("*")
        .eq("id", deviceId)
        .single();
      if (error || !data) return null;
      return data as DeviceRecord;
    }
    return globalMemoryDb.devices.get(deviceId) || null;
  },

  async getDevicesByRoom(roomId: string): Promise<DeviceRecord[]> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient
        .from("devices")
        .select("*")
        .eq("room_id", roomId);
      if (error) throw new Error(error.message);
      return data as DeviceRecord[];
    }

    const result: DeviceRecord[] = [];
    for (const d of globalMemoryDb.devices.values()) {
      if (d.room_id === roomId) {
        result.push(d);
      }
    }
    return result;
  },

  async createDevice(
    deviceId: string,
    roomId: string,
    publicKey: string,
    approved: boolean
  ): Promise<DeviceRecord> {
    const record: DeviceRecord = {
      id: deviceId,
      room_id: roomId,
      public_key: publicKey,
      approved,
      created_at: new Date().toISOString(),
    };

    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient
        .from("devices")
        .insert(record)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as DeviceRecord;
    }

    globalMemoryDb.devices.set(deviceId, record);
    return record;
  },

  // --- Messages ---
  async getMessages(roomId: string, limit = 100): Promise<MessageRecord[]> {
    const nowIso = new Date().toISOString();
    const nowMs = Date.now();

    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient
        .from("messages")
        .select("*")
        .eq("room_id", roomId)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .order("created_at", { ascending: true })
        .limit(limit);
      if (error) throw new Error(error.message);
      return data as MessageRecord[];
    }

    const result: MessageRecord[] = [];
    for (const msg of globalMemoryDb.messages.values()) {
      if (msg.room_id === roomId) {
        if (msg.expires_at && new Date(msg.expires_at).getTime() <= nowMs) {
          continue; // expired
        }
        result.push(msg);
      }
    }
    return result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).slice(-limit);
  },

  async insertMessage(message: MessageRecord): Promise<MessageRecord> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient
        .from("messages")
        .insert(message)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as MessageRecord;
    }

    globalMemoryDb.messages.set(message.id, message);
    return message;
  },

  async updateMessage(
    id: string,
    roomId: string,
    updates: Partial<Pick<MessageRecord, "ciphertext" | "iv" | "type" | "expires_at">>
  ): Promise<MessageRecord | null> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient
        .from("messages")
        .update(updates)
        .eq("id", id)
        .eq("room_id", roomId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as MessageRecord;
    }

    const existing = globalMemoryDb.messages.get(id);
    if (!existing || existing.room_id !== roomId) return null;

    const updated: MessageRecord = {
      ...existing,
      ...updates,
    };
    globalMemoryDb.messages.set(id, updated);
    return updated;
  },

  async deleteMessage(id: string, roomId: string): Promise<boolean> {
    if (supabaseAdminClient) {
      const { error } = await supabaseAdminClient
        .from("messages")
        .delete()
        .eq("id", id)
        .eq("room_id", roomId);
      if (error) throw new Error(error.message);
      return true;
    }

    const existing = globalMemoryDb.messages.get(id);
    if (!existing || existing.room_id !== roomId) return false;

    globalMemoryDb.messages.delete(id);
    return true;
  },

  // Cleanup expired messages and associated media
  async cleanupExpiredMessages(roomId?: string): Promise<{ deletedMessages: number }> {
    const nowMs = Date.now();
    let deletedCount = 0;

    if (supabaseAdminClient) {
      const nowIso = new Date().toISOString();
      let query = supabaseAdminClient
        .from("messages")
        .delete()
        .not("expires_at", "is", null)
        .lte("expires_at", nowIso);

      if (roomId) {
        query = query.eq("room_id", roomId);
      }

      const { data, error } = await query.select("id");
      if (!error && data) {
        deletedCount = data.length;
      }
      return { deletedMessages: deletedCount };
    }

    for (const [id, msg] of globalMemoryDb.messages.entries()) {
      if (roomId && msg.room_id !== roomId) continue;
      if (msg.expires_at && new Date(msg.expires_at).getTime() <= nowMs) {
        globalMemoryDb.messages.delete(id);
        deletedCount++;
      }
    }

    return { deletedMessages: deletedCount };
  },

  // --- Encrypted Media Storage ---
  async uploadMediaBlob(
    roomId: string,
    fileId: string,
    data: Buffer | Uint8Array,
    mimeType = "application/octet-stream"
  ): Promise<string> {
    const path = `${roomId}/${fileId}.enc`;

    if (supabaseAdminClient) {
      const { error } = await supabaseAdminClient.storage
        .from("room-media")
        .upload(path, data, {
          contentType: "application/octet-stream",
          upsert: true,
        });

      if (error) throw new Error(error.message);
      return path;
    }

    globalMemoryDb.mediaFiles.set(`${roomId}/${fileId}`, { data, mimeType });
    return path;
  },

  async getMediaBlob(
    roomId: string,
    fileId: string
  ): Promise<{ data: Buffer | Uint8Array; mimeType: string } | null> {
    if (supabaseAdminClient) {
      const path = `${roomId}/${fileId}.enc`;
      const { data, error } = await supabaseAdminClient.storage
        .from("room-media")
        .download(path);

      if (error || !data) return null;
      const arrayBuf = await data.arrayBuffer();
      return {
        data: Buffer.from(arrayBuf),
        mimeType: data.type || "application/octet-stream",
      };
    }

    return globalMemoryDb.mediaFiles.get(`${roomId}/${fileId}`) || null;
  },

  async deleteMediaBlob(roomId: string, fileId: string): Promise<boolean> {
    if (supabaseAdminClient) {
      const path = `${roomId}/${fileId}.enc`;
      const { error } = await supabaseAdminClient.storage
        .from("room-media")
        .remove([path]);
      return !error;
    }

    return globalMemoryDb.mediaFiles.delete(`${roomId}/${fileId}`);
  },

  async approveDevice(deviceId: string): Promise<DeviceRecord | null> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient
        .from("devices")
        .update({ approved: true })
        .eq("id", deviceId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as DeviceRecord;
    }

    const device = globalMemoryDb.devices.get(deviceId);
    if (!device) return null;
    device.approved = true;
    return device;
  },

  // --- Push Subscriptions ---
  async savePushSubscription(deviceId: string, subscription: unknown): Promise<boolean> {
    if (supabaseAdminClient) {
      const { error } = await supabaseAdminClient
        .from("devices")
        .update({ push_subscription: subscription })
        .eq("id", deviceId);
      return !error;
    }

    const device = globalMemoryDb.devices.get(deviceId);
    if (!device) return false;
    device.push_subscription = subscription;
    return true;
  },

  async removePushSubscription(deviceId: string): Promise<boolean> {
    if (supabaseAdminClient) {
      const { error } = await supabaseAdminClient
        .from("devices")
        .update({ push_subscription: null })
        .eq("id", deviceId);
      return !error;
    }

    const device = globalMemoryDb.devices.get(deviceId);
    if (!device) return false;
    device.push_subscription = undefined;
    return true;
  },

  async getPartnerPushSubscriptions(roomId: string, senderDeviceId: string): Promise<{ deviceId: string; subscription: any }[]> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient
        .from("devices")
        .select("id, push_subscription")
        .eq("room_id", roomId)
        .eq("approved", true)
        .neq("id", senderDeviceId)
        .not("push_subscription", "is", null);

      if (error || !data) return [];
      return data.map((d) => ({ deviceId: d.id, subscription: d.push_subscription }));
    }

    const list: { deviceId: string; subscription: any }[] = [];
    for (const d of globalMemoryDb.devices.values()) {
      if (d.room_id === roomId && d.approved && d.id !== senderDeviceId && d.push_subscription) {
        list.push({ deviceId: d.id, subscription: d.push_subscription });
      }
    }
    return list;
  },

  // --- Challenges ---
  async saveChallenge(deviceId: string, nonce: string, ttlMs = 120000): Promise<string> {
    const id = crypto.randomUUID();
    const expiresAt = Date.now() + ttlMs;

    if (supabaseAdminClient) {
      await supabaseAdminClient.from("auth_challenges").insert({
        id,
        device_id: deviceId,
        nonce,
        expires_at: new Date(expiresAt).toISOString(),
      });
      return nonce;
    }

    globalMemoryDb.challenges.set(deviceId, {
      id,
      device_id: deviceId,
      nonce,
      expires_at: expiresAt,
    });
    return nonce;
  },

  async verifyAndConsumeChallenge(deviceId: string, nonce: string): Promise<boolean> {
    if (supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient
        .from("auth_challenges")
        .select("*")
        .eq("device_id", deviceId)
        .eq("nonce", nonce)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return false;

      // Delete consumed challenge
      await supabaseAdminClient.from("auth_challenges").delete().eq("id", data.id);
      return true;
    }

    const stored = globalMemoryDb.challenges.get(deviceId);
    if (!stored) return false;
    if (stored.nonce !== nonce) return false;
    if (Date.now() > stored.expires_at) {
      globalMemoryDb.challenges.delete(deviceId);
      return false;
    }

    globalMemoryDb.challenges.delete(deviceId);
    return true;
  },

  // --- Rate Limiting ---
  isRateLimited(key: string): boolean {
    return globalMemoryDb.isRateLimited(key);
  },

  recordFailedVerifier(key: string): void {
    globalMemoryDb.recordFailedVerifier(key);
  },

  clearRateLimit(key: string): void {
    globalMemoryDb.clearRateLimit(key);
  },
};
