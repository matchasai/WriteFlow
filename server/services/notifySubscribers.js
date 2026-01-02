import { sendMail } from '../config/mail.js';
import Subscriber from '../models/Subscriber.js';

const escapeHtml = (s) => String(s || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

export const buildBlogUrl = (blogId) => {
  const publicBase =
    process.env.PUBLIC_SITE_URL ||
    process.env.PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.CLIENT_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://writeflow-zfes.onrender.com'
      : 'http://localhost:5173');

  return `${String(publicBase).replace(/\/$/, '')}/blog/${blogId}`;
};

export const buildNewBlogEmail = (blog) => {
  const title = escapeHtml(blog?.title);
  const category = escapeHtml(blog?.category);
  const desc = escapeHtml(blog?.metaDescription || 'A new post is live on WriteFlow.');
  const url = escapeHtml(buildBlogUrl(blog?._id));

  const subject = `New blog published: ${blog?.title || 'WriteFlow'}`;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5">
      <h2 style="margin:0 0 8px">${title}</h2>
      <p style="margin:0 0 12px;color:#555">${desc}</p>
      <p style="margin:0 0 14px;color:#777;font-size:13px">Category: <b>${category || 'General'}</b></p>
      <a href="${url}" style="display:inline-block;padding:10px 14px;text-decoration:none;border-radius:8px;background:#2563eb;color:#fff">Read the blog</a>
      <p style="margin:18px 0 0;color:#888;font-size:12px">You received this because you subscribed to WriteFlow updates.</p>
    </div>
  `;

  const text = `${blog?.title || 'New blog'}\n\n${blog?.metaDescription || ''}\n\nRead: ${buildBlogUrl(blog?._id)}\n`;

  return { subject, html, text };
};

export const sendNewBlogToSubscribers = async (blog) => {
  const subs = await Subscriber.find({}, { email: 1, _id: 0 }).lean();
  const emails = subs.map(s => s.email).filter(Boolean);
  if (emails.length === 0) return { sent: 0, skipped: 0 };

  const { subject, html, text } = buildNewBlogEmail(blog);

  // Use BCC to avoid leaking subscriber list. Chunk to stay under provider limits.
  const batches = chunk(emails, 50);
  let sent = 0;
  let skipped = 0;

  for (const bcc of batches) {
    // Some SMTP providers require a concrete "to" even when using bcc.
    const result = await sendMail({
      to: process.env.MAIL_TO_FALLBACK || process.env.MAIL_FROM || process.env.MAIL_USERNAME,
      bcc,
      subject,
      html,
      text,
    });

    if (result?.skipped) {
      skipped += bcc.length;
    } else {
      sent += bcc.length;
    }
  }

  return { sent, skipped };
};

export const buildWelcomeEmail = (recentBlogs = []) => {
  const subject = 'Welcome to WriteFlow – Recent posts inside';

  const itemsHtml = recentBlogs.map((b) => {
    const t = escapeHtml(b.title);
    const url = escapeHtml(buildBlogUrl(b._id));
    const d = escapeHtml(b.metaDescription || '');
    return `<li style="margin:0 0 10px"><a href="${url}">${t}</a>${d ? `<div style="color:#666;font-size:13px">${d}</div>` : ''}</li>`;
  }).join('');

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5">
      <h2 style="margin:0 0 10px">Thanks for subscribing!</h2>
      <p style="margin:0 0 14px;color:#555">You’ll now get an email when a new blog is published.</p>
      ${recentBlogs.length ? `
        <h3 style="margin:18px 0 8px">Recent posts</h3>
        <ul style="padding-left:18px;margin:0">${itemsHtml}</ul>
      ` : ''}
      <p style="margin:18px 0 0;color:#888;font-size:12px">You received this because you subscribed to WriteFlow updates.</p>
    </div>
  `;

  const text = `Thanks for subscribing to WriteFlow!\n\nRecent posts:\n${recentBlogs.map(b => `- ${b.title}: ${buildBlogUrl(b._id)}`).join('\n')}`;

  return { subject, html, text };
};
