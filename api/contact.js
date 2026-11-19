'use strict';
// Website forms (early access, materials request, contact) -> one email to the company inbox.
// Needs RESEND_API_KEY in the Vercel project's environment variables. Logs no personal data.

const KINDS = { waitlist: 'Early access', materials: 'Materials request', contact: 'Contact' };
const TO = 'jhofstad@ddt-pro.com';
const FROM = 'DDT Website <noreply@ddt-pro.com>';

function line(v, n) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
}
function text(v, n) {
  return String(v == null ? '' : v).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').trim().slice(0, n);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};
  if (line(b.website, 200)) return res.status(200).json({ ok: true });

  const kind = line(b.kind, 20);
  const name = line(b.name, 120);
  const email = line(b.email, 200);
  const topic = line(b.topic, 120);
  const affiliation = line(b.affiliation, 200);
  const page = line(b.page, 120);
  const message = text(b.message, 4000);
  if (Object.prototype.hasOwnProperty.call(KINDS, kind) === false || name === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) === false) {
    return res.status(400).json({ ok: false });
  }

  const key = process.env.RESEND_API_KEY;
  if (key === undefined || key === '') {
    console.error('contact: RESEND_API_KEY is not set');
    return res.status(500).json({ ok: false });
  }

  const body = [KINDS[kind], '', 'Name: ' + name, 'Email: ' + email];
  if (topic) body.push('Type: ' + topic);
  if (affiliation) body.push('Affiliation: ' + affiliation);
  if (page) body.push('Page: ' + page);
  body.push('Received: ' + new Date().toISOString());
  if (message) body.push('', message);

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: 'DDT ' + KINDS[kind] + (topic ? ': ' + topic : '') + ' (' + name + ')',
        text: body.join('\n'),
      }),
    });
    if (r.ok === false) {
      console.error('contact: email provider returned ' + r.status);
      return res.status(502).json({ ok: false });
    }
  } catch (e) {
    console.error('contact: email send failed');
    return res.status(502).json({ ok: false });
  }
  return res.status(200).json({ ok: true });
};
