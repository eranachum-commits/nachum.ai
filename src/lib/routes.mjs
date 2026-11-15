// Route registry. Hebrew is the default locale at "/", English lives under "/en".
export const routes = [
  { key: 'home', path: '' },
  { key: 'quotes', path: 'solutions/quotes-and-orders' },
  { key: 'inbox', path: 'solutions/customer-inbox' },
  { key: 'discovery', path: 'solutions/opportunity-discovery' },
  { key: 'adoption', path: 'solutions/ai-adoption' },
  { key: 'how', path: 'how-it-works' },
  { key: 'about', path: 'about' },
  { key: 'results', path: 'results' },
  { key: 'faq', path: 'faq' },
  { key: 'security', path: 'data-and-security' },
  { key: 'contact', path: 'contact' },
  { key: 'privacy', path: 'privacy' },
];
export const langs = ['he', 'en'];
export function href(lang, key) {
  const r = routes.find((x) => x.key === key);
  if (!r) throw new Error('unknown route ' + key);
  const base = lang === 'en' ? '/en' : '';
  return (base + '/' + r.path).replace(/\/+$/, '') || '/';
}
