import nodemailer from 'nodemailer';

const toInt = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const getMailConfig = () => {
  const host = process.env.MAIL_HOST;
  const port = toInt(process.env.MAIL_PORT, 587);
  const user = process.env.MAIL_USERNAME;
  const pass = process.env.MAIL_PASSWORD;
  const from = process.env.MAIL_FROM || user;

  if (!host || !user || !pass || !from) return null;

  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    from,
  };
};

let cachedTransporter = null;

export const getMailer = () => {
  if (cachedTransporter) return cachedTransporter;
  const cfg = getMailConfig();
  if (!cfg) return null;

  cachedTransporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.auth,
  });

  return cachedTransporter;
};

export const getMailFrom = () => {
  const cfg = getMailConfig();
  return cfg?.from || null;
};

export const sendMail = async ({ to, bcc, subject, html, text }) => {
  const transporter = getMailer();
  const from = getMailFrom();

  if (!transporter || !from) {
    return { skipped: true, reason: 'MAIL_* env not configured' };
  }

  const info = await transporter.sendMail({
    from,
    to,
    bcc,
    subject,
    html,
    text,
  });

  return { skipped: false, messageId: info.messageId };
};
