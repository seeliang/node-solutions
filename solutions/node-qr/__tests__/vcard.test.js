const buildVCard = require('../vcard');

describe('vcard.js', () => {
  test('includes required EMAIL field', () => {
    const result = buildVCard({ email: 'joe@example.com' });
    expect(result).toContain('EMAIL:joe@example.com');
    expect(result).toContain('BEGIN:VCARD');
    expect(result).toContain('END:VCARD');
  });

  test('includes FN when name is provided', () => {
    const result = buildVCard({ email: 'joe@example.com', name: 'Joe Lee' });
    expect(result).toContain('FN:Joe Lee');
  });

  test('includes TEL when phone is provided', () => {
    const result = buildVCard({ email: 'joe@example.com', phone: '+1234567890' });
    expect(result).toContain('TEL:+1234567890');
  });

  test('includes ORG when org is provided', () => {
    const result = buildVCard({ email: 'joe@example.com', org: 'Acme' });
    expect(result).toContain('ORG:Acme');
  });

  test('includes URL when url is provided', () => {
    const result = buildVCard({ email: 'joe@example.com', url: 'https://example.com' });
    expect(result).toContain('URL:https://example.com');
  });

  test('omits absent optional fields', () => {
    const result = buildVCard({ email: 'joe@example.com' });
    expect(result).not.toContain('FN:');
    expect(result).not.toContain('TEL:');
    expect(result).not.toContain('ORG:');
    expect(result).not.toContain('URL:');
  });

  test('includes all fields when fully populated', () => {
    const result = buildVCard({
      email: 'joe@example.com',
      name: 'Joe Lee',
      phone: '+1234567890',
      org: 'Acme',
      url: 'https://example.com',
    });
    expect(result).toContain('FN:Joe Lee');
    expect(result).toContain('EMAIL:joe@example.com');
    expect(result).toContain('TEL:+1234567890');
    expect(result).toContain('ORG:Acme');
    expect(result).toContain('URL:https://example.com');
  });
});
