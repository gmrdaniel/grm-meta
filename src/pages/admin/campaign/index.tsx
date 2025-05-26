import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImportCampaign from "@/components/admin/campaigns/SendCampaign"
import {Layout} from "@/components/Layout";

export default function CampaignPage() {
  return (
    <Layout>
      <div className="container max-w-full py-6">
        <Card>
          <CardHeader>
            <CardTitle>Enviar Campaña</CardTitle>
          </CardHeader>
          <CardContent>
            <ImportCampaign />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}