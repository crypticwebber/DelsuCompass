import { env } from "../../config/env.js";

async function sendEmail(input: { to: string; subject: string; html: string; text: string }) {
  if (!env.RESEND_ENABLED || !env.RESEND_API_KEY) return { sent: false };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: env.RESEND_FROM, to: [input.to], subject: input.subject, html: input.html, text: input.text }),
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend email delivery failed (${response.status}): ${details}`);
  }
  return { sent: true };
}

export const mailService = {
  async sendVerificationOtp(input: { to: string; name: string; otp: string }) {
    return sendEmail({
      to: input.to,
      subject: "Your DELSU Compass verification code",
      text: `Hello ${input.name}, your DELSU Compass verification code is ${input.otp}. It expires in 15 minutes.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px"><h2 style="color:#1d4ed8">DELSU Compass</h2><p>Hello ${input.name},</p><p>Use this verification code to activate your account:</p><div style="font-size:32px;letter-spacing:8px;font-weight:700;padding:18px 0">${input.otp}</div><p>This code expires in 15 minutes.</p><p>If you did not create this account, you can ignore this email.</p></div>`,
    });
  },

  async sendPasswordResetEmail(input: { to: string; name: string; token: string }) {
    const resetUrl = `${env.CLIENT_URL.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(input.token)}`;
    return sendEmail({
      to: input.to,
      subject: "Reset your DELSU Compass password",
      text: `Hello ${input.name}, reset your DELSU Compass password here: ${resetUrl}. This link expires in 30 minutes.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px"><h2 style="color:#1d4ed8">DELSU Compass</h2><p>Hello ${input.name},</p><p>We received a request to reset your password.</p><p><a href="${resetUrl}" style="display:inline-block;background:#1d4ed8;color:white;padding:12px 18px;border-radius:10px;text-decoration:none">Reset password</a></p><p>This link expires in 30 minutes. If you did not request it, ignore this message.</p></div>`,
    });
  },
};
