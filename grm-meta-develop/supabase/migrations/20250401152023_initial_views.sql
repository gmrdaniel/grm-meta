create or replace view "public"."summary_creator" as  SELECT ci.nombre,
    ci.apellido,
    ci.correo,
    ci.usuario_tiktok,
    ci.seguidores_tiktok,
    COALESCE((sum(((tv.number_of_comments + tv.number_of_hearts) + tv.number_of_reposts)) / (NULLIF(ci.seguidores_tiktok, 0))::numeric), (0)::numeric) AS engagement,
    COALESCE(avg(tv.duration), (0)::numeric) AS duration_average,
    max(tv.create_time) AS date_last_post
   FROM (creator_inventory ci
     LEFT JOIN tiktok_video tv ON ((ci.id = tv.creator_id)))
  GROUP BY ci.id, ci.nombre, ci.apellido, ci.correo, ci.usuario_tiktok, ci.seguidores_tiktok;