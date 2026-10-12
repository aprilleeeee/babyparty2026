import { supabase } from "./supabase.js";
const $=id=>document.getElementById(id);let all=[];
async function start(){
 const {data:{session}}=await supabase.auth.getSession();
 if(session)show(); 
}
function show(){ $("login-card").classList.add("hidden");$("dashboard").classList.remove("hidden");refresh();}
$("login-form").addEventListener("submit",async e=>{e.preventDefault();const {error}=await supabase.auth.signInWithPassword({email:$("email").value,password:$("password").value});if(error)$("login-error").textContent=error.message;else show();});
$("logout").onclick=()=>supabase.auth.signOut().then(()=>location.reload());
$("refresh").onclick=refresh;$("search").oninput=render;
async function refresh(){
 const [{data:v,error:ve},{data:s,error:se}]=await Promise.all([supabase.from("votes").select("*").order("created_at",{ascending:false}),supabase.from("pool_settings").select("*").eq("id",1).single()]);
 if(ve||se){alert((ve||se).message);return} all=v||[]; $("voting-open").checked=s.voting_open;$("revealed").checked=s.revealed;$("actual-gender").value=s.actual_gender||"";render();stats();
}
function stats(){const boy=all.filter(x=>x.gender_vote==="Boy").length,girl=all.length-boy,paid=all.filter(x=>x.paid).length;$("stats").innerHTML=[["Votes",all.length],["Pool","RM"+all.length*10],["Boy / Girl",boy+" / "+girl],["Paid",paid+" / "+all.length]].map(x=>`<div class="stat"><b>${x[1]}</b><span>${x[0]}</span></div>`).join("")}
function render(){const q=($("search").value||"").toLowerCase();const rows=all.filter(x=>(x.voter_name+" "+x.vote_code).toLowerCase().includes(q));$("entries").innerHTML=rows.map(x=>`<tr><td>${x.vote_code}</td><td>${esc(x.voter_name)}</td><td>${x.gender_vote}</td><td><button class="button ${x.paid?"secondary":""}" data-paid="${x.id}" data-value="${!x.paid}">${x.paid?"Paid":"Mark paid"}</button></td><td>${new Date(x.created_at).toLocaleString()}</td><td><button class="button secondary" data-delete="${x.id}">Delete</button></td></tr>`).join("")||"<tr><td colspan='6'>No entries.</td></tr>";}
$("entries").onclick=async e=>{const p=e.target.dataset.paid,d=e.target.dataset.delete;if(p){await supabase.from("votes").update({paid:e.target.dataset.value==="true"}).eq("id",p);refresh()}if(d&&confirm("Delete this vote?")){await supabase.from("votes").delete().eq("id",d);refresh()}};
$("save-settings").onclick=async()=>{const {error}=await supabase.from("pool_settings").update({voting_open:$("voting-open").checked,revealed:$("revealed").checked,actual_gender:$("actual-gender").value||null}).eq("id",1);if(error)alert(error.message);else alert("Settings saved.");};
function esc(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}start();
