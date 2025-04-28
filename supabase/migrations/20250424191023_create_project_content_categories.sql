CREATE TABLE project_content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content_category_id UUID NOT NULL REFERENCES content_categories(id) ON DELETE CASCADE,
  UNIQUE (project_id, content_category_id)
);