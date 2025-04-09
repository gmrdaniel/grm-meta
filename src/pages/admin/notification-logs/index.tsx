
import { NotificationLogsList } from "@/components/admin/notifications/NotificationLogsList";

export default function NotificationLogsPage() {
  return (
    <div className="container p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Registros de Notificaciones</h1>
        <p className="text-gray-500">
          Visualiza todas las notificaciones enviadas a los creadores
        </p>
      </header>

      <NotificationLogsList />
    </div>
  );
}
