import { useState } from "react";
import { ProjectSummary } from "@/types/project";
import { Users, Loader2 } from "lucide-react";

interface ProjectCardProps {
  projectSummary: ProjectSummary;
  onDownloadExcel: () => Promise<void>;
}

export function ProjectCard({
  projectSummary,
  onDownloadExcel,
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

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      await onDownloadExcel();
    } catch (err) {
      console.error("Error downloading Excel:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-between flex-col bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col">
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

          <div className="flex flex-wrap mt-4 justify-between">
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
      </div>
      {inProcessInvitations > 0 && (
        <button
          onClick={handleDownload}
          className="mt-8 w-full bg-slate-50 border border-slate-200 text-slate-700 py-3 px-6 rounded-lg font-medium hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md group disabled:opacity-60 disabled:cursor-not-allowed"
          title={`Download in process invitations for ${projectName}`}
          disabled={isLoading}
        >
          <span className="flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Downloading...
              </>
            ) : (
              <>
                <svg
                  className="w-full h-auto max-w-[24px] max-h-[24px] group-hover:scale-110 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download In Process Invitations
              </>
            )}
          </span>
        </button>
      )}
    </div>
  );
}
