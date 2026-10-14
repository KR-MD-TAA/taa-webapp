'use strict';
/* This dashboard runs entirely in the browser. No Python, Dash, APIs, or server execution. */
const COLORS = ['#4F83FF','#FFB020','#3DDC97','#FF5A6F','#B388FF'];
const NAMES = ['위기','둔화','안정','금융불안','과열'];
const PURPLE = '#8B5CF6', INK = '#F8FAFC', MUTED = '#94A3B8', GRID = '#263244';
const ASSET_COLORS = ['#636EFA','#EF553B','#00CC96','#AB63FA','#FFA15A'];
const MAJOR_VARS = ['GDP_real','RETAILSALE','CAPEX','IPIND','KR.MIR','GS5','EXKRUSx','SPCS20RSA','NONBORRES','OILPRICEx','CPIAUCSL','KOSPI'];
const CASE_LABEL = {index_constrained:'지수별 최적화 · 제약',index_unconstrained:'지수별 최적화 · 무제약',class_eq_constrained:'자산군 균등 · 제약',class_eq_unconstrained:'자산군 균등 · 무제약'};
const $ = id => document.getElementById(id);
const clean = s => String(s ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const monthDate = s => String(s).slice(0,7)+'-01';
const plusMonth = (s,offset) => {let [y,m]=String(s).slice(0,7).split('-').map(Number);let d=new Date(Date.UTC(y,m-1+offset,1));return d.toISOString().slice(0,7)};
const nfmt = (n,places=1) => Number(n).toFixed(places);
const labels = [0,1,2,3,4].map(i=>'R'+i);
const state = {tab:'overview',seen:new Set(),data:null,cycleByVar:{}};
function fillSelect(id,values,value){
 const el=$(id),previous=el.value;
 el.replaceChildren();
 for(const [val,label] of values){const opt=document.createElement('option');opt.value=val;opt.textContent=label;el.add(opt)}
 if(value!==undefined)el.value=value;else if([...el.options].some(o=>o.value===previous))el.value=previous;
}
function selectedRadio(name){return document.querySelector(`input[name="${name}"]:checked`)?.value}
function plot(id,traces,layout,opts={}){
 const container=$(id);
 if(!container || container.closest('.tab-panel')?.hidden)return;
 const base={
  template:'plotly_dark',height:opts.height||380,autosize:true,
  margin:{l:56,r:24,t:56,b:45},
  title:{text:opts.title||'',x:0.015,xanchor:'left',font:{size:16,color:INK}},
  paper_bgcolor:'#0F172A',plot_bgcolor:'#0F172A',
  font:{family:'Inter, Pretendard, Noto Sans KR, sans-serif',size:12,color:INK},
  hovermode:'x unified',hoverlabel:{bgcolor:'#111827',bordercolor:'#334155',font:{color:INK}},
  legend:{orientation:'h',yanchor:'bottom',y:1.02,xanchor:'right',x:1,font:{size:10,color:MUTED}},
  xaxis:{gridcolor:GRID,zeroline:false,linecolor:'#334155',tickfont:{size:10,color:MUTED}},
  yaxis:{gridcolor:GRID,zeroline:false,linecolor:'#334155',tickfont:{size:10,color:MUTED}},
  transition:{duration:opts.transition??175,easing:'cubic-in-out'},
  ...layout
 };
 // Deep-merge the axes so chart-specific titles do not erase dark grid styling.
 base.xaxis={gridcolor:GRID,zeroline:false,linecolor:'#334155',tickfont:{size:10,color:MUTED},...(layout.xaxis||{})};
 base.yaxis={gridcolor:GRID,zeroline:false,linecolor:'#334155',tickfont:{size:10,color:MUTED},...(layout.yaxis||{})};
 return Plotly.react(container,traces,base,{displaylogo:false,responsive:true,scrollZoom:false,modeBarButtonsToRemove:['lasso2d','select2d']}).catch(showError);
}
function showError(err){console.error('KR-MD Dashboard:',err);const el=$('error-message');el.hidden=false;el.textContent='대시보드 표시 오류: '+(err?.message||String(err))+' (브라우저 새로고침 후에도 지속되면 파일 경로와 브라우저 콘솔을 확인하세요.)'}
function kpi(label,value,sub='',color=PURPLE){return `<div class="kpi-card"><div class="kpi-label">${clean(label)}</div><div class="kpi-value" style="color:${color}">${clean(value)}</div><div class="kpi-sub">${clean(sub)}</div></div>`}
function sideRow(label,value,color=''){return `<div class="side-row"><span class="side-label">${clean(label)}</span><span class="side-value" ${color?`style="color:${color}"`:''}>${clean(value)}</span></div>`}
function initControls(){
 const D=state.data;
 for(const id of ['ov-method','taa-method'])fillSelect(id,D.taa.methods.map(m=>[m,m]),'Ridge');
 fillSelect('taa-case',D.taa.cases.map(c=>[c,CASE_LABEL[c]]),'class_eq_constrained');
 fillSelect('ov-var',MAJOR_VARS.map(v=>[v,`${D.cycles.major[v]} · ${v}`]),'GDP_real');
 fillSelect('exp-group',D.cycles.groups.map(g=>[g.id,`${g.label} (${g.id})`]),'Output and Income');
 fillExplorerVars();
 const rt=D.regimes.modes.global.rt.filter(r=>r.date>='2001-01');
 const vintage=$('ov-vintage');vintage.min='0';vintage.max=String(rt.length-1);vintage.value=vintage.max;
 const marks=$('ov-year-marks');let ix=[];
 for(let i=0;i<rt.length;i+=60)ix.push(i);
 if(rt.length-1-ix.at(-1)>=24)ix.push(rt.length-1);
 marks.innerHTML=ix.map(i=>{const pct=i/(rt.length-1)*100;const offset=(9.5-19*pct/100).toFixed(4);const transform=i===0?'translateX(0)':i===rt.length-1?'translateX(-100%)':'translateX(-50%)';return `<span class="vintage-year" style="left:calc(${pct.toFixed(4)}% + ${offset}px);transform:${transform}">${rt[i].date.slice(0,4)}</span>`}).join('');
 updateMonthLabel();fillRegimeMonths('global');
 $('reg-legend').innerHTML=NAMES.map((n,i)=>`<div class="regime-key"><span class="regime-dot" style="background:${COLORS[i]}"></span>R${i} ${n}</div>`).join('');
 for(const b of document.querySelectorAll('[data-tab]'))b.addEventListener('click',()=>switchTab(b.dataset.tab));
 $('ov-var').addEventListener('change',updateOverview);
 $('ov-method').addEventListener('change',updateOverview);
 vintage.addEventListener('input',()=>{updateMonthLabel();updateOverview()});
 $('exp-group').addEventListener('change',()=>{fillExplorerVars();updateExplorer()});
 $('exp-var').addEventListener('change',updateExplorer);
 document.querySelectorAll('input[name="reg-mode"]').forEach(n=>n.addEventListener('change',()=>{fillRegimeMonths(n.value);updateRegime()}));
 $('reg-month').addEventListener('change',updateRegime);
 document.querySelectorAll('input[name="taa-spec"]').forEach(n=>n.addEventListener('change',updateTAA));
 $('taa-case').addEventListener('change',updateTAA);
 $('taa-method').addEventListener('change',updateTAA);
 window.addEventListener('resize',()=>{
  for(const e of document.querySelectorAll('.tab-panel:not([hidden]) .js-plotly-plot')){if(e.data)Plotly.Plots.resize(e)}
 });
}
function updateMonthLabel(){
 const rt=state.data.regimes.modes.global.rt.filter(r=>r.date>='2001-01');const n=Number($('ov-vintage').value),pct=100*n/Math.max(1,rt.length-1);let trans='translateX(-50%)';if(pct<=3)trans='translateX(0)';if(pct>=97)trans='translateX(-100%)';
 const s=$('ov-vintage').style;s.setProperty('--vintage-progress',pct.toFixed(3)+'%');
 const lbl=$('ov-month-label');lbl.textContent=rt[n].date+'-01';lbl.style.left=`calc(${pct.toFixed(4)}% + ${(9.5-19*pct/100).toFixed(4)}px)`;lbl.style.transform=trans;
}
function switchTab(tab){
 state.tab=tab;
 for(const el of document.querySelectorAll('.tab-panel'))el.hidden=(el.id!=='panel-'+tab);
 for(const b of document.querySelectorAll('[data-tab]')){const active=b.dataset.tab===tab;b.classList.toggle('tab--selected',active);b.setAttribute('aria-selected',String(active))}
 const updater={overview:updateOverview,explorer:updateExplorer,regime:updateRegime,taa:updateTAA,methodology:updateMethodology}[tab];
 if(updater)updater();
}
function rawRegimeHistory(mode,date){
 const d=state.data.regimes.modes[mode];
 // Select last existing information vintage <= requested month, not the current final series.
 let v=d.vintages[0];for(const m of d.vintages){if(m<=date)v=m;else break}
 const h=d.histories[v];return {vintage:v,dates:d.histDates,values:h};
}
function selectedRegime(mode,date){
 const h=rawRegimeHistory(mode,date);for(let j=h.dates.length-1;j>=0;j--){if(h.dates[j]<=date&&h.values[j]!=null)return h.values[j]}return 0;
}
function monthRegimeMap(mode,date){
 const h=rawRegimeHistory(mode,date),r={};
 for(let j=0;j<h.dates.length;j++){if(h.dates[j]>date)break;if(h.values[j]!=null)r[h.dates[j]]=h.values[j]}
 return r;
}
function getRtRow(mode,date){const rows=state.data.regimes.modes[mode].rt;let row=rows[0];for(const x of rows){if(x.date<=date)row=x;else break}return row}
function matchedProb(mode,probs){
 const mapping=state.data.regimes.map[mode],p=[0,0,0,0,0];let hasCrisis=false;
 for(const [key,v] of Object.entries(probs)){const raw=Number(String(key).replace('Regime ',''));if(raw===0)hasCrisis=true;const matched=mapping[String(raw)]??raw;p[matched]+=Number(v)}
 if(!hasCrisis){const total=p.reduce((a,b)=>a+b,0);p[0]=Math.max(0,1-total)}
 return p;
}
function monthlyIndexForVar(varid){return state.cycleByVar[varid]}
function updateOverview(){
 const d=state.data;if(!d)return;
 const vintages=d.regimes.modes.global.rt.filter(x=>x.date>='2001-01');
 const requested=vintages[Number($('ov-vintage').value)].date, row=getRtRow('global',requested),cut=row.date;
 const first=plusMonth(cut,-60),last=plusMonth(cut,15),future=plusMonth(cut,1),series=monthlyIndexForVar($('ov-var').value);
 if(!series){showError(new Error('거시지표를 찾을 수 없음'));return}
 const historyX=[],historyY=[],futureX=[],futureY=[];
 for(let i=0;i<series.dates.length;i++){
  const date=series.dates[i].slice(0,7),y=series.y[i];if(y==null||date<first||date>last)continue;
  if(date<=cut){historyX.push(monthDate(date));historyY.push(y)}else{futureX.push(monthDate(date));futureY.push(y)}
 }
 if(historyX.length&&futureX.length){futureX.unshift(historyX.at(-1));futureY.unshift(historyY.at(-1))}
 const byMonth=monthRegimeMap('global',cut),shapes=[];
 for(let i=0;i<=60;i++){
  const m=plusMonth(first,i),label=byMonth[m];
  shapes.push({type:'rect',xref:'x',yref:'paper',x0:monthDate(m),x1:monthDate(plusMonth(m,1)),y0:0,y1:1,fillcolor:COLORS[label]||'#0F172A',opacity:label===undefined?0:0.34,line:{width:0},layer:'below'});
 }
 shapes.push({type:'rect',xref:'x',yref:'paper',x0:monthDate(future),x1:monthDate(last),y0:0,y1:1,fillcolor:'#334155',opacity:0.70,line:{width:0},layer:'below'});
 shapes.push({type:'line',xref:'x',yref:'paper',x0:monthDate(cut),x1:monthDate(cut),y0:0,y1:1,line:{color:INK,width:2}});
 const yy=historyY.concat(futureY);let lo=-0.04,hi=0.04;if(yy.length){lo=Math.min(lo,...yy);hi=Math.max(hi,...yy);if(lo<-.04||hi>.04){let pad=(hi-lo)*0.05;lo-=pad;hi+=pad}}
 const name=d.cycles.major[$('ov-var').value]||$('ov-var').value;
 plot('ov-main',[
  {type:'scatter',mode:'lines',x:historyX,y:historyY,name:name,line:{color:PURPLE,width:2.6}},
  {type:'scatter',mode:'lines',x:futureX,y:futureY,name:'선택 vintage 이후 실제값',line:{color:'#CBD5E1',width:2,dash:'dash'}}
 ],{shapes,xaxis:{type:'date',range:[monthDate(first),monthDate(last)]},yaxis:{title:'Cycle',range:[lo,hi],autorange:false},annotations:[{x:monthDate(cut),y:0.04,yref:'paper',text:'Vintage '+clean(cut),showarrow:false,xanchor:'right',font:{size:10,color:INK},bgcolor:'rgba(18,24,38,.90)'}]}, {title:name+' · 5-year rolling vintage view',height:520});
 const regime=selectedRegime('global',cut);
 $('ov-regime').innerHTML='<h3>Vintage &amp; regime</h3>'+sideRow('선택 Vintage',cut)+sideRow('선택 월 Regime',`R${regime} · ${NAMES[regime]}`,COLORS[regime])+sideRow('최근 3개월','신규 관측치에 따라 수정 가능');
 const method=$('ov-method').value,key=`qoq_global|class_eq_constrained|${method}`,w=d.taa.portfolios[key];
 const valid=w.months.map((m,i)=>m<=cut?i:-1).filter(i=>i>=0),i=valid.length?valid.at(-1):-1;
 if(i<0){$('ov-allocation').innerHTML='<div class="note">선택 시점에는 TAA 비중이 아직 없습니다.</div>'}
 else $('ov-allocation').innerHTML=`<div class="section-sub">기준 ${clean(w.months[i])}</div>`+d.taa.classes.map((c,j)=>`<div class="alloc-row"><div class="alloc-name">${clean(c)}</div><div class="alloc-track"><div class="alloc-fill" style="width:${Math.min(100,Math.max(0,w.weights[i][j]))}%;background:${ASSET_COLORS[j]}"></div></div><div class="alloc-pct">${nfmt(w.weights[i][j])}%</div></div>`).join('');
 const m=d.taa.vintageMetrics[requested]?.[method],early=plusMonth(requested,-11);
 $('ov-performance').innerHTML='<h3>전략 성과 · 최근 1년 (Rolling 12M)</h3>'+
  `<div class="performance-descriptor">${m?`Global / Class constrained · ${clean(method)} · ${early} ~ ${requested}`:'Global / Class constrained · 12개월 성과 미제공 (2005-01부터)'}</div>`+
  `<div class="perf-cells"><div><div class="kpi-label">Sharpe</div><div class="side-value">${m?nfmt(m[0],2):'N/A'}</div></div><div><div class="kpi-label">MDD</div><div class="side-value">${m?nfmt(m[1])+'%':'N/A'}</div></div><div><div class="kpi-label">Cum. return</div><div class="side-value">${m?nfmt(m[2])+'%':'N/A'}</div></div></div>`;
}
function fillExplorerVars(){
 const group=state.data.cycles.groups.find(g=>g.id===$('exp-group').value);
 if(!group)return;
 fillSelect('exp-var',group.vars.map(v=>[v.id,v.label]),group.vars.some(v=>v.id==='GDP_real')?'GDP_real':group.vars[0].id)
}
function updateExplorer(){
 const group=state.data.cycles.groups.find(g=>g.id===$('exp-group').value),v=group.vars.find(x=>x.id===$('exp-var').value);if(!v)return;
 const x=[],y=[];for(let i=0;i<v.y.length;i++){if(v.y[i]!=null){x.push(group.dates[i]);y.push(v.y[i])}}
 const korean=v.metadata['Korean series name'],title=korean&&korean!=='nan'?`${v.id} · ${korean}`:state.data.cycles.major[v.id]||v.id;
 plot('exp-chart',[{type:'scatter',mode:'lines',x,y,line:{color:PURPLE,width:2.3},name:v.id}],{shapes:[{type:'line',xref:'paper',yref:'y',x0:0,x1:1,y0:0,y1:0,line:{color:'#9CA3AF',dash:'dot'}}],yaxis:{title:'Cycle'}},{title,height:480});
 const meta=v.metadata||{},fields=[['그룹',group.label],['Source',meta.Source||'-'],['Period',meta.Period||'-'],['Beg',meta.Beg||'-'],['End',meta.End||'-'],['Cycle',meta.Cycle||'-']];
 $('exp-meta').innerHTML=fields.map(([k,x])=>`<div><span>${clean(k)}</span><strong>${clean(x)}</strong></div>`).join('');
}
function fillRegimeMonths(mode){
 const dates=state.data.regimes.modes[mode].rt.filter(r=>r.date>='2001-01').map(r=>r.date);
 fillSelect('reg-month',dates.map(d=>[d,d]),dates.at(-1));
}
function getLatestTimeline(mode,selected){
 const d=state.data.regimes.modes[mode],last=d.vintages.at(-1),h=d.histories[last],xx=[],yy=[];
 for(let i=0;i<h.length;i++){if(d.histDates[i]>='2001-01'&&h[i]!=null&&d.histDates[i]<=last){xx.push(monthDate(d.histDates[i]));yy.push(h[i])}}
 const shapes=[];let begin=0;
 for(let i=1;i<=xx.length;i++){
  if(i===xx.length||yy[i]!==yy[begin]){
   shapes.push({type:'rect',xref:'x',yref:'paper',x0:xx[begin],x1:i<xx.length?xx[i]:monthDate(plusMonth(xx.at(-1),1)),y0:0,y1:1,fillcolor:COLORS[yy[begin]],opacity:0.38,line:{width:0},layer:'below'});
   begin=i;
  }
 }
 if(selected)shapes.push({type:'line',xref:'x',yref:'paper',x0:monthDate(selected),x1:monthDate(selected),y0:0,y1:1,line:{color:INK,width:2}});
 plot('reg-timeline',[{type:'scatter',mode:'lines',x:xx,y:yy,name:'최신 수정 반영 국면',line:{color:'#CBD5E1',width:1.4}}],{shapes,xaxis:{type:'date',range:['2001-01-01',monthDate(plusMonth(xx.at(-1),1))],autorange:false},yaxis:{tickvals:[0,1,2,3,4],ticktext:NAMES.map((n,i)=>`R${i} ${n}`),range:[-0.5,4.5]}},{title:'경기국면 타임라인 · 전체 기간',height:360});
}
function heatTrace(z,x,y,kind){
 const isP=kind!=='character';const Z=z.map(row=>row.map(v=>isP?v*100:v));
 return {type:'heatmap',z:Z,x,y,text:Z.map(row=>row.map(v=>nfmt(v,isP?1:2)+(isP?'%':''))),texttemplate:'%{text}',textfont:{size:11,color:'#F8FAFC'},colorscale:[[0,'#171126'],[.35,'#34205C'],[.7,'#7C3AED'],[1,'#C4B5FD']],zmin:0,zmax:isP?100:1,colorbar:{title:isP?'%':'Scaled'}};
}
function updateRegime(){
 const mode=selectedRadio('reg-mode'),m=$('reg-month').value,d=state.data.regimes.modes[mode];if(!m)return;
 const row=getRtRow(mode,m),r=selectedRegime(mode,row.date),p=matchedProb(mode,row.probs),maxi=p.indexOf(Math.max(...p));
 $('reg-kpis').innerHTML=[kpi('선택 월 국면',`R${r} · ${NAMES[r]}`,row.date,COLORS[r]),kpi('선택 월 최고확률',`R${maxi} · ${nfmt(p[maxi]*100)}%`,'Matched probability',COLORS[maxi]),kpi('사용 변수',row.n_vars,`PCA components: ${row.n_components}`),kpi('분석 관측치',row.n_obs,mode.charAt(0).toUpperCase()+mode.slice(1))].join('');
 getLatestTimeline(mode,row.date);
 plot('reg-prob',[{type:'bar',x:labels,y:p.map(q=>q*100),marker:{color:COLORS},text:p.map(q=>nfmt(q*100)+'%'),textposition:'outside'}],{yaxis:{title:'Probability (%)',range:[0,Math.max(35,Math.max(...p)*125)]}},{title:'선택 월 국면 확률',height:330});
 for(const kind of ['full','switch']){
  const title=kind==='full'?'국면 전이확률 (자기전이 포함)':'전환 발생 조건부 전이확률';
  plot(`reg-trans-${kind}`,[heatTrace(d.transition[kind],labels,labels,kind)],{xaxis:{title:'To regime'},yaxis:{title:'From regime',autorange:'reversed'}},{title,height:390});
 }
 plot('reg-heat',[heatTrace(d.heat.z,labels,d.heat.labels,'character')],{yaxis:{automargin:true}},{title:'국면별 주요 거시지표 특성',height:520});
}
function updateTAA(){
 const spec=selectedRadio('taa-spec'),c=$('taa-case').value,m=$('taa-method').value,key=`${spec}|${c}|${m}`,w=state.data.taa.portfolios[key];
 if(!w){showError(new Error('전략 데이터를 찾을 수 없습니다: '+key));return}
 const perf=w.perf;const months=w.cumMonths.map(monthDate);
 $('taa-kpis').innerHTML=[kpi('Sharpe ratio',nfmt(perf.sharpe,2),'월별 수익률 연율화'),kpi('Max Drawdown',nfmt(perf.mdd)+'%','백테스트 최대 낙폭','#B91C1C'),kpi('누적수익률',nfmt(perf.cum)+'%',`${w.months[0]} – ${w.months.at(-1)}`)].join('');
 plot('taa-cum',[
  {type:'scatter',mode:'lines',x:months,y:w.cum[0],name:m,line:{color:PURPLE,width:2.5}},
  {type:'scatter',mode:'lines',x:months,y:w.cum[1],name:'Benchmark 2026',line:{color:'#CBD5E1',width:1.8,dash:'dot'}},
  {type:'scatter',mode:'lines',x:months,y:w.cum[2],name:'Benchmark 2030',line:{color:'#64748B',width:1.8,dash:'dash'}}
 ],{yaxis:{title:'Cumulative return (%)'}},{title:'누적수익률 · Position Check 최종 결과',height:420});
 const a=w.weights.at(-1);
 plot('taa-current',[{type:'bar',x:state.data.taa.classes,y:a,marker:{color:ASSET_COLORS},text:a.map(z=>nfmt(z)+'%'),textposition:'outside'}],{yaxis:{title:'Weight (%)',range:[0,Math.max(45,Math.max(...a)*1.25)]},xaxis:{tickangle:-18}},{title:`최근 자산배분 · ${w.months.at(-1)}`,height:390});
 const traces=state.data.taa.classes.map((c,i)=>({type:'scatter',mode:'lines',x:w.months.map(monthDate),y:w.weights.map(row=>row[i]),stackgroup:'one',name:c,line:{color:ASSET_COLORS[i],width:0.9},fillcolor:ASSET_COLORS[i]}));
 plot('taa-history',traces,{yaxis:{title:'Weight (%)',range:[0,100]}},{title:'월별 자산군 배분',height:440});
}
async function updateMethodology(){
 if(state.seen.has('methodology')){if(window.MathJax?.typesetPromise)window.MathJax.typesetPromise([$('methodology-content')]).catch(console.error);return}
 try{
  const r=await fetch('methodology.html');if(!r.ok)throw new Error(`methodology.html: ${r.status}`);
  $('methodology-content').innerHTML=await r.text();state.seen.add('methodology');
  if(window.MathJax?.typesetPromise)window.MathJax.typesetPromise([$('methodology-content')]).catch(console.error);
 }catch(e){showError(e);$('methodology-content').textContent='Methodology 파일을 불러올 수 없습니다.'}
}
async function init(){
 try{
  if(typeof Plotly==='undefined')throw new Error('assets/plotly.min.js를 불러오지 못했습니다.');
  const paths=['cycles.json','regimes.json','taa.json'];
  const resp=await Promise.all(paths.map(path=>fetch('data/'+path)));
  for(let i=0;i<resp.length;i++)if(!resp[i].ok)throw new Error(`data/${paths[i]} (HTTP ${resp[i].status})`);
  const [cycles,regimes,taa]=await Promise.all(resp.map(r=>r.json()));
  state.data={cycles,regimes,taa};
  for(const group of cycles.groups)for(const variable of group.vars){state.cycleByVar[variable.id]={dates:group.dates,y:variable.y}}
  initControls();updateOverview();
 }catch(e){showError(e)}
}
init();
