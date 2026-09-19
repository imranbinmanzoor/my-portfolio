/* Set the saved appearance before first paint on every route. */
(()=>{try{const saved=localStorage.getItem('theme');document.documentElement.dataset.theme=saved==='dark'||saved==='light'?saved:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}catch{document.documentElement.dataset.theme='light';}})();
