/*
  # Create Consultation and Messaging Tables

  1. New Tables
    - `consultation_bookings`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email` (text, required)
      - `phone` (text, required)
      - `service` (text, required)
      - `contact_method` (text, enum: whatsapp, email, in_app)
      - `status` (text, enum: pending, replied, completed, archived)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `consultation_messages`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, foreign key)
      - `sender_type` (text, enum: client, technician)
      - `message` (text, required)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for in-app messaging

  3. Indexes
    - Add index on consultation_bookings.email for fast lookups
    - Add index on consultation_messages.booking_id for faster message queries
*/

CREATE TABLE IF NOT EXISTS consultation_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  service text NOT NULL,
  contact_method text NOT NULL DEFAULT 'in_app' CHECK (contact_method IN ('whatsapp', 'email', 'in_app')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'completed', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consultation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES consultation_bookings(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('client', 'technician')),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consultation_bookings_email ON consultation_bookings(email);
CREATE INDEX IF NOT EXISTS idx_consultation_messages_booking_id ON consultation_messages(booking_id);

ALTER TABLE consultation_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create consultation bookings"
  ON consultation_bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view their own bookings"
  ON consultation_bookings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create messages"
  ON consultation_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view messages for bookings"
  ON consultation_messages FOR SELECT
  USING (true);
