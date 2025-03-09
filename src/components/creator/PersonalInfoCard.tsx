
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

interface PersonalData {
  first_name: string | null;
  last_name: string | null;
  instagram_username: string | null;
  birth_date: string | null;
  country_of_residence: string | null;
  state_of_residence: string | null;
  phone_number: string | null;
  country_code: string | null;
  gender: string | null;
  category_id: string | null;
  profile_photo_url: string | null;
  primary_social_network: string | null;
  instagram_followers: number | null;
  tiktok_username: string | null;
  tiktok_followers: number | null;
  youtube_username: string | null;
  youtube_followers: number | null;
  pinterest_username: string | null;
  pinterest_followers: number | null;
  // Add the category relation
  categories?: {
    id: string;
    name: string;
    status: string;
  } | null;
}

interface PersonalInfoCardProps {
  personalData?: PersonalData;
}

export function PersonalInfoCard({ personalData }: PersonalInfoCardProps) {
  // Debug log to see what's in the personal data
  console.log("PersonalInfoCard - personalData:", personalData);
  
  // Function to format the primary social network display
  const formatSocialNetwork = (network: string | null) => {
    if (!network) return "Not set";
    
    // Capitalize first letter
    return network.charAt(0).toUpperCase() + network.slice(1);
  };

  // Get network data based on available information
  const socialNetworks = [
    {
      name: "Instagram",
      username: personalData?.instagram_username,
      followers: personalData?.instagram_followers,
      isPrimary: personalData?.primary_social_network === "instagram"
    },
    {
      name: "TikTok",
      username: personalData?.tiktok_username,
      followers: personalData?.tiktok_followers,
      isPrimary: personalData?.primary_social_network === "tiktok"
    },
    {
      name: "YouTube",
      username: personalData?.youtube_username,
      followers: personalData?.youtube_followers,
      isPrimary: personalData?.primary_social_network === "youtube"
    },
    {
      name: "Pinterest",
      username: personalData?.pinterest_username,
      followers: personalData?.pinterest_followers,
      isPrimary: personalData?.primary_social_network === "pinterest"
    }
  ].filter(network => network.username); // Only show networks with usernames
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="font-medium text-gray-500">First Name</dt>
            <dd>{personalData?.first_name || "Not set"}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Last Name</dt>
            <dd>{personalData?.last_name || "Not set"}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Birth Date</dt>
            <dd>{personalData?.birth_date || "Not set"}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Country</dt>
            <dd>{personalData?.country_of_residence || "Not set"}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">State</dt>
            <dd>{personalData?.state_of_residence || "Not set"}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Phone Number</dt>
            <dd>{personalData?.country_code ? `${personalData.country_code} ${personalData.phone_number || ""}` : (personalData?.phone_number || "Not set")}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Gender</dt>
            <dd>{personalData?.gender || "Not set"}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Category</dt>
            <dd>{personalData?.categories?.name || "Not set"}</dd>
          </div>
        </dl>

        {socialNetworks.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Social Networks</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Network</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Followers</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {socialNetworks.map((network, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {network.name} 
                          {network.isPrimary && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Primary</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {network.username || "Not set"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {network.followers ? network.followers.toLocaleString() : "0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
