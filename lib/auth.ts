import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, magicLink, organization } from "better-auth/plugins";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false,
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const urlParams = new URLSearchParams(url.split("?")[1]);
        const callbackUrl = urlParams.get("callbackURL") || "";
        const invitationParam = new URLSearchParams(
          callbackUrl.split("?")[1]
        )?.get("invitation");

        let isInvitation = false;
        let invitationData = null;

        if (invitationParam) {
          try {
            invitationData = JSON.parse(decodeURIComponent(invitationParam));
            isInvitation = true;
          } catch (error) {
            console.error("Failed to parse invitation data:", error);
          }
        }

        if (isInvitation && invitationData) {
          await resend.emails.send({
            from: process.env.FROM_EMAIL || "noreply@example.com",
            to: email,
            subject: `You've been invited to join ${invitationData.organizationName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>You've been invited to join ${invitationData.organizationName}</h2>
                <p>${invitationData.inviterName} has invited you to join their organization as a <strong>${invitationData.role === "admin" ? "Organization Admin" : "Member"}</strong>.</p>
                <p>Click the link below to accept the invitation and sign in:</p>
                <a href="${url}" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
                  Accept Invitation & Sign In
                </a>
                <p style="color: #666; font-size: 14px; margin-top: 24px;">
                  This invitation link will expire in 5 minutes. If you didn't expect this invitation, please ignore this email.
                </p>
              </div>
            `,
          });
        } else {
          await resend.emails.send({
            from: process.env.FROM_EMAIL || "noreply@example.com",
            to: email,
            subject: "Sign in to your account",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Sign in to your account</h2>
                <p>Click the link below to sign in:</p>
                <a href="${url}" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
                  Sign In
                </a>
                <p style="color: #666; font-size: 14px; margin-top: 24px;">
                  This link will expire in 5 minutes. If you didn't request this email, please ignore it.
                </p>
              </div>
            `,
          });
        }
      },
      expiresIn: 300,
      disableSignUp: false,
    }),
    admin(),
    organization({
      sendInvitationEmail: async (data) => {
        const { email, organization, inviter, invitation } = data;
        const invitationId = invitation.id;

        await resend.emails.send({
          from: process.env.FROM_EMAIL || "noreply@example.com",
          to: email,
          subject: `You've been invited to join ${organization.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>You've been invited to join ${organization.name}</h2>
              <p>${inviter.user.name || inviter.user.email} has invited you to join their organization.</p>
              <p>Click the link below to accept the invitation and sign in:</p>
              <a href="${process.env.BETTER_AUTH_URL}/api/auth/accept-invitation?invitationId=${invitationId}" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
                Accept Invitation & Sign In
              </a>
              <p style="color: #666; font-size: 14px; margin-top: 24px;">
                This invitation link will expire soon. If you didn't expect this invitation, please ignore this email.
              </p>
            </div>
          `,
        });
      },
    }),
  ],
});
