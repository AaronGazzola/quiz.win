import { betterAuth } from "better-auth";
import { admin, magicLink, organization } from "better-auth/plugins";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: {
    client: prisma,
    type: "prisma",
  },
  emailAndPassword: {
    enabled: false,
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, token, url }) => {
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
      },
      expiresIn: 300,
      disableSignUp: false,
    }),
    admin({
      defaultRole: "user",
      adminRoles: ["admin", "super-admin"],
      impersonationSessionDuration: 60 * 60,
      defaultBanReason: "Violation of terms of service",
      defaultBanExpiresIn: 60 * 60 * 24 * 7,
      bannedUserMessage: "Your account has been suspended. Contact support for assistance.",
    }),
    organization({
      allowUserToCreateOrganization: false,
      organizationLimit: 5,
      creatorRole: "owner",
      membershipLimit: 100,
      invitationExpiresIn: 48 * 60 * 60,
      requireEmailVerificationOnInvitation: false,
      async sendInvitationEmail(data) {
        const inviteLink = `${process.env.BASE_URL}/invitation/${data.token}`;
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