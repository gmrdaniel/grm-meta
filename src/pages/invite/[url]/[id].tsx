
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const InvitationPage = () => {
  const { url, id } = useParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitationDetails = async () => {
      try {
        setLoading(true);
        
        if (!url || !id) {
          throw new Error("Missing URL or invitation ID parameters");
        }

        // Find the invitation directly by its ID
        const { data: invitationData, error: invitationError } = await supabase
          .from('creator_invitations')
          .select('*, projects:project_id(*)')
          .eq('id', id)
          .single();

        if (invitationError) throw invitationError;

        // Verify that the stage URL matches
        const { data: stageData, error: stageError } = await supabase
          .from('project_stages')
          .select('*')
          .eq('url', url)
          .eq('project_id', invitationData.project_id)
          .single();

        if (stageError) throw new Error("Invalid invitation URL");

        setInvitation(invitationData);
        setProject(invitationData.projects);
        
      } catch (err: any) {
        console.error('Error fetching invitation details:', err);
        setError(err.message || 'Failed to load invitation details');
      } finally {
        setLoading(false);
      }
    };

    if (url && id) {
      fetchInvitationDetails();
    }
  }, [url, id]);

  const handleAccept = async () => {
    try {
      if (!invitation) return;

      // If this is for a new user, redirect to sign up
      if (invitation.invitation_type === 'new_user') {
        navigate('/auth?signup=true&email=' + encodeURIComponent(invitation.email));
      } else {
        // For existing users, update the invitation status and redirect to login
        await supabase
          .from('creator_invitations')
          .update({ status: 'accepted' })
          .eq('id', invitation.id);
          
        navigate('/auth');
      }
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      toast.error('Failed to process your invitation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-lg">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl text-center text-red-600">
              Invitation Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">
              Sorry, we couldn't find the invitation you're looking for. It may have expired or been removed.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/auth')}>
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            You've Been Invited!
          </CardTitle>
          <CardDescription className="text-center">
            {invitation.full_name}, you've been invited to join as a creator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">Project: {project?.name || 'N/A'}</p>
            <p>Email: {invitation.email}</p>
            {invitation.social_media_handle && (
              <p>
                {invitation.social_media_type}: {invitation.social_media_handle}
              </p>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-600">
              By accepting this invitation, you'll be able to access the creator dashboard and manage your content.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="default" onClick={handleAccept}>
            Accept Invitation
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            Not Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InvitationPage;
