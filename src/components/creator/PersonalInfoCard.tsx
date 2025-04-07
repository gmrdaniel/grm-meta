
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

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
  isLoading?: boolean; // Make isLoading optional
}

export function PersonalInfoCard({ personalData, isLoading = false }: PersonalInfoCardProps) {
  
  const { user } = useAuth()
  console.log(user)
  // Get all social networks with their usernames and followers
  const socialNetworks = !isLoading && personalData ? [
    { name: "instagram", label: "Instagram", username: personalData?.instagram_username, followers: personalData?.instagram_followers },
    { name: "tiktok", label: "TikTok", username: personalData?.tiktok_username, followers: personalData?.tiktok_followers },
    { name: "youtube", label: "YouTube", username: personalData?.youtube_username, followers: personalData?.youtube_followers },
    { name: "pinterest", label: "Pinterest", username: personalData?.pinterest_username, followers: personalData?.pinterest_followers }
  ].filter(network => network.username) : [];
  
  if (isLoading) {
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
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>
                  <dt className="font-medium text-gray-500">
                    <Skeleton className="h-4 w-24" />
                  </dt>
                  <dd>
                    <Skeleton className="h-6 w-32 mt-1" />
                  </dd>
                </div>
              ))}
            </dl>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Social Networks</h3>
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
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
              <dt className="font-medium text-gray-500">Full Name</dt>
              <dd>{user.user_metadata.full_name || "Not set"}</dd>
            </div>
            {/* <div>
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
            </div> */}
            <div>
              <dt className="font-medium text-gray-500">Phone Number</dt>
              <dd>{user.user_metadata.phone || ""}</dd>
            </div>
            {/* <div>
              <dt className="font-medium text-gray-500">Gender</dt>
              <dd>{personalData?.gender || "Not set"}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Category</dt>
              <dd>{personalData?.categories?.name || "Not set"}</dd>
            </div> */}
          </dl>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Social Networks</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Network</TableHead>
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