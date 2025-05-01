import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { StatsCard } from "@/components/StatsCard";
import { Image, Star, Heart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { EyeIcon, EnvelopeIcon } from "@heroicons/react/24/solid";
import { createClient } from "@supabase/supabase-js";
import { fetchProjectNameByInvitationEmail } from "@/services/project/getProjectByUser";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function CreatorDashboard() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState("review");
  const [projectName, setProjectName] = useState<string>()

  const texts = {
    "PINTEREST": {
      headerTitle: "Panel del Creador",
      title: "¡Bienvenido!",
      descriptionOne: "Pronto podrás acceder a oportunidades",
      descriptionTwo: "comerciales y otras actividades.",
      note: "Te notificaremos por correo electrónico/SMS/WhatsApp una vez que sea aprobado."
    },
    "META": {
      headerTitle: "Creator Dashboard",
      title: "Welcome! Your Submission is Under Review",
      descriptionOne: "We've received your details and are currently verifying",
      descriptionTwo: "your information (takes 1-3 business days).",
      note: "You'll be notified via email/SMS once approved."
    }
  }

  const getTextByKey = (key: string) => {
    let name = 'META'
    if (projectName) name = projectName.toUpperCase()
    return texts[name][key]
  }

  const getProject = async () => {
    if (!user) return
    if (!user.email) return
    if (projectName != null) return
    const name = await fetchProjectNameByInvitationEmail(user.email)
    setProjectName(name)
  }

  const isPinterest = () => {
    if (projectName?.toUpperCase() === "PINTEREST") return true
    return false
  }

  useEffect(() => {
    getProject()
  }, [user])

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("meta_verified")
        .eq("id", user.id)
        .single();
      console.log(" Datos obtenidos desde Supabase:", data);

      if (error) {
        console.error("Error fetching verification status:", error);
      } else {
        setVerificationStatus(data?.meta_verified || "review");
      }
    };

    fetchVerificationStatus();
  }, [user]);

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className={cn(`flex-1 overflow-y-auto p-6`, isMobile && "pb-20")}>
          <div className={`max-w-7xl mx-auto space-y-6`}>
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-800">
                {getTextByKey("headerTitle")}
              </h1>
            </div>


            {/* Tarjeta de estado de verificación */}
            <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-8 w-full max-w-md">
              <div className="flex justify-center mb-6">
                <div className={cn('bg-blue-100 rounded-full p-3', isPinterest() && 'bg-[#FCE8F3]')}>
                  <EyeIcon className={cn('w-8 text-blue-500', isPinterest() && 'text-[#F4A8D2]')} />
                </div>
              </div>
              <h2 className=" flex text-xl gap-1 font-semibold text-center text-gray-800 mb-4    whitespace-nowrap">
                {verificationStatus === "review" && (
                  <>

                    <span className="whitespace-normal md:whitespace-nowrap">
                      {getTextByKey("title")}
                    </span>
                  </>
                )}
                {verificationStatus === "approved" && "You're Approved!"}
                {verificationStatus === "rejected" &&
                  "Your Submission was Rejected"}
              </h2>
              <p className="text-center text-gray-600 mb-6 text-sm mx-auto ">
                {verificationStatus === "review" && (
                  <>
                    {getTextByKey("descriptionOne")}
                    <br className="hidden md:block" />{" "}
                    {getTextByKey("descriptionTwo")}
                  </>
                )}
                {verificationStatus === "approved" &&
                  "Congratulations! Your account has been approved and you're ready to go!"}
                {verificationStatus === "rejected" &&
                  "Unfortunately, your submission was rejected. Please check your email for more details."}
              </p>

              <div className="flex items-start text-center mt-6 gap-2 px-2">
                <EnvelopeIcon className={cn("h-4 w-4 text-blue-500 sm:ml-[-15px] flex-shrink-0 mt-[5px]", isPinterest() && 'text-[#F4A8D2]')} />
                <p className="text-gray-600 whitespace-normal max-w-[250px] sm:max-w-full">
                  {getTextByKey("note")}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {/* Tarjetas StatsCard: Se muestran solo si el usuario está aprobado */}
              {verificationStatus === "approved" && (
                <>
                  <StatsCard
                    title="Content Created"
                    value="156"
                    description="Total pieces created"
                    icon={<Image size={20} />}
                    trend="up"
                    trendValue="+15.5%"
                  />
                  <StatsCard
                    title="Average Rating"
                    value="4.8"
                    description="From user reviews"
                    icon={<Star size={20} />}
                    trend="up"
                    trendValue="+0.3"
                  />
                  <StatsCard
                    title="Likes"
                    value="2,341"
                    description="Total content likes"
                    icon={<Heart size={20} />}
                    trend="up"
                    trendValue="+22.4%"
                  />
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
