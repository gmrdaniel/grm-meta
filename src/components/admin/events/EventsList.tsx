import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchEventsWithPagination,
  fetchAllEvents,
  deleteEvent,
  exportEventsToExcel,
  Event,
} from "@/services/events/eventService";
import {
  Calendar,
  Copy,
  Download,
  MoreVertical,
  Trash2,
  Edit,
  Link,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@radix-ui/react-dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import EventsPagination from "./EventsPagination";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/use-debounce";
import EditEvent from "./EditEvent";

interface EventsListProps {
  onManageNotifications?: (eventId: string) => void;
}

const EventsList = ({ onManageNotifications }: EventsListProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [filterProject, setFilterProject] = useState<string>("all");

  const queryClient = useQueryClient();

  // Normalizamos el filtro para que "all" no aplique ningún filtro
  const normalizedProjectFilter =
    filterProject === "all" ? undefined : filterProject;

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "events",
      {
        page: currentPage,
        pageSize,
        projectFilter: normalizedProjectFilter,
        searchQuery: debouncedSearchQuery,
      },
    ],
    queryFn: () =>
      fetchEventsWithPagination(
        currentPage,
        pageSize,
        "event_name", // Cambiado de "created_at" a "event_name"
        "desc",
        debouncedSearchQuery,
        normalizedProjectFilter
      ),
  });

  const events = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Evento eliminado correctamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar el evento: ${error.message}`);
    },
  });

  const confirmDelete = () => {
    if (selectedEvent) {
      deleteMutation.mutate(selectedEvent);
      setSelectedEvent(null);
    }
  };

  const handleExportEvents = async () => {
    try {
      setIsExporting(true);
      // Fetch all events for export
      const allEvents = await fetchAllEvents();
      // Export to Excel
      exportEventsToExcel(allEvents);
    } catch (error) {
      console.error("Error exporting events:", error);
      toast.error("Error al exportar eventos");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
  };

  const handleEditSuccess = () => {
    setEditingEvent(null);
    queryClient.invalidateQueries({ queryKey: ["events"] });
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading events...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading events</div>;
  }

  if (!events || events.length === 0) {
    return <div className="text-center p-4">No events found</div>;
  }

  return (
    <div>
      {editingEvent ? (
        <EditEvent
          event={editingEvent}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditingEvent(null)}
        />
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleExportEvents}
              disabled={isExporting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download size={16} />
              {isExporting ? "Exporting..." : "Export All Events"}
            </Button>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by event name"
              className="border rounded px-3 py-2 w-full md:w-80"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // resetear página al filtrar
              }}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Deadline Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event: Event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">
                    {event.event_name}
                  </TableCell>
                  <TableCell>{event.projects?.name || "N/A"}</TableCell>
                  <TableCell>
                    {event.deadline
                      ? new Date(event.deadline).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        side="bottom"
                        sideOffset={8}
                        collisionPadding={16}
                        className="z-50 bg-white border shadow-md rounded-md w-auto max-w-xs p-2"
                      >
                        <DropdownMenuItem
                          onClick={() => handleEditEvent(event)}
                          className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm select-none outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit event
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            onManageNotifications
                              ? onManageNotifications(event.id, event)
                              : null
                          }
                          className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm select-none outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
                        >
                          <Bell className="mr-2 h-4 w-4" />
                          Manage Notifications
                        </DropdownMenuItem>

                        {event.link_terms && (
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(event.link_terms, "_blank")
                            }
                            className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm select-none outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
                          >
                            <Link className="mr-2 h-4 w-4" />
                            See Link
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <AlertDialog
                          open={selectedEvent === event.id}
                          onOpenChange={(open) =>
                            !open && setSelectedEvent(null)
                          }
                        >
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                setSelectedEvent(event.id);
                              }}
                              className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm select-none outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Event
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Event</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this event? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminate
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalCount > 0 && (
            <EventsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default EventsList;
