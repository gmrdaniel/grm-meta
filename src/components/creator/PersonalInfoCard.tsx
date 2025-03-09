
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User } from "lucide-react";

interface PersonalData {
  first_name: string | null;
  last_name: string | null;
  instagram_username: string | null;
  instagram_followers: number | null;
  tiktok_username: string | null;
  tiktok_followers: number | null;
  youtube_username: string | null;
  youtube_followers: number | null;
  pinterest_username: string | null;
  pinterest_followers: number | null;
  birth_date: string | null;
  country_of_residence: string | null;
  state_of_residence: string | null;
  phone_number: string | null;
  country_code: string | null;
  gender: string | null;
  category_id: string | null;
  profile_photo_url: string | null;
  primary_social_network: string | null;
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

  // Function to get the number of followers for each network
  const getFollowers = (network: string | null) => {
    if (!network || !personalData) return "0";
    
    switch (network) {
      case "instagram":
        return personalData.instagram_followers?.toLocaleString() || "0";
      case "tiktok":
        return personalData.tiktok_followers?.toLocaleString() || "0";
      case "youtube":
        return personalData.youtube_followers?.toLocaleString() || "0";
      case "pinterest":
        return personalData.pinterest_followers?.toLocaleString() || "0";
      default:
        return "0";
    }
  };

  // Function to get the username for each network
  const getUsername = (network: string | null) => {
    if (!network || !personalData) return "Not set";
    
    switch (network) {
      case "instagram":
        return personalData.instagram_username || "Not set";
      case "tiktok":
        return personalData.tiktok_username || "Not set";
      case "youtube":
        return personalData.youtube_username || "Not set";
      case "pinterest":
        return personalData.pinterest_username || "Not set";
      default:
        return "Not set";
    }
  };
  
  // Get all social networks with their usernames
  const socialNetworks = [
    { name: "instagram", label: "Instagram", username: personalData?.instagram_username, followers: personalData?.instagram_followers },
    { name: "tiktok", label: "TikTok", username: personalData?.tiktok_username, followers: personalData?.tiktok_followers },
    { name: "youtube", label: "YouTube", username: personalData?.youtube_username, followers: personalData?.youtube_followers },
    { name: "pinterest", label: "Pinterest", username: personalData?.pinterest_username, followers: personalData?.pinterest_followers }
  ].filter(network => network.username);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
          
          <div>
            <h3 className="text-lg font-medium mb-2">Social Networks</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Primary Network</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Followers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {socialNetworks.length > 0 ? (
                  socialNetworks.map((network) => (
                    <TableRow key={network.name}>
                      <TableCell>
                        {network.name === personalData?.primary_social_network ? (
                          <span className="flex items-center">
                            {network.label} 
                            <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              Primary
                            </span>
                          </span>
                        ) : (
                          network.label
                        )}
                      </TableCell>
                      <TableCell>{network.username || "Not set"}</TableCell>
                      <TableCell>{network.followers?.toLocaleString() || "0"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">
                      No social networks set
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
