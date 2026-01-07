CREATE OR REPLACE FUNCTION public.handle_new_blog_post()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR OLD.status != 'published') THEN
    PERFORM net.http_post(
      url := 'https://xybpgorbkiaitimxiqej.supabase.co/functions/v1/blog-post-automation',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer sb_publishable_Wn6QDYJFnIMuhOSHsRjUlA_WpFVy3-v"}'::jsonb,
      body := jsonb_build_object(
        'post_id', NEW.id,
        'title', NEW.title,
        'slug', NEW.slug,
        'category', NEW.category,
        'published_at', NEW.published_at
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;