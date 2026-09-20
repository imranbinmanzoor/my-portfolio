export const SITE = 'https://imranbinmanzoor.com';
export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const jsonLD = value => `<script type="application/ld+json">${JSON.stringify(value).replaceAll('<','\\u003c')}</script>`;
export function breadcrumbs(items) {
  return jsonLD({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((item,i)=>({'@type':'ListItem',position:i+1,name:item.name,...(item.href?{item:SITE+item.href}:{})}))});
}
export function publishedUnits(book,all) {
  return book.units.map(unit=>({unit,content:all[String(unit.n)]})).filter(x=>x.content).map(x=>({...x,exercises:x.unit.exercises.filter(id=>x.content[id]?.questions?.length).map(id=>x.content[id]),review:x.content[`Review ${x.unit.n}`]?.questions?.length?x.content[`Review ${x.unit.n}`]:null})).filter(x=>x.exercises.length);
}
