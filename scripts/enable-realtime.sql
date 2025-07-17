-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;

-- Create function to notify room updates
CREATE OR REPLACE FUNCTION notify_room_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify all subscribers about room changes
  PERFORM pg_notify(
    'room_update',
    json_build_object(
      'room_id', NEW.id,
      'event', TG_OP,
      'data', row_to_json(NEW)
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for room updates
DROP TRIGGER IF EXISTS room_update_trigger ON rooms;
CREATE TRIGGER room_update_trigger
  AFTER INSERT OR UPDATE OR DELETE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION notify_room_update();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_id ON rooms(id);
CREATE INDEX IF NOT EXISTS idx_participants_room_id ON participants(room_id);
CREATE INDEX IF NOT EXISTS idx_participants_active ON participants(room_id, is_active);
