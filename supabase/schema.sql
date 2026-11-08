-- ==============================================================================
-- Our Little Room: Supabase Schema & Row Level Security (RLS)
-- ==============================================================================

-- 1. Rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,                       -- HKDF-SHA256 derived room hash (64-char hex)
  verifier TEXT NOT NULL,                   -- SHA-256(authKey) verifier (64-char hex)
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Devices table
CREATE TABLE IF NOT EXISTS public.devices (
  id TEXT PRIMARY KEY,                       -- Client-generated UUID for the device
  room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  public_key TEXT NOT NULL,                 -- JWK or SPKI public key of ECDSA P-256
  approved BOOLEAN DEFAULT FALSE NOT NULL,  -- Exactly 2 devices approved per room
  push_subscription JSONB,                  -- Web Push subscription object
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for room device lookups
CREATE INDEX IF NOT EXISTS idx_devices_room_id ON public.devices(room_id);
CREATE INDEX IF NOT EXISTS idx_devices_approved ON public.devices(room_id, approved);

-- 3. Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,                       -- Client-generated message UUID
  room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  sender_device_id TEXT NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  ciphertext TEXT NOT NULL,                 -- AES-256-GCM ciphertext + auth tag (Base64)
  iv TEXT NOT NULL,                         -- Fresh 12-byte random IV (Base64)
  type TEXT NOT NULL DEFAULT 'text',        -- 'text' | 'photo' | 'sticker' | 'reaction' | 'signal' | 'settings'
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ                    -- Nullable: disappearing message expiry timestamp
);

-- Indexes for efficient message ordering and querying
CREATE INDEX IF NOT EXISTS idx_messages_room_created ON public.messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_expires_at ON public.messages(expires_at) WHERE expires_at IS NOT NULL;

-- 4. Auth Challenges table (ephemeral challenge-response)
CREATE TABLE IF NOT EXISTS public.auth_challenges (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  nonce TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_challenges_device_exp ON public.auth_challenges(device_id, expires_at);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- The JWT contains:
-- {
--   "aud": "authenticated",
--   "role": "authenticated",
--   "room_id": "<room_hash>",
--   "device_id": "<device_uuid>"
-- }
-- ==============================================================================

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_challenges ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Rooms RLS:
-- Only devices holding a JWT with this room_id can read room metadata.
-- Creation is handled via server API routes using the service role.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Rooms are accessible only to authenticated room members" ON public.rooms;
CREATE POLICY "Rooms are accessible only to authenticated room members"
  ON public.rooms
  FOR SELECT
  USING (id = (auth.jwt() ->> 'room_id'));

-- ------------------------------------------------------------------------------
-- Devices RLS:
-- Devices in the room can view approved devices in the same room.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Devices can view devices in their own room" ON public.devices;
CREATE POLICY "Devices can view devices in their own room"
  ON public.devices
  FOR SELECT
  USING (room_id = (auth.jwt() ->> 'room_id'));

DROP POLICY IF EXISTS "Devices can update their own push subscription" ON public.devices;
CREATE POLICY "Devices can update their own push subscription"
  ON public.devices
  FOR UPDATE
  USING (id = (auth.jwt() ->> 'device_id') AND room_id = (auth.jwt() ->> 'room_id'))
  WITH CHECK (id = (auth.jwt() ->> 'device_id') AND room_id = (auth.jwt() ->> 'room_id'));

-- ------------------------------------------------------------------------------
-- Messages RLS:
-- Strict room isolation: devices can only read, insert, update, or delete
-- messages strictly matching their authenticated room_id claim.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Room members can read messages in their room" ON public.messages;
CREATE POLICY "Room members can read messages in their room"
  ON public.messages
  FOR SELECT
  USING (room_id = (auth.jwt() ->> 'room_id'));

DROP POLICY IF EXISTS "Room members can insert messages into their room" ON public.messages;
CREATE POLICY "Room members can insert messages into their room"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    room_id = (auth.jwt() ->> 'room_id') AND
    sender_device_id = (auth.jwt() ->> 'device_id')
  );

DROP POLICY IF EXISTS "Message sender can update their own message" ON public.messages;
CREATE POLICY "Message sender can update their own message"
  ON public.messages
  FOR UPDATE
  USING (
    room_id = (auth.jwt() ->> 'room_id') AND
    sender_device_id = (auth.jwt() ->> 'device_id')
  );

DROP POLICY IF EXISTS "Message sender can delete their own message" ON public.messages;
CREATE POLICY "Message sender can delete their own message"
  ON public.messages
  FOR DELETE
  USING (
    room_id = (auth.jwt() ->> 'room_id') AND
    sender_device_id = (auth.jwt() ->> 'device_id')
  );

-- ------------------------------------------------------------------------------
-- Storage RLS:
-- Private bucket 'room-media' with path format: room-media/{room_id}/{file_id}.enc
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('room-media', 'room-media', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Room members can access their room media objects" ON storage.objects;
CREATE POLICY "Room members can access their room media objects"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'room-media' AND
    (storage.foldername(name))[1] = (auth.jwt() ->> 'room_id')
  )
  WITH CHECK (
    bucket_id = 'room-media' AND
    (storage.foldername(name))[1] = (auth.jwt() ->> 'room_id')
  );
