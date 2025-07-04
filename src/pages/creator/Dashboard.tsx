import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { MoreHorizontal, Mail, ExternalLink } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { fetchProjectsByEmail } from "@/services/project/getProjectsByUser";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function CreatorDashboard() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);

  const fetchInvitationStatus = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from("creator_invitations")
        .select("status,invitation_url,project_id")
        .eq("email", user.email);
      const dataProjects = await fetchProjectsByEmail(user.email);
      setInvitations(dataProjects);
      console.log(dataProjects);

      if (error || !data) {
        console.error("No invitation data:", error);
      }
    } catch (error) {
      console.error("Error in fetchInvitationStatus:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 ",
      inprocess: "bg-blue-100 ",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
    };
    return colors[status] ?? "bg-gray-100 text-gray-800";
  };

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .select("meta_verified")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching verification status:", error);
      }
    };

    fetchVerificationStatus();
    fetchInvitationStatus();
  }, [user]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main
          className={cn(
            "flex-1 overflow-y-auto px-4 py-6",
            isMobile && "pb-20"
          )}
        >
          <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Hello!
                  </h1>
                  <p className="text-gray-600">
                    Here's what's happening with your projects today
                  </p>
                </div>
                {/* <div className="flex items-center space-x-4">
            <div className="bg-white rounded-lg shadow-sm border px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">{taskCompletion}% Task Completed</span>
              </div>
            </div>
            <div className="relative">
              <button className="bg-white rounded-lg shadow-sm border p-2 hover:bg-gray-50 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
            </div>
          </div> */}
              </div>

              <div className="flex flex-col">
                {/* Left Column - Projects and Tasks */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Active Projects */}
                  <div className="bg-white shadow-sm border  rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Active invitations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {invitations
                        .filter(
                          (invitation) =>
                            invitation.status === "in process" ||
                            invitation.status === "pending" ||
                            invitation.status === "completed"
                        )
                        .sort((a, b) => {
                          const order = {
                            pending: 1,
                            "in process": 2,
                            completed: 3,
                          };

                          return order[a.status] - order[b.status];
                        })
                        .map((invitation) => {
                          // Color para el fondo general de la tarjeta
                          const bgColorClass = () => {
                            switch (invitation.status) {
                              case "in process":
                                return "bg-gradient-to-br from-[#e1efff] to-[#90c4ff] text-[#2563eb] border border-[#90c4ff]";
                              case "pending":
                                return "bg-gradient-to-br from-[#fff4dc] to-[#ffd17c] text-[#5b3b00] border border-[#ffa800]";
                              case "completed":
                                return "bg-gradient-to-br from-green-500 to-green-600 text-white border border-green-700";
                              default:
                                return "bg-gradient-to-br from-blue-500 to-blue-600 text-white border border-blue-700";
                            }
                          };

                          const getButtonStyleByStatus = (status: string) => {
                            switch (status) {
                              case "in process":
                                return "bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-300";
                              case "pending":
                                return "bg-[#ffe4af] text-[#5b3b00] border border-[#ffd88b] hover:bg-[#fdaa05] hover:text-yellow-900";
                              case "completed":
                                return "bg-green-400 text-white-300  hover:bg-green-700";
                              case "approved":
                                return "bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200";
                              case "rejected":
                                return "bg-red-100 text-red-700 border border-red-300 hover:bg-red-200";
                              default:
                                return "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200";
                            }
                          };

                          // Color solo para el estado (texto o fondo)
                          const statusColorClass = () => {
                            switch (invitation.status) {
                              case "in process":
                                return "bg-blue-700 text-blue-100"; // azul fuerte
                              case "pending":
                                return "bg-[#fdaa05] text-yellow-900";
                              case "completed":
                                return "bg-green-700 text-green-100";
                              default:
                                return "bg-blue-700 text-blue-100";
                            }
                          };

                          return (
                            <div
                              key={invitation.id}
                              className={`${bgColorClass()} rounded-2xl p-6 relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer`}
                            >
                              <div className="mb-4">
                                <h3 className="font-semibold text-lg mb-4">
                                  {invitation.projectName}
                                </h3>

                                <p className="text-xs">
                                  Created at:{" "}
                                  {new Date(
                                    invitation.created_at
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex -space-x-2">
                                  <div
                                    className={`w-6 h-6  rounded-full border-2 ${bgColorClass()}`}
                                  ></div>
                                  <div
                                    className={`w-6 h-6 rounded-full border-2 ${bgColorClass()}`}
                                  ></div>
                                  <div
                                    className={`w-6 h-6 bg-white/30 rounded-full border-2 ${bgColorClass()}`}
                                  ></div>
                                </div>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColorClass()}`}
                                >
                                  {invitation.status}
                                </span>
                              </div>
                              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full"></div>

                              <div className="flex justify-center mt-5">
                                {/* Mostrar botón solo si no está completed ni rejected */}
                                {(invitation.status == "pending" ||
                                  invitation.status == "in process") && (
                                  <a
                                    href={invitation.invitation_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-full transition ${getButtonStyleByStatus(
                                      invitation.status
                                    )}`}
                                  >
                                    Complete invitation
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                     {invitations.filter(
                        (invitation) =>
                          invitation.status === "in process" ||
                          invitation.status === "pending" ||
                          invitation.status === "completed"
                      ).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No invitations at the moment</p>
                        </div>
                      )}
                  </div>

                  {/* Pending Invitations Section */}
                  <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Processed invitations
                      </h2>
                      <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium">
                        {
                          invitations.filter(
                            (invitation) =>
                              invitation.status === "approved" ||
                              invitation.status === "rejected"
                          ).length
                        }{" "}
                        Invitations
                      </span>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {invitations
                        .filter(
                          (invitation) =>
                            invitation.status === "approved" ||
                            invitation.status === "rejected"
                        )
                        .map((invitation) => (
                          <div
                            key={invitation.id}
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors group"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                {/* Nombre del proyecto */}
                                <p className="text-sm text-gray-600 mb-1">
                                  <span className="font-semibold text-gray-900">
                                    Project:{" "}
                                  </span>
                                  {invitation.projectName}
                                </p>

                                {/* Estado del proyecto */}
                                <p className="text-sm text-gray-600 mb-2">
                                  <span className="font-semibold text-gray-900">
                                    Status:{" "}
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                      invitation.status
                                    )}`}
                                  >
                                    {invitation.status}
                                  </span>
                                </p>

                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">
                                    {new Date(
                                      invitation.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                      {invitations.filter(
                        (invitation) =>
                          invitation.status === "approved" ||
                          invitation.status === "rejected"
                      ).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No invitations at the moment</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Aquí podrías agregar otras secciones de la columna derecha */}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
