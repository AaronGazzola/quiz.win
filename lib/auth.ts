import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, magicLink, organization } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
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
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const callbackUrl = urlParams.get('callbackURL') || '';
        const invitationParam = new URLSearchParams(callbackUrl.split('?')[1])?.get('invitation');

        let isInvitation = false;
        let invitationData = null;

        if (invitationParam) {
          try {
            invitationData = JSON.parse(decodeURIComponent(invitationParam));
            isInvitation = true;
          } catch (error) {
            console.error('Failed to parse invitation data:', error);
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
                <p>${invitationData.inviterName} has invited you to join their organization as a <strong>${invitationData.role === 'admin' ? 'Organization Admin' : 'Member'}</strong>.</p>
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
    admin({
      defaultRole: "user",
      adminRole: "super-admin",
      impersonationSessionDuration: 60 * 60,
      disableBannedUserMessage: true,
    }),
    organization({
      ac: createAccessControl({
        quiz: ["create", "read", "update", "delete"],
        question: ["create", "read", "update", "delete"],
        response: ["read", "delete", "export"],
        user: ["invite", "remove", "update-role", "view"],
      }),
      roles: ["owner", "admin", "member"],
      allowUserToCreateOrganization: false,
      organizationLimit: 10,
      creatorRole: "admin",
      membershipLimit: 100,
      invitationExpiresIn: 48 * 60 * 60,
      requireEmailVerificationOnInvitation: false,
      async sendInvitationEmail(data) {
        const inviteLink = `${process.env.BASE_URL}/invitation/${data.invitation.id}`;
        await resend.emails.send({
          from: process.env.FROM_EMAIL || "noreply@example.com",
          to: data.email,
          subject: `You've been invited to join ${data.organization.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>You've been invited to join ${data.organization.name}</h2>
              <p>${data.inviter.user.name || data.inviter.user.email} has invited you to join their organization.</p>
              <a href="${inviteLink}" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
                Accept Invitation
              </a>
              <p style="color: #666; font-size: 14px; margin-top: 24px;">
                This invitation will expire in 48 hours.
              </p>
            </div>
          `,
        });
      },
    }),
  ],
});
