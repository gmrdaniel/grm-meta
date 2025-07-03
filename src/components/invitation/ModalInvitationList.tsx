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
}: ButtonDownloadInvitationsProps) => {
  return (
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
};

export const ModalInvitationList = () => {
  const [currentProject, setCurrentProject] = useState<Project | undefined>(
    undefined
  );
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [exporting, setExporting] = useState<boolean>(false);
  const today = new Date().toISOString().split("T")[0];

  const STATUSES = [
    "pending",
    "in process",
    "completed",
    "approved",
    "rejected",
  ];

  const handleCheckboxChange = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const generateXlsx = async () => {
    if (!currentProject) {
      toast.error("Please select a project.");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates.");
      return;
    }

    try {
      setExporting(true);

      const from = new Date(startDate);
      const to = new Date(endDate);

      console.log(currentProject);

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
  };

  useEffect(() => {
    initialFetch();
  }, []);

  return (
    <Modal
      options={{
        title: "Export By Date",
        ButtonComponent: (
          <ButtonDownloadInvitations
            onClick={generateXlsx}
            exporting={exporting}
          />
        ),
      }}
    >
      <div className="mt-4 md:mt-0 flex flex-col">
        <div className="flex flex-col w-full">
          <label className="mb-2 mt-2 text-sm font-medium">See from: (*)</label>
          <Select
            onValueChange={(value) => {
              const project = projectsList.find(
                (project) => project.id === value
              );
              setCurrentProject(project);
            }}
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
        </div>

        <div className="w-full">
          <label className="mb-1 mt-3 block text-sm font-medium">
            From date: (*)
          </label>{" "}
          <input
            max={today}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-2 py-2 rounded-md w-full max-w-sm"
          />
          <label className="mb-1 mt-3 block text-sm font-medium">
            To date: (*)
          </label>{" "}
          <input
            max={today}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-2 py-2 rounded-md w-full max-w-sm"
          />
          <div className="w-full my-4">
            <label className="mb-2 mt-3 block text-sm font-medium">
              Filter by state
            </label>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 gap-3">
              {STATUSES.map((status) => (
                <label
                  key={status}
                  className="flex items-center gap-2 px-2 py-2 border border-gray-300 rounded-full cursor-pointer transition hover:bg-gray-100"
                >
                  <input
                    type="checkbox"
                    value={status}
                    checked={selectedStatuses.includes(status)}
                    onChange={() => handleCheckboxChange(status)}
                    className="peer hidden "
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
