const $ = id => document.getElementById(id);
const cfg = window.GSA_CONFIG || {};
let sb, timer, activeRequest = 0;
const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const badge = s => `<span class="badge ${String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g,'-')}">${escapeHTML(s)}</span>`;
const show = id => {for (const name of ['loginView','dashboard','configError']) $(name).hidden = name !== id;};
function displayUser(session) { if (session) { $('signedInAs').textContent = session.user?.email || 'Staff'; show('dashboard'); load(); } else { ++activeRequest; $('rows').innerHTML=''; $('signedInAs').textContent=''; show('loginView'); } }
async function load() {
  if ($('dashboard').hidden) return;
  const request = ++activeRequest;
  $('message').textContent='Loading leads…';
  const term = $('search').value.trim().replace(/[,()%]/g, ' ');
  let query = sb.from('gsa_leads').select('*').order('created_at',{ascending:false}).limit(1000);
  if (term) query = query.or(`parent_name.ilike.%${term}%,child_name.ilike.%${term}%,mobile.ilike.%${term}%,email.ilike.%${term}%`);
  if ($('center').value) query = query.eq('center',$('center').value);
  if ($('status').value) query = query.eq('status',$('status').value);
  if ($('program').value.trim()) query = query.ilike('program',`%${$('program').value.trim().replace(/[%_]/g,'')}%`);
  const {data,error} = await query;
  if (request !== activeRequest || $('dashboard').hidden) return;
  if (error) { $('message').textContent='Unable to load leads: '+error.message; $('rows').innerHTML=''; ['total','newCount','trialCount','convertedCount'].forEach(x=>$(x).textContent='—'); return; }
  const records=data||[];
  $('message').textContent = records.length ? `${records.length} matching lead(s) shown` : 'No matching leads found.';
  $('total').textContent=records.length;
  $('newCount').textContent=records.filter(x=>x.status==='New').length;
  $('trialCount').textContent=records.filter(x=>x.status==='Trial Scheduled').length;
  $('convertedCount').textContent=records.filter(x=>x.status==='Converted').length;
  $('rows').innerHTML=records.map(x=>`<tr><td>${escapeHTML(x.created_at?new Date(x.created_at).toLocaleDateString():'')}</td><td><strong>${escapeHTML(x.parent_name)}</strong></td><td>${escapeHTML(x.child_name)}</td><td>${escapeHTML(x.child_age)}</td><td><a href="tel:${encodeURIComponent(x.mobile||'')}">${escapeHTML(x.mobile)}</a></td><td>${x.email?`<a href="mailto:${encodeURIComponent(x.email)}">${escapeHTML(x.email)}</a>`:''}</td><td>${escapeHTML(x.center)}</td><td>${escapeHTML(x.program)}</td><td>${escapeHTML(x.source)}</td><td>${badge(x.status)}</td><td>${escapeHTML(x.follow_up_date)}</td><td class="notes">${escapeHTML(x.notes)}</td></tr>`).join('');
}
async function start() {
  if (!window.supabase || !cfg.SUPABASE_URL || !cfg.SUPABASE_PUBLISHABLE_KEY || cfg.SUPABASE_URL.includes('YOUR_PROJECT') || cfg.SUPABASE_PUBLISHABLE_KEY.includes('YOUR_PUBLISHABLE_KEY') || /^(sb_secret_|eyJ.*service_role)/.test(cfg.SUPABASE_PUBLISHABLE_KEY)) {show('configError');return;}
  sb=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY);
  $('loginForm').addEventListener('submit', async e => {
    e.preventDefault();$('loginError').textContent='';$('loginBtn').disabled=true;$('loginBtn').textContent='Signing in…';
    const {error}=await sb.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});
    $('loginBtn').disabled=false;$('loginBtn').textContent='Log in';$('password').value='';
    if(error) $('loginError').textContent=error.message;
  });
  $('logout').addEventListener('click', async () => { const {error}=await sb.auth.signOut(); if(error) $('message').textContent='Log out failed: '+error.message; });
  $('refresh').addEventListener('click',load);
  ['search','program'].forEach(id=>$(id).addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(load,350)}));
  ['center','status'].forEach(id=>$(id).addEventListener('change',load));
  sb.auth.onAuthStateChange((_event,session)=>{displayUser(session);});
  const {data,error}=await sb.auth.getSession();
  if(error){show('loginView');$('loginError').textContent=error.message;return;}
  displayUser(data.session);
}
start();
