import React, { useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useCurrentProgress } from '../hooks/useCurrentProgress';
import { 
  Download, 
  Upload, 
  Trash2, 
  ShieldCheck, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const { user, exportProgress, importProgress, deleteMyData } = useAuthStore();
  const progress = useCurrentProgress();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user || !progress) return null;

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (importProgress(content)) {
        alert("Progresul a fost importat cu succes!");
      } else {
        alert("Eroare la importul fișierului. Verifică formatul.");
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteData = () => {
    if (window.confirm("Ești sigur că vrei să ștergi toate datele tale de progres? Această acțiune este ireversibilă (GDPR).")) {
      deleteMyData();
      alert("Datele au fost șterse.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 py-12 space-y-12">
      <header>
        <h1 className="text-4xl font-bold text-secondary font-serif italic mb-2">Profilul Tău</h1>
        <p className="text-gray-500">Gestionarea identității și a datelor de progres în Waldevar Academy.</p>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="h-48 bg-secondary relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        </div>
        <div className="p-10 md:p-14 -mt-24 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end mb-12">
            <div className="w-40 h-40 bg-white rounded-[2.5rem] border-8 border-white shadow-2xl flex items-center justify-center text-5xl font-black text-secondary">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="pb-4">
              <h2 className="text-4xl font-bold text-secondary mb-1">{user.name}</h2>
              <p className="text-primary font-bold uppercase tracking-widest text-sm">{user.role} | Waldevar Energy</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <UserIcon className="text-primary" size={20} />
                <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">Informații Personale</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-gray-600">
                  <Mail size={18} className="text-gray-400" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                  <Phone size={18} className="text-gray-400" />
                  <span className="text-sm">+40 7xx xxx xxx</span>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                  <Calendar size={18} className="text-gray-400" />
                  <span className="text-sm">Ultima actualizare: {new Date(progress.lastUpdated).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <ShieldCheck className="text-primary" size={20} />
                <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">Securitate & Date</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                  <AlertCircle className="text-blue-500 shrink-0" size={18} />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Datele tale sunt stocate local pe acest dispozitiv. Folosește funcția de export pentru a crea un backup sau pentru a muta progresul pe alt browser.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={exportProgress}
                    className="flex items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-secondary hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <Download size={18} /> Exportă Date
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-secondary hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <Upload size={18} /> Importă Date
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImport} 
                    className="hidden" 
                    accept=".json"
                  />
                </div>

                <button 
                  onClick={handleDeleteData}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold hover:bg-red-100 transition-all"
                >
                  <Trash2 size={18} /> Șterge Datele Mele (GDPR)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Summary in Profile */}
      <div className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-2xl border border-gray-100">
        <div className="flex items-center gap-3 mb-10">
          <CheckCircle2 className="text-primary" size={24} />
          <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">Sumar Progres Rol: {user.role}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-gray-50 rounded-3xl text-center">
            <div className="text-4xl font-black text-secondary mb-1">{progress.completedModules.length}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Module Completate</div>
          </div>
          <div className="p-6 bg-gray-50 rounded-3xl text-center">
            <div className="text-4xl font-black text-secondary mb-1">
              {progress.completedModules.length > 0 
                ? Math.round(Object.values(progress.scores).reduce((a, b) => a + b, 0) / progress.completedModules.length)
                : 0}%
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scor Mediu</div>
          </div>
          <div className="p-6 bg-gray-50 rounded-3xl text-center">
            <div className="text-4xl font-black text-secondary mb-1">{progress.weakAreas.length}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Arii de Îmbunătățit</div>
          </div>
        </div>
      </div>
    </div>
  );
}
