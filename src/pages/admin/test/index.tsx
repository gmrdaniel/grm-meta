import { useState } from "react";
import { Layout } from "@/components/Layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchInvitationByCode } from "@/services/invitationService";
import { fetchTikTokUserInfo } from "@/services/tiktokVideoService";
import { CreatorInvitation } from "@/types/invitation";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function AdminTestPage() {
  const [invitationCode, setInvitationCode] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [directResult, setDirectResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [directLoading, setDirectLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [directError, setDirectError] = useState<string | null>(null);

  const [tiktokUsername, setTiktokUsername] = useState<string>("");
  const [tiktokResult, setTiktokResult] = useState<any>(null);
  const [tiktokLoading, setTiktokLoading] = useState<boolean>(false);
  const [tiktokError, setTiktokError] = useState<string | null>(null);

  const [tiktokVideoUsername, setTiktokVideoUsername] = useState<string>("");
  const [tiktokVideoResult, setTiktokVideoResult] = useState<any>(null);
  const [tiktokVideoLoading, setTiktokVideoLoading] = useState<boolean>(false);
  const [tiktokVideoError, setTiktokVideoError] = useState<string | null>(null);

  const handleTestService = async () => {
    if (!invitationCode.trim()) {
      setError("Please enter an invitation code");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const invitation = await fetchInvitationByCode(invitationCode);
      setResult({
        invitation,
        success: true,
        timestamp: new Date().toLocaleString(),
      });
    } catch (err) {
      console.error("Error testing invitation service:", err);
      setError(
        "Error querying service: " +
          (err instanceof Error ? err.message : String(err))
      );
      setResult({
        success: false,
        error: err,
        timestamp: new Date().toLocaleString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDirectTest = async () => {
    if (!invitationCode.trim()) {
      setDirectError("Please enter an invitation code");
      return;
    }

    setDirectLoading(true);
    setDirectError(null);
    try {
      const { data, error } = await supabase.rpc("find_invitation_by_code", {
        code_param: invitationCode,
      });

      if (error) throw error;

      setDirectResult({
        data,
        success: true,
        timestamp: new Date().toLocaleString(),
      });
    } catch (err) {
      console.error("Error testing direct RPC call:", err);
      setDirectError(
        "Error al consultar RPC: " +
          (err instanceof Error ? err.message : String(err))
      );
      setDirectResult({
        success: false,
        error: err,
        timestamp: new Date().toLocaleString(),
      });
    } finally {
      setDirectLoading(false);
    }
  };

  const handleTiktokTest = async () => {
    if (!tiktokUsername.trim()) {
      setTiktokError("Please enter a username");
      return;
    }

    setTiktokLoading(true);
    setTiktokError(null);

    try {
      const data = await fetchTikTokUserInfo(tiktokUsername);

      setTiktokResult({
        data,
        success: true,
        timestamp: new Date().toLocaleString(),
      });
    } catch (err) {
      console.error("Error testing TikTok API:", err);
      setTiktokError(
        "Error querying TikTok API: " +
          (err instanceof Error ? err.message : String(err))
      );
      setTiktokResult({
        success: false,
        error: err,
        timestamp: new Date().toLocaleString(),
      });
    } finally {
      setTiktokLoading(false);
    }
  };

  const handleTiktokVideoTest = async () => {
    if (!tiktokVideoUsername.trim()) {
      setTiktokVideoError("Please enter a username");
      return;
    }

    setTiktokVideoLoading(true);
    setTiktokVideoError(null);

    try {
      const url = `https://tiktok-api6.p.rapidapi.com/user/videos?username=${encodeURIComponent(
        tiktokVideoUsername
      )}`;
      const options = {
        method: "GET",
        headers: {
          "x-rapidapi-key":
            "9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5",
          "x-rapidapi-host": "tiktok-api6.p.rapidapi.com",
        },
      };

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      setTiktokVideoResult({
        data,
        success: true,
        timestamp: new Date().toLocaleString(),
      });
    } catch (err) {
      console.error("Error testing TikTok Video API:", err);
      setTiktokVideoError(
        "Error querying TikTok Video API: " +
          (err instanceof Error ? err.message : String(err))
      );
      setTiktokVideoResult({
        success: false,
        error: err,
        timestamp: new Date().toLocaleString(),
      });
    } finally {
      setTiktokVideoLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Test Panel (Admin)</h1>

        <Alert className="mb-6 border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Public Service Configured</AlertTitle>
          <AlertDescription>
            The invitation query service is configured for public access without
            authentication. The tests below can be run without logging in.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="service" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="service">Using Service</TabsTrigger>
            <TabsTrigger value="direct">Direct RPC Call</TabsTrigger>
            <TabsTrigger value="tiktok">TikTok API</TabsTrigger>
            <TabsTrigger value="tiktok-video">TikTok Video</TabsTrigger>
          </TabsList>

          <TabsContent value="service">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Invitation Service Test
                  <Badge variant="outline" className="ml-2">
                    fetchInvitationByCode
                  </Badge>
                </CardTitle>
                <CardDescription>
                  This test uses the service function that internally uses the
                  RPC
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="invitationCode"
                      className="block text-sm font-medium mb-1"
                    >
                      Invitation Code{" "}
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="invitationCode"
                        placeholder="Enter the code"
                        value={invitationCode}
                        onChange={(e) => setInvitationCode(e.target.value)}
                      />
                      <Button onClick={handleTestService} disabled={loading}>
                        {loading ? "Processing..." : "Test Service"}
                      </Button>
                    </div>
                    {error && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {result && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">
                        Result ({result.timestamp}):
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-md border">
                        <pre className="whitespace-pre-wrap overflow-auto max-h-80 text-sm">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="text-sm text-gray-500">
                This panel allows you to test the fetchInvitationByCode service
                without authentication.
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="direct">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Direct Call to RPC
                  <Badge variant="outline" className="ml-2">
                    find_invitation_by_code
                  </Badge>
                </CardTitle>
                <CardDescription>
                  This test directly calls the Supabase RPC function
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="directInvitationCode"
                      className="block text-sm font-medium mb-1"
                    >
                      Invitation Code
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="directInvitationCode"
                        placeholder="Enter the code"
                        value={invitationCode}
                        onChange={(e) => setInvitationCode(e.target.value)}
                      />
                      <Button
                        onClick={handleDirectTest}
                        disabled={directLoading}
                      >
                        {directLoading ? "Processing..." : "Call RPC"}
                      </Button>
                    </div>
                    {directError && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{directError}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {directResult && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">
                        RPC Result ({directResult.timestamp}):
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-md border">
                        <pre className="whitespace-pre-wrap overflow-auto max-h-80 text-sm">
                          {JSON.stringify(directResult, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="text-sm text-gray-500">
                This panel allows you to directly test the RPC function
                find_invitation_by_code without authentication.
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="tiktok">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Test API TikTok
                  <Badge variant="outline" className="ml-2">
                    TikTok API
                  </Badge>
                </CardTitle>
                <CardDescription>
                  This test queries TikTok user information using RapidAPI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="tiktokUsername"
                      className="block text-sm font-medium mb-1"
                    >
                      Username
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="tiktokUsername"
                        placeholder="Enter username"
                        value={tiktokUsername}
                        onChange={(e) => setTiktokUsername(e.target.value)}
                      />
                      <Button
                        onClick={handleTiktokTest}
                        disabled={tiktokLoading}
                      >
                        {tiktokLoading ? "Processing..." : "Test Service"}
                      </Button>
                    </div>
                    {tiktokError && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{tiktokError}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {tiktokResult && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">
                        Result ({tiktokResult.timestamp}):
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-md border">
                        <pre className="whitespace-pre-wrap overflow-auto max-h-80 text-sm">
                          {JSON.stringify(tiktokResult, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="text-sm text-gray-500">
                This panel allows you to test the TikTok API to obtain user
                information.
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="tiktok-video">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Test API TikTok Video
                  <Badge variant="outline" className="ml-2">
                    TikTok Video API
                  </Badge>
                </CardTitle>
                <CardDescription>
                  This test queries TikTok user videos using RapidAPI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="tiktokVideoUsername"
                      className="block text-sm font-medium mb-1"
                    >
                      Username
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="tiktokVideoUsername"
                        placeholder="Enter your username"
                        value={tiktokVideoUsername}
                        onChange={(e) => setTiktokVideoUsername(e.target.value)}
                      />
                      <Button
                        onClick={handleTiktokVideoTest}
                        disabled={tiktokVideoLoading}
                      >
                        {tiktokVideoLoading ? "Processing..." : "Test Service"}
                      </Button>
                    </div>
                    {tiktokVideoError && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{tiktokVideoError}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {tiktokVideoResult && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">
                        Result ({tiktokVideoResult.timestamp}):
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-md border">
                        <pre className="whitespace-pre-wrap overflow-auto max-h-80 text-sm">
                          {JSON.stringify(tiktokVideoResult, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="text-sm text-gray-500">
                This panel allows you to test the TikTok API to retrieve user
                videos.
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
