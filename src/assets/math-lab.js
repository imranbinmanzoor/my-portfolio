(() => {
  const lab=document.querySelector('[data-lab]');
  if(!lab)return;
  const $=s=>lab.querySelector(s), models=window.MathModels;
  const input=$('#lab-input'), drawing=$('[data-lab-drawing]');
  const tabs=[...lab.querySelectorAll('[data-lab-scene]')];
  const values={pattern:8,curve:1,chance:8};
  let scene='pattern',heads=4,zoom=false;
  const num=n=>String(Number(n.toFixed(4)));
  const tex=t=>window.katex?window.katex.renderToString(t,{throwOnError:true,trust:false,output:'htmlAndMathml'}):t;
  const math=t=>'<span>'+tex(t)+'</span>';
  const label=(x,y,t,width=54)=>`<foreignObject x="${x}" y="${y}" width="${width}" height="28"><div xmlns="http://www.w3.org/1999/xhtml" class="lab-math-label">${tex(t)}</div></foreignObject>`;
  function showFormula(t){$('[data-lab-formula]').innerHTML=tex(t);}
  function pattern(){
    const n=values.pattern,odds=models.squareLayers(n),cell=23,left=220-n*cell/2,bottom=242;
    let svg='';
    for(let row=0;row<n;row++)for(let col=0;col<n;col++){
      const newest=Math.max(row,col)===n-1;
      svg+=`<rect class="lab-tile${newest?'':' lab-tile--old'}" x="${left+col*cell}" y="${bottom-(row+1)*cell}" width="21" height="21" rx="3"/>`;
    }
    svg+=label(left+n*cell+10,bottom-n*cell/2-12,String(n));
    drawing.innerHTML=svg;
    const sum=n<=5?odds.join('+'):'1+3+\\cdots+'+odds.at(-1);
    showFormula(sum+'='+n+'^2');
    $('[data-lab-value]').innerHTML=tex(String(n));
    input.setAttribute('aria-valuetext',n+' tiles wide');
    $('[data-lab-feedback]').innerHTML='The highlighted border adds '+math(String(2*n-1))+' tiles. Together, the layers fill a square of '+math(String(n*n))+' tiles.';
    $('#lab-diagram-desc').textContent=`A square ${n} tiles wide and ${n} tiles tall, containing ${n*n} tiles. The top and right edges are highlighted: ${2*n-1} new tiles added to the previous square.`;
  }
  function curve(){
    const a=values.curve,t=models.tangent(a),unit=zoom?150:40,cx=zoom?a:0,cy=zoom?t.y:2.6;
    const px=x=>226+(x-cx)*unit,py=y=>128-(y-cy)*unit;
    const xmin=cx-190/unit,xmax=cx+190/unit,ymin=cy-112/unit,ymax=cy+112/unit;
    const tick=zoom?.5:1;let svg='';
    for(let x=Math.ceil(xmin/tick)*tick;x<=xmax;x+=tick)svg+=`<path class="lab-grid" d="M${px(x)} 16V240"/>`;
    for(let y=Math.ceil(ymin/tick)*tick;y<=ymax;y+=tick)svg+=`<path class="lab-grid" d="M36 ${py(y)}H416"/>`;
    svg+=`<g clip-path="url(#lab-plot-clip)"><path class="lab-axis" d="M36 ${py(0)}H416M${px(0)} 16V240"/>`;
    let path='';for(let i=0;i<=180;i++){const x=xmin+(xmax-xmin)*i/180;path+=(i?'L':'M')+px(x)+' '+py(x*x);}
    svg+=`<path class="lab-curve" d="${path}"/><path class="lab-tangent" d="M${px(xmin)} ${py(t.at(xmin))}L${px(xmax)} ${py(t.at(xmax))}"/><circle class="lab-point" cx="${px(a)}" cy="${py(t.y)}" r="5"/></g>`;
    svg+=label(44,21,'y=x^2',100)+label(300,21,'m='+num(t.slope),100);
    if(!zoom){svg+=label(395,py(0)+3,'x',24)+label(px(0)+7,18,'y',24);for(const x of [-2,0,2])svg+=label(px(x)-8,py(0)+3,String(x),35);}
    drawing.innerHTML=svg;
    showFormula('x='+num(a)+'\\qquad f\'(x)='+num(t.slope));
    $('[data-lab-value]').innerHTML=tex('x='+num(a));input.setAttribute('aria-valuetext','x equals '+num(a));
    $('[data-lab-feedback]').textContent=a<0?'Moving right, the curve is falling here. The dashed tangent has negative slope.':a>0?'Moving right, the curve is rising here. The dashed tangent has positive slope.':'At the turning point, the tangent is horizontal. Its slope is zero.';
    $('[data-lab-caption]').innerHTML=(zoom?'Closer view of ':'Marked point ')+math('('+num(a)+','+num(t.y)+')')+' · solid curve · dashed tangent';
    $('#lab-diagram-desc').textContent=`The curve y equals x squared and its tangent at (${a}, ${t.y}). The tangent slope is ${t.slope}. ${zoom?'The view is magnified around the marked point.':''}`;
  }
  function chance(){
    const n=values.chance,distribution=models.fairCoins(n),selected=distribution[heads],slot=360/(n+1);
    let svg='<path class="lab-axis" d="M42 16V228H410"/>';
    for(const percent of [0,25,50]){const y=228-percent*4;svg+=`<path class="lab-grid" d="M42 ${y}H410"/>`+label(2,y-12,percent+'\\%',44);}
    distribution.forEach((d,k)=>{
      const height=d.probability*400,x=48+k*slot;
      svg+=`<rect class="lab-bar${k===heads?' lab-bar--selected':''}" x="${x}" y="${228-height}" width="${slot-5}" height="${height}" rx="2"/>`;
      svg+=label(x+slot/2-9,236,String(k),32);
    });drawing.innerHTML=svg;
    showFormula('\\Pr(H='+heads+')=\\frac{'+selected.ways+'}{'+selected.total+'}');
    const percent=selected.probability*100,rounded=Math.round(percent*100)/100;
    $('[data-lab-value]').innerHTML=tex('n='+n);input.setAttribute('aria-valuetext',n+' independent fair coin tosses');
    $('[data-heads-value]').innerHTML=tex(String(heads));$('#lab-heads').setAttribute('aria-valuetext',heads+' heads');
    $('[data-lab-feedback]').innerHTML=math(String(selected.ways))+' of '+math(String(selected.total))+' equally likely sequences have exactly '+math(String(heads))+' heads: '+math((Math.abs(percent-rounded)<1e-10?'':'\\approx ')+num(rounded)+'\\%')+'.';
    $('#lab-diagram-desc').textContent=`Exact probabilities for the number of heads in ${n} independent fair coin tosses. The horizontal axis counts heads; the vertical axis is probability. Selected: ${heads} heads, ${selected.ways} of ${selected.total} equally likely sequences, ${Math.abs(percent-rounded)<1e-10?'':'approximately '}${rounded} percent.`;
  }
  const scenes={
    pattern:{title:'What do odd numbers build?',prompt:'Grow the square. Watch what each new layer adds.',label:'Square width',min:1,max:10,step:1,caption:'Each new border makes the square one tile wider.',proof:()=>'<p>A square of width '+math('n-1')+' becomes one of width '+math('n')+' by adding a top row and a right column, counting their shared corner once:</p><div class="lab-equation">'+tex('n^2-(n-1)^2=2n-1')+'</div><p>Starting from the empty square, these layers account for every tile. Thus '+math('1+3+\\cdots+(2n-1)=n^2')+' for every positive integer '+math('n')+'.</p>'},
    curve:{title:'How steep is a curve?',prompt:'Move the point. See where the curve falls, levels out, and rises.',label:'Position on the curve',min:-2,max:2,step:.25,caption:'Solid curve · dashed tangent · marked point',proof:()=>'<p>For '+math('f(x)=x^2')+', the average rate of change from '+math('a')+' to '+math('a+h')+', with '+math('h\\ne0')+', is</p><div class="lab-equation">'+tex('\\frac{(a+h)^2-a^2}{h}=2a+h')+'</div><p>As '+math('h\\to0')+', this approaches '+math('2a')+'. The tangent therefore has slope '+math('f\'(a)=2a')+' and equation '+math('y=2ax-a^2')+'. This is the idea behind measuring an instantaneous rate of change.</p>'},
    chance:{title:'Is half heads guaranteed?',prompt:'Count how many different sequences give the same number of heads.',label:'Number of tosses',min:2,max:12,step:1,caption:'Heads along the bottom · probability up the side',proof:()=>'<p>Assume '+math('n')+' independent tosses, each with probability '+math('\\tfrac12')+' of heads. There are '+math('2^n')+' equally likely sequences. Choosing which '+math('k')+' positions contain heads gives '+math('\\binom nk')+' sequences:</p><div class="lab-equation">'+tex('\\Pr(H=k)=\\binom nk\\,2^{-n}')+'</div><p>The bars show exact probabilities, not experimental results. Percentages are rounded to two decimal places when necessary. The most likely count is not a promise about the next experiment.</p>'}
  };
  function render(){({pattern,curve,chance})[scene]();}
  function select(next){
    scene=next;lab.dataset.scene=scene;
    const config=scenes[scene];
    tabs.forEach(t=>{const active=t.dataset.labScene===scene;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;});
    $('#lab-panel').setAttribute('aria-labelledby','lab-tab-'+scene);
    $('[data-lab-title]').textContent=config.title;$('#lab-diagram-title').textContent=config.title;
    $('[data-lab-prompt]').textContent=config.prompt;$('[data-lab-label]').textContent=config.label;$('[data-lab-caption]').textContent=config.caption;
    Object.assign(input,{min:config.min,max:config.max,step:config.step,value:values[scene]});
    const extra=$('[data-lab-extra]');extra.replaceChildren();
    if(scene==='curve'){
      extra.innerHTML='<label class="math-lab__zoom"><input id="lab-zoom" type="checkbox">Look closer at the point</label>';
      $('#lab-zoom').checked=zoom;$('#lab-zoom').addEventListener('change',e=>{zoom=e.target.checked;render();});
    }
    if(scene==='chance'){
      extra.innerHTML='<label for="lab-heads">Heads to inspect<output aria-live="off" for="lab-heads" data-heads-value></output></label><input type="range" id="lab-heads" min="0" max="'+values.chance+'" step="1" value="'+heads+'" aria-describedby="lab-feedback">';
      $('#lab-heads').addEventListener('input',e=>{heads=Number(e.target.value);render();});
    }
    $('.math-lab__proof').open=false;$('[data-lab-proof]').innerHTML=config.proof();render();
  }
  input.addEventListener('input',()=>{values[scene]=Number(input.value);if(scene==='chance'){heads=Math.min(heads,values.chance);$('#lab-heads').max=values.chance;$('#lab-heads').value=heads;}render();});
  tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(tab.dataset.labScene));tab.addEventListener('keydown',e=>{let index;if(e.key==='ArrowRight')index=(i+1)%tabs.length;else if(e.key==='ArrowLeft')index=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')index=0;else if(e.key==='End')index=tabs.length-1;else return;e.preventDefault();tabs[index].focus();select(tabs[index].dataset.labScene);});});
  select(scene);$('.math-lab__tabs').hidden=false;$('.math-lab__controls').hidden=false;
})();
