/**
 * vcard.js — pure function
 * Accepts a contact data object and returns a vCard 3.0 string.
 * Only `email` is required; all other fields are optional and additive.
 *
 * Supported fields:
 *   email  → EMAIL
 *   name   → FN
 *   phone  → TEL
 *   org    → ORG
 *   url    → URL
 */
const buildVCard = ({ email, name, phone, org, url }) => {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];

  if (name) lines.push(`FN:${name}`);
  if (email) lines.push(`EMAIL:${email}`);
  if (phone) lines.push(`TEL:${phone}`);
  if (org) lines.push(`ORG:${org}`);
  if (url) lines.push(`URL:${url}`);

  lines.push('END:VCARD');
  return lines.join('\n');
};

module.exports = buildVCard;
