export const getPinterestRegisterEmail = (name: string, url: string) => {

    const template = `<div>
                <p>Hola ${name}</p>
                <p>Soy Nicole, de La Neta, agencia de marketing que se ha aliado con Pinterest para invitar
                    a un grupo selecto de creadores a formar parte de su programa ¿El reto? Unirte a Pinterest,
                    conectar tu cuenta de IG, y dejar que tu contenido brille también allí.
                </p>
                <p>Con eso, estarás participando automáticamente por:</p>
                <ul>
                    <li>1 tarjeta de regalo de Amazon por $1,000 USD</li>
                    <li>10 tarjetas de regalo de Amazon por $100 USD</li>
                </ul>
                <p><b>Además, al unirte recibirás:</b></p>
                <ul>
                    <li>Acceso a un webinar exclusivo con el equipo de Pinterest</li>
                    <li>Recursos especiales para ayudarte a crecer más rápido como creador de contenido</li>
                </ul>
                <p>Tienes hasta el 15 de Mayo para participar. Si estás buscando impulsar tu crecimiento en una
                    plataforma visual pensada para creadores como tú, este es el momento.</p>
                <div style="text-align: center; padding-top: 20px; padding-bottom: 20px;">

                    <a href="${url}" class="button" style="
                        text-decoration: none !important;
                        color: white !important;
                        background-color: #E60023 !important;
                        padding-top: 10px !important; 
                        padding-bottom: 10px !important;
                        padding-left: 20px !important;
                        padding-right: 20px !important;
                        margin-top: 20px !important;
                        margin-bottom: 20px !important;
                        border-radius: 20px !important;
                        cursor: pointer !important;">
                        Participa aquí
                    </a>
                    <p style="color: #9a9a9a !important; margin-top: 20px !important">Si tienes problemas con el Botón anterior, prueba a copiar y pegar el siguiente enlace: <a style="color: #00ade8" href="${url}">${url}</a></p>
                </div>
                <p>Si tienes alguna duda, no dudes en escribirme. Estoy aquí para apoyarte.</p>
            </div>`
    return template
}