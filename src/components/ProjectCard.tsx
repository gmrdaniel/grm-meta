import { useState } from "react";
import { ProjectSummary } from "@/types/project";
import { Users, Loader2 } from "lucide-react";
import { ModalInvitationList } from "./invitation/ModalInvitationList";

interface ProjectCardProps {
  projectSummary: ProjectSummary;
}

export function ProjectCard({
  projectSummary,
}: ProjectCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    totalInvitations,
    pendingInvitations,
    inProcessInvitations,
    completedInvitations,
    approvedInvitations,
    acceptedInvitations,
    rejectedInvitations,
    projectName,
  } = projectSummary;

  const getPercentage = (value: number) =>
    totalInvitations > 0
      ? `(${((value / totalInvitations) * 100).toFixed(1)}%)`
      : "(0%)";

  const statItemClass = "m-2 text-gray-700 font-semibold";


  return (
    <div className="flex justify-between flex-col bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-2xl">{projectName}</span>
        <span className="text-gray-600 bg-gray-50/50 p-2 rounded-xl">
          <Users size={20} />
        </span>
      </div>

      <div className="text-gray-700">
        <h3 className="text-xl mb-2">Invitations:</h3>
        <p className="text-4xl font-bold">{totalInvitations}</p>
        <hr className="my-4 border-t-2 border-black w-full" />

        <div className="flex flex-wrap mt-4">
          <div className={statItemClass}>
            <span className="mr-1">Pending:</span>
            <span>
              {pendingInvitations}{" "}
              <small className="text-gray-500">
                {getPercentage(pendingInvitations)}
              </small>
            </span>
          </div>

          <div className={statItemClass}>
            <span className="mr-1">In process:</span>
            <span>
              {inProcessInvitations}{" "}
              <small className="text-gray-500">
                {getPercentage(inProcessInvitations)}
              </small>
            </span>
          </div>

          <div className={statItemClass}>
            <span className="mr-1">Completed:</span>
            <span>
              {completedInvitations}{" "}
              <small className="text-gray-500">
                {getPercentage(completedInvitations)}
              </small>
            </span>
          </div>

          <div className={statItemClass}>
            <span className="mr-1">Approved:</span>
            <span>
              {approvedInvitations}{" "}
              <small className="text-gray-500">
                {getPercentage(approvedInvitations)}
              </small>
            </span>
          </div>

          {acceptedInvitations > 0 && (
            <div className={statItemClass}>
              <span className="mr-1">Accepted:</span>
              <span>
                {acceptedInvitations}{" "}
                <small className="text-gray-500">
                  {getPercentage(acceptedInvitations)}
                </small>
              </span>
            </div>
          )}

          <div className={statItemClass}>
            <span className="mr-1">Rejected:</span>
            <span>
              {rejectedInvitations}{" "}
              <small className="text-gray-500">
                {getPercentage(rejectedInvitations)}
              </small>
            </span>
          </div>
        </div>
      </div>

      {inProcessInvitations > 0 && (
<ModalInvitationList
  preselectedProject={{
    id: projectSummary.projectId,
    name: projectSummary.projectName,
  }}
  resetProjectOnClose={false}
  disableProjectSelector={true}
/>


      )}
    </div>
  );
}