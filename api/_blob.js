// api/_blob.js — shared Vercel Blob helpers
import { put, get, list, del } from '@vercel/blob';

const USERS_KEY = 'brumessenger/users.json';
const MESSAGES_KEY = 'brumessenger/messages.json';
const REPORTS_KEY = 'brumessenger/reports.json';

async function readJSON(key) {
  try {
    const { blobs } = await list({ prefix: key });
    if (!blobs.length) return null;
    const latest = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
    const res = await fetch(latest.url);
    return await res.json();
  } catch {
    return null;
  }
}

async function writeJSON(key, data) {
  // Delete old blobs with this prefix first
  const { blobs } = await list({ prefix: key });
  for (const b of blobs) await del(b.url);
  await put(key, JSON.stringify(data), { access: 'public', allowOverwrite: true });
}

export async function getUsers() {
  return (await readJSON(USERS_KEY)) || [];
}

export async function saveUsers(users) {
  await writeJSON(USERS_KEY, users);
}

export async function getMessages() {
  return (await readJSON(MESSAGES_KEY)) || [];
}

export async function saveMessages(messages) {
  await writeJSON(MESSAGES_KEY, messages);
}

export async function getReports() {
  return (await readJSON(REPORTS_KEY)) || [];
}

export async function saveReports(reports) {
  await writeJSON(REPORTS_KEY, reports);
}
