CREATE OR REPLACE FUNCTION public.search_countries(search_term TEXT)
RETURNS SETOF RECORD
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        cpc.id,
        cpc.name_es,
        cpc.name_en,
        cpc.phone_code
    FROM country_phone_codes cpc
    WHERE
        cpc.status = 'active' AND
        (
            cpc.name_es ILIKE '%' || search_term || '%' OR
            cpc.name_en ILIKE '%' || search_term || '%' OR
            cpc.phone_code ILIKE '%' || search_term || '%'
        )
    ORDER BY cpc.name_es;
END;
$$;
