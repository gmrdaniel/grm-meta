
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
  gender: string | null;
  category: string | null;
}

interface PersonalInfoCardProps {
  personalData?: PersonalData;
}

export function PersonalInfoCard({ personalData }: PersonalInfoCardProps) {
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
            <dt className="font-medium text-gray-500">Instagram Username</dt>
            <dd>{personalData?.instagram_username || "Not set"}</dd>
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
            <dd>{personalData?.phone_number || "Not set"}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Gender</dt>
            <dd>{personalData?.gender || "Not set"}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Category</dt>
            <dd>{personalData?.category || "Not set"}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
