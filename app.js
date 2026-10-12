import { supabase } from "./supabase.js";
const $=id=>document.getElementById(id);
let settings={voting_open:true,revealed:false,actual_gender:null};
async function load(){
 const {data:s}=await supabase.from("pool_settings").select("*").eq("id",1).single();
 if(s) settings=s;
 $("vote-form").classList.toggle("hidden",!settings.voting_open);
 $("closed").classList.toggle("hidden",settings.voting_open);
 if(!settings.voting_open)$("closed").textContent="Voting is currently closed.";
 const {data}=await supabase.from("votes").select("voter_name,gender_vote,vote_code,created_at").order("created_at",{ascending:false});
 renderLeaderboard(data||[]); renderResults(data||[]);
}
function renderLeaderboard(rows){
 $("leaderboard-list").innerHTML=rows.length?rows.map(r=>`<div class="row"><span>${escapeHtml(r.voter_name)}</span><span class="tag">${r.gender_vote==="Boy"?"👦 Boy":"👧 Girl"}</span></div>`).join(""):"<p>No votes yet.</p>";
}
function renderResults(rows){
 if(settings.revealed&&settings.actual_gender){$("results-content").innerHTML=`<div class="confirmation"><p>The result is...</p><h1>👶 Baby ${settings.actual_gender}!</h1>${breakdown(rows)}</div>`;return}
 $("results-content").innerHTML=breakdown(rows)+"<p class='sub'>The final result will be revealed by the organiser.</p>";
}
function breakdown(rows){
 const boy=rows.filter(r=>r.gender_vote==="Boy").length,girl=rows.length-boy,total=rows.length;
 return `<div class="stats"><div class="stat"><b>${total}</b><span>Total votes</span></div><div class="stat"><b>${boy}</b><span>Boy</span></div><div class="stat"><b>${girl}</b><span>Girl</span></div><div class="stat"><b>RM${total*10}</b><span>Pool (all entries)</span></div></div>`;
}
$("vote-form").addEventListener("submit",async e=>{
 e.preventDefault(); const name=$("name").value.trim(), gender=document.querySelector('input[name="gender"]:checked')?.value;
 if(!name||!gender)return;
 const {data,error}=await supabase.rpc("submit_vote",{p_name:name,p_gender:gender});
 if(error){alert(error.message);return}
 $("vote-form").reset();$("confirmation").classList.remove("hidden");$("confirmation").innerHTML=`<p>Thank you, ${escapeHtml(name)}!</p><p>Your unique Vote ID:</p><strong>${data}</strong><p>Please show this ID to the organiser when paying RM10 offline.</p>`;
 load();
});
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
load();
