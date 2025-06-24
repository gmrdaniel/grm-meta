-- Insertar plantilla base HTML en email_templates
INSERT INTO public.email_templates (id, name, html, created_at)
VALUES (
  '9ab55f79-6e2f-4b99-a842-d6a9e01c78cc',
  'default_frame',
  $$ 
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meta Creator Breakthrough Bonus Program</title>
    <style>
        body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333333;
        margin: 0;
        padding: 0;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        }
        
        .email-container {
        max-width: 600px;
        margin: 0 auto;
        }
        
        .header {
        background-image: url('https://hs-6554518.f.hubspotstarter.net/hub/6554518/hubfs/Background.png');
        background-size: cover;
        background-position: center;
        color: white;
        padding: 20px;
        text-align: center;
        height: 90px;
        }
        
        .header-content {
        display: inline-block;
        text-align: left;
        vertical-align: middle;
        }
        
        .logo {
        display: inline-block;
        vertical-align: middle;
        margin-right: 15px;
        }
        
        h1 {
        margin: 0;
        font-size: 16px;
        font-family: Tahoma, sans-serif;
        font-weight: bold;
        }
        
        .subtitle {
        margin: 5px 0 0;
        font-size: 16px;
        font-family: Tahoma, sans-serif;
        }
        
        .content {
        background-color: white;
        padding: 30px;
        }
        
        ul {
        padding-left: 20px;
        }
        
        li {
        margin-bottom: 10px;
        }
        
        .cta-button {
        text-align: center;
        padding: 20px 0 30px;
        }
        
        .button {
        background-color: #4a90e2;
        color: white;
        padding: 12px 30px;
        text-decoration: none;
        border-radius: 4px;
        font-weight: bold;
        display: inline-block;
        }
        
        .signature {
        margin-top: 20px;
        }
    </style>
    </head>
    <body>
    <div class="email-container">
        <div class="header">
        <img class="logo" src="https://hs-6554518.f.hubspotstarter.net/hub/6554518/hubfs/LOGO_LANETA_2022_ICONO_BLANCO-1.png?upscale=true&width=120&upscale=true&name=LOGO_LANETA_2022_ICONO_BLANCO-1.png" alt="La Neta Logo" width="50" height="50">
        <div class="header-content">
            <h1>Join Meta Creator Breakthrough Bonus Program</h1>
            <p class="subtitle">Exclusive Invitation to High-Performance Creators</p>
        </div>
        </div>
        
        <div class="content">
        {{content}}
        <div class="cta-button">
            <a href="#" class="button">Apply here</a>
        </div>
        
        <div class="signature">
            <p>Warm regards,</p>
            <p>
            <strong>Nicole Kressler</strong><br>
            Creator Management Representative<br>
            La Neta
            </p>
        </div>
        </div>
    </div>
    </body>
    </html>
  $$,
  '2025-04-10T19:00:36.196425'
);
