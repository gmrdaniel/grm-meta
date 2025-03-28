import { sendEmail } from "../email/sendIEmail";

export const sendCreatorInvitationEmail = async ({
    email,
    name,
    invitationUrl,
  }: {
    email: string;
    name?: string;
    invitationUrl: string;
  }) => {
    const subject = "You're invited to La Neta!";
    const html = `
      <h1>You’ve been invited!</h1>
      <p>${name ? `Hi ${name},` : 'Hi,'}</p>
      <p>You’ve been invited to join as a creator. Click below:</p>
      <a href="${invitationUrl}">Complete Registration</a>
    `;
  
    return await sendEmail({
      email,
      subject,
      html,
    });
  };
  