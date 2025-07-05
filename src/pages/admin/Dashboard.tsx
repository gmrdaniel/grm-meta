import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ProjectCard } from "@/components/ProjectCard";
import { fetchProjectInvitationSummaries } from "@/services/invitation/fetchProjectInvitationSummaries";
import { fetchInProcessInvitationsByProjects } from "@/services/invitation/fetchInProcessInvitationsByProject";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { CreatorInvitation } from "@/types/invitation";
import { ProjectSummary } from "@/types/project";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminDashboard() {
  const [projectsSummary, setProjectsSummary] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [inProcessInvitations, setInProcessInvitations] = useState<
    { projectId: string; invitations: CreatorInvitation[] }[]
  >([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const summary = await fetchProjectInvitationSummaries();
        setProjectsSummary(summary);

        const projectIds = summary.map((p) => p.projectId);
        const inProcess = await fetchInProcessInvitationsByProjects(projectIds);
        setInProcessInvitations(inProcess);
      } catch (error) {
        console.error("Error loading project data:", error);
        setProjectsSummary([]);
        setInProcessInvitations([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const STEP_NAMES: { [key: string]: string } = {
    "12592545-e1dd-4fa9-95b9-34a4ca9accd6": "Create Pinterest Account",
    "17d6d8d0-3a9f-4bdc-a1d9-39cd4c0f0fe0": "Create account",
    "462b4ad5-9fd5-4404-a700-f46f440ef75e":"Facebook Page Creation & Instagram Link",
    "c6cb53f9-f285-475a-ae36-0b474254e2ca": "pinterest/sendedApplication",
    "d4372ddc-b14c-48d0-bd4e-928d08fd4c91": "Complete Your Profile",
    "db68c27d-f0cf-49f4-8cf0-954220e9f14e": "Welcome & Identification",
  };


  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Invitation Summary</h1>

            {loading ? (
              <div className="flex flex-col justify-center items-center h-48 space-y-2 ">
                <div className="animate-spin h-8 w-8 border-b-2 border-gray-900 rounded-full m-5" />
                Loading projects...
              </div>
            ) : projectsSummary.length === 0 ? (
              <p className="p-6 text-center text-gray-600">
                No projects available or found.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                {projectsSummary.map((projectSummary) => (
                  <ProjectCard
                    key={projectSummary.projectId}
                    projectSummary={projectSummary}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
