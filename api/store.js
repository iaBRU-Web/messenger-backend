// api/_store.js
// Replaces _blob.js — uses Vercel KV (free, no credit card)
// KV env variables are added automatically by Vercel when you connect KV
// Only manual env variable you need: JWT_SECRET

import { kv } from '@vercel/kv';

export async function getUsers()      { return (await kv.get('bru_users'))    || []; }
export async function saveUsers(d)    { await kv.set('bru_users', d); }

export async function getMessages()   { return (await kv.get('bru_messages')) || []; }
export async function saveMessages(d) { await kv.set('bru_messages', d); }

export async function getReports()    { return (await kv.get('bru_reports'))  || []; }
export async function saveReports(d)  { await kv.set('bru_reports', d); }
