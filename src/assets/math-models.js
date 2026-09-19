/* Small, pure models shared by the homepage explorer and its numerical checks. */
(() => {
  function squareLayers(n) {
    if (!Number.isInteger(n) || n < 1 || n > 10) throw new RangeError('Choose 1–10 layers');
    return Array.from({length:n}, (_,i) => 2*i+1);
  }
  function tangent(a) {
    if (!Number.isFinite(a)) throw new RangeError('A finite position is required');
    return {x:a, y:a*a, slope:2*a, at:x => 2*a*x-a*a};
  }
  function fairCoins(n) {
    if (!Number.isInteger(n) || n < 2 || n > 12) throw new RangeError('Choose 2–12 tosses');
    let coefficient=1;
    return Array.from({length:n+1}, (_,k) => {
      if(k) coefficient=coefficient*(n-k+1)/k;
      return {heads:k, ways:coefficient, total:2**n, probability:coefficient/2**n};
    });
  }
  window.MathModels=Object.freeze({squareLayers,tangent,fairCoins});
})();
