import React from 'react';

type ProyectoCardProps = {
  titulo: string;
  urlBoton: string;
  textoBoton?: string;
  statusInvitacion?:string;
};

const ProyectoCard: React.FC<ProyectoCardProps> = ({
  titulo,
  statusInvitacion,
  urlBoton,
  textoBoton = 'Ir al proyecto',
}) => {

return (
  <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-lg mb-4">
    {/* Barra superior con gradiente dinámico */}
    <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500"></div>

    {/* Indicador de urgencia flotante */}
    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse z-10">
      <span className="text-white text-xs font-bold">!</span>
    </div>

    {/* Contenido principal */}
    <div className="p-6">
      <div className="flex items-center justify-between">
        {/* Lado izquierdo */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-lime-400 rounded-full border-2 border-white animate-bounce"></div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-1">{titulo}</h3>
          </div>
        </div>

        {/* Estado de la invitación */}
        <div className="ml-4 flex flex-col items-end space-y-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md ${
              statusInvitacion === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : statusInvitacion === "in process"
                ? "bg-blue-100 text-blue-800"
                : statusInvitacion === "approved"
                ? "bg-green-100 text-green-800"
                :statusInvitacion === "rejected"
                ? "bg-red-100 text-red-800"
                :statusInvitacion === "completed"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
                
            
                
            }`}
          >
            {statusInvitacion}
          </span>

          {/* Botón adaptativo */}
          {urlBoton && (
            <a
              href={urlBoton}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-emerald-600 hover:to-teal-700 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10 mr-2 hidden sm:inline">{textoBoton}</span>
              <svg
                className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Barra decorativa */}
      <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
        <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-1 rounded-full w-1/3 animate-pulse"></div>
      </div>

      {/* Mensaje motivacional */}
      <div className="mt-3 flex items-center text-sm text-gray-600">
        <span className="mr-2">🚀</span>
        <span>¡Un paso más para desbloquear oportunidades increíbles!</span>
      </div>
    </div>

    {/* Hover decorativo */}
    <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/0 to-teal-50/0 group-hover:from-emerald-50/50 group-hover:to-teal-50/50 transition-all duration-300 pointer-events-none"></div>
  </div>
);






};

export default ProyectoCard;