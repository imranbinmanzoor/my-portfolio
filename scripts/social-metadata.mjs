// Derive share metadata from each page's existing title, description and canonical.
// Keep one maintained image; never stamp the homepage title onto every route.
export function socialMetadata(html) {
  if (/http-equiv=["']refresh["']|name=["']robots["']\s+content=["']noindex/i.test(html)) return html;
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
  const tags = name => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(m => Object.fromEntries([...m[0].matchAll(/([\w:-]+)=("([^"]*)"|'([^']*)')/g)].map(a=>[a[1],a[3]??a[4]])));
  const metas = tags('meta');
  const description = metas.find(m=>m.name==='description')?.content;
  const canonical = tags('link').find(m=>m.rel==='canonical')?.href;
  if (!title || !description || !canonical) throw new Error('Share metadata requires page metadata');
  const attribute = value => value.replaceAll('"','&quot;').replaceAll("'",'&#39;');
  const type = metas.find(m=>m.property==='og:type')?.content || 'website';
  const values = {'og:type':type,'og:site_name':'Muhammad Imran','og:title':title,'og:description':description,'og:url':canonical,'og:image':'https://imranbinmanzoor.com/IMAGES/social-preview.png','og:image:width':'1200','og:image:height':'630','og:image:alt':'Muhammad Imran — AI evaluation, frontend development, mathematics and teaching'};
  const cleaned = html.replace(/<meta\b[^>]*(?:property=["']og:[^"']+["']|name=["']twitter:[^"']+["'])[^>]*>\s*/gi,'');
  return cleaned.replace('</head>',Object.entries(values).map(([key,value])=>`<meta property="${key}" content="${attribute(value)}">`).join('\n')+'\n<meta name="twitter:card" content="summary_large_image">\n</head>');
}
