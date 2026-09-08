"use client";
import { useEffect, useState } from "react";

type Version={id:string;version:number;content:string|null;createdAt:string};
export default function DocumentEditor({document}:{document:{id:string;title:string;content:string|null;updatedAt:string|Date}}){
 const [content,setContent]=useState(document.content||""); const [versions,setVersions]=useState<Version[]>([]); const [status,setStatus]=useState("");
 async function loadVersions(){const r=await fetch(`/api/documents/${document.id}/versions`);if(r.ok){const d=await r.json();setVersions(d.versions||[]);}}
 useEffect(()=>{loadVersions()},[]);
 async function save(){setStatus("Saving version...");const r=await fetch(`/api/documents/${document.id}/versions`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content})});const d=await r.json().catch(()=>({}));if(!r.ok){setStatus(d.error||"Unable to save.");return;}setStatus(`Saved as version ${d.version.version}.`);loadVersions();}
 return <div className="editor-layout"><section className="card"><div className="card-title"><h2>Draft</h2><button className="primary-button" onClick={save}>Save version</button></div><textarea className="draft-editor" value={content} onChange={e=>setContent(e.target.value)} rows={28}/>{status&&<p className="form-status" role="status">{status}</p>}</section><aside className="card"><div className="card-title"><h2>Version history</h2></div>{versions.length?<div className="version-list">{versions.map(v=><button className="version-item" key={v.id} onClick={()=>setContent(v.content||"")}><strong>Version {v.version}</strong><span>{new Date(v.createdAt).toLocaleString()}</span></button>)}</div>:<div className="empty-state"><p>No saved versions yet.</p></div>}<p className="disclaimer">Selecting a version loads its content into the editor. Save it as a new version if you want to keep changes.</p></aside></div>;
}
