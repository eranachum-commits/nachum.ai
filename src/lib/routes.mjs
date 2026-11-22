// Route registry. Hebrew is the default locale at "/", English lives under "/en".
export const routes = [
  { key: 'home', path: '' },
  { key: 'usecase', path: 'business-use-case' },
  { key: 'how', path: 'how-it-works' },
  { key: 'about', path: 'about' },
  { key: 'results', path: 'results' },
  { key: 'faq', path: 'faq' },
  { key: 'security', path: 'data-and-security' },
  { key: 'contact', path: 'contact' },
  { key: 'privacy', path: 'privacy' },
  // Campaign landing pages (paid and referral traffic), rendered from content.industries.
  { key: 'lp-distribution', path: 'for/distribution' },
  { key: 'lp-manufacturing', path: 'for/manufacturing' },
  { key: 'lp-ecommerce', path: 'for/ecommerce' },
  { key: 'lp-insurance', path: 'for/insurance' },
  { key: 'lp-accounting', path: 'for/accounting' },
  { key: 'lp-law', path: 'for/law' },
  { key: 'lp-real-estate', path: 'for/real-estate' },
];
export const langs = ['he', 'en'];
export function href(lang, key) {
  const r = routes.find((x) => x.key === key);
  if (!r) throw new Error('unknown route ' + key);
  const base = lang === 'en' ? '/en' : '';
  return (base + '/' + r.path).replace(/\/+$/, '') || '/';
}
