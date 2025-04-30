INSERT INTO public.email_templates (id, name, html, created_at)
VALUES (
  'e8eae740-c609-435b-9630-93dc7c064b11',
  'pinterest_frame',
    $$ 
    <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitación de Pinterest</title>
    <style>
      body { font-family: sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      .container { max-width: 600px; margin: 20px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); padding: 30px; }
      .header-wrapper { min-width: 280px; max-width: 600px; margin-left: auto; margin-right: auto; background-color: #E60023; background-image: url('https://6554518.fs1.hubspotusercontent-na1.net/hubfs/6554518/fondo2.png'); background-position: center; background-repeat: no-repeat; background-size: cover; padding-bottom: 15px; padding-top: 15px; border-radius: 8px 8px 0 0; color: white; }
      .body-content { padding: 20px; }
      .signature { margin-top: 20px; line-height: 1.6; }
      .header-row { display: flex; align-items: center; padding: 10px 20px; }
      .hse-image-wrapper { display: inline-block; vertical-align: middle; margin-right: 20px; }
      .hse-image-wrapper img { width: 60px; max-width: 60px; vertical-align: middle; }
      .header-text-container { display: inline-block; vertical-align: middle; }
      .header-text-top { font-size: 1.5em; line-height: 1.2; margin-bottom: 5px; }
      .header-text-bottom { font-size: 1.2em; line-height: 1.2; }
      @media screen and (max-width: 480px) {
        .container { margin: 10px auto; padding: 20px; }
        .header-wrapper { min-width: auto; max-width: 100%; border-radius: 0; padding-bottom: 10px; padding-top: 10px; }
        .header-row { display: flex; align-items: center; padding: 10px; }
        .hse-image-wrapper { margin-right: 10px; }
        .hse-image-wrapper img { width: 40px; max-width: 40px; }
        .header-text-top { font-size: 1.2em; margin-bottom: 2px; }
        .header-text-bottom { font-size: 1em; }
      }
    </style>
  </head>
  <body>
  <div class="container">
    <div class="header-wrapper">
      <div class="header-row">
        <table class="hse-image-wrapper" role="presentation" cellpadding="0" cellspacing="0" style="display: inline-block; vertical-align: middle;">
          <tbody>
            <tr>
              <td class="hs_padded" align="left" valign="middle" style="font-family:Tahoma, sans-serif; color:#1a1939; word-break:break-word; text-align:center; font-size:0px; padding: 0;">
                <img alt="LOGO_LANETA_2022_ICONO_BLANCO-1" src="https://6554518.fs1.hubspotusercontent-na1.net/hub/6554518/hubfs/LOGO_LANETA_2022_ICONO_BLANCO-1.png?width=120&amp;upscale=true&amp;name=LOGO_LANETA_2022_ICONO_BLANCO-1.png" style="outline:none; text-decoration:none; max-width:100%; font-size:16px; vertical-align: middle;" width="60">
              </td>
            </tr>
          </tbody>
        </table>
        <div class="header-text-container" style="color: white; display: inline-block; vertical-align: middle;">
          <div class="header-text-top">Dale vida a tu creatividad.</div>
          <div class="header-text-bottom">¡Ahora en Pinterest!</div>
        </div>
      </div>
    </div>
    <div class="body-content">
      {{content}}
      <div class="signature">
        <p>Saludos,<br>Nicole Kressler<br>Especialista Colaboraciones con Creadores<br>La Neta</p>
      </div>
    </div>
  </div>
  </body>
</html>
$$,
'2025-04-29 16:00:00.196425+00'
)