import { useEffect, useState } from "react";
import { Modal } from "../modal/Modal";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { fetchInvitationsByDateAndStatus } from "@/services/invitation";
import { exportToExcel } from "@/utils/exportToExcel";
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { fetchProjects } from "@/services/project/projectService";
import { Project } from "@/types/project";

interface ButtonDownloadInvitationsProps {
  onClick: () => void;
  exporting: boolean;
}

const ButtonDownloadInvitations = ({
  onClick,
  exporting,
}: ButtonDownloadInvitationsProps) => (
  <Button
    onClick={onClick}
    disabled={exporting}
    variant="outline"
    className="flex items-center gap-2 mr-4"
  >
    <Download size={16} />
    {exporting ? "Exporting..." : "Export Invitations"}
  </Button>
);

interface ModalInvitationListProps {
  preselectedProject?: Project;
  preselectedProjectName?: string;
  preselectedProjectId?: string;
  showProjectSelector?: boolean;
  disableProjectSelector?: boolean;
  onProjectSelect?: (project: Project) => void;
  resetProjectOnClose?: boolean;
}

export const ModalInvitationList = ({
  preselectedProject,
  preselectedProjectName,
  preselectedProjectId,
  showProjectSelector = true,
  disableProjectSelector = false,
  onProjectSelect,
  resetProjectOnClose = false,
}: ModalInvitationListProps) => {
  const [currentProject, setCurrentProject] = useState<Project | undefined>(
    preselectedProject
  );
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [exporting, setExporting] = useState<boolean>(false);
  const today = new Date().toISOString().split("T")[0];

  const StatusList = [
    "pending",
    "in process",
    "completed",
    "approved",
    "rejected",
  ];

  const resetForm = () => {
    setStartDate("");
    setEndDate("");
    setSelectedStatuses([]);
    if (resetProjectOnClose) {
      setCurrentProject(undefined);
    } else {
      setCurrentProject(preselectedProject); // conserva la selección original
    }
  };

  const handleCheckboxChange = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleProjectChange = (value: string) => {
    const project = projectsList.find((project) => project.id === value);
    if (project) {
      setCurrentProject(project);
      onProjectSelect?.(project);
    }
  };

  const generateXlsx = async () => {
    if (!currentProject) {
      toast.error("Please select a project.");
      return;
    }

    try {
      setExporting(true);

      const from = startDate ? new Date(startDate) : undefined;
      const to = endDate ? new Date(endDate) : new Date();

      const data = await fetchInvitationsByDateAndStatus(
        currentProject.id,
        from,
        to,
        selectedStatuses
      );

      exportToExcel(data, "invitations", from, to, selectedStatuses);
    } catch (e) {
      console.error("Error :", e);
      toast.error("An error has occurred");
    } finally {
      setExporting(false);
    }
  };

  const initialFetch = async () => {
    const res = await fetchProjects();
    setProjectsList(res);

    if (preselectedProjectName && !preselectedProject) {
      const project = res.find((p) => p.name === preselectedProjectName);
      if (project) setCurrentProject(project);
    } else if (preselectedProjectId && !preselectedProject) {
      const project = res.find((p) => p.id === preselectedProjectId);
      if (project) setCurrentProject(project);
    }
  };

  useEffect(() => {
    initialFetch();
  }, []);

  useEffect(() => {
    if (preselectedProject) {
      setCurrentProject(preselectedProject);
    }
  }, [preselectedProject]);

  return (
    <Modal
      onOpenChange={(open) => {
        if (!open) resetForm(); // limpia al cerrar
      }}
      options={{
        title: "Export Invitations",
        ButtonComponent: (
          <ButtonDownloadInvitations
            onClick={generateXlsx}
            exporting={exporting}
          />
        ),
      }}
    >
      <div className="mt-4 md:mt-0 flex flex-col">
        {showProjectSelector && (
          <div className="flex flex-col w-full">
            <label className="mb-2 mt-2 text-sm font-medium">
              Project: {!currentProject && "(*)"}
            </label>
            {disableProjectSelector && currentProject ? (
              <input
                type="text"
                value={currentProject.name}
                readOnly
                className="border px-3 py-2 rounded-md w-full max-w-sm bg-gray-50 text-gray-700 cursor-not-allowed"
              />
            ) : (
              <Select
                onValueChange={handleProjectChange}
                disabled={disableProjectSelector}
                value={currentProject?.id || ""}
              >
                <SelectTrigger className="w-full max-w-sm">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent side="bottom" avoidCollisions={false}>
                  {projectsList.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        <div className="w-full">
          <label className="mb-1 mt-3 block text-sm font-medium">From date:</label>
          <div className="relative w-full max-w-sm">
            <input
              max={today}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border px-2 py-2 rounded-md w-full pr-10"
            />
            {startDate && (
              <button
                type="button"
                onClick={() => setStartDate("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label="Clear start date"
              >
                ✕
              </button>
            )}
          </div>

          <label className="mb-1 mt-3 block text-sm font-medium">To date:</label>
          <div className="relative w-full max-w-sm">
            <input
              max={today}
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border px-2 py-2 rounded-md w-full pr-10"
            />
            {endDate && (
              <button
                type="button"
                onClick={() => setEndDate("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label="Clear end date"
              >
                ✕
              </button>
            )}
          </div>

          <div className="w-full my-4">
            <label className="mb-2 mt-3 block text-sm font-medium">
              Filter by state
            </label>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 gap-3">
              {StatusList.map((status) => (
                <label
                  key={status}
                  className="flex items-center gap-2 px-2 py-2 border border-gray-300 rounded-full cursor-pointer transition hover:bg-gray-100"
                >
                  <input
                    type="checkbox"
                    value={status}
                    checked={selectedStatuses.includes(status)}
                    onChange={() => handleCheckboxChange(status)}
                    className="peer hidden"
                  />
                  <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center peer-checked:bg-blue-600 transition">
                    <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition"></div>
                  </div>
                  <span className="capitalize text-sm text-gray-800">
                    {status}
                  </span>
                </label>
              ))}
            </div>

            {selectedStatuses.length > 0 && (
              <p className="text-xs mt-3 text-gray-500">
                Selected: {selectedStatuses.join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
