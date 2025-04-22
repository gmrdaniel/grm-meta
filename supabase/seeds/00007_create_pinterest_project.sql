INSERT INTO
    "public"."projects" (
        "id",
        "name",
        "slug",
        "status",
        "created_at",
        "updated_at"
    )
VALUES
    (
        'b1e23456-7f89-4abc-9d12-34567890abcd',
        'Pinterest',
        'pinterest',
        'active',
        '2025-03-20 03:55:06.575655+00',
        '2025-03-20 03:55:06.575655+00'
    )
on conflict (id) do nothing;
