import fetch from 'node-fetch';
export async function notifySlack(webhookUrl: string | undefined, text: string) {
  if (!webhookUrl) return;
  await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
}
