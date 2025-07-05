import { useState } from "react";
import { ProjectSummary } from "@/types/project";
import { Users } from "lucide-react";
import { ModalInvitationList } from "./invitation/ModalInvitationList";

interface ProjectCardProps {
  projectSummary: ProjectSummary;
}

export function ProjectCard({
  projectSummary,
}: ProjectCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    total,
    invitations,
    project_name,
    project_id,
  } = projectSummary;

  // Obtener conteos individuales por estado
  const getCount = (status: string) =>
    invitations.find((i) => i.status === status)?.invitation_count ?? 0;

  const getPercentage = (value: number) =>
    total > 0 ? `(${((value / total) * 100).toFixed(1)}%)` : "(0%)";

  const statItemClass = "m-2 text-gray-700 font-semibold";

  // Conteos por estado
  const pending = getCount("pending");
  const inProcess = getCount("in process");
  const completed = getCount("completed");
  const approved = getCount("approved");
  const accepted = getCount("accepted");
  const rejected = getCount("rejected");

  return (
    <div className="flex justify-between flex-col bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-2xl">{project_name}</span>
        <span className="text-gray-600 bg-gray-50/50 p-2 rounded-xl">
          <Users size={20} />
        </span>
      </div>

      <div className="text-gray-700">
        <h3 className="text-xl mb-2">Invitations:</h3>
        <p className="text-4xl font-bold">{total}</p>
        <hr className="my-4 border-t-2 border-black w-full" />

        <div className="flex flex-wrap mt-4">
          {pending > 0 && (
            <div className={statItemClass}>
              <span className="mr-1">Pending:</span>
              <span>{pending} <small className="text-gray-500">{getPercentage(pending)}</small></span>
            </div>
          )}

          {inProcess > 0 && (
            <div className={statItemClass}>
              <span className="mr-1">In process:</span>
              <span>{inProcess} <small className="text-gray-500">{getPercentage(inProcess)}</small></span>
            </div>
          )}

          {completed > 0 && (
            <div className={statItemClass}>
              <span className="mr-1">Completed:</span>
              <span>{completed} <small className="text-gray-500">{getPercentage(completed)}</small></span>
            </div>
          )}

          {approved > 0 && (
            <div className={statItemClass}>
              <span className="mr-1">Approved:</span>
              <span>{approved} <small className="text-gray-500">{getPercentage(approved)}</small></span>
            </div>
          )}

          {accepted > 0 && (
            <div className={statItemClass}>
              <span className="mr-1">Accepted:</span>
              <span>{accepted} <small className="text-gray-500">{getPercentage(accepted)}</small></span>
            </div>
          )}

          {rejected > 0 && (
            <div className={statItemClass}>
              <span className="mr-1">Rejected:</span>
              <span>{rejected} <small className="text-gray-500">{getPercentage(rejected)}</small></span>
            </div>
          )}
        </div>
      </div>

      {/* Modal solo si hay "in process" */}
      {inProcess > 0 && (
        <ModalInvitationList
          preselectedProject={{
            id: project_id,
            name: project_name,
          }}
          resetProjectOnClose={false}
          disableProjectSelector={true}
        />
      )}
    </div>
  );
}
