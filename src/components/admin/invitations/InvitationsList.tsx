import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchInvitations,
  updateInvitationStatus,
  deleteInvitation,
  sendCreatorInvitationEmail,
  fetchInvitationsWithPagination,
  fetchAllInvitations,
  exportInvitationsToExcel,
  getProjects, 
} from "@/services/invitationService";
import {
  Check,
  Copy,
  Download,
  MailCheck,
  MoreVertical,
  RefreshCw,
  Trash2,
  X,
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
import { CreatorInvitation } from "@/types/invitation";
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
import InvitationsPagination from "./InvitationsPagination";
import { useNavigate } from "react-router-dom";
import { ModalInvitationList } from "@/components/invitation/ModalInvitationList";
import { ModalRegisteredsList } from "@/components/invitation/ModalRegisteredsList";
import { useDebounce } from "@/hooks/use-debounce";
//import { Cross2Icon } from "@radix-ui/react-icons";
import { RequestUpdateDialog } from "./RequestUpdateDialog";

const InvitationsList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [selectedInvitation, setSelectedInvitation] = useState<string | null>(
    null
  );
  const [requestUpdateInvitation, setRequestUpdateInvitation] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  
  // Inicializar los estados con valores de localStorage si existen
  const [filterStatus, setFilterStatus] = useState<string>(
    localStorage.getItem("invitationsFilterStatus") || "all"
  );
  const [filterProject, setFilterProject] = useState<string>(
    localStorage.getItem("invitationsFilterProject") || "all"
  );

  // Consulta para obtener los proyectos
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const projects = projectsData || [];

  // Guardar los valores de los filtros en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem("invitationsFilterStatus", filterStatus);
  }, [filterStatus]);

  useEffect(() => {
    localStorage.setItem("invitationsFilterProject", filterProject);
  }, [filterProject]);

  const queryClient = useQueryClient();

  // Normalizamos el filtro para que "all" no aplique ningún filtro
  const normalizedStatusFilter =
    filterStatus === "all"
      ? undefined
      : (filterStatus as
          | "pending"
          | "rejected"
          | "completed"
          | "in process"
          | "approved");

  const normalizedProjectFilter =
    filterProject === "all" ? undefined : filterProject;

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "invitations",
      {
        page: currentPage,
        pageSize,
        statusFilter: normalizedStatusFilter,
        searchQuery: debouncedSearchQuery,
        projectFilter: normalizedProjectFilter, // Añadir filtro de proyecto
      },
    ],
    queryFn: () =>
      fetchInvitationsWithPagination(
        currentPage,
        pageSize,
        "created_at",
        "desc",
        normalizedStatusFilter,
        debouncedSearchQuery,
        normalizedProjectFilter // Añadir filtro de proyecto
      ),
  });

  const invitations = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
    const isFbStepDisabled = (status: string) => {
    return status === "pending" || status === "in process";
  };
  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      resetFbStep = false
    }: {
      id: string;
      status: "pending" | "rejected" | "completed" | "in process" | "approved";
      resetFbStep?: boolean;
    }) => updateInvitationStatus(id, status,false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation status updated");
    },
    onError: (error: Error) => {
      toast.error(`Error updating invitation: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error deleting invitation: ${error.message}`);
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: ({
      email,
      name,
      invitationUrl,
    }: {
      email: string;
      name?: string;
      invitationUrl: string;
    }) => sendCreatorInvitationEmail({ email, name, invitationUrl }),
    onSuccess: () => {
      toast.success("Invitation email sent successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error sending email: ${error.message}`);
    },
  });

const handleStatusChange = (
  id: string,
  newStatus: "pending" | "rejected" | "completed" | "in process"| "approved"
) => {
  // Determine if fb_step_completed should be false based on the new status
  const shouldResetFbStep = newStatus === "pending" || newStatus === "in process";
  
  updateStatusMutation.mutate({ 
    id, 
    status: newStatus,
    resetFbStep: shouldResetFbStep 
  });
};
  const confirmDelete = () => {
    if (selectedInvitation) {
      deleteMutation.mutate(selectedInvitation);
      setSelectedInvitation(null);
    }
  };

  const createInvitationLink = (invitation: CreatorInvitation) => {
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}${invitation.invitation_url}`;

    return fullUrl;
  };
  const copyInvitationLink = (invitation: CreatorInvitation) => {
    navigator.clipboard
      .writeText(createInvitationLink(invitation))
      .then(() => toast.success("Invitation link copied to clipboard"))
      .catch(() => toast.error("Failed to copy invitation link"));
  };

  const copyInvitationCode = (code: string) => {
    navigator.clipboard
      .writeText(code)
      .then(() => toast.success("Invitation code copied to clipboard"))
      .catch(() => toast.error("Failed to copy invitation code"));
  };

  const resetInvitationStatus = (id: string) => {
    handleStatusChange(id, "pending");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
        case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Accepted
          </Badge>
        );
        case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleExportInvitations = async () => {
    try {
      setIsExporting(true);
      // Fetch all invitations for export
      const allInvitations = await fetchAllInvitations();
      // Export to Excel
      exportInvitationsToExcel(allInvitations);
    } catch (error) {
      console.error("Error exporting invitations:", error);
      toast.error("Failed to export invitations");
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

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">Loading invitations...</div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading invitations</div>;
  }

  const filteredInvitations =
    filterStatus === "all"
      ? invitations
      : invitations.filter(
          (invitation: CreatorInvitation) => invitation.status === filterStatus
        );

  if (filteredInvitations.length === 0 && filterStatus !== "all") {
    setFilterStatus("all");
    toast.info("No invitations found for the selected filter");
  }

  if (!invitations || invitations.length === 0) {
    return <div className="text-center p-4">No invitations found</div>;
  }
  return (
    <div>
      <div className="flex justify-end mb-4">
        <ModalInvitationList />
        <ModalRegisteredsList />
        <Button
          onClick={handleExportInvitations}
          disabled={isExporting}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download size={16} />
          {isExporting ? "Exporting..." : "Export All Invitations"}
        </Button>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or code"
          className="border rounded px-3 py-2 w-full md:w-80"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // resetear página al filtrar
          }}
        />
        <div className="flex gap-2">
          <Select
            value={filterStatus}
            onValueChange={(value) => {
              setFilterStatus(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="in process">In Process</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filterProject}
            onValueChange={(value) => {
              setFilterProject(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Invitation Code</TableHead>
            <TableHead>Project</TableHead> 
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvitations.map((invitation: CreatorInvitation) => (
            <TableRow key={invitation.id}>
              <TableCell className="font-medium">
                {invitation.first_name} {invitation.last_name}
              </TableCell>
              <TableCell>{invitation.email}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm">
                    {invitation.invitation_code || "N/A"}
                  </span>
                  {invitation.invitation_code && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        copyInvitationCode(invitation.invitation_code)
                      }
                      title="Copy invitation code"
                    >
                      <Copy size={16} />
                    </Button>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                {invitation.projects?.name || "N/A"}
              </TableCell>
              <TableCell>
                {invitation.invitation_type === "new_user"
                  ? "New User"
                  : "Existing User"}
              </TableCell>
              <TableCell>{getStatusBadge(invitation.status)}</TableCell>
              <TableCell>
                {new Date(invitation.created_at).toLocaleDateString()}
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
                      onClick={() => copyInvitationLink(invitation)}
                      className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm select-none outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy invitation link
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() =>
                        navigate(`/admin/invitations/edit/${invitation.id}`)
                      }
                      className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm select-none outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Edit invitation
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() =>
                        sendEmailMutation.mutate({
                          email: invitation.email,
                          name: invitation.first_name,
                          invitationUrl: createInvitationLink(invitation),
                        })
                      }
                      className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm select-none outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none text-indigo-600"
                    >
                      <MailCheck className="mr-2 h-4 w-4" />
                      Send invitation email
                    </DropdownMenuItem>

                    {invitation.status === "pending" && (
                      <>
                        {/* <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(invitation.id, "completed" as const)
                          }
                          className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm select-none outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none text-green-600"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Mark as accepted
                        </DropdownMenuItem> */}
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(invitation.id, "rejected")
                          }
                          className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm select-none outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none text-red-600"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Mark as rejected
                        </DropdownMenuItem>
                      </>
                    )}

                    {invitation.status !== "pending" && (
                      <DropdownMenuItem
                        onClick={() => resetInvitationStatus(invitation.id)}
                        className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm select-none outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none text-blue-600"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset to pending
                      </DropdownMenuItem>
                      
                    )}
                    

                    <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setRequestUpdateInvitation(invitation.id)}
                        className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm select-none outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none text-blue-600"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Request update
                      </DropdownMenuItem>
                      
                    <AlertDialog
                      open={selectedInvitation === invitation.id}
                      onOpenChange={(open) =>
                        !open && setSelectedInvitation(null)
                      }
                    >
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            setSelectedInvitation(invitation.id);
                          }}
                          className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm select-none outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:pointer-events-none text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete invitation
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Invitation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this invitation?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Diálogo de Request Update */}
                {requestUpdateInvitation === invitation.id && (
                  <RequestUpdateDialog
                    isOpen={!!requestUpdateInvitation}
                    onOpenChange={(open) => {
                      if (!open) setRequestUpdateInvitation(null);
                    }}
                    project={invitation.projects?.name}
                    email={invitation.email}
                    name={invitation.first_name}
                    invitation_id={invitation.id} 
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalCount > 0 && (
        <InvitationsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
};

export default InvitationsList;