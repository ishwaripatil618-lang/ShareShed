const KEY='shareshed_v1';
const U=[{id:'u1',name:'Asha Patil',role:'student',trained:['3D Printer','Laser Cutter']},{id:'u2',name:'Rahul Verma',role:'student',trained:[]},{id:'o1',name:'Dr. Mehta (Workshop Lab)',role:'owner'},{id:'a1',name:'Admin Office',role:'admin'}];
const seed=()=>({res:[
{id:'r1',owner:'o1',name:'Prusa 3D Printer',loc:'Workshop Lab, Block B',need:'3D Printer',max:4,rules:'Staff must be present. Clean the bed after use.'},
{id:'r2',owner:'o1',name:'Laser Cutter',loc:'Workshop Lab, Block B',need:'Laser Cutter',max:2,rules:'Safety goggles required. No PVC sheets.'},
{id:'r3',owner:'o1',name:'Mirrorless Camera Kit',loc:'Media Room, Block A',need:'',max:24,rules:'Return with all lenses and the charger.'},
{id:'r4',owner:'o1',name:'Seminar Room 204',loc:'Block C, 2nd floor',need:'',max:3,rules:'Leave the room tidy. Projector stays on its mount.'}],
b:[],log:[],me:'u1',tab:'browse',msg:null,q:''});
let S=(function(){try{const t=localStorage.getItem(KEY);if(t)return JSON.parse(t)}catch(e){}return seed()})();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nowS=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,16);
const fm=s=>String(s).replace('T',' ');
const me=()=>U.find(u=>u.id===S.me),usr=id=>U.find(u=>u.id===id),rs=id=>S.res.find(r=>r.id===id),bk=id=>S.b.find(b=>b.id===id);
const isStu=()=>me().role==='student';
const CND=['Good','Minor wear','Damaged'];
const lg=(b,t)=>S.log.push({t:nowS(),b:b.id,who:me().name,text:t});
const ov=(a,b)=>a.start<b.end&&b.start<a.end;
const taken=(rid,st,en,skip)=>S.b.some(x=>x.rid===rid&&x.id!==skip&&['approved','checkedin'].includes(x.status)&&ov(x,{start:st,end:en}));
function msg(t,k){S.msg={t,k};save();R()}
function sw(id){S.me=id;S.tab=isStu()?'browse':'req';S.msg=null;save();R()}
function tab(t){S.tab=t;S.msg=null;save();R()}
function reqB(rid){const r=rs(rid),u=me(),st=$('s'+rid).value,en=$('e'+rid).value,pu=$('p'+rid).value.trim();
 if(!st||!en||!pu)return msg('Fill in start, end and purpose.','bad');
 if(en<=st)return msg('End time must be after the start time.','bad');
 if(st<nowS())return msg('Start time is in the past.','bad');
 if((new Date(en)-new Date(st))/36e5>r.max)return msg('This resource allows at most '+r.max+' hours per booking.','bad');
 if(r.need&&!u.trained.includes(r.need))return msg('You need "'+r.need+'" training first.','bad');
 const open=S.b.filter(x=>x.uid===u.id&&['pending','approved','checkedin','waitlisted'].includes(x.status)).length;
 if(open>=2)return msg('Fair-use limit: 2 open bookings per person. Finish or cancel one first.','bad');
 const b={id:'b'+Date.now(),rid,uid:u.id,start:st,end:en,purpose:pu,status:'pending',reason:'',created:nowS(),inc:[]};
 if(taken(rid,st,en)){b.status='waitlisted';const pos=S.b.filter(x=>x.rid===rid&&x.status==='waitlisted'&&ov(x,b)).length+1;b.reason='This time is already approved for someone else. You are #'+pos+' on the waiting list. You move up if it is cancelled.'}
 S.b.push(b);lg(b,b.status==='pending'?'Requested booking. Eligibility check passed.':'Requested booking. Slot taken, placed on waiting list.');
 S.tab='mine';msg(b.status==='pending'?'Request sent. The owner will review it.':'Slot is taken. You are on the waiting list.','ok')}
function decide(id,act){const b=bk(id),rsn=($('n'+id).value||'').trim();
 if(act==='approve'){if(taken(b.rid,b.start,b.end,b.id))return msg('Cannot approve: this time overlaps an approved booking.','bad');b.status='approved';b.reason=rsn||'Approved. Eligibility and time slot were checked.'}
 else if(act==='reject'){if(!rsn)return msg('Add a reason so the user understands the decision.','bad');b.status='rejected';b.reason=rsn}
 else{b.status='waitlisted';b.reason=rsn||'Placed on the waiting list by the owner.'}
 lg(b,({approve:'Approved',reject:'Rejected',wait:'Waitlisted'})[act]+': '+b.reason);msg('Decision saved and recorded.','ok')}
function promote(rid){const w=S.b.filter(x=>x.rid===rid&&x.status==='waitlisted').sort((a,b)=>a.created<b.created?-1:1).find(x=>!taken(rid,x.start,x.end,x.id));
 if(w){w.status='pending';w.reason='A slot opened up. Waiting for owner review.';S.log.push({t:nowS(),b:w.id,who:'System',text:'Moved from waiting list to pending (first in line).'})}}
function cancel(id){const b=bk(id);b.status='cancelled';b.reason='Cancelled by user.';lg(b,'Cancelled booking.');promote(b.rid);msg('Booking cancelled.','ok')}
function cin(id){const b=bk(id);b.cin={c:$('c'+id).value,n:$('m'+id).value.trim(),t:nowS()};b.status='checkedin';lg(b,'Checked in. Condition: '+b.cin.c+(b.cin.n?' ('+b.cin.n+')':''));msg('Checked in. Condition recorded.','ok')}
function ret(id){const b=bk(id),c=$('c'+id).value,n=$('m'+id).value.trim();b.cout={c,n,t:nowS()};b.status='returned';
 lg(b,'Returned. Condition: '+c+(n?' ('+n+')':''));
 if(CND.indexOf(c)>CND.indexOf(b.cin.c)){const t='Damage report: condition changed from '+b.cin.c+' to '+c+'. Owner review needed.';b.inc.push(t);lg(b,t)}
 if(nowS()>b.end){const t='Delay report: returned after the booked end time ('+fm(b.end)+').';b.inc.push(t);lg(b,t)}
 promote(b.rid);msg('Returned. Final condition recorded.','ok')}
function addRes(){const n=$('rn').value.trim(),l=$('rl').value.trim();if(!n||!l)return msg('Add a name and a location.','bad');
 S.res.push({id:'r'+Date.now(),owner:S.me==='a1'?'o1':S.me,name:n,loc:l,need:$('rt').value.trim(),max:Math.max(1,+$('rh').value||2),rules:$('ru').value.trim()||'No special rules.'});msg('Resource listed.','ok')}
const stBd=s=>'<span class="bd '+({approved:'ok',checkedin:'ok',returned:'ok',pending:'warn',waitlisted:'warn',rejected:'bad',cancelled:'bad'}[s]||'')+'">'+({checkedin:'in use',waitlisted:'waiting list'}[s]||s)+'</span>';
function browse(){const u=me();return '<h2>Find resources</h2><input id="q" placeholder="Search by name or place" value="'+esc(S.q)+'" oninput="S.q=this.value;R(1)" style="width:100%;margin-bottom:12px">'+
 S.res.filter(r=>(r.name+r.loc).toLowerCase().includes(S.q.toLowerCase())).map(r=>{const ok=!r.need||u.trained.includes(r.need);
 return '<div class="card"><h3>'+esc(r.name)+'</h3><div class="mut">'+esc(r.loc)+' · max '+r.max+' h per booking</div><div class="mut">Rules: '+esc(r.rules)+'</div>'+
 '<div style="margin-top:6px">'+(ok?'<span class="bd ok">You are eligible</span>':'<span class="bd bad">Not eligible: needs "'+esc(r.need)+'" training</span>')+(r.need&&ok?' <span class="mut">Training verified: '+esc(r.need)+'</span>':'')+'</div>'+
 '<div class="row"><input type="datetime-local" id="s'+r.id+'" aria-label="Start"><input type="datetime-local" id="e'+r.id+'" aria-label="End"><input id="p'+r.id+'" placeholder="Purpose of use"><button class="btn" '+(ok?'':'disabled')+' onclick="reqB(\''+r.id+'\')">Request booking</button></div></div>'}).join('')}
function bcard(b,own){const r=rs(b.rid),u=usr(b.uid);
 let h='<div class="card"><h3>'+esc(r.name)+' '+stBd(b.status)+'</h3><div class="mut">'+(own?'':esc(u.name)+' · ')+fm(b.start)+' to '+fm(b.end)+' · '+esc(b.purpose)+'</div>';
 if(b.reason)h+='<div class="why"><b>Why:</b> '+esc(b.reason)+'</div>';
 b.inc.forEach(i=>h+='<div class="inc">'+esc(i)+'</div>');
 if(b.cin)h+='<div class="mut">Before use: '+b.cin.c+(b.cin.n?' · '+esc(b.cin.n):'')+'</div>';
 if(b.cout)h+='<div class="mut">After use: '+b.cout.c+(b.cout.n?' · '+esc(b.cout.n):'')+'</div>';
 const co='<select id="c'+b.id+'">'+CND.map(c=>'<option>'+c+'</option>').join('')+'</select><input id="m'+b.id+'" placeholder="Condition note">';
 if(own){
  if(b.status==='approved')h+='<div class="row">'+co+'<button class="btn" onclick="cin(\''+b.id+'\')">Check in</button></div>';
  if(b.status==='checkedin')h+='<div class="row">'+co+'<button class="btn" onclick="ret(\''+b.id+'\')">Return</button></div>';
  if(['pending','approved','waitlisted'].includes(b.status))h+='<div class="row"><button class="btn alt" onclick="cancel(\''+b.id+'\')">Cancel booking</button></div>';
 }else if(['pending','waitlisted'].includes(b.status))h+='<div class="row"><input id="n'+b.id+'" placeholder="Reason (needed to reject)"><button class="btn" onclick="decide(\''+b.id+'\',\'approve\')">Approve</button><button class="btn alt" onclick="decide(\''+b.id+'\',\'wait\')">Waiting list</button><button class="btn red" onclick="decide(\''+b.id+'\',\'reject\')">Reject</button></div>';
 return h+'</div>'}
const mine=()=>{const l=S.b.filter(b=>b.uid===S.me);return '<h2>My bookings</h2>'+(l.length?l.slice().reverse().map(b=>bcard(b,1)).join(''):'<p class="mut">No bookings yet. Open Find resources and request one.</p>')};
const mineRes=()=>S.res.filter(r=>S.me==='a1'||r.owner===S.me).map(r=>r.id);
const reqs=()=>{const ids=mineRes(),l=S.b.filter(b=>ids.includes(b.rid)).sort((a,b)=>(['pending','waitlisted'].includes(b.status)?1:0)-(['pending','waitlisted'].includes(a.status)?1:0));
 return '<h2>Booking requests</h2>'+(l.length?l.map(b=>bcard(b,0)).join(''):'<p class="mut">No requests yet.</p>')};
const resv=()=>'<h2>Your resources</h2>'+S.res.filter(r=>mineRes().includes(r.id)).map(r=>'<div class="card"><h3>'+esc(r.name)+'</h3><div class="mut">'+esc(r.loc)+' · max '+r.max+' h · '+(r.need?'needs "'+esc(r.need)+'" training':'no training needed')+'</div><div class="mut">Rules: '+esc(r.rules)+'</div></div>').join('')+
 '<div class="card"><h3>List a new resource</h3><div class="row"><input id="rn" placeholder="Name"><input id="rl" placeholder="Location"><input id="rt" placeholder="Training needed (optional)"><input id="rh" type="number" min="1" placeholder="Max hours"><input id="ru" placeholder="Usage rules"><button class="btn" onclick="addRes()">List resource</button></div></div>';
const hist=()=>{const ids=isStu()?null:mineRes(),l=S.b.filter(b=>isStu()?b.uid===S.me:ids.includes(b.rid));
 return '<h2>History and incidents</h2><p class="mut">Every approval, check-in, return and report is recorded here.</p>'+(l.length?l.slice().reverse().map(b=>'<div class="card"><h3>'+esc(rs(b.rid).name)+' '+stBd(b.status)+'</h3><div class="mut">'+esc(usr(b.uid).name)+' · '+fm(b.start)+' to '+fm(b.end)+'</div>'+b.inc.map(i=>'<div class="inc">'+esc(i)+'</div>').join('')+'<ol class="tl">'+S.log.filter(x=>x.b===b.id).map(x=>'<li>'+fm(x.t)+' · '+esc(x.who)+': '+esc(x.text)+'</li>').join('')+'</ol></div>').join(''):'<p class="mut">Nothing recorded yet.</p>')};
function R(keep){$('who').innerHTML=U.map(u=>'<option value="'+u.id+'"'+(u.id===S.me?' selected':'')+'>'+esc(u.name)+' ('+u.role+')</option>').join('');
 const T=isStu()?[['browse','Find resources'],['mine','My bookings'],['hist','History']]:[['req','Requests'],['res','Resources'],['hist','History and incidents']];
 if(!T.some(t=>t[0]===S.tab))S.tab=T[0][0];
 const v={browse,mine,req:reqs,res:resv,hist}[S.tab]();
 const html=(S.msg?'<div class="msg '+S.msg.k+'" role="status">'+esc(S.msg.t)+'</div>':'')+'<nav>'+T.map(t=>'<button class="'+(t[0]===S.tab?'on':'')+'" onclick="tab(\''+t[0]+'\')">'+t[1]+'</button>').join('')+'</nav>'+v;
 if(keep){const q=$('q'),p=q.selectionStart;$('app').innerHTML=html;const n=$('q');n.focus();n.setSelectionRange(p,p)}else $('app').innerHTML=html}
R();
