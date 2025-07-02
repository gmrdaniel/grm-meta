import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ProjectCard } from "@/components/ProjectCard";
import { fetchProjectsInvitations } from "@/services/invitation/fetchProjectsInvitations";
import { fetchInProcessInvitationsByProjects } from "@/services/invitation/fetchInProcessInvitationsByProject";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { CreatorInvitation } from "@/types/invitation";
import {ProjectSummary} from "@/types/project"

export default function AdminDashboard() {
  const [projectsSummary, setProjectsSummary] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [inProcessInvitations, setInProcessInvitations] = useState<
    { projectId: string; invitations: CreatorInvitation[] }[]
  >([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const summary = await fetchProjectsInvitations();
      setProjectsSummary(summary);

      const projectIds = summary.map(p => p.projectId);
      const inProcess = await fetchInProcessInvitationsByProjects(projectIds);
      // Filtrar solo los proyectos que tienen invitaciones en proceso
            
      setInProcessInvitations(inProcess);

      setLoading(false);
    }
    loadData();
  }, []);

const STEP_NAMES: { [key: string]: string } = {
  "12592545-e1dd-4fa9-95b9-34a4ca9accd6": "Create Pinterest Account",
  "17d6d8d0-3a9f-4bdc-a1d9-39cd4c0f0fe0": "Crear cuenta",
  "462b4ad5-9fd5-4404-a700-f46f440ef75e": "Facebook Page Creation & Instagram Link",
  "c6cb53f9-f285-475a-ae36-0b474254e2ca": "pinterest/sendedApplication",
  "d4372ddc-b14c-48d0-bd4e-928d08fd4c91": "Complete Your Profile",
  "db68c27d-f0cf-49f4-8cf0-954220e9f14e": "Welcome & Identification",
  // Agrega más pasos según sea necesario
};

const exportToExcel = (projectId: string) => {
  const projectInvitations = inProcessInvitations.find(p => p.projectId === projectId)?.invitations;

  if (!projectInvitations || projectInvitations.length === 0) {
    alert("No hay invitaciones in process para exportar.");
    return;
  }

  // Transformar los datos para reemplazar IDs con nombres de pasos
  const transformedInvitations = projectInvitations.map(invitation => {
    const transformed = { ...invitation };
    
    // Opción 1: Transformar automáticamente todos los campos
    Object.keys(transformed).forEach(key => {
      const value = transformed[key];
      
      // Si el valor es un string y existe en STEP_NAMES, reemplazarlo
      if (typeof value === 'string' && STEP_NAMES[value]) {
        transformed[key] = STEP_NAMES[value];
      }
      
      // Si es un array, revisar cada elemento

    });
    
    
    
    return transformed;
  });

  // Crear la hoja de cálculo y limpiar los headers
  const worksheet = XLSX.utils.json_to_sheet(transformedInvitations);
  
  // Obtener el rango de la hoja
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  
  // Limpiar los headers (primera fila) quitando underscores
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    const cell = worksheet[cellAddress];
    
    if (cell && cell.v) {
      // Reemplazar underscores con espacios y capitalizar primera letra de cada palabra
      cell.v = cell.v.toString()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char: string) => char.toUpperCase());
    }
  }
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Invitations");

  XLSX.writeFile(workbook, `IN PROCESS INVITATIONS.xlsx`);
};


  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Invitation Summary</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {projectsSummary.length === 0 && (
                <p className="p-6">No hay proyectos para mostrar.</p>
              )}

              {projectsSummary.map((projectSummary) => {
                const inProcess = inProcessInvitations.find(
                  (p) => p.projectId === projectSummary.projectId
                );

                return (
                  <ProjectCard
                    key={projectSummary.projectId}
                    projectSummary={projectSummary}
                    onDownloadExcel={async () => exportToExcel(projectSummary.projectId)}             />
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
