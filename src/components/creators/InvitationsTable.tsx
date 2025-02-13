
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

interface InvitationData {
  id: string;
  email: string;
  status: string;
  created_at: string;
  token: string;
  service: {
    name: string;
  };
}

export function InvitationsTable() {
  const [page, setPage] = useState(1);
  const [isResending, setIsResending] = useState<string | null>(null);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["invitations", page],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await supabase
        .from("creator_invitations")
        .select(
          `
          id,
          email,
          status,
          created_at,
          token,
          service:services (
            name
          )
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        invitations: data,
        total: count || 0,
      };
    },
  });

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  const handleResendEmail = async (invitation: InvitationData) => {
    setIsResending(invitation.id);
    try {
      const inviteUrl = `${window.location.origin}/auth?invitation=${invitation.token}`;
      
      const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          email: invitation.email,
          invitationUrl: inviteUrl,
        },
      });

      if (emailError) throw emailError;
      
      toast.success(`Invitation resent to ${invitation.email}`);
    } catch (error: any) {
      console.error("Error resending invitation:", error);
      toast.error(`Error resending invitation: ${error.message}`);
    } finally {
      setIsResending(null);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.invitations.map((invitation: InvitationData) => (
              <TableRow key={invitation.id}>
                <TableCell>{invitation.email}</TableCell>
                <TableCell>{invitation.service?.name}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      invitation.status === "accepted"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {invitation.status}
                  </span>
                </TableCell>
                <TableCell>
                  {format(new Date(invitation.created_at), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResendEmail(invitation)}
                    disabled={invitation.status === "accepted" || isResending === invitation.id}
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    {isResending === invitation.id ? "Sending..." : "Resend"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(1)}
          disabled={page === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(totalPages)}
          disabled={page >= totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
