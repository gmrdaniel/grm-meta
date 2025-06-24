import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import InvitationsPagination from "../invitations/InvitationsPagination";
import { fetchProfileProjectsWithPagination } from "@/services/profile-project/fetchProfileProjectsWithPagination";
import { fetchProjects } from "@/services/project/projectService";
import { Button } from "@/components/ui/button";

const ProjectCreatorsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>("all");

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "profile-projects",
      {
        page: currentPage,
        pageSize,
        statusFilter: filterStatus === "all" ? undefined : filterStatus,
        projectFilter: filterProject === "all" ? undefined : filterProject,
        searchQuery: debouncedSearchQuery,
      },
    ],
    queryFn: () =>
      fetchProfileProjectsWithPagination(
        currentPage,
        pageSize,
        "joined_at",
        "desc",
        filterStatus === "all" ? undefined : filterStatus,
        filterProject === "all" ? undefined : filterProject,
        debouncedSearchQuery
      ),
  });

  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const creators = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const getStatusBadge = (status: string) => {
    switch (status) {
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

  return (
    <div>
          

      <div className="flex flex-col gap-4 mb-4 sm:grid sm:grid-cols-2 lg:flex lg:flex-row lg:justify-between lg:items-center">
        <input
          type="text"
          placeholder="Search by name or email"
          className="border rounded px-3 py-2 w-full sm:col-span-2 lg:w-80"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />

        <Select
          value={filterProject}
          onValueChange={(value) => {
            setFilterProject(value);
            setCurrentPage(1);
          }}
          disabled={isLoadingProjects}
        >
          <SelectTrigger className="w-full sm:w-full lg:w-48">
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

        <Select
          value={filterStatus}
          onValueChange={(value) => {
            setFilterStatus(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-full lg:w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {creators.length === 0 && totalCount === 0 ? (
        <div className="text-center p-4">No creators found</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Page ID</TableHead>
              <TableHead>Owner ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creators.map((creator) => (
              <TableRow key={`${creator.profile?.email}-${creator.project_id}`}>
                <TableCell>
                  {creator.profile?.first_name} {creator.profile?.last_name}
                </TableCell>
                <TableCell>{creator.profile?.email}</TableCell>
                <TableCell className="font-mono text-xs">
                  {creator.fb_profile_id}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {creator.fb_profile_owner_id}
                </TableCell>
                <TableCell>{getStatusBadge(creator.status)}</TableCell>
                <TableCell>
                  {new Date(creator.joined_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

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

export default ProjectCreatorsList;
