
-- Create functions to handle presentation links since the table is not in the types

-- Function to create a presentation link
CREATE OR REPLACE FUNCTION create_presentation_link(
  link_id UUID,
  client_id_param UUID,
  link_url TEXT,
  pilares_data JSONB,
  objetivos_data JSONB,
  created_by_user UUID
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO links_temporales (id, client_id, link, pilares, objetivos, created_by)
  VALUES (link_id, client_id_param, link_url, pilares_data, objetivos_data, created_by_user);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get presentation links by client
CREATE OR REPLACE FUNCTION get_presentation_links(client_id_param UUID)
RETURNS TABLE(
  id UUID,
  client_id UUID,
  link TEXT,
  pilares JSONB,
  objetivos JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT lt.id, lt.client_id, lt.link, lt.pilares, lt.objetivos, lt.created_at
  FROM links_temporales lt
  WHERE lt.client_id = client_id_param
  ORDER BY lt.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get a specific presentation by ID
CREATE OR REPLACE FUNCTION get_presentation_by_id(link_id UUID)
RETURNS TABLE(
  id UUID,
  client_id UUID,
  link TEXT,
  pilares JSONB,
  objetivos JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT lt.id, lt.client_id, lt.link, lt.pilares, lt.objetivos, lt.created_at
  FROM links_temporales lt
  WHERE lt.id = link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
