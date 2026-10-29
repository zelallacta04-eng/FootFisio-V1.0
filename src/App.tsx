import AuthPage from './AuthPage'
import { useState, useEffect } from 'react'

// ─── Types ─────────────────────────────────────────────────────────────────

type Page = 'login' | 'inicio' | 'agenda' | 'pacientes' | 'historial' | 'pagos' | 'reportes' | 'usuarios' | 'secuencias' | 'configuracion' | 'arquitectura'
type Role = 'admin' | 'therapist' | 'receptionist'
type EntryRole = 'patient' | Role
type LoginState = 'idle' | 'success' | 'wrong-password' | 'user-not-found' | 'locked'
type AppointmentStatus = 'Atendida' | 'Confirmada' | 'En espera' | 'Cancelada'
type PaymentStatus = 'Pagado' | 'Pendiente' | 'Vencido'
type ActiveStatus = 'Activo' | 'Inactivo'

interface Appointment { id: number; date?: string; time: string; duration: string; patient: string; email?: string; phone?: string; initials: string; color: string; treatment: string; doctor: string; status: AppointmentStatus }
interface Patient { id: number; name: string; initials: string; color: string; age: number; phone: string; email: string; condition: string; doctor: string; status: ActiveStatus; lastVisit: string }
interface Payment { id: number; patient: string; concept: string; amount: number; date: string; status: PaymentStatus; method: string }
interface HistoryEntry { id: number; patient: string; date: string; diagnosis: string; treatment: string; doctor: string; session: number; notes: string }
interface UserRecord { id: number; name: string; initials: string; color: string; role: string; email: string; phone: string; status: ActiveStatus }
interface Sequence { id: number; name: string; sessions: number; duration: string; category: string; exercises: number; status: ActiveStatus }

// ─── Auth ──────────────────────────────────────────────────────────────────

const VALID_CREDENTIALS = [
  { email: 'admin@footfisio.com', password: 'admin123', name: 'Administrador', role: 'admin' as Role },
  { email: 'e.ruiz@footfisio.com', password: 'elena123', name: 'Dra. Elena Ruiz', role: 'therapist' as Role },
  { email: 'd.ortega@footfisio.com', password: 'daniel123', name: 'Dr. Daniel Ortega', role: 'therapist' as Role },
  { email: 'c.lopez@footfisio.com', password: 'carmen123', name: 'Carmen López', role: 'receptionist' as Role },
]

// ─── Initial Data ──────────────────────────────────────────────────────────

const INIT_APPOINTMENTS: Appointment[] = [
  { id:1, time:'09:00', duration:'50 min', patient:'María González', initials:'MG', color:'#d1fae5', treatment:'Rehabilitación de rodilla', doctor:'Dra. Elena Ruiz', status:'Atendida' },
  { id:2, time:'10:30', duration:'50 min', patient:'Carlos Martínez', initials:'CM', color:'#dbeafe', treatment:'Fisioterapia general', doctor:'Dr. Daniel Ortega', status:'Confirmada' },
  { id:3, time:'11:45', duration:'50 min', patient:'Lucía Fernández', initials:'LF', color:'#ede9fe', treatment:'Fisioterapia deportiva', doctor:'Dra. Elena Ruiz', status:'Confirmada' },
  { id:4, time:'14:00', duration:'50 min', patient:'Javier Rodríguez', initials:'JR', color:'#fef3c7', treatment:'Recuperación de hombro', doctor:'Dra. Elena Ruiz', status:'En espera' },
  { id:5, time:'15:30', duration:'50 min', patient:'Ana Pérez', initials:'AP', color:'#fce7f3', treatment:'Artritis de cadera', doctor:'Dr. Daniel Ortega', status:'Confirmada' },
  { id:6, time:'17:00', duration:'30 min', patient:'Pedro Alvarado', initials:'PA', color:'#e0f2fe', treatment:'Electroestimulación', doctor:'Dra. Elena Ruiz', status:'Confirmada' },
]
const INIT_PATIENTS: Patient[] = [
  { id:1, name:'María González', initials:'MG', color:'#d1fae5', age:35, phone:'+34 611 234 567', email:'m.gonzalez@email.com', condition:'Rehabilitación de rodilla', doctor:'Dra. Elena Ruiz', status:'Activo', lastVisit:'30/09/2026' },
  { id:2, name:'Carlos Martínez', initials:'CM', color:'#dbeafe', age:42, phone:'+34 622 345 678', email:'c.martinez@email.com', condition:'Fisioterapia general', doctor:'Dr. Daniel Ortega', status:'Activo', lastVisit:'30/09/2026' },
  { id:3, name:'Lucía Fernández', initials:'LF', color:'#ede9fe', age:28, phone:'+34 633 456 789', email:'l.fernandez@email.com', condition:'Fisioterapia deportiva', doctor:'Dra. Elena Ruiz', status:'Activo', lastVisit:'30/09/2026' },
  { id:4, name:'Javier Rodríguez', initials:'JR', color:'#fef3c7', age:51, phone:'+34 644 567 890', email:'j.rodriguez@email.com', condition:'Recuperación de hombro', doctor:'Dra. Elena Ruiz', status:'Activo', lastVisit:'28/09/2026' },
  { id:5, name:'Ana Pérez', initials:'AP', color:'#fce7f3', age:63, phone:'+34 655 678 901', email:'a.perez@email.com', condition:'Artritis de cadera', doctor:'Dr. Daniel Ortega', status:'Activo', lastVisit:'25/09/2026' },
  { id:6, name:'Pedro Alvarado', initials:'PA', color:'#e0f2fe', age:39, phone:'+34 666 789 012', email:'p.alvarado@email.com', condition:'Electroestimulación lumbar', doctor:'Dra. Elena Ruiz', status:'Inactivo', lastVisit:'10/09/2026' },
]
const INIT_PAYMENTS: Payment[] = [
  { id:1, patient:'María González', concept:'Sesión de fisioterapia × 4', amount:180, date:'30/09/2026', status:'Pagado', method:'Tarjeta' },
  { id:2, patient:'Carlos Martínez', concept:'Evaluación inicial + 2 sesiones', amount:110, date:'30/09/2026', status:'Pendiente', method:'Transferencia' },
  { id:3, patient:'Lucía Fernández', concept:'Bono 10 sesiones deportivas', amount:350, date:'29/09/2026', status:'Pagado', method:'Efectivo' },
  { id:4, patient:'Javier Rodríguez', concept:'Sesión de fisioterapia × 3', amount:135, date:'28/09/2026', status:'Vencido', method:'Efectivo' },
  { id:5, patient:'Ana Pérez', concept:'Tratamiento articular × 5', amount:225, date:'25/09/2026', status:'Pendiente', method:'Tarjeta' },
  { id:6, patient:'Pedro Alvarado', concept:'Electroestimulación × 6', amount:160, date:'10/09/2026', status:'Pagado', method:'Tarjeta' },
]
const INIT_HISTORY: HistoryEntry[] = [
  { id:1, patient:'María González', date:'30/09/2026', diagnosis:'Gonartrosis grado II', treatment:'Terapia manual + ultrasonidos', doctor:'Dra. Elena Ruiz', session:8, notes:'Mejoría notable en rango de movimiento. Continúa con ejercicios en casa.' },
  { id:2, patient:'Carlos Martínez', date:'30/09/2026', diagnosis:'Lumbalgia mecánica', treatment:'Masaje descontracturante + TENS', doctor:'Dr. Daniel Ortega', session:3, notes:'Dolor reducido un 40%. Prescripción de estiramientos diarios.' },
  { id:3, patient:'Lucía Fernández', date:'28/09/2026', diagnosis:'Tendinopatía rotuliana', treatment:'Fisioterapia deportiva + excéntricos', doctor:'Dra. Elena Ruiz', session:5, notes:'Vuelta gradual al deporte en 2 semanas.' },
  { id:4, patient:'Javier Rodríguez', date:'28/09/2026', diagnosis:'Síndrome de manguito rotador', treatment:'Movilización articular + criostasis', doctor:'Dra. Elena Ruiz', session:4, notes:'Persistencia de dolor nocturno. Se evalúa derivación a traumatología.' },
  { id:5, patient:'Ana Pérez', date:'25/09/2026', diagnosis:'Coxartrosis bilateral', treatment:'Hidroterapia + ejercicios pasivos', doctor:'Dr. Daniel Ortega', session:10, notes:'Paciente colaboradora. Se trabaja la marcha y el equilibrio.' },
]
const INIT_USERS: UserRecord[] = [
  { id:1, name:'Elena Ruiz', initials:'ER', color:'#d1fae5', role:'Fisioterapeuta', email:'e.ruiz@footfisio.com', phone:'+34 611 100 200', status:'Activo' },
  { id:2, name:'Daniel Ortega', initials:'DO', color:'#dbeafe', role:'Fisioterapeuta', email:'d.ortega@footfisio.com', phone:'+34 622 200 300', status:'Activo' },
  { id:3, name:'Carmen López', initials:'CL', color:'#fce7f3', role:'Recepcionista', email:'c.lopez@footfisio.com', phone:'+34 633 300 400', status:'Activo' },
  { id:4, name:'Administrador', initials:'AD', color:'#fef3c7', role:'Administrador', email:'admin@footfisio.com', phone:'+34 644 400 500', status:'Activo' },
]
const INIT_SEQUENCES: Sequence[] = [
  { id:1, name:'Protocolo rodilla post-cirugía', sessions:12, duration:'50 min', category:'Rehabilitación', exercises:8, status:'Activo' },
  { id:2, name:'Fisioterapia deportiva intensiva', sessions:8, duration:'60 min', category:'Deportiva', exercises:12, status:'Activo' },
  { id:3, name:'Recuperación de hombro', sessions:10, duration:'45 min', category:'Rehabilitación', exercises:6, status:'Activo' },
  { id:4, name:'Tratamiento lumbar crónico', sessions:16, duration:'40 min', category:'Columna', exercises:9, status:'Activo' },
  { id:5, name:'Electroestimulación muscular', sessions:6, duration:'30 min', category:'Electroterapia', exercises:4, status:'Inactivo' },
]

const AVATAR_COLORS = ['#d1fae5','#dbeafe','#ede9fe','#fce7f3','#fef3c7','#e0f2fe','#fce4d6','#f0fdf4']
function getInitials(name: string) { return name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase() }
let nextId = 100

// ─── Icons ─────────────────────────────────────────────────────────────────

const Ic = {
  Home: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Calendar: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Clipboard: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  Card: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Bar: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  User: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Activity: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Settings: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Heart: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Chevron: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Arrow: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Lock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Mail: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Eye: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  List: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  Shield: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 1l9 4v6c0 5.5-3.8 10.7-9 12C3.8 21.7 3 16.5 3 11V5l9-4z"/></svg>,
  Filter: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
}

// ─── Utilities ─────────────────────────────────────────────────────────────

const PulseLogo = () => (
  <div style={{ width:38, height:38, background:'#2d6a4f', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  </div>
)

function Avatar({ initials, color, size = 36 }: { initials: string; color: string; size?: number }) {
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:size*0.35, fontWeight:700, color:'#1a3d2b' }}>
      {initials}
    </div>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:'white', borderRadius:14, border:'1px solid #e2ebe5', padding:24, ...style }}>{children}</div>
}

function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28 }}>
      <div>
        <h1 style={{ fontFamily:'Instrument Sans', fontSize:24, fontWeight:700, color:'#162d20', margin:0, letterSpacing:'-0.5px' }}>{title}</h1>
        {sub && <p style={{ fontSize:14, color:'#6b8c78', marginTop:4, margin:'4px 0 0' }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}

function StatCard({ icon, label, value, sub, iconBg }: { icon: React.ReactNode; label: string; value: string; sub: string; iconBg: string }) {
  return (
    <div className="stat-card" style={{ background:'white', borderRadius:14, border:'1px solid #e2ebe5', padding:'20px 22px' }}>
      <div style={{ width:44, height:44, borderRadius:12, background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, color:'#2d6a4f' }}>{icon}</div>
      <div style={{ fontSize:13, color:'#6b8c78', marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:'Instrument Sans', fontSize:34, fontWeight:700, color:'#162d20', lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:12, color:'#9ca3af', marginTop:8, display:'flex', alignItems:'center', gap:4 }}>
        <span style={{ width:6, height:6, borderRadius:'50%', background:'#52b788', display:'inline-block' }}/>{sub}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    'Atendida':'badge-atendida','Confirmada':'badge-confirmada','En espera':'badge-espera',
    'Cancelada':'badge-cancelada','Pagado':'badge-pagado','Pendiente':'badge-pendiente',
    'Vencido':'badge-vencido','Activo':'badge-activo','Inactivo':'badge-inactivo'
  }
  return <span className={cls[status] || 'badge-confirmada'}>{status}</span>
}

// ─── Access Denied ─────────────────────────────────────────────────────────

function AccessDenied() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:400, gap:16, textAlign:'center' }}>
      <div style={{ width:72, height:72, borderRadius:'50%', background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center', color:'#ef4444' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <div>
        <h3 style={{ fontFamily:'Instrument Sans', fontSize:20, fontWeight:700, color:'#162d20', margin:'0 0 8px' }}>Acceso restringido</h3>
        <p style={{ fontSize:14, color:'#6b8c78', margin:0, maxWidth:340 }}>Esta sección es exclusiva para administradores. Contacta con tu administrador si necesitas acceso.</p>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:6, background:'#fef3c7', border:'1px solid #fde68a', borderRadius:8, padding:'8px 16px', fontSize:13, color:'#92400e', fontWeight:500 }}>
        <Ic.Shield /> Solo administradores
      </div>
    </div>
  )
}

// ─── Modal ─────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(22,45,32,0.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(2px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background:'white', borderRadius:18, padding:'28px 32px', width:`min(${wide ? 700 : 520}px, 95vw)`, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(22,45,32,0.25)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <h3 style={{ fontFamily:'Instrument Sans', fontSize:19, fontWeight:700, color:'#162d20', margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:'none', background:'#f0f4f1', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#6b8c78' }}><Ic.X /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#2d3748', marginBottom:6 }}>{label}</label>
      {children}
    </div>
  )
}

function FormRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>{children}</div>
}

function ModalActions({ onClose, onSave, saveLabel = 'Guardar' }: { onClose: () => void; onSave: () => void; saveLabel?: string }) {
  return (
    <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:24 }}>
      <button className="btn-secondary" onClick={onClose}>Cancelar</button>
      <button className="btn-primary" onClick={onSave}>{saveLabel}</button>
    </div>
  )
}

// ─── Appointment Form ──────────────────────────────────────────────────────

function AppointmentForm({ initial, patientNames, onSave, onClose }: {
  initial?: Partial<Appointment>; patientNames: string[]; onSave: (a: Appointment) => void; onClose: () => void
}) {
  const [form, setForm] = useState({
    date: initial?.date ?? new Date().toISOString().slice(0, 10),
    time: initial?.time ?? '09:00', duration: initial?.duration ?? '50 min',
    patient: initial?.patient ?? '', treatment: initial?.treatment ?? '',
    doctor: initial?.doctor ?? 'Dra. Elena Ruiz', status: initial?.status ?? 'Confirmada' as AppointmentStatus,
  })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const handleSave = () => {
    if (!form.patient || !form.treatment) return
    const name = form.patient
    onSave({ id: initial?.id ?? ++nextId, ...form, email:initial?.email, phone:initial?.phone, status: form.status as AppointmentStatus, initials: getInitials(name), color: initial?.color ?? AVATAR_COLORS[nextId % AVATAR_COLORS.length] })
    onClose()
  }
  return (
    <>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <FormRow>
          <FormField label="Fecha"><input type="date" value={form.date} onChange={e => set('date', e.target.value)} /></FormField>
          <FormField label="Hora"><input type="time" value={form.time} onChange={e => set('time', e.target.value)} /></FormField>
        </FormRow>
        <FormRow>
          <FormField label="Duración">
            <select value={form.duration} onChange={e => set('duration', e.target.value)}>
              {['30 min','45 min','50 min','60 min','90 min'].map(d => <option key={d}>{d}</option>)}
            </select>
          </FormField>
          <FormField label="Estado">
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              {(['Confirmada','En espera','Atendida','Cancelada'] as AppointmentStatus[]).map(s => <option key={s}>{s}</option>)}
            </select>
          </FormField>
        </FormRow>
        <FormField label="Paciente">
          <select value={form.patient} onChange={e => set('patient', e.target.value)}>
            <option value="">Seleccionar paciente...</option>
            {patientNames.map(n => <option key={n}>{n}</option>)}
          </select>
        </FormField>
        <FormField label="Tratamiento"><input type="text" value={form.treatment} onChange={e => set('treatment', e.target.value)} placeholder="Ej. Fisioterapia general" /></FormField>
        <FormField label="Especialista">
          <select value={form.doctor} onChange={e => set('doctor', e.target.value)}>
            {['Dra. Elena Ruiz','Dr. Daniel Ortega'].map(d => <option key={d}>{d}</option>)}
          </select>
        </FormField>
      </div>
      <ModalActions onClose={onClose} onSave={handleSave} saveLabel={initial?.id ? 'Actualizar cita' : 'Crear cita'} />
    </>
  )
}

// ─── Patient Form ──────────────────────────────────────────────────────────

function PatientForm({ initial, onSave, onClose }: {
  initial?: Partial<Patient>; onSave: (p: Patient) => void; onClose: () => void
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '', age: String(initial?.age ?? ''), phone: initial?.phone ?? '',
    email: initial?.email ?? '', condition: initial?.condition ?? '',
    doctor: initial?.doctor ?? 'Dra. Elena Ruiz', status: initial?.status ?? 'Activo' as ActiveStatus,
  })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const handleSave = () => {
    if (!form.name || !form.condition) return
    onSave({
      id: initial?.id ?? ++nextId, name: form.name, initials: getInitials(form.name),
      color: initial?.color ?? AVATAR_COLORS[nextId % AVATAR_COLORS.length],
      age: parseInt(form.age) || 0, phone: form.phone, email: form.email,
      condition: form.condition, doctor: form.doctor, status: form.status as ActiveStatus,
      lastVisit: initial?.lastVisit ?? new Date().toLocaleDateString('es-ES'),
    })
    onClose()
  }
  return (
    <>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <FormRow>
          <FormField label="Nombre completo"><input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nombre y apellidos" /></FormField>
          <FormField label="Edad"><input type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="Años" min="0" max="120" /></FormField>
        </FormRow>
        <FormRow>
          <FormField label="Teléfono"><input type="text" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+34 600 000 000" /></FormField>
          <FormField label="Correo electrónico"><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="correo@email.com" /></FormField>
        </FormRow>
        <FormField label="Condición / Motivo de consulta"><input type="text" value={form.condition} onChange={e => set('condition', e.target.value)} placeholder="Ej. Lumbalgia mecánica" /></FormField>
        <FormRow>
          <FormField label="Especialista asignado">
            <select value={form.doctor} onChange={e => set('doctor', e.target.value)}>
              {['Dra. Elena Ruiz','Dr. Daniel Ortega'].map(d => <option key={d}>{d}</option>)}
            </select>
          </FormField>
          <FormField label="Estado">
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              {(['Activo','Inactivo'] as ActiveStatus[]).map(s => <option key={s}>{s}</option>)}
            </select>
          </FormField>
        </FormRow>
      </div>
      <ModalActions onClose={onClose} onSave={handleSave} saveLabel={initial?.id ? 'Actualizar paciente' : 'Registrar paciente'} />
    </>
  )
}

// ─── History Form ──────────────────────────────────────────────────────────

function HistoryForm({ initial, patientNames, onSave, onClose }: {
  initial?: Partial<HistoryEntry>; patientNames: string[]; onSave: (h: HistoryEntry) => void; onClose: () => void
}) {
  const [form, setForm] = useState({
    patient: initial?.patient ?? '', date: initial?.date ?? new Date().toLocaleDateString('es-ES'),
    diagnosis: initial?.diagnosis ?? '', treatment: initial?.treatment ?? '',
    doctor: initial?.doctor ?? 'Dra. Elena Ruiz', session: String(initial?.session ?? '1'),
    notes: initial?.notes ?? '',
  })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const handleSave = () => {
    if (!form.patient || !form.diagnosis) return
    onSave({ id: initial?.id ?? ++nextId, ...form, session: parseInt(form.session) || 1 })
    onClose()
  }
  return (
    <>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <FormRow>
          <FormField label="Paciente">
            <select value={form.patient} onChange={e => set('patient', e.target.value)}>
              <option value="">Seleccionar...</option>
              {patientNames.map(n => <option key={n}>{n}</option>)}
            </select>
          </FormField>
          <FormField label="Fecha"><input type="text" value={form.date} onChange={e => set('date', e.target.value)} placeholder="DD/MM/AAAA" /></FormField>
        </FormRow>
        <FormField label="Diagnóstico"><input type="text" value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} placeholder="Diagnóstico principal" /></FormField>
        <FormField label="Tratamiento aplicado"><input type="text" value={form.treatment} onChange={e => set('treatment', e.target.value)} placeholder="Técnicas y procedimientos" /></FormField>
        <FormRow>
          <FormField label="Especialista">
            <select value={form.doctor} onChange={e => set('doctor', e.target.value)}>
              {['Dra. Elena Ruiz','Dr. Daniel Ortega'].map(d => <option key={d}>{d}</option>)}
            </select>
          </FormField>
          <FormField label="Número de sesión"><input type="number" value={form.session} onChange={e => set('session', e.target.value)} min="1" /></FormField>
        </FormRow>
        <FormField label="Notas clínicas">
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Observaciones, evolución, instrucciones para el paciente..." style={{ resize:'vertical' }} />
        </FormField>
      </div>
      <ModalActions onClose={onClose} onSave={handleSave} saveLabel={initial?.id ? 'Actualizar entrada' : 'Registrar entrada'} />
    </>
  )
}

// ─── Payment Form ──────────────────────────────────────────────────────────

function PaymentForm({ initial, patientNames, onSave, onClose }: {
  initial?: Partial<Payment>; patientNames: string[]; onSave: (p: Payment) => void; onClose: () => void
}) {
  const [form, setForm] = useState({
    patient: initial?.patient ?? '', concept: initial?.concept ?? '',
    amount: String(initial?.amount ?? ''), date: initial?.date ?? new Date().toLocaleDateString('es-ES'),
    status: initial?.status ?? 'Pendiente' as PaymentStatus, method: initial?.method ?? 'Tarjeta',
  })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const handleSave = () => {
    if (!form.patient || !form.concept || !form.amount) return
    onSave({ id: initial?.id ?? ++nextId, ...form, amount: parseFloat(form.amount) || 0, status: form.status as PaymentStatus })
    onClose()
  }
  return (
    <>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <FormField label="Paciente">
          <select value={form.patient} onChange={e => set('patient', e.target.value)}>
            <option value="">Seleccionar paciente...</option>
            {patientNames.map(n => <option key={n}>{n}</option>)}
          </select>
        </FormField>
        <FormField label="Concepto"><input type="text" value={form.concept} onChange={e => set('concept', e.target.value)} placeholder="Ej. Sesión de fisioterapia × 4" /></FormField>
        <FormRow>
          <FormField label="Importe (€)"><input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" min="0" step="0.01" /></FormField>
          <FormField label="Fecha"><input type="text" value={form.date} onChange={e => set('date', e.target.value)} placeholder="DD/MM/AAAA" /></FormField>
        </FormRow>
        <FormRow>
          <FormField label="Método de pago">
            <select value={form.method} onChange={e => set('method', e.target.value)}>
              {['Tarjeta','Efectivo','Transferencia','Bizum'].map(m => <option key={m}>{m}</option>)}
            </select>
          </FormField>
          <FormField label="Estado">
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              {(['Pagado','Pendiente','Vencido'] as PaymentStatus[]).map(s => <option key={s}>{s}</option>)}
            </select>
          </FormField>
        </FormRow>
      </div>
      <ModalActions onClose={onClose} onSave={handleSave} saveLabel={initial?.id ? 'Actualizar pago' : 'Registrar pago'} />
    </>
  )
}

// ─── User Form (admin only) ────────────────────────────────────────────────

function UserForm({ initial, onSave, onClose }: {
  initial?: Partial<UserRecord>; onSave: (u: UserRecord) => void; onClose: () => void
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '', role: initial?.role ?? 'Fisioterapeuta',
    email: initial?.email ?? '', phone: initial?.phone ?? '', status: initial?.status ?? 'Activo' as ActiveStatus,
  })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const handleSave = () => {
    if (!form.name || !form.email) return
    onSave({ id: initial?.id ?? ++nextId, ...form, status: form.status as ActiveStatus, initials: getInitials(form.name), color: initial?.color ?? AVATAR_COLORS[nextId % AVATAR_COLORS.length] })
    onClose()
  }
  return (
    <>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <FormField label="Nombre completo"><input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nombre y apellidos" /></FormField>
        <FormField label="Rol">
          <select value={form.role} onChange={e => set('role', e.target.value)}>
            {['Administrador','Fisioterapeuta','Recepcionista'].map(r => <option key={r}>{r}</option>)}
          </select>
        </FormField>
        <FormRow>
          <FormField label="Correo electrónico"><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="correo@footfisio.com" /></FormField>
          <FormField label="Teléfono"><input type="text" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+34 600 000 000" /></FormField>
        </FormRow>
        <FormField label="Estado">
          <select value={form.status} onChange={e => set('status', e.target.value)}>
            {(['Activo','Inactivo'] as ActiveStatus[]).map(s => <option key={s}>{s}</option>)}
          </select>
        </FormField>
      </div>
      <ModalActions onClose={onClose} onSave={handleSave} saveLabel={initial?.id ? 'Actualizar usuario' : 'Crear usuario'} />
    </>
  )
}

// ─── Sequence Form ─────────────────────────────────────────────────────────

function SequenceForm({ initial, onSave, onClose }: {
  initial?: Partial<Sequence>; onSave: (s: Sequence) => void; onClose: () => void
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '', sessions: String(initial?.sessions ?? '8'),
    duration: initial?.duration ?? '50 min', category: initial?.category ?? 'Rehabilitación',
    exercises: String(initial?.exercises ?? '6'), status: initial?.status ?? 'Activo' as ActiveStatus,
  })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const handleSave = () => {
    if (!form.name) return
    onSave({ id: initial?.id ?? ++nextId, ...form, sessions: parseInt(form.sessions)||8, exercises: parseInt(form.exercises)||6, status: form.status as ActiveStatus })
    onClose()
  }
  return (
    <>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <FormField label="Nombre del protocolo"><input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej. Protocolo rodilla post-cirugía" /></FormField>
        <FormField label="Categoría">
          <select value={form.category} onChange={e => set('category', e.target.value)}>
            {['Rehabilitación','Deportiva','Columna','Electroterapia','Neurológica','Respiratoria'].map(c => <option key={c}>{c}</option>)}
          </select>
        </FormField>
        <FormRow>
          <FormField label="Nº de sesiones"><input type="number" value={form.sessions} onChange={e => set('sessions', e.target.value)} min="1" /></FormField>
          <FormField label="Duración por sesión">
            <select value={form.duration} onChange={e => set('duration', e.target.value)}>
              {['30 min','45 min','50 min','60 min','90 min'].map(d => <option key={d}>{d}</option>)}
            </select>
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Nº de ejercicios"><input type="number" value={form.exercises} onChange={e => set('exercises', e.target.value)} min="1" /></FormField>
          <FormField label="Estado">
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              {(['Activo','Inactivo'] as ActiveStatus[]).map(s => <option key={s}>{s}</option>)}
            </select>
          </FormField>
        </FormRow>
      </div>
      <ModalActions onClose={onClose} onSave={handleSave} saveLabel={initial?.id ? 'Actualizar protocolo' : 'Crear protocolo'} />
    </>
  )
}

// ─── Confirm Delete Modal ──────────────────────────────────────────────────

function ConfirmDelete({ label, onConfirm, onClose }: { label: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal title="Confirmar eliminación" onClose={onClose}>
      <p style={{ fontSize:14, color:'#4a6358', lineHeight:1.6 }}>¿Estás seguro de que deseas eliminar <strong>{label}</strong>? Esta acción no se puede deshacer.</p>
      <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:20 }}>
        <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button onClick={() => { onConfirm(); onClose() }} style={{ padding:'10px 20px', borderRadius:8, border:'none', background:'#ef4444', color:'white', fontFamily:'Inter', fontWeight:600, cursor:'pointer' }}>Eliminar</button>
      </div>
    </Modal>
  )
}

// ─── Action buttons ────────────────────────────────────────────────────────

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div style={{ display:'flex', gap:4 }}>
      <button onClick={onEdit} title="Editar" style={{ width:30, height:30, borderRadius:6, border:'1.5px solid #e2ebe5', background:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#2d6a4f', transition:'all 0.15s' }}><Ic.Edit /></button>
      <button onClick={onDelete} title="Eliminar" style={{ width:30, height:30, borderRadius:6, border:'1.5px solid #fee2e2', background:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#ef4444', transition:'all 0.15s' }}><Ic.Trash /></button>
    </div>
  )
}

// ─── Nav ───────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id:'inicio', label:'Inicio', icon: Ic.Home, roles: ['admin','therapist','receptionist'] },
  { id:'agenda', label:'Agenda', icon: Ic.Calendar, roles: ['admin','therapist','receptionist'] },
  { id:'pacientes', label:'Pacientes', icon: Ic.Users, roles: ['admin','therapist','receptionist'] },
  { id:'historial', label:'Historial clínico', icon: Ic.Clipboard, roles: ['admin','therapist'] },
  { id:'pagos', label:'Pagos', icon: Ic.Card, roles: ['admin','receptionist'] },
  { id:'reportes', label:'Reportes', icon: Ic.Bar, roles: ['admin'], adminOnly: true },
  { id:'usuarios', label:'Usuarios', icon: Ic.User, roles: ['admin'], adminOnly: true },
  { id:'secuencias', label:'Secuencias', icon: Ic.List, roles: ['admin','therapist'] },
  { id:'arquitectura', label:'Arquitectura de software', icon: Ic.Settings, roles: ['admin'], adminOnly: true },
]

function Sidebar({ active, onNav, role }: { active: Page; onNav: (p: Page) => void; role: Role }) {
  const visibleItems = NAV_ITEMS.filter(i => i.roles.includes(role))
  return (
    <aside style={{ width:208, minHeight:'100vh', background:'#162d20', display:'flex', flexDirection:'column', flexShrink:0, position:'fixed', left:0, top:0, bottom:0, zIndex:100 }}>
      <div style={{ padding:'22px 20px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <PulseLogo />
          <div>
            <div style={{ fontFamily:'Instrument Sans', fontSize:18, fontWeight:700, letterSpacing:'-0.4px' }}>
              <span style={{ color:'white' }}>foot</span><span style={{ color:'#52b788' }}>fisio</span>
            </div>
            <div style={{ fontSize:9, color:'#52b788', letterSpacing:'0.12em', textTransform:'uppercase', marginTop:1 }}>Gestión Clínica</div>
          </div>
        </div>
      </div>
      <nav style={{ padding:'16px 0', flex:1 }}>
        <div style={{ fontSize:10, color:'#3a7a5c', letterSpacing:'0.12em', textTransform:'uppercase', padding:'0 18px', marginBottom:8, fontWeight:600 }}>
          Espacio de trabajo
        </div>
        {visibleItems.map(({ id, label, icon: Icon, adminOnly }) => {
          const isActive = active === id
          return (
            <button key={id} onClick={() => onNav(id as Page)} className="nav-item"
              style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 18px', background: isActive ? 'rgba(82,183,136,0.18)' : 'transparent', border:'none', cursor:'pointer', textAlign:'left', color: isActive ? '#74c69d' : '#8ab59a', fontFamily:'Inter', fontSize:13.5, fontWeight: isActive ? 600 : 400, borderLeft: isActive ? '3px solid #52b788' : '3px solid transparent' }}>
              <Icon />
              <span style={{ flex:1 }}>{label}</span>
              {adminOnly && <span style={{ color:'#f59e0b', opacity:0.85 }}><Ic.Shield /></span>}
              {isActive && <span style={{ width:6, height:6, borderRadius:'50%', background:'#52b788', flexShrink:0 }}/>}
            </button>
          )
        })}
      </nav>
      <div style={{ padding:'14px 14px', margin:'0 12px 12px', background:'rgba(82,183,136,0.1)', borderRadius:12, border:'1px solid rgba(82,183,136,0.2)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <div style={{ color:'#52b788' }}><Ic.Heart /></div>
          <span style={{ fontSize:13, fontWeight:600, color:'white' }}>Tu espacio de cuidado</span>
        </div>
        <div style={{ fontSize:11, color:'#74c69d', lineHeight:1.5, marginBottom:6 }}>Todo lo que necesitas para acompañar a tus pacientes.</div>
        {role === 'admin' && (
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#f59e0b', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700 }}>
            <Ic.Shield /> Modo administrador
          </div>
        )}
        {role === 'therapist' && (
          <div style={{ fontSize:10, color:'#52b788', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:600 }}>Modo terapeuta</div>
        )}
        {role === 'receptionist' && (
          <div style={{ fontSize:10, color:'#52b788', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:600 }}>Modo recepción</div>
        )}
      </div>
      <button onClick={() => onNav('configuracion')} className="nav-item"
        style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 18px', width:'100%', background:'transparent', border:'none', borderTop:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', color:'#8ab59a', fontFamily:'Inter', fontSize:13.5 }}>
        <Ic.Settings /><span style={{ flex:1 }}>Configuración</span><span style={{ color:'#3a7a5c' }}><Ic.Chevron /></span>
      </button>
    </aside>
  )
}

// ─── Login ─────────────────────────────────────────────────────────────────

function AccessChoice({ onSelect }: { onSelect: (role: EntryRole) => void }) {
  const options: { role: EntryRole; title: string; description: string; action: string; icon: React.ReactNode; tone: string }[] = [
    { role:'patient', title:'Soy paciente', description:'Solicita una cita sin crear una cuenta ni iniciar sesión.', action:'Agendar mi cita', icon:<Ic.Calendar />, tone:'#d1fae5' },
    { role:'therapist', title:'Soy terapeuta', description:'Consulta tu agenda diaria y modifica tus citas asignadas.', action:'Entrar como terapeuta', icon:<Ic.Activity />, tone:'#dbeafe' },
    { role:'receptionist', title:'Soy recepcionista', description:'Agenda citas usando los datos existentes de los pacientes.', action:'Entrar a recepción', icon:<Ic.Users />, tone:'#fef3c7' },
    { role:'admin', title:'Soy administrador', description:'Accede a todas las áreas, usuarios, reportes y configuración.', action:'Entrar como administrador', icon:<Ic.Shield />, tone:'#ede9fe' },
  ]
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(145deg, #edf4ef 0%, #f8faf8 55%, #e5f0e9 100%)', padding:'40px clamp(24px, 6vw, 80px)', display:'flex', alignItems:'center' }}>
      <div style={{ width:'100%', maxWidth:1080, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:48 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <PulseLogo />
            <div>
              <div style={{ fontFamily:'Instrument Sans', fontSize:22, fontWeight:700, color:'#162d20' }}><span>foot</span><span style={{ color:'#2d6a4f' }}>fisio</span></div>
              <div style={{ fontSize:10, color:'#6b8c78', letterSpacing:'0.12em', textTransform:'uppercase' }}>Gestión clínica</div>
            </div>
          </div>
          <div style={{ fontSize:13, color:'#6b8c78' }}>Clínica FootFisio</div>
        </div>
        <div style={{ maxWidth:620, marginBottom:36 }}>
          <div style={{ color:'#2d6a4f', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:12 }}>Bienvenido</div>
          <h1 style={{ color:'#162d20', fontSize:38, lineHeight:1.15, letterSpacing:'-1px', margin:'0 0 12px' }}>¿Cómo quieres acceder?</h1>
          <p style={{ color:'#6b8c78', fontSize:15, lineHeight:1.7, margin:0 }}>Selecciona tu perfil para mostrarte únicamente las herramientas que necesitas.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap:18 }}>
          {options.map(option => (
            <button key={option.role} onClick={() => onSelect(option.role)} className="access-card"
              style={{ background:'white', border:'1px solid #e2ebe5', borderRadius:16, padding:24, textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:18, fontFamily:'Inter', boxShadow:'0 8px 30px rgba(22,45,32,0.05)' }}>
              <span style={{ width:50, height:50, borderRadius:14, background:option.tone, color:'#2d6a4f', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{option.icon}</span>
              <span style={{ flex:1 }}>
                <span style={{ display:'block', fontFamily:'Instrument Sans', fontSize:18, fontWeight:700, color:'#162d20', marginBottom:5 }}>{option.title}</span>
                <span style={{ display:'block', color:'#6b8c78', fontSize:13, lineHeight:1.5, marginBottom:12 }}>{option.description}</span>
                <span style={{ color:'#2d6a4f', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>{option.action} <Ic.Arrow /></span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function LoginPage({ role, onLogin, onBack }: { role: Role; onLogin: (name: string, role: Role) => void; onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [state, setState] = useState<LoginState>('idle')
  const [attempts, setAttempts] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (attempts >= 3) { setState('locked'); return }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const user = VALID_CREDENTIALS.find(u => u.email === email.toLowerCase().trim() && u.role === role)
      if (!user) { setState('user-not-found'); setAttempts(a => a+1) }
      else if (user.password !== password) {
        const na = attempts + 1; setAttempts(na)
        setState(na >= 3 ? 'locked' : 'wrong-password')
      } else {
        setState('success')
        setTimeout(() => onLogin(user.name, user.role), 1000)
      }
    }, 700)
  }

  const MSGS: Record<LoginState, { type: 'success'|'error'|'warning'|null; title: string; sub: string }> = {
    idle: { type:null, title:'', sub:'' },
    success: { type:'success', title:'¡Acceso exitoso!', sub:'Credenciales verificadas. Redirigiendo a tu panel...' },
    'wrong-password': { type:'error', title:'Contraseña incorrecta', sub:`La contraseña no coincide. Te quedan ${3-attempts} intento${3-attempts===1?'':'s'}.` },
    'user-not-found': { type:'error', title:'Usuario no encontrado', sub:'No existe ninguna cuenta con ese correo electrónico.' },
    locked: { type:'warning', title:'Cuenta bloqueada temporalmente', sub:'Demasiados intentos fallidos. Inténtelo de nuevo en 15 minutos o contacta al administrador.' },
  }
  const msg = MSGS[state]
  const roleInfo = {
    admin: { label:'Administrador', credential:'admin@footfisio.com / admin123' },
    therapist: { label:'Terapeuta', credential:'e.ruiz@footfisio.com / elena123' },
    receptionist: { label:'Recepción', credential:'c.lopez@footfisio.com / carmen123' },
  }[role]

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'linear-gradient(135deg, #162d20 0%, #1a3d2b 60%, #0d1f15 100%)' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px', color:'white', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, opacity:0.06, backgroundImage:'radial-gradient(circle at 20% 50%, #52b788 0%, transparent 55%), radial-gradient(circle at 80% 20%, #74c69d 0%, transparent 40%)' }}/>
        <div style={{ position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:56 }}>
            <PulseLogo />
            <div>
              <div style={{ fontFamily:'Instrument Sans', fontSize:22, fontWeight:700, letterSpacing:'-0.5px' }}><span style={{ color:'white' }}>foot</span><span style={{ color:'#52b788' }}>fisio</span></div>
              <div style={{ fontSize:11, color:'#74c69d', letterSpacing:'0.12em', textTransform:'uppercase', marginTop:1 }}>Gestión Clínica</div>
            </div>
          </div>
          <h1 style={{ fontFamily:'Instrument Sans', fontSize:42, fontWeight:700, lineHeight:1.15, marginBottom:18, letterSpacing:'-1px' }}>
            Cada paso cuenta<br /><span style={{ color:'#52b788' }}>en su recuperación.</span>
          </h1>
          <p style={{ fontSize:16, lineHeight:1.7, color:'#b7e4c7', maxWidth:380, margin:'0 0 56px' }}>
            Organiza tus citas, acompaña a tus pacientes y dedica más tiempo a lo que realmente importa.
          </p>
          <div style={{ display:'flex', gap:48 }}>
            {[{ n:'150+', l:'Pacientes activos' },{ n:'98%', l:'Satisfacción' },{ n:'12', l:'Especialistas' }].map(s => (
              <div key={s.n}>
                <div style={{ fontFamily:'Instrument Sans', fontSize:28, fontWeight:700, color:'#52b788' }}>{s.n}</div>
                <div style={{ fontSize:13, color:'#74c69d', marginTop:2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ width:'min(460px,100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 32px', background:'#f0f4f1' }}>
        <div style={{ width:'100%', maxWidth:400 }}>
          <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:7, background:'none', border:'none', padding:0, marginBottom:26, color:'#6b8c78', cursor:'pointer', fontFamily:'Inter', fontSize:13, fontWeight:600 }}>
            <span style={{ display:'flex', transform:'rotate(180deg)' }}><Ic.Arrow /></span> Cambiar tipo de acceso
          </button>
          <h2 style={{ fontFamily:'Instrument Sans', fontSize:26, fontWeight:700, color:'#162d20', marginBottom:4, letterSpacing:'-0.5px' }}>Acceso de {roleInfo.label.toLowerCase()}</h2>
          <p style={{ fontSize:14, color:'#6b8c78', marginBottom:28 }}>Introduce tus credenciales para continuar</p>
          {state !== 'idle' && (
            <div style={{ padding:'14px 16px', borderRadius:10, marginBottom:20, display:'flex', alignItems:'flex-start', gap:12, background: msg.type==='success'?'#d1fae5':msg.type==='error'?'#fee2e2':'#fef3c7', border:`1.5px solid ${msg.type==='success'?'#6ee7b7':msg.type==='error'?'#fca5a5':'#fde68a'}` }}>
              <div style={{ width:26, height:26, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background: msg.type==='success'?'#10b981':msg.type==='error'?'#ef4444':'#f59e0b', color:'white', marginTop:1 }}>
                {msg.type==='success' ? <Ic.Check /> : <Ic.X />}
              </div>
              <div>
                <div style={{ fontWeight:600, fontSize:14, color: msg.type==='success'?'#065f46':msg.type==='error'?'#991b1b':'#92400e' }}>{msg.title}</div>
                <div style={{ fontSize:13, marginTop:3, color: msg.type==='success'?'#047857':msg.type==='error'?'#b91c1c':'#b45309' }}>{msg.sub}</div>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#2d3748', marginBottom:6 }}>Correo electrónico</label>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }}><Ic.Mail /></div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@footfisio.com" style={{ paddingLeft:40 }} disabled={state==='locked'||state==='success'} required />
              </div>
            </div>
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#2d3748', marginBottom:6 }}>Contraseña</label>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }}><Ic.Lock /></div>
                <input type={showPw?'text':'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ paddingLeft:40, paddingRight:44 }} disabled={state==='locked'||state==='success'} required />
                <button type="button" onClick={() => setShowPw(p=>!p)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:0 }}>
                  {showPw ? <Ic.EyeOff /> : <Ic.Eye />}
                </button>
              </div>
            </div>
            <div style={{ fontSize:12, color:'#6b8c78', background:'#e8f0eb', borderRadius:8, padding:'10px 14px', lineHeight:1.7 }}>
              <strong>Credenciales de {roleInfo.label.toLowerCase()}:</strong><br />{roleInfo.credential}
            </div>
            <button type="submit" className="btn-primary" disabled={loading||state==='locked'||state==='success'} style={{ padding:'13px', fontSize:15, fontWeight:600, opacity:loading?0.7:1 }}>
              {loading ? 'Verificando...' : state==='success' ? '¡Acceso concedido!' : 'Entrar'}
            </button>
          </form>
          <p style={{ textAlign:'center', marginTop:24, fontSize:13, color:'#6b8c78' }}>
            ¿Problemas? <span style={{ color:'#2d6a4f', cursor:'pointer', fontWeight:500 }}>Contacta al administrador</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Public booking ────────────────────────────────────────────────────────

function PublicBooking({ onBack, onBook }: { onBack: () => void; onBook: (appointment: Appointment) => void }) {
  const today = new Date().toISOString().slice(0, 10)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({
    patient:'', email:'', phone:'', date:today, time:'09:00',
    treatment:'Valoración inicial', doctor:'Dra. Elena Ruiz',
  })
  const set = (key: string, value: string) => setForm(current => ({ ...current, [key]: value }))
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const id = ++nextId
    onBook({
      id,
      date:form.date,
      time:form.time,
      duration:'50 min',
      patient:form.patient,
      email:form.email,
      phone:form.phone,
      initials:getInitials(form.patient),
      color:AVATAR_COLORS[id % AVATAR_COLORS.length],
      treatment:form.treatment,
      doctor:form.doctor,
      status:'En espera',
    })
    setSent(true)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f0f4f1', display:'grid', gridTemplateColumns:'minmax(300px, 0.9fr) minmax(480px, 1.1fr)' }}>
      <div style={{ background:'linear-gradient(145deg, #162d20 0%, #24563e 100%)', color:'white', padding:'48px clamp(32px, 6vw, 80px)', display:'flex', flexDirection:'column', justifyContent:'space-between', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', width:360, height:360, borderRadius:'50%', background:'rgba(82,183,136,0.12)', right:-120, bottom:-100 }} />
        <div style={{ position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <PulseLogo />
            <div>
              <div style={{ fontFamily:'Instrument Sans', fontSize:21, fontWeight:700 }}><span>foot</span><span style={{ color:'#52b788' }}>fisio</span></div>
              <div style={{ fontSize:10, color:'#74c69d', letterSpacing:'0.12em', textTransform:'uppercase' }}>Gestión clínica</div>
            </div>
          </div>
        </div>
        <div style={{ position:'relative', maxWidth:440 }}>
          <div style={{ fontSize:11, color:'#74c69d', letterSpacing:'0.14em', textTransform:'uppercase', fontWeight:700, marginBottom:16 }}>Reserva online</div>
          <h1 style={{ fontSize:40, lineHeight:1.12, letterSpacing:'-1px', margin:'0 0 18px' }}>Tu recuperación puede empezar hoy.</h1>
          <p style={{ color:'#b7e4c7', lineHeight:1.7, margin:0 }}>Elige el horario que mejor te venga. Nuestro equipo revisará la solicitud y te confirmará la cita.</p>
          <div style={{ display:'grid', gap:12, marginTop:32 }}>
            {['Sin registro ni contraseña','Confirmación por correo o teléfono','Atención personalizada de 50 minutos'].map(item => (
              <div key={item} style={{ display:'flex', alignItems:'center', gap:10, color:'#d8f3dc', fontSize:14 }}>
                <span style={{ width:24, height:24, borderRadius:'50%', background:'rgba(82,183,136,0.18)', color:'#74c69d', display:'flex', alignItems:'center', justifyContent:'center' }}><Ic.Check /></span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <button onClick={onBack} style={{ position:'relative', width:'fit-content', display:'flex', alignItems:'center', gap:8, border:'none', background:'none', color:'#b7e4c7', padding:0, cursor:'pointer', fontFamily:'Inter', fontWeight:600 }}>
          <span style={{ transform:'rotate(180deg)', display:'flex' }}><Ic.Arrow /></span> Volver al acceso del equipo
        </button>
      </div>
      <div style={{ padding:'48px clamp(32px, 7vw, 96px)', display:'flex', alignItems:'center' }}>
        <div style={{ width:'100%', maxWidth:620, margin:'0 auto' }}>
          {!sent ? (
            <>
              <div style={{ marginBottom:28 }}>
                <h2 style={{ fontSize:28, color:'#162d20', margin:'0 0 6px' }}>Solicita tu cita</h2>
                <p style={{ color:'#6b8c78', fontSize:14, margin:0 }}>Completa tus datos y selecciona una fecha disponible.</p>
              </div>
              <form onSubmit={submit} style={{ background:'white', border:'1px solid #e2ebe5', borderRadius:18, padding:28, boxShadow:'0 18px 50px rgba(22,45,32,0.08)', display:'flex', flexDirection:'column', gap:18 }}>
                <FormField label="Nombre y apellidos">
                  <input type="text" value={form.patient} onChange={e => set('patient', e.target.value)} placeholder="Ej. Laura Sánchez" required />
                </FormField>
                <FormRow>
                  <FormField label="Correo electrónico">
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="tu@correo.com" required />
                  </FormField>
                  <FormField label="Teléfono">
                    <input type="text" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+34 600 000 000" required />
                  </FormField>
                </FormRow>
                <FormRow>
                  <FormField label="Fecha preferida">
                    <input type="date" min={today} value={form.date} onChange={e => set('date', e.target.value)} required />
                  </FormField>
                  <FormField label="Hora preferida">
                    <select value={form.time} onChange={e => set('time', e.target.value)}>
                      {['09:00','10:30','11:45','14:00','15:30','17:00'].map(time => <option key={time}>{time}</option>)}
                    </select>
                  </FormField>
                </FormRow>
                <FormField label="Motivo de la consulta">
                  <select value={form.treatment} onChange={e => set('treatment', e.target.value)}>
                    {['Valoración inicial','Fisioterapia general','Fisioterapia deportiva','Rehabilitación','Terapia manual'].map(item => <option key={item}>{item}</option>)}
                  </select>
                </FormField>
                <FormField label="Terapeuta">
                  <select value={form.doctor} onChange={e => set('doctor', e.target.value)}>
                    {['Dra. Elena Ruiz','Dr. Daniel Ortega'].map(doctor => <option key={doctor}>{doctor}</option>)}
                  </select>
                </FormField>
                <button type="submit" className="btn-primary" style={{ padding:'13px', fontSize:15, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  Solicitar cita <Ic.Arrow />
                </button>
                <p style={{ color:'#6b8c78', fontSize:12, lineHeight:1.6, margin:0, textAlign:'center' }}>La solicitud quedará pendiente hasta que recepción confirme la disponibilidad.</p>
              </form>
            </>
          ) : (
            <div style={{ background:'white', border:'1px solid #e2ebe5', borderRadius:18, padding:40, textAlign:'center', boxShadow:'0 18px 50px rgba(22,45,32,0.08)' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'#d1fae5', color:'#047857', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}><Ic.Check /></div>
              <h2 style={{ fontSize:26, color:'#162d20', margin:'0 0 10px' }}>Solicitud enviada</h2>
              <p style={{ color:'#6b8c78', lineHeight:1.7, margin:'0 0 24px' }}>Gracias, {form.patient}. Hemos reservado provisionalmente el {new Date(`${form.date}T12:00:00`).toLocaleDateString('es-ES')} a las {form.time}. Te contactaremos para confirmarla.</p>
              <button className="btn-primary" onClick={onBack}>Volver al inicio</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Inicio ────────────────────────────────────────────────────────────────

function InicioPag({ appointments, onNav, role }: { appointments: Appointment[]; onNav: (p: Page) => void; role: Role }) {
  const today = new Date().toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })
  const pending = appointments.filter(a => a.status === 'En espera').length
  const confirmed = appointments.filter(a => a.status === 'Confirmada' || a.status === 'En espera').length
  return (
    <div>
      <div style={{ borderRadius:16, background:'linear-gradient(135deg, #1a3d2b 0%, #162d20 100%)', padding:'36px 40px', display:'flex', alignItems:'center', gap:32, marginBottom:32, position:'relative', overflow:'hidden' }}>
        <div style={{ flex:1, position:'relative' }}>
          <div style={{ fontSize:11, color:'#52b788', letterSpacing:'0.14em', textTransform:'uppercase', fontWeight:600, marginBottom:12 }}>• {role === 'therapist' ? 'Tu jornada de hoy' : 'Tu clínica, en movimiento'}</div>
          <h2 style={{ fontFamily:'Instrument Sans', fontSize:32, fontWeight:700, color:'white', margin:'0 0 12px', letterSpacing:'-0.8px', lineHeight:1.2 }}>{role === 'therapist' ? <>Todo preparado para<br />tus pacientes de hoy.</> : <>Cada paso cuenta<br />en su recuperación.</>}</h2>
          <p style={{ fontSize:14, color:'#b7e4c7', margin:'0 0 20px', lineHeight:1.6, maxWidth:380 }}>{role === 'therapist' ? 'Consulta tus próximas sesiones, tratamientos y estados sin perder detalle.' : 'Organiza tus citas, acompaña a tus pacientes y dedica más tiempo a lo que realmente importa.'}</p>
          <button onClick={() => onNav('agenda')} style={{ display:'inline-flex', alignItems:'center', gap:8, color:'white', background:'none', border:'none', cursor:'pointer', fontFamily:'Inter', fontSize:14, fontWeight:600, padding:0 }}>
            Ver agenda de hoy <Ic.Arrow />
          </button>
        </div>
        <div style={{ width:160, height:140, borderRadius:14, overflow:'hidden', flexShrink:0, background:'rgba(82,183,136,0.1)' }}>
          <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=320&h=280&fit=crop&auto=format" alt="Fisioterapeuta" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h3 style={{ fontFamily:'Instrument Sans', fontSize:20, fontWeight:700, color:'#162d20', margin:0 }}>Resumen de hoy</h3>
          <p style={{ fontSize:13, color:'#6b8c78', margin:'4px 0 0' }}>Tu actividad de un vistazo</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#6b8c78' }}>
          <Ic.Calendar />{today.charAt(0).toUpperCase()+today.slice(1)}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16, marginBottom:28 }}>
        <StatCard icon={<Ic.Calendar />} label="Citas programadas" value={String(appointments.length).padStart(2,'0')} sub="Para el día de hoy" iconBg="#e8f5ee" />
        <StatCard icon={<Ic.Users />} label="Citas confirmadas" value={String(confirmed).padStart(2,'0')} sub="Confirmadas hoy" iconBg="#e0f2fe" />
        <StatCard icon={<Ic.Activity />} label="Citas pendientes" value={String(pending).padStart(2,'0')} sub="Por atender hoy" iconBg="#fef3c7" />
        <StatCard icon={<Ic.Card />} label="Atendidas" value={String(appointments.filter(a=>a.status==='Atendida').length).padStart(2,'0')} sub="Completadas hoy" iconBg="#ede9fe" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:20 }}>
        <Card>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <div>
              <h4 style={{ fontFamily:'Instrument Sans', fontWeight:700, fontSize:17, color:'#162d20', margin:0 }}>Próximas citas</h4>
              <p style={{ fontSize:12, color:'#6b8c78', margin:'4px 0 0' }}>Organiza tu jornada sin perder detalle</p>
            </div>
            <button onClick={() => onNav('agenda')} style={{ display:'flex', alignItems:'center', gap:6, color:'#2d6a4f', background:'none', border:'none', cursor:'pointer', fontFamily:'Inter', fontSize:13, fontWeight:600 }}>
              Ver agenda completa <Ic.Arrow />
            </button>
          </div>
          {appointments.slice(0,4).map((a, i) => (
            <div key={a.id} style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 0', borderBottom: i<3 ? '1px solid #f0f4f1' : 'none' }}>
              <div style={{ textAlign:'right', minWidth:44 }}>
                <div style={{ fontFamily:'Instrument Sans', fontSize:14, fontWeight:700, color:'#162d20' }}>{a.time}</div>
                <div style={{ fontSize:11, color:'#9ca3af' }}>{a.duration}</div>
              </div>
              <div style={{ width:3, height:40, background:'#52b788', borderRadius:2, flexShrink:0 }}/>
              <Avatar initials={a.initials} color={a.color} size={34} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:14, color:'#162d20' }}>{a.patient}</div>
                <div style={{ fontSize:12, color:'#6b8c78', marginTop:1 }}>{a.treatment} · {a.doctor}</div>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </Card>
        <Card>
          <h4 style={{ fontFamily:'Instrument Sans', fontWeight:700, fontSize:17, color:'#162d20', margin:'0 0 4px' }}>Accesos rápidos</h4>
          <p style={{ fontSize:12, color:'#6b8c78', margin:'0 0 20px' }}>Lo que necesitas, a un clic</p>
          {(role === 'therapist' ? [
            { icon:<Ic.Calendar />, label:'Ver mi agenda', sub:'Consulta tu jornada', page:'agenda' as Page },
            { icon:<Ic.Clipboard />, label:'Historial clínico', sub:'Registra la evolución', page:'historial' as Page },
            { icon:<Ic.List />, label:'Ver secuencias', sub:'Consulta protocolos', page:'secuencias' as Page },
          ] : [
            { icon:<Ic.Users />, label:'Registrar paciente', sub:'Añade una nueva ficha', page:'pacientes' as Page },
            { icon:<Ic.Calendar />, label:'Programar cita', sub:'Reserva un horario', page:'agenda' as Page },
            { icon:<Ic.Card />, label:'Gestionar pagos', sub:'Consulta saldos pendientes', page:'pagos' as Page },
          ]).map((item, i) => (
            <button key={i} onClick={() => onNav(item.page)} style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 0', background:'none', border:'none', borderBottom:i<2?'1px solid #f0f4f1':'none', cursor:'pointer', textAlign:'left' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:'#e8f5ee', display:'flex', alignItems:'center', justifyContent:'center', color:'#2d6a4f', flexShrink:0 }}>{item.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14, color:'#162d20' }}>{item.label}</div>
                <div style={{ fontSize:12, color:'#6b8c78', marginTop:1 }}>{item.sub}</div>
              </div>
              <span style={{ color:'#9ca3af' }}><Ic.Chevron /></span>
            </button>
          ))}
        </Card>
      </div>
    </div>
  )
}

// ─── Agenda ────────────────────────────────────────────────────────────────

function AgendaPag({ data, setData, patients }: { data: Appointment[]; setData: React.Dispatch<React.SetStateAction<Appointment[]>>; patients: Patient[] }) {
  const [filter, setFilter] = useState('Todas')
  const [modal, setModal] = useState<null | 'add' | Appointment>(null)
  const [deleting, setDeleting] = useState<Appointment | null>(null)
  const patientNames = patients.map(p => p.name)
  const filtered = filter==='Todas' ? data : data.filter(a => a.status===filter)
  const save = (a: Appointment) => setData(d => a.id && d.find(x => x.id===a.id) ? d.map(x => x.id===a.id ? a : x) : [...d, a])
  return (
    <div>
      <PageHeader title="Agenda" sub="Gestiona todas tus citas del día"
        action={<button className="btn-primary" style={{ display:'flex', alignItems:'center', gap:8 }} onClick={() => setModal('add')}><Ic.Plus /> Nueva cita</button>} />
      <Card>
        <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
          {['Todas','Confirmada','En espera','Atendida','Cancelada'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding:'7px 16px', borderRadius:20, border:filter===s?'none':'1.5px solid #e2ebe5', background:filter===s?'#2d6a4f':'white', color:filter===s?'white':'#6b8c78', fontFamily:'Inter', fontSize:13, fontWeight:filter===s?600:400, cursor:'pointer', transition:'all 0.15s' }}>{s}</button>
          ))}
        </div>
        <table>
          <thead><tr><th>Fecha</th><th>Hora</th><th>Paciente</th><th>Tratamiento</th><th>Especialista</th><th>Duración</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id}>
                <td style={{ color:'#6b8c78', whiteSpace:'nowrap' }}>{a.date ? new Date(`${a.date}T12:00:00`).toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit' }) : 'Hoy'}</td>
                <td><span style={{ fontFamily:'Instrument Sans', fontWeight:700, fontSize:15 }}>{a.time}</span></td>
                <td><div style={{ display:'flex', alignItems:'center', gap:10 }}><Avatar initials={a.initials} color={a.color} size={32} /><div><div style={{ fontWeight:500 }}>{a.patient}</div>{(a.phone || a.email) && <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{a.phone || a.email}</div>}</div></div></td>
                <td style={{ color:'#6b8c78' }}>{a.treatment}</td>
                <td style={{ color:'#6b8c78' }}>{a.doctor}</td>
                <td style={{ color:'#6b8c78' }}>{a.duration}</td>
                <td><StatusBadge status={a.status} /></td>
                <td><RowActions onEdit={() => setModal(a)} onDelete={() => setDeleting(a)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0 && <div style={{ textAlign:'center', color:'#9ca3af', padding:'40px 0', fontSize:14 }}>No hay citas con ese estado</div>}
      </Card>
      {modal && (
        <Modal title={modal==='add' ? 'Nueva cita' : 'Editar cita'} onClose={() => setModal(null)}>
          <AppointmentForm initial={modal==='add' ? undefined : modal} patientNames={patientNames} onSave={save} onClose={() => setModal(null)} />
        </Modal>
      )}
      {deleting && <ConfirmDelete label={`cita de ${deleting.patient} a las ${deleting.time}`} onConfirm={() => setData(d => d.filter(x => x.id!==deleting!.id))} onClose={() => setDeleting(null)} />}
    </div>
  )
}

// ─── Pacientes ─────────────────────────────────────────────────────────────

function PacientesPag({ data, setData }: { data: Patient[]; setData: React.Dispatch<React.SetStateAction<Patient[]>> }) {
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<null | 'add' | Patient>(null)
  const [deleting, setDeleting] = useState<Patient | null>(null)
  const filtered = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.condition.toLowerCase().includes(search.toLowerCase()))
  const save = (p: Patient) => setData(d => p.id && d.find(x => x.id===p.id) ? d.map(x => x.id===p.id ? p : x) : [...d, p])
  return (
    <div>
      <PageHeader title="Pacientes" sub="Gestiona la ficha de cada paciente"
        action={<button className="btn-primary" style={{ display:'flex', alignItems:'center', gap:8 }} onClick={() => setModal('add')}><Ic.Plus /> Nuevo paciente</button>} />
      <Card>
        <div style={{ position:'relative', maxWidth:340, marginBottom:20 }}>
          <div style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }}><Ic.Search /></div>
          <input type="text" placeholder="Buscar paciente o condición..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft:38, fontSize:14 }} />
        </div>
        <table>
          <thead><tr><th>Paciente</th><th>Edad</th><th>Condición</th><th>Especialista</th><th>Última visita</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td><div style={{ display:'flex', alignItems:'center', gap:12 }}><Avatar initials={p.initials} color={p.color} size={36} /><div><div style={{ fontWeight:600 }}>{p.name}</div><div style={{ fontSize:12, color:'#6b8c78' }}>{p.email}</div></div></div></td>
                <td>{p.age} años</td>
                <td style={{ color:'#6b8c78' }}>{p.condition}</td>
                <td style={{ color:'#6b8c78' }}>{p.doctor}</td>
                <td style={{ color:'#6b8c78' }}>{p.lastVisit}</td>
                <td><StatusBadge status={p.status} /></td>
                <td><RowActions onEdit={() => setModal(p)} onDelete={() => setDeleting(p)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0 && <div style={{ textAlign:'center', color:'#9ca3af', padding:'40px 0', fontSize:14 }}>No se encontraron pacientes</div>}
      </Card>
      {modal && (
        <Modal title={modal==='add' ? 'Nuevo paciente' : 'Editar paciente'} onClose={() => setModal(null)}>
          <PatientForm initial={modal==='add' ? undefined : modal} onSave={save} onClose={() => setModal(null)} />
        </Modal>
      )}
      {deleting && <ConfirmDelete label={deleting.name} onConfirm={() => setData(d => d.filter(x => x.id!==deleting!.id))} onClose={() => setDeleting(null)} />}
    </div>
  )
}

// ─── Historial ─────────────────────────────────────────────────────────────

function HistorialPag({ data, setData, patients }: { data: HistoryEntry[]; setData: React.Dispatch<React.SetStateAction<HistoryEntry[]>>; patients: Patient[] }) {
  const [modal, setModal] = useState<null | 'add' | HistoryEntry>(null)
  const [deleting, setDeleting] = useState<HistoryEntry | null>(null)
  const patientNames = patients.map(p => p.name)
  const save = (h: HistoryEntry) => setData(d => h.id && d.find(x => x.id===h.id) ? d.map(x => x.id===h.id ? h : x) : [...d, h])
  return (
    <div>
      <PageHeader title="Historial Clínico" sub="Registro completo de sesiones y diagnósticos"
        action={<button className="btn-primary" style={{ display:'flex', alignItems:'center', gap:8 }} onClick={() => setModal('add')}><Ic.Plus /> Nueva entrada</button>} />
      <Card style={{ marginBottom:20 }}>
        <table>
          <thead><tr><th>Paciente</th><th>Fecha</th><th>Diagnóstico</th><th>Tratamiento</th><th>Especialista</th><th>Sesión</th><th></th></tr></thead>
          <tbody>
            {data.map(h => (
              <tr key={h.id}>
                <td style={{ fontWeight:600 }}>{h.patient}</td>
                <td style={{ color:'#6b8c78' }}>{h.date}</td>
                <td style={{ fontWeight:500 }}>{h.diagnosis}</td>
                <td style={{ color:'#6b8c78', maxWidth:180 }}>{h.treatment}</td>
                <td style={{ color:'#6b8c78' }}>{h.doctor}</td>
                <td style={{ textAlign:'center' }}><span style={{ background:'#e8f5ee', color:'#2d6a4f', padding:'3px 10px', borderRadius:20, fontSize:13, fontWeight:600 }}>#{h.session}</span></td>
                <td><RowActions onEdit={() => setModal(h)} onDelete={() => setDeleting(h)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <h4 style={{ fontFamily:'Instrument Sans', fontSize:16, fontWeight:700, color:'#162d20', margin:'0 0 12px' }}>Notas clínicas</h4>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {data.map(h => (
          <Card key={h.id} style={{ padding:'16px 20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontWeight:600, color:'#162d20' }}>{h.patient}</span>
              <span style={{ fontSize:13, color:'#9ca3af' }}>{h.date} · Sesión #{h.session}</span>
            </div>
            <p style={{ fontSize:14, color:'#4a6358', margin:0, lineHeight:1.6 }}>{h.notes}</p>
          </Card>
        ))}
      </div>
      {modal && (
        <Modal title={modal==='add' ? 'Nueva entrada clínica' : 'Editar entrada'} onClose={() => setModal(null)}>
          <HistoryForm initial={modal==='add' ? undefined : modal} patientNames={patientNames} onSave={save} onClose={() => setModal(null)} />
        </Modal>
      )}
      {deleting && <ConfirmDelete label={`entrada de ${deleting.patient} (${deleting.date})`} onConfirm={() => setData(d => d.filter(x => x.id!==deleting!.id))} onClose={() => setDeleting(null)} />}
    </div>
  )
}

// ─── Pagos ─────────────────────────────────────────────────────────────────

function PagosPag({ data, setData, patients }: { data: Payment[]; setData: React.Dispatch<React.SetStateAction<Payment[]>>; patients: Patient[] }) {
  const [modal, setModal] = useState<null | 'add' | Payment>(null)
  const [deleting, setDeleting] = useState<Payment | null>(null)
  const patientNames = patients.map(p => p.name)
  const save = (p: Payment) => setData(d => p.id && d.find(x => x.id===p.id) ? d.map(x => x.id===p.id ? p : x) : [...d, p])
  const total = data.reduce((s,p) => s+p.amount, 0)
  const paid = data.filter(p => p.status==='Pagado').reduce((s,p) => s+p.amount, 0)
  const pending = data.filter(p => p.status==='Pendiente').reduce((s,p) => s+p.amount, 0)
  const overdue = data.filter(p => p.status==='Vencido').reduce((s,p) => s+p.amount, 0)
  return (
    <div>
      <PageHeader title="Pagos" sub="Gestiona los pagos y saldos de la clínica"
        action={<button className="btn-primary" style={{ display:'flex', alignItems:'center', gap:8 }} onClick={() => setModal('add')}><Ic.Plus /> Registrar pago</button>} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16, marginBottom:24 }}>
        <StatCard icon={<Ic.Card />} label="Total facturado" value={`${total}€`} sub="Este mes" iconBg="#e8f5ee" />
        <StatCard icon={<Ic.Check />} label="Cobrado" value={`${paid}€`} sub="Pagos recibidos" iconBg="#d1fae5" />
        <StatCard icon={<Ic.Activity />} label="Pendiente" value={`${pending}€`} sub="Por cobrar" iconBg="#fef3c7" />
        <StatCard icon={<Ic.X />} label="Vencido" value={`${overdue}€`} sub="Sin cobrar" iconBg="#fee2e2" />
      </div>
      <Card>
        <table>
          <thead><tr><th>Paciente</th><th>Concepto</th><th>Importe</th><th>Fecha</th><th>Método</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {data.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight:600 }}>{p.patient}</td>
                <td style={{ color:'#6b8c78' }}>{p.concept}</td>
                <td style={{ fontFamily:'Instrument Sans', fontWeight:700, fontSize:15 }}>{p.amount}€</td>
                <td style={{ color:'#6b8c78' }}>{p.date}</td>
                <td style={{ color:'#6b8c78' }}>{p.method}</td>
                <td><StatusBadge status={p.status} /></td>
                <td><RowActions onEdit={() => setModal(p)} onDelete={() => setDeleting(p)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {modal && (
        <Modal title={modal==='add' ? 'Registrar pago' : 'Editar pago'} onClose={() => setModal(null)}>
          <PaymentForm initial={modal==='add' ? undefined : modal} patientNames={patientNames} onSave={save} onClose={() => setModal(null)} />
        </Modal>
      )}
      {deleting && <ConfirmDelete label={`pago de ${deleting.patient} (${deleting.amount}€)`} onConfirm={() => setData(d => d.filter(x => x.id!==deleting!.id))} onClose={() => setDeleting(null)} />}
    </div>
  )
}

// ─── Reportes (admin only) ─────────────────────────────────────────────────

function ReportesPag({ role, appointments, payments, patients }: { role: Role; appointments: Appointment[]; payments: Payment[]; patients: Patient[] }) {
  if (role !== 'admin') return <AccessDenied />
  const [doctorFilter, setDoctorFilter] = useState('Todos')
  const doctors = ['Todos', 'Dra. Elena Ruiz', 'Dr. Daniel Ortega']

  const filteredAppts = doctorFilter==='Todos' ? appointments : appointments.filter(a => a.doctor===doctorFilter)
  const bars = [
    { month:'Jun', citas:42, ingresos:1890 },
    { month:'Jul', citas:48, ingresos:2160 },
    { month:'Ago', citas:39, ingresos:1755 },
    { month:'Sep', citas: appointments.length + 49, ingresos: payments.reduce((s,p)=>s+p.amount,0) + 1315 },
  ]
  const maxC = Math.max(...bars.map(b => b.citas))
  const maxI = Math.max(...bars.map(b => b.ingresos))
  const statusDist = (['Atendida','Confirmada','En espera','Cancelada'] as AppointmentStatus[]).map(s => ({
    s, n: filteredAppts.filter(a => a.status===s).length,
    color: s==='Atendida'?'#10b981':s==='Confirmada'?'#3b82f6':s==='En espera'?'#f59e0b':'#ef4444'
  }))
  const total = statusDist.reduce((s,x)=>s+x.n,0)||1

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <h1 style={{ fontFamily:'Instrument Sans', fontSize:24, fontWeight:700, color:'#162d20', margin:0, letterSpacing:'-0.5px' }}>Reportes</h1>
            <span style={{ display:'flex', alignItems:'center', gap:4, background:'#fef3c7', color:'#92400e', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, letterSpacing:'0.04em', textTransform:'uppercase' }}>
              <Ic.Shield /> Solo Admin
            </span>
          </div>
          <p style={{ fontSize:14, color:'#6b8c78', margin:0 }}>Analítica e indicadores de tu clínica</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:13, color:'#6b8c78', display:'flex', alignItems:'center', gap:6 }}><Ic.Filter />Filtrar por especialista:</span>
          {doctors.map(d => (
            <button key={d} onClick={() => setDoctorFilter(d)} style={{ padding:'7px 14px', borderRadius:20, border:doctorFilter===d?'none':'1.5px solid #e2ebe5', background:doctorFilter===d?'#2d6a4f':'white', color:doctorFilter===d?'white':'#6b8c78', fontFamily:'Inter', fontSize:12, fontWeight:doctorFilter===d?600:400, cursor:'pointer', transition:'all 0.15s', whiteSpace:'nowrap' }}>{d}</button>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16, marginBottom:20 }}>
        <StatCard icon={<Ic.Calendar />} label="Total citas (mes)" value={String(filteredAppts.length)} sub="Filtradas por especialista" iconBg="#e8f5ee" />
        <StatCard icon={<Ic.Users />} label="Pacientes activos" value={String(patients.filter(p=>p.status==='Activo').length)} sub="En seguimiento" iconBg="#e0f2fe" />
        <StatCard icon={<Ic.Card />} label="Ingresos totales" value={`${payments.reduce((s,p)=>s+p.amount,0)}€`} sub="Este mes" iconBg="#ede9fe" />
        <StatCard icon={<Ic.Check />} label="Tasa de atención" value={`${Math.round((appointments.filter(a=>a.status==='Atendida').length/Math.max(appointments.length,1))*100)}%`} sub="Citas completadas" iconBg="#d1fae5" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <Card>
          <h4 style={{ fontFamily:'Instrument Sans', fontSize:16, fontWeight:700, color:'#162d20', margin:'0 0 20px' }}>Citas por mes</h4>
          <div style={{ display:'flex', alignItems:'flex-end', gap:16, height:140 }}>
            {bars.map(b => (
              <div key={b.month} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:12, fontWeight:700, color:'#2d6a4f' }}>{b.citas}</span>
                <div style={{ width:'100%', background:'#e8f5ee', borderRadius:6, height:`${(b.citas/maxC)*110}px`, overflow:'hidden' }}>
                  <div style={{ width:'100%', height:'100%', background:'linear-gradient(180deg, #52b788, #2d6a4f)', borderRadius:6 }}/>
                </div>
                <span style={{ fontSize:12, color:'#6b8c78' }}>{b.month}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h4 style={{ fontFamily:'Instrument Sans', fontSize:16, fontWeight:700, color:'#162d20', margin:'0 0 20px' }}>Ingresos por mes (€)</h4>
          <div style={{ display:'flex', alignItems:'flex-end', gap:16, height:140 }}>
            {bars.map(b => (
              <div key={b.month} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:12, fontWeight:700, color:'#6b5bdb' }}>{b.ingresos}€</span>
                <div style={{ width:'100%', background:'#ede9fe', borderRadius:6, height:`${(b.ingresos/maxI)*110}px`, overflow:'hidden' }}>
                  <div style={{ width:'100%', height:'100%', background:'linear-gradient(180deg, #a78bfa, #6b5bdb)', borderRadius:6 }}/>
                </div>
                <span style={{ fontSize:12, color:'#6b8c78' }}>{b.month}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <Card>
          <h4 style={{ fontFamily:'Instrument Sans', fontSize:16, fontWeight:700, color:'#162d20', margin:'0 0 16px' }}>Top tratamientos (citas filtradas)</h4>
          {[...filteredAppts.reduce((m, a) => { m.set(a.treatment, (m.get(a.treatment)||0)+1); return m }, new Map<string,number>()).entries()]
            .sort((a,b) => b[1]-a[1]).slice(0,5).map(([t, n], i) => (
            <div key={i} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                <span style={{ fontWeight:500, color:'#162d20' }}>{t}</span>
                <span style={{ color:'#6b8c78' }}>{n} sesión{n!==1?'es':''}</span>
              </div>
              <div style={{ height:6, background:'#e8f5ee', borderRadius:3 }}>
                <div style={{ height:6, width:`${(n/Math.max(...filteredAppts.reduce((m,a)=>{ m.set(a.treatment,(m.get(a.treatment)||0)+1); return m },new Map<string,number>()).values()))*100}%`, background:'#52b788', borderRadius:3 }}/>
              </div>
            </div>
          ))}
          {filteredAppts.length===0 && <p style={{ color:'#9ca3af', fontSize:14 }}>Sin datos para este filtro.</p>}
        </Card>
        <Card>
          <h4 style={{ fontFamily:'Instrument Sans', fontSize:16, fontWeight:700, color:'#162d20', margin:'0 0 16px' }}>Distribución de estados</h4>
          {statusDist.map(row => (
            <div key={row.s} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
              <div style={{ width:12, height:12, borderRadius:'50%', background:row.color, flexShrink:0 }}/>
              <span style={{ flex:1, fontSize:14, color:'#162d20' }}>{row.s}</span>
              <span style={{ fontFamily:'Instrument Sans', fontWeight:700, fontSize:15 }}>{row.n}</span>
              <span style={{ fontSize:12, color:'#9ca3af', width:36, textAlign:'right' }}>{Math.round(row.n/total*100)}%</span>
            </div>
          ))}
          <div style={{ height:8, borderRadius:4, overflow:'hidden', display:'flex', marginTop:4 }}>
            {statusDist.map(row => (
              <div key={row.s} style={{ flex:row.n, background:row.color, transition:'flex 0.3s' }}/>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── Usuarios (admin only) ─────────────────────────────────────────────────

function UsuariosPag({ role, data, setData }: { role: Role; data: UserRecord[]; setData: React.Dispatch<React.SetStateAction<UserRecord[]>> }) {
  if (role !== 'admin') return <AccessDenied />
  const [modal, setModal] = useState<null | 'add' | UserRecord>(null)
  const [deleting, setDeleting] = useState<UserRecord | null>(null)
  const save = (u: UserRecord) => setData(d => u.id && d.find(x => x.id===u.id) ? d.map(x => x.id===u.id ? u : x) : [...d, u])
  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <h1 style={{ fontFamily:'Instrument Sans', fontSize:24, fontWeight:700, color:'#162d20', margin:0, letterSpacing:'-0.5px' }}>Usuarios</h1>
            <span style={{ display:'flex', alignItems:'center', gap:4, background:'#fef3c7', color:'#92400e', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, letterSpacing:'0.04em', textTransform:'uppercase' }}>
              <Ic.Shield /> Solo Admin
            </span>
          </div>
          <p style={{ fontSize:14, color:'#6b8c78', margin:0 }}>Equipo y permisos del sistema</p>
        </div>
        <button className="btn-primary" style={{ display:'flex', alignItems:'center', gap:8 }} onClick={() => setModal('add')}><Ic.Plus /> Añadir usuario</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:16 }}>
        {data.map(u => (
          <Card key={u.id} style={{ display:'flex', alignItems:'center', gap:16, padding:'20px 22px' }}>
            <Avatar initials={u.initials} color={u.color} size={48} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:16, color:'#162d20' }}>{u.name}</div>
              <div style={{ fontSize:13, color:'#6b8c78', marginTop:2 }}>{u.role}</div>
              <div style={{ fontSize:12, color:'#9ca3af', marginTop:4 }}>{u.email}</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
              <StatusBadge status={u.status} />
              <RowActions onEdit={() => setModal(u)} onDelete={() => setDeleting(u)} />
            </div>
          </Card>
        ))}
      </div>
      {modal && (
        <Modal title={modal==='add' ? 'Añadir usuario' : 'Editar usuario'} onClose={() => setModal(null)}>
          <UserForm initial={modal==='add' ? undefined : modal} onSave={save} onClose={() => setModal(null)} />
        </Modal>
      )}
      {deleting && <ConfirmDelete label={deleting.name} onConfirm={() => setData(d => d.filter(x => x.id!==deleting!.id))} onClose={() => setDeleting(null)} />}
    </div>
  )
}

// ─── Secuencias ────────────────────────────────────────────────────────────

function SecuenciasPag({ data, setData }: { data: Sequence[]; setData: React.Dispatch<React.SetStateAction<Sequence[]>> }) {
  const [modal, setModal] = useState<null | 'add' | Sequence>(null)
  const [deleting, setDeleting] = useState<Sequence | null>(null)
  const save = (s: Sequence) => setData(d => s.id && d.find(x => x.id===s.id) ? d.map(x => x.id===s.id ? s : x) : [...d, s])
  return (
    <div>
      <PageHeader title="Secuencias" sub="Protocolos y programas de tratamiento"
        action={<button className="btn-primary" style={{ display:'flex', alignItems:'center', gap:8 }} onClick={() => setModal('add')}><Ic.Plus /> Nuevo protocolo</button>} />
      <Card>
        <table>
          <thead><tr><th>Protocolo</th><th>Categoría</th><th>Sesiones</th><th>Duración</th><th>Ejercicios</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {data.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight:600, color:'#162d20' }}>{s.name}</td>
                <td><span style={{ background:'#e8f5ee', color:'#2d6a4f', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>{s.category}</span></td>
                <td style={{ color:'#6b8c78' }}>{s.sessions} ses.</td>
                <td style={{ color:'#6b8c78' }}>{s.duration}</td>
                <td style={{ color:'#6b8c78' }}>{s.exercises} ej.</td>
                <td><StatusBadge status={s.status} /></td>
                <td><RowActions onEdit={() => setModal(s)} onDelete={() => setDeleting(s)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {modal && (
        <Modal title={modal==='add' ? 'Nuevo protocolo' : 'Editar protocolo'} onClose={() => setModal(null)}>
          <SequenceForm initial={modal==='add' ? undefined : modal} onSave={save} onClose={() => setModal(null)} />
        </Modal>
      )}
      {deleting && <ConfirmDelete label={deleting.name} onConfirm={() => setData(d => d.filter(x => x.id!==deleting!.id))} onClose={() => setDeleting(null)} />}
    </div>
  )
}

// ─── Configuración ─────────────────────────────────────────────────────────

function ConfiguracionPag({ role }: { role: Role }) {
  const [saved, setSaved] = useState(false)
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }
  return (
    <div>
      <PageHeader title="Configuración" sub="Ajustes generales del sistema" />
      {saved && (
        <div style={{ background:'#d1fae5', border:'1.5px solid #6ee7b7', borderRadius:10, padding:'12px 18px', marginBottom:20, display:'flex', alignItems:'center', gap:10, color:'#065f46', fontWeight:600, fontSize:14 }}>
          <Ic.Check /> Cambios guardados correctamente
        </div>
      )}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <Card>
          <h4 style={{ fontFamily:'Instrument Sans', fontSize:16, fontWeight:700, color:'#162d20', margin:'0 0 20px' }}>Datos de la clínica</h4>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {[{ l:'Nombre de la clínica', v:'FootFisio Gestión Clínica' },{ l:'Correo de contacto', v:'contacto@footfisio.com' },{ l:'Teléfono', v:'+34 910 000 001' },{ l:'Dirección', v:'Calle de la Salud, 12 – Madrid' }].map(f => (
              <div key={f.l}>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#2d3748', marginBottom:6 }}>{f.l}</label>
                <input type="text" defaultValue={f.v} disabled={role!=='admin'} style={{ opacity:role!=='admin'?0.6:1 }} />
              </div>
            ))}
            {role==='admin' ? (
              <button className="btn-primary" style={{ width:'fit-content' }} onClick={save}>Guardar cambios</button>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#6b8c78', background:'#f0f4f1', borderRadius:8, padding:'10px 14px' }}>
                <Ic.Lock /> Solo los administradores pueden modificar estos datos
              </div>
            )}
          </div>
        </Card>
        <Card>
          <h4 style={{ fontFamily:'Instrument Sans', fontSize:16, fontWeight:700, color:'#162d20', margin:'0 0 20px' }}>Preferencias del sistema</h4>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#2d3748', marginBottom:6 }}>Idioma del sistema</label>
              <select defaultValue="Español"><option>Español</option><option>English</option><option>Português</option></select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#2d3748', marginBottom:6 }}>Zona horaria</label>
              <select defaultValue="Europe/Madrid"><option>Europe/Madrid</option><option>Europe/London</option><option>America/New_York</option></select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#2d3748', marginBottom:6 }}>Duración por defecto de cita (min)</label>
              <input type="number" defaultValue="50" />
            </div>
            <button className="btn-primary" style={{ width:'fit-content' }} onClick={save}>Guardar preferencias</button>
          </div>
        </Card>
        {role === 'admin' && (
          <Card style={{ gridColumn:'span 2' }}>
            <h4 style={{ fontFamily:'Instrument Sans', fontSize:16, fontWeight:700, color:'#162d20', margin:'0 0 16px' }}>Panel de administración</h4>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
              {[
                { label:'Exportar datos', sub:'Descarga CSV con toda la información' },
                { label:'Restablecer demo', sub:'Vuelve a los datos iniciales' },
                { label:'Logs del sistema', sub:'Registro de actividad reciente' },
              ].map((item, i) => (
                <div key={i} style={{ padding:'16px', background:'#f8fafc', borderRadius:10, border:'1px solid #e2ebe5' }}>
                  <div style={{ fontWeight:600, fontSize:14, color:'#162d20', marginBottom:4 }}>{item.label}</div>
                  <div style={{ fontSize:12, color:'#6b8c78', marginBottom:12 }}>{item.sub}</div>
                  <button className="btn-secondary" style={{ fontSize:12, padding:'6px 14px' }}>Ejecutar</button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

// ─── Root App ──────────────────────────────────────────────────────────────

function ArquitecturaPag() {
  const [activeTab, setActiveTab] = useState<'mvc' | 'dao' | 'solid' | 'tdd'>('mvc')
  const tabs = [
    { id:'mvc' as const, label:'MVC', number:'01', title:'Modelo–Vista–Controlador', description:'Separa la interfaz, los datos y el flujo de las acciones. En esta aplicación React representa la organización lógica recomendada; la interfaz actual todavía concentra parte de la lógica en App.tsx.', items:[['Modelo','Tipos y reglas del dominio: Patient, Appointment, Payment.'],['Vista','Componentes React que muestran formularios, tablas y paneles.'],['Controlador','Casos de uso que reciben una acción de la vista y llaman a los servicios.']], code:'Vista (React) → Controlador / caso de uso → Modelo y servicio → DAO / repositorio'},
    { id:'dao' as const, label:'DAO', number:'02', title:'Data Access Object', description:'Encapsula cómo se guardan y consultan los datos. La interfaz no debería conocer si los pacientes vienen de una API, una base de datos o almacenamiento local.', items:[['PatientDAO','Define operaciones como listar, buscar, crear y actualizar pacientes.'],['PatientService','Aplica validaciones y reglas antes de guardar.'],['Implementación','Conecta con la API o base de datos. En este prototipo los datos son de ejemplo y viven en el estado de React.']], code:'Componente → PatientService → PatientDAO → API / base de datos'},
    { id:'solid' as const, label:'SOLID', number:'03', title:'Principios SOLID', description:'Cinco principios para mantener el sistema organizado y facilitar cambios sin romper otras funciones.', items:[['S · Responsabilidad única','Cada módulo debe tener un motivo principal para cambiar.'],['O · Abierto/cerrado','Permitir nuevas implementaciones sin modificar el contrato existente.'],['L · Sustitución de Liskov','Una implementación debe poder reemplazar a otra sin alterar el comportamiento esperado.'],['I · Segregación de interfaces','Preferir contratos pequeños y específicos.'],['D · Inversión de dependencias','Los servicios dependen de interfaces, no de detalles concretos de almacenamiento.']], code:'PatientService depende de PatientDAO (contrato), no de una base de datos específica.'},
    { id:'tdd' as const, label:'TDD', number:'04', title:'Test-Driven Development', description:'Desarrollar guiándose por pruebas automatizadas. Primero se define el comportamiento esperado y luego se escribe el código mínimo para cumplirlo.', items:[['1 · Rojo','Escribir una prueba que falle para una regla, por ejemplo validar el teléfono del paciente.'],['2 · Verde','Implementar la solución mínima para que la prueba pase.'],['3 · Refactorizar','Mejorar el diseño manteniendo todas las pruebas en verde.']], code:"describe('PatientService', () => { it('rechaza pacientes sin nombre', () => { expect(() => service.create({ name: '' })).toThrow() }) })"},
  ]
  const current = tabs.find(tab => tab.id === activeTab)!
  return (
    <div style={{ maxWidth:1100, margin:'0 auto' }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:11, color:'#2d6a4f', fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', marginBottom:8 }}>Documentación técnica</div>
        <h1 style={{ fontSize:28, color:'#162d20', margin:'0 0 8px', letterSpacing:'-0.7px' }}>Arquitectura de Software</h1>
        <p style={{ margin:0, color:'#6b7c72', fontSize:14, lineHeight:1.7 }}>Diseño propuesto para evolucionar FootFisio con módulos mantenibles, acceso a datos desacoplado y pruebas automatizadas.</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:14, marginBottom:22 }}>
        {tabs.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ textAlign:'left', cursor:'pointer', padding:18, borderRadius:14, border:activeTab===tab.id?'1.5px solid #2d6a4f':'1px solid #e1e9e3', background:activeTab===tab.id?'#e8f5ee':'white', color:'#162d20' }}><div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}><span style={{ fontSize:11, fontWeight:800, color:'#2d6a4f' }}>{tab.number} / PRINCIPIO</span><span style={{ fontSize:12, color:'#2d6a4f' }}>↗</span></div><div style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>{tab.label}</div><div style={{ fontSize:12, lineHeight:1.5, color:'#6b7c72' }}>{tab.title}</div></button>)}
      </div>
      <section style={{ background:'white', border:'1px solid #e1e9e3', borderRadius:16, padding:'clamp(18px,3vw,30px)', marginBottom:18 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}><span style={{ width:42, height:42, display:'grid', placeItems:'center', borderRadius:12, background:'#e8f5ee', color:'#2d6a4f', fontWeight:800 }}>{current.number}</span><div><h2 style={{ margin:0, fontSize:22, color:'#162d20' }}>{current.title}</h2><span style={{ fontSize:12, color:'#718078' }}>Aplicación al sistema FootFisio</span></div></div>
        <p style={{ color:'#52645a', fontSize:14, lineHeight:1.8, margin:'14px 0 22px' }}>{current.description}</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12 }}>
          {current.items.map(([title, description]) => <div key={title} style={{ padding:16, border:'1px solid #e8eee9', borderRadius:12, background:'#fbfdfb' }}><div style={{ fontWeight:700, color:'#24583f', fontSize:14, marginBottom:7 }}>{title}</div><div style={{ fontSize:13, color:'#607067', lineHeight:1.65 }}>{description}</div></div>)}
        </div>
        <div style={{ marginTop:20, padding:18, background:'#162d20', borderRadius:12, color:'#d8f3e4' }}><div style={{ color:'#74c69d', fontSize:10, fontWeight:800, letterSpacing:'.12em', marginBottom:10 }}>EJEMPLO DE FLUJO / CÓDIGO</div><code style={{ fontSize:13, whiteSpace:'pre-wrap', overflowWrap:'anywhere', lineHeight:1.8 }}>{current.code}</code></div>
      </section>
      <section style={{ background:'white', border:'1px solid #e1e9e3', borderRadius:16, padding:22 }}>
        <h3 style={{ color:'#162d20', margin:'0 0 14px', fontSize:17 }}>Estructura de carpetas recomendada</h3>
        <pre style={{ margin:0, padding:16, background:'#f5f8f5', borderRadius:10, color:'#355344', fontSize:12, lineHeight:1.8, overflowX:'auto' }}>{`src/\n  views/          # Vistas y componentes React\n  controllers/    # Coordinación de casos de uso\n  models/         # Tipos y reglas del dominio\n  dao/            # Contratos y acceso a datos\n  services/       # Lógica de negocio\n  tests/          # Pruebas unitarias y de integración`}</pre>
        <p style={{ margin:'14px 0 0', color:'#718078', fontSize:12, lineHeight:1.7 }}>Nota: esta sección documenta la arquitectura objetivo. La aplicación entregada sigue siendo un prototipo React con datos iniciales en memoria; para completar DAO y TDD ejecutables se debe conectar una persistencia real e incorporar un framework de pruebas.</p>
      </section>
    </div>
  )
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [entryRole, setEntryRole] = useState<EntryRole | null>(null)
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState<Role>('therapist')
  const [page, setPage] = useState<Page>('inicio')

  const [appointments, setAppointments] = useState<Appointment[]>(INIT_APPOINTMENTS)
  const [patients, setPatients] = useState<Patient[]>(INIT_PATIENTS)
  const [payments, setPayments] = useState<Payment[]>(INIT_PAYMENTS)
  const [history, setHistory] = useState<HistoryEntry[]>(INIT_HISTORY)
  const [users, setUsers] = useState<UserRecord[]>(INIT_USERS)
  const [sequences, setSequences] = useState<Sequence[]>(INIT_SEQUENCES)

  const handleLogin = (name: string, role: Role) => {
    setUserName(name); setUserRole(role); setIsLoggedIn(true); setPage('inicio')
  }
  const handleLogout = () => { setIsLoggedIn(false); setUserName(''); setEntryRole(null); setPage('inicio') }

  if (!isLoggedIn && !entryRole) {
    return <AccessChoice onSelect={setEntryRole} />
  }
  if (!isLoggedIn && entryRole === 'patient') {
    return <PublicBooking onBack={() => setEntryRole(null)} onBook={appointment => setAppointments(current => [...current, appointment])} />
  }
  if (!isLoggedIn) return <AuthPage role={entryRole as Role} onLogin={handleLogin} onBack={() => setEntryRole(null)} />

  const today = new Date().toISOString().slice(0, 10)
  const roleAppointments = userRole === 'therapist' ? appointments.filter(appointment => appointment.doctor === userName) : appointments
  const todayAppointments = roleAppointments.filter(appointment => !appointment.date || appointment.date === today)

  const pageContent: Record<Page, React.ReactNode> = {
    login: null,
    inicio: <InicioPag appointments={todayAppointments} onNav={setPage} role={userRole} />,
    agenda: <AgendaPag data={roleAppointments} setData={setAppointments} patients={patients} />,
    pacientes: <PacientesPag data={patients} setData={setPatients} />,
    historial: <HistorialPag data={history} setData={setHistory} patients={patients} />,
    pagos: <PagosPag data={payments} setData={setPayments} patients={patients} />,
    reportes: <ReportesPag role={userRole} appointments={appointments} payments={payments} patients={patients} />,
    usuarios: <UsuariosPag role={userRole} data={users} setData={setUsers} />,
    secuencias: <SecuenciasPag data={sequences} setData={setSequences} />,
    configuracion: <ConfiguracionPag role={userRole} />,
    arquitectura: <ArquitecturaPag />,
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f0f4f1' }}>
      <Sidebar active={page} onNav={setPage} role={userRole} />
      <main style={{ marginLeft:208, flex:1, padding:'28px 32px', minHeight:'100vh', maxWidth:'calc(100vw - 208px)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', marginBottom:24, gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {userRole === 'admin' && (
              <span style={{ display:'flex', alignItems:'center', gap:4, background:'#fef3c7', color:'#92400e', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20 }}>
                <Ic.Shield /> Administrador
              </span>
            )}
            {userRole === 'therapist' && (
              <span style={{ background:'#e8f5ee', color:'#065f46', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20 }}>Terapeuta</span>
            )}
            {userRole === 'receptionist' && (
              <span style={{ background:'#e0f2fe', color:'#075985', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20 }}>Recepción</span>
            )}
            <span style={{ fontSize:14, color:'#6b8c78' }}>
              Bienvenido, <strong style={{ color:'#162d20' }}>{userName}</strong>
            </span>
          </div>
          <div style={{ width:34, height:34, borderRadius:'50%', background:'#2d6a4f', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:13, fontWeight:700 }}>
            {userName.charAt(0)}
          </div>
          <button onClick={handleLogout} style={{ fontSize:13, color:'#6b8c78', background:'none', border:'1.5px solid #e2ebe5', borderRadius:8, padding:'7px 14px', cursor:'pointer', fontFamily:'Inter', transition:'all 0.15s' }}>
            Cerrar sesión
          </button>
        </div>
        {pageContent[page]}
        <footer style={{ marginTop:48, paddingTop:20, borderTop:'1px solid #e2ebe5', display:'flex', justifyContent:'space-between', fontSize:12, color:'#9ca3af' }}>
          <span>© 2026 FootFisio · Demo de gestión clínica</span>
          <span>Hecho con cuidado, cada día.</span>
        </footer>
      </main>
    </div>
  )
}
