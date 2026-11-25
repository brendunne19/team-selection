import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { AlertTriangle, ArrowDownUp, BadgeCheck, CalendarDays, Check, ChevronDown, ChevronRight, Clipboard, ClipboardCheck, Cloud, GripVertical, Info, Search, ShieldAlert, Users, X } from 'lucide-react';
import { initialPlayers, initialTeams } from './data';
import './style.css';

function PlayerCard({ player, assignedTeam, compact = false, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: player.id, disabled: !player.available });
  const style = { transform: CSS.Transform.toString(transform), opacity: isDragging ? 0.35 : undefined };
  return <div ref={setNodeRef} style={style} className={`player-card ${!player.available ? 'unavailable' : ''} ${player.injured ? 'injured' : ''} ${compact ? 'compact' : ''}`} {...attributes} {...listeners}>
    <GripVertical size={13} className="grip" />
    <div className="player-main"><div className="player-name">{player.name.trim()}{!player.available && <span className="status-tag">Unavailable</span>}</div><div className="player-meta"><span className="grade">{player.grade}</span><span>{player.rating} ELO</span>{player.minTeam <= 4 && <span className="nomination">Nom. T{player.minTeam}</span>}</div></div>
    {player.injured && <span className="injury"><AlertTriangle size={12}/> Injured</span>}
    {assignedTeam && <span className="assigned-chip">T{assignedTeam}</span>}
    {onRemove && <button className="remove" title="Return to pool" onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onRemove(); }}><X size={14}/></button>}
  </div>;
}

function DropZone({ id, children, className = '' }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return <div ref={setNodeRef} className={`${className} ${isOver ? 'drag-over' : ''}`}>{children}</div>;
}

function App() {
  const [players] = useState(initialPlayers);
  const [teams, setTeams] = useState(() => {
    try { return JSON.parse(localStorage.getItem('county-selection-board-v1')) || initialTeams; } catch { return initialTeams; }
  });
  const [filter, setFilter] = useState('');
  const [sortHigh, setSortHigh] = useState(true);
  const [activeGender, setActiveGender] = useState('M');
  const [copied, setCopied] = useState('');
  const [notice, setNotice] = useState('');
  const [lineup, setLineup] = useState(null);
  const [showUnavailable, setShowUnavailable] = useState(true);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  useEffect(() => { localStorage.setItem('county-selection-board-v1', JSON.stringify(teams)); }, [teams]);
  const assignments = useMemo(() => Object.fromEntries(teams.flatMap(t => [...t.men.map(id => [id, t.rank]), ...t.women.map(id => [id, t.rank])])), [teams]);
  const pool = (gender) => players.filter(p => p.gender === gender && !assignments[p.id] && (showUnavailable || p.available) && p.name.toLowerCase().includes(filter.toLowerCase())).sort((a,b) => (sortHigh ? b.rating-a.rating : a.rating-b.rating));
  const assignedPlayers = (team, gender) => team[gender === 'M' ? 'men' : 'women'].map(id => players.find(p => p.id === id)).filter(Boolean);
  const alertFor = (team, gender) => {
    const count = team[gender === 'M' ? 'men' : 'women'].length;
    if (count < 5) return { type: 'depth', label: 'Needs depth', detail: `${5-count} more ${gender === 'M' ? 'men' : 'women'} recommended` };
    if (count > 6) return { type: 'over', label: 'Over selected', detail: `${count} ${gender === 'M' ? 'men' : 'women'} selected` };
    return null;
  };
  const remove = (playerId) => setTeams(current => current.map(t => ({ ...t, men: t.men.filter(id => id !== playerId), women: t.women.filter(id => id !== playerId) })));
  const addFromPool = (team, gender) => {
    const candidate = pool(gender).find(p => p.available);
    if (!candidate) { setNotice(`No available ${gender === 'M' ? 'men' : 'women'} in the player pool.`); return; }
    const key = gender === 'M' ? 'men' : 'women';
    if (team[key].length >= 7) { setNotice(`Team ${team.rank} already has the maximum of 7 ${gender === 'M' ? 'men' : 'women'}.`); return; }
    setTeams(current => current.map(t => t.id === team.id ? { ...t, [key]: [...t[key], candidate.id] } : t));
    setNotice(candidate.minTeam < team.rank ? `${candidate.name.trim()} is nominated for Team ${candidate.minTeam}; Team ${team.rank} is below that nomination.` : `${candidate.name.trim()} added to Team ${team.rank}.`);
  };
  function onDragEnd({ active, over }) {
    if (!over) return;
    const player = players.find(p => p.id === active.id); if (!player || !player.available) return;
    const destination = String(over.id);
    const next = teams.map(t => ({ ...t, men: t.men.filter(id => id !== player.id), women: t.women.filter(id => id !== player.id) }));
    if (destination === 'pool-M' || destination === 'pool-F' || destination === 'reserves') { setTeams(next); setNotice(`${player.name.trim()} returned to the player pool.`); return; }
    const match = destination.match(/^team-(\d+)-(M|F)$/); if (!match) return;
    const [, rankText, gender] = match; const rank = Number(rankText); const target = next.find(t => t.rank === rank);
    if (!target || player.gender !== gender) { setNotice(`That slot is for ${gender === 'M' ? 'men' : 'women'} players.`); return; }
    const key = gender === 'M' ? 'men' : 'women';
    if (target[key].length >= 7) { setNotice(`Team ${rank} already has the maximum of 7 ${gender === 'M' ? 'men' : 'women'}.`); return; }
    target[key].push(player.id); setTeams(next);
    setNotice(player.minTeam < rank ? `${player.name.trim()} is nominated for Team ${player.minTeam}; Team ${rank} is below that nomination.` : `${player.name.trim()} added to Team ${rank}.`);
  }
  async function copySquad(team) {
    const list = [...assignedPlayers(team, 'M'), ...assignedPlayers(team, 'F')];
    const message = `🏸 ${team.name}\n📅 ${team.date} • ${team.venue}\n\n${list.length ? list.map(p => `${p.gender === 'M' ? '👨' : '👩'} ${p.name.trim()} (${p.grade} • ${p.rating})`).join('\n') : 'Squad to be confirmed'}`;
    try { await navigator.clipboard.writeText(message); setCopied(team.id); setTimeout(() => setCopied(''), 1800); } catch { setNotice(message); }
  }

  return <DndContext sensors={sensors} onDragEnd={onDragEnd}>
    <div className="app-shell">
      <header className="topbar"><a className="brand" href="#"><div className="brand-mark">C<span>+</span></div><div><strong>COUNTY<span className="brand-light"> / SELECTION</span></strong><small>PLAYER MANAGEMENT</small></div></a><div className="season"><span className="live-dot"/>2025 / 26 SEASON <ChevronDown size={13}/></div><div className="top-actions"><button className="top-btn" onClick={() => { localStorage.setItem('county-selection-board-v1', JSON.stringify(teams)); setNotice('Board saved in this browser.'); }}><Cloud size={15}/> Save board</button><div className="avatar">BD</div><span className="user-label">Brendan<br/><small>Administrator</small></span></div></header>
      <main>
        <div className="page-heading"><div><div className="eyebrow">COUNTY BADMINTON ASSOCIATION <span>/</span> SELECTION CENTER</div><h1>Selection board <span className="season-tag">WEEK 08</span></h1><p>Build your squads. Balance your teams. Make the call.</p></div><button className="fixture-filter"><CalendarDays size={16}/><span>All fixtures <small>14 – 15 Nov 2025</small></span><ChevronDown size={15}/></button></div>
        <div className="summary-row"><div className="summary-card"><div className="summary-icon purple"><Users size={18}/></div><div><small>AVAILABLE PLAYERS</small><strong>{players.filter(p=>p.available).length} <em>/ {players.length}</em></strong></div></div><div className="summary-card"><div className="summary-icon green"><BadgeCheck size={18}/></div><div><small>SQUADS IN PROGRESS</small><strong>{teams.filter(t=>t.men.length+t.women.length>0).length} <em>/ {teams.length} teams</em></strong></div></div><div className="summary-card"><div className="summary-icon amber"><ShieldAlert size={18}/></div><div><small>SELECTION FLAGS</small><strong>{teams.reduce((n,t)=> n + (t.men.some(id=>players.find(p=>p.id===id)?.minTeam<t.rank)?1:0) + (t.women.some(id=>players.find(p=>p.id===id)?.minTeam<t.rank)?1:0),0)} <em>to review</em></strong></div></div><div className="summary-note"><Info size={16}/><span>Drag a player onto a team slot to assign.<br/>Click <b>×</b> to return them to the pool.</span></div></div>
        <div className="board-label-row"><div><h2>Team squads <span>{teams.length}</span></h2><small>Drag to move players between squads</small></div><div className="board-actions"><div className="searchbox"><Search size={15}/><input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Find a player..."/></div><button className="outline-btn" onClick={()=>setShowUnavailable(!showUnavailable)}>{showUnavailable ? 'Hide unavailable' : 'Show unavailable'}</button></div></div>
        <div className="board"><aside className="pool-panel">
          <div className="pool-head"><div><span className="section-kicker">ROSTER</span><h3>Player pool <span>{pool('M').length+pool('F').length}</span></h3></div><button className="sort-btn" onClick={()=>setSortHigh(!sortHigh)}><ArrowDownUp size={14}/>{sortHigh ? 'Rating' : 'Lowest'}</button></div>
          <div className="gender-switch"><button className={activeGender==='M'?'selected':''} onClick={()=>setActiveGender('M')}>Men <span>{pool('M').length}</span></button><button className={activeGender==='F'?'selected':''} onClick={()=>setActiveGender('F')}>Women <span>{pool('F').length}</span></button></div>
          <DropZone id={`pool-${activeGender}`} className="pool-list"><div className="pool-caption">{activeGender==='M'?'MEN':'WOMEN'} <span>RATED HIGH → LOW</span></div>{pool(activeGender).map(p=><PlayerCard key={p.id} player={p} assignedTeam={assignments[p.id]}/>)}{pool(activeGender).length===0&&<div className="empty-pool">Everyone is on a team</div>}</DropZone>
          <div className="pool-legend"><span className="legend-dot orange"/> Injured <span className="legend-dot grey"/> Unavailable <span className="legend-dot red"/> Nomination warning</div>
        </aside>
        <section className="teams-viewport"><div className="teams-row">{teams.map(team=>{
          const menWarning=alertFor(team,'M'), womenWarning=alertFor(team,'F');
          return <article className="team-card" key={team.id}><div className="team-head"><div className="team-title-row"><span className="team-number">{String(team.rank).padStart(2,'0')}</span><div><h3>{team.name}</h3><small><CalendarDays size={12}/>{team.date}<i>·</i>{team.venue}</small></div><button className="more-btn" onClick={()=>setLineup(team)} title="Lineup sandbox">•••</button></div><div className="team-tools"><span className="squad-count"><b>{team.men.length+team.women.length}</b> / 10 selected</span><button className="copy-btn" onClick={()=>copySquad(team)}>{copied===team.id?<ClipboardCheck size={13}/>:<Clipboard size={13}/>} {copied===team.id?'Copied':'Copy squad'}</button></div></div>
            <div className="columns"><div className="gender-column"><div className="column-head"><span className="gender-icon men-icon">M</span><b>MEN</b><span>{team.men.length}/5</span>{menWarning&&<span className={`warning-mini ${menWarning.type}`}>!</span>}</div><DropZone id={`team-${team.rank}-M`} className="slots">{Array.from({length:Math.max(5,team.men.length)}).map((_,i)=>{const p=players.find(x=>x.id===team.men[i]);return <div key={i} className="slot-wrap">{p?<PlayerCard player={p} compact onRemove={()=>remove(p.id)}/>:<button className="empty-slot" onClick={()=>addFromPool(team,'M')}><span>{i+1}</span><small>Click or drop player</small><ChevronRight size={13}/></button>}</div>})}</DropZone>{menWarning&&<div className={`team-alert ${menWarning.type}`}><AlertTriangle size={13}/><span><b>{menWarning.label}</b><small>{menWarning.detail}</small></span></div>}</div>
              <div className="gender-column"><div className="column-head"><span className="gender-icon women-icon">W</span><b>WOMEN</b><span>{team.women.length}/5</span>{womenWarning&&<span className={`warning-mini ${womenWarning.type}`}>!</span>}</div><DropZone id={`team-${team.rank}-F`} className="slots">{Array.from({length:Math.max(5,team.women.length)}).map((_,i)=>{const p=players.find(x=>x.id===team.women[i]);return <div key={i} className="slot-wrap">{p?<PlayerCard player={p} compact onRemove={()=>remove(p.id)}/>:<button className="empty-slot" onClick={()=>addFromPool(team,'F')}><span>{i+1}</span><small>Click or drop player</small><ChevronRight size={13}/></button>}</div>})}</DropZone>{womenWarning&&<div className={`team-alert ${womenWarning.type}`}><AlertTriangle size={13}/><span><b>{womenWarning.label}</b><small>{womenWarning.detail}</small></span></div>}</div></div>
            <button className="lineup-link" onClick={()=>setLineup(team)}><ChevronDown size={14}/> Lineup sandbox <span>Coming soon</span></button>
          </article>;
        })}</div></section></div>
        <div className="reserve-bar"><div className="reserve-title"><span className="reserve-icon">↗</span><div><b>RESERVES</b><small>Unassigned players</small></div></div><DropZone id="reserves" className="reserve-drop">Drag a player here to return them to the pool</DropZone><div className="reserve-totals"><span>MEN <b>{pool('M').length}</b></span><span>WOMEN <b>{pool('F').length}</b></span></div></div>
        <div className="footer-note"><span><span className="live-dot"/> Changes are saved in this browser</span><span>Selection board <i>·</i> Week 08 <i>·</i> Data last updated 12 Nov 2025</span></div>
      </main>
      {notice&&<div className="toast"><Info size={15}/><span>{notice}</span><button onClick={()=>setNotice('')}><X size={15}/></button></div>}
      {lineup&&<div className="modal-backdrop" onClick={()=>setLineup(null)}><aside className="lineup-drawer" onClick={e=>e.stopPropagation()}><div className="drawer-head"><div><span className="section-kicker">CAPTAIN TOOLS</span><h2>{lineup.name}</h2><small>{lineup.date} · {lineup.venue}</small></div><button className="close-btn" onClick={()=>setLineup(null)}><X/></button></div><p className="drawer-copy">Lineup sandbox <span>Preview only</span></p><p className="drawer-hint">Select players from this squad to sketch the match card. Lineup changes don’t affect your selected squad.</p><div className="match-list">{['MS 1','MS 2','WS 1','WS 2','MD 1','MD 2','WD 1','WD 2','XD 1','XD 2','XD 3'].map((format,i)=><div className="match-row" key={format}><b>{format}</b><span>{i<2?assignedPlayers(lineup,'M').filter((_,n)=>n===i).map(p=>p.name.trim()).join(' + ')||'Choose a player':i<4?assignedPlayers(lineup,'F').filter((_,n)=>n===i-2).map(p=>p.name.trim()).join(' + ')||'Choose a player':'Select pair from squad'}</span><ChevronDown size={14}/></div>)}</div><button className="drawer-done" onClick={()=>setLineup(null)}>Done</button></aside></div>}
    </div>
  </DndContext>;
}

createRoot(document.getElementById('root')).render(<App/>);
