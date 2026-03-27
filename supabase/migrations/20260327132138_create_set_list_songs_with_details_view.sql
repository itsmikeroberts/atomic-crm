-- Create a read-only view for set_list_songs with joined song details
-- The base table (set_list_songs) remains writable for INSERT/UPDATE/DELETE
-- This view is used for convenient reads with all song information

CREATE OR REPLACE VIEW set_list_songs_with_details
WITH (security_invoker=on)
AS
SELECT
  sls.id,
  sls.set_list_id,
  sls.song_id,
  sls.position,
  sls.notes,
  sls.created_at,
  -- Join song details
  s.title,
  s.artist,
  s.key,
  s.tempo,
  s.genre,
  s.duration
FROM set_list_songs sls
LEFT JOIN songs s ON sls.song_id = s.id;

-- Add comment
COMMENT ON VIEW set_list_songs_with_details IS 'Read-only view of set list songs with joined song details (title, artist, key, tempo, genre, duration)';
