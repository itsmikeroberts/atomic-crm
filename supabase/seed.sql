INSERT INTO favicons_excluded_domains (domain) VALUES
    ('gmail.com'),
    ('yahoo.com'),
    ('hotmail.com'),
    ('aol.com'),
    ('hotmail.co.uk'),
    ('hotmail.fr'),
    ('msn.com'),
    ('yahoo.fr'),
    ('wanadoo.fr'),
    ('orange.fr'),
    ('comcast.net'),
    ('yahoo.co.uk'),
    ('yahoo.com.br'),
    ('yahoo.co.in'),
    ('live.com'),
    ('rediffmail.com'),
    ('free.fr'),
    ('gmx.de'),
    ('web.de'),
    ('yandex.ru'),
    ('ymail.com'),
    ('libero.it'),
    ('outlook.com'),
    ('uol.com.br'),
    ('bol.com.br'),
    ('mail.ru'),
    ('cox.net'),
    ('hotmail.it'),
    ('sbcglobal.net'),
    ('sfr.fr'),
    ('live.fr'),
    ('verizon.net'),
    ('live.co.uk'),
    ('googlemail.com'),
    ('yahoo.es'),
    ('ig.com.br'),
    ('live.nl'),
    ('bigpond.com'),
    ('terra.com.br'),
    ('yahoo.it'),
    ('neuf.fr'),
    ('yahoo.de'),
    ('alice.it'),
    ('rocketmail.com'),
    ('att.net'),
    ('laposte.net'),
    ('facebook.com'),
    ('bellsouth.net'),
    ('yahoo.in'),
    ('hotmail.es'),
    ('charter.net'),
    ('yahoo.ca'),
    ('yahoo.com.au'),
    ('rambler.ru'),
    ('hotmail.de'),
    ('tiscali.it'),
    ('shaw.ca'),
    ('yahoo.co.jp'),
    ('sky.com'),
    ('earthlink.net'),
    ('optonline.net'),
    ('freenet.de'),
    ('t-online.de'),
    ('aliceadsl.fr'),
    ('virgilio.it'),
    ('home.nl'),
    ('qq.com'),
    ('telenet.be'),
    ('me.com'),
    ('yahoo.com.ar'),
    ('tiscali.co.uk'),
    ('yahoo.com.mx'),
    ('voila.fr'),
    ('gmx.net'),
    ('mail.com'),
    ('planet.nl'),
    ('tin.it'),
    ('live.it'),
    ('ntlworld.com'),
    ('arcor.de'),
    ('yahoo.co.id'),
    ('frontiernet.net'),
    ('hetnet.nl'),
    ('live.com.au'),
    ('yahoo.com.sg'),
    ('zonnet.nl'),
    ('club-internet.fr'),
    ('juno.com'),
    ('optusnet.com.au'),
    ('blueyonder.co.uk'),
    ('bluewin.ch'),
    ('skynet.be'),
    ('sympatico.ca'),
    ('windstream.net'),
    ('mac.com'),
    ('centurytel.net'),
    ('chello.nl'),
    ('live.ca'),
    ('aim.com'),
    ('bigpond.net.au'),
    ('online.de'),
    ('apple.com');

-- Band CRM Sample Data
-- Note: This assumes you have at least one user in the sales table
-- You may need to adjust the sales_id values based on your actual data

-- Sample Venues
INSERT INTO venues (name, city, address, postcode, capacity, stage_size, parking_info, load_in_notes, contact_name, contact_phone, contact_email, website, notes, created_at, updated_at) VALUES
    ('The Jazz Cafe', 'London', '5 Parkway, Camden', 'NW1 7PG', 450, '6m x 4.5m', 'Street parking available nearby', 'Load in via rear entrance on Parkway', 'Sarah Johnson', '+44 20 7485 6834', 'bookings@thejazzcafe.com', 'https://thejazzcafelondon.com', NULL, NOW(), NOW()),
    ('Ronnie Scott''s', 'London', '47 Frith Street, Soho', 'W1D 4HT', 250, '5m x 4m', 'No parking - use public transport', 'Load in via Frith Street entrance before 6pm', 'Mike Davies', '+44 20 7439 0747', 'info@ronniescotts.co.uk', 'https://ronniescotts.co.uk', NULL, NOW(), NOW()),
    ('The Troubadour', 'London', '263-267 Old Brompton Road', 'SW5 9JA', 150, '4m x 3m', 'Limited street parking', 'Small load in area - compact gear recommended', 'Emma Wilson', '+44 20 7370 1434', 'bookings@troubadour.co.uk', 'https://troubadour.co.uk', NULL, NOW(), NOW()),
    ('The Sage Gateshead', 'Gateshead', 'St Mary''s Square, Gateshead Quays', 'NE8 2JR', 1700, '12m x 8m', 'Underground car park available', 'Professional loading bay with lift access', 'David Brown', '+44 191 443 4661', 'info@sagegateshead.com', 'https://sagegateshead.com', NULL, NOW(), NOW()),
    ('The Cavern Club', 'Liverpool', '10 Mathew Street', 'L2 6RE', 350, '5.5m x 4m', 'Multi-storey car parks nearby', 'Narrow stairs - plan equipment carefully', 'Lisa Taylor', '+44 151 236 9091', 'bookings@cavernclub.com', 'https://cavernclub.com', NULL, NOW(), NOW());

-- Sample Songs
INSERT INTO songs (title, artist, genre, key, tempo, duration, lyrics_url, chart_url, notes, active, created_at, updated_at) VALUES
    ('Superstition', 'Stevie Wonder', 'Funk', 'Eb', 100, 245, 'https://genius.com/stevie-wonder-superstition-lyrics', NULL, 'Classic funk groove - watch the syncopation', true, NOW(), NOW()),
    ('Valerie', 'Amy Winehouse', 'Soul', 'C', 115, 227, 'https://genius.com/amy-winehouse-valerie-lyrics', NULL, 'Popular wedding song - upbeat energy', true, NOW(), NOW()),
    ('Fly Me to the Moon', 'Frank Sinatra', 'Jazz', 'C', 120, 148, NULL, NULL, 'Swing feel - great for cocktail hour', true, NOW(), NOW()),
    ('Uptown Funk', 'Bruno Mars', 'Funk', 'Dm', 115, 269, 'https://genius.com/bruno-mars-uptown-funk-lyrics', NULL, 'High energy closer - crowd pleaser', true, NOW(), NOW()),
    ('Isn''t She Lovely', 'Stevie Wonder', 'Soul', 'E', 105, 394, NULL, NULL, 'Extended version available - great for dancing', true, NOW(), NOW()),
    ('September', 'Earth, Wind & Fire', 'Funk', 'Eb', 126, 215, 'https://genius.com/earth-wind-and-fire-september-lyrics', NULL, 'Essential party song - everyone knows it', true, NOW(), NOW()),
    ('At Last', 'Etta James', 'Blues', 'F', 60, 180, NULL, NULL, 'Popular first dance song', true, NOW(), NOW()),
    ('I Got You (I Feel Good)', 'James Brown', 'Funk', 'D', 140, 165, NULL, NULL, 'High energy - great opener', true, NOW(), NOW()),
    ('Signed, Sealed, Delivered', 'Stevie Wonder', 'Soul', 'F', 120, 162, NULL, NULL, 'Upbeat and fun - mid-set energy boost', true, NOW(), NOW()),
    ('Crazy Little Thing Called Love', 'Queen', 'Rock', 'D', 156, 163, NULL, NULL, 'Rockabilly feel - versatile crowd pleaser', true, NOW(), NOW());

-- Sample Quote Template (if not already seeded by migration)
INSERT INTO quote_templates (name, body_html, is_default, created_at, updated_at)
SELECT
    'Standard Quote',
    '<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 10px;">Performance Quote</h1>
  
  <div style="margin: 20px 0;">
    <h2 style="color: #666;">Event Details</h2>
    <p><strong>Event:</strong> {{gig_name}}</p>
    <p><strong>Date:</strong> {{performance_date}}</p>
    <p><strong>Time:</strong> {{start_time}} - {{end_time}}</p>
    <p><strong>Venue:</strong> {{venue_name}}, {{venue_city}}</p>
  </div>

  <div style="margin: 20px 0;">
    <h2 style="color: #666;">Client Information</h2>
    <p><strong>Company:</strong> {{company_name}}</p>
    <p><strong>Contact:</strong> {{contact_name}}</p>
  </div>

  <div style="margin: 20px 0;">
    <h2 style="color: #666;">Performance Details</h2>
    <p><strong>Number of Sets:</strong> {{set_count}}</p>
    <p><strong>Total Duration:</strong> {{duration}}</p>
  </div>

  <div style="margin: 20px 0; background: #f5f5f5; padding: 15px; border-radius: 5px;">
    <h2 style="color: #666;">Investment</h2>
    <p style="font-size: 24px; color: #333;"><strong>Performance Fee:</strong> {{fee}}</p>
    <p><strong>Deposit Required:</strong> {{deposit}}</p>
    <p style="font-size: 14px; color: #666;">Balance due on day of performance</p>
  </div>

  <div style="margin: 30px 0; padding-top: 20px; border-top: 1px solid #ccc;">
    <p style="font-size: 12px; color: #666;">
      This quote is valid for 30 days from the date of issue.
      A 50% deposit is required to secure the booking.
    </p>
  </div>
</div>',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM quote_templates WHERE name = 'Standard Quote');
