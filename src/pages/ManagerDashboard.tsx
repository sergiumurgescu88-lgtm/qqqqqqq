import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  PieChart, 
  Download, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  Calendar,
  ChevronDown,
  Mail,
  ShieldAlert,
  LayoutDashboard,
  Target,
  Award,
  Trophy
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Navigate, useNavigate } from 'react-router-dom';
import teamData from '../data/team-data.json';

interface Employee {
  id: string;
  name: string;
  role: string;
  score: number;
  competenceLevel: string;
  weakAreas: string[];
  lastActive: string;
  categoryScores: Record<string, number>;
}

export default function ManagerDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [selectedCell, setSelectedCell] = useState<{ category: string; role: string } | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Employee; direction: 'asc' | 'desc' }>({ key: 'score', direction: 'desc' });

  // Access check
  const hasAccess = user?.role === 'manager' || user?.role === 'hr';

  const employees = teamData.employees as Employee[];
  const categories = ['responsibilities', 'procedures', 'requirements', 'scenarios'];
  const roles = Array.from(new Set(employees.map(e => e.role)));

  // Filtered and Sorted employees
  const filteredEmployees = useMemo(() => {
    let result = employees.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || e.role === roleFilter;
      const matchesLevel = levelFilter === 'all' || e.competenceLevel === levelFilter;
      const matchesHeatmap = !selectedCell || (e.role === selectedCell.role && e.categoryScores[selectedCell.category] < 70);
      
      return matchesSearch && matchesRole && matchesLevel && matchesHeatmap;
    });

    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [employees, searchTerm, roleFilter, levelFilter, selectedCell, sortConfig]);

  const toggleSort = (key: keyof Employee) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Insights
  const insights = useMemo(() => {
    const avgScore = Math.round(employees.reduce((acc, e) => acc + e.score, 0) / employees.length);
    const expertsCount = employees.filter(e => e.competenceLevel === 'Expert').length;
    
    // Find top weak area
    const categoryTotals: Record<string, number> = {};
    employees.forEach(e => {
      Object.entries(e.categoryScores).forEach(([cat, score]) => {
        categoryTotals[cat] = (categoryTotals[cat] || 0) + score;
      });
    });
    const topWeakArea = Object.entries(categoryTotals).sort((a, b) => a[1] - b[1])[0][0];

    // Inactive users
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const inactiveCount = employees.filter(e => new Date(e.lastActive) < sevenDaysAgo).length;

    return {
      avgScore,
      expertsCount,
      topWeakArea,
      totalEvaluated: employees.length,
      inactiveCount
    };
  }, [employees]);

  // Heatmap data
  const heatmapData = useMemo(() => {
    const data: Record<string, Record<string, number>> = {};
    categories.forEach(cat => {
      data[cat] = {};
      roles.forEach(role => {
        const roleEmployees = employees.filter(e => e.role === role);
        const avg = Math.round(roleEmployees.reduce((acc, e) => acc + e.categoryScores[cat], 0) / roleEmployees.length);
        data[cat][role] = avg;
      });
    });
    return data;
  }, [employees, roles, categories]);

  const handleExportCSV = () => {
    const headers = ['Nume', 'Rol', 'Scor', 'Nivel', 'Arii Slabe', 'Ultima Activitate'];
    const rows = filteredEmployees.map(e => [
      e.name,
      e.role,
      e.score,
      e.competenceLevel,
      e.weakAreas.join(', '),
      new Date(e.lastActive).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `raport-echipa-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!hasAccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mb-6">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-3xl font-bold text-secondary mb-2">Acces Restricționat</h1>
        <p className="text-gray-500 max-w-md mb-8">
          Acest dashboard este rezervat exclusiv managementului și departamentului HR. 
          Ești redirecționat către zona ta de training.
        </p>
        <button 
          onClick={() => navigate('/training')}
          className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
        >
          Înapoi la Training
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 py-12 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-secondary font-serif italic mb-2">Dashboard Managerial</h1>
          <p className="text-gray-500">Monitorizarea competențelor și a progresului echipei Waldevar.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-secondary hover:bg-gray-50 transition-all shadow-sm"
        >
          <Download size={18} /> Exportă Raport CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex items-center gap-6"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Users size={32} />
          </div>
          <div>
            <div className="text-3xl font-black text-secondary">{insights.totalEvaluated}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Angajați Evaluați</div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex items-center gap-6"
        >
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
            <TrendingUp size={32} />
          </div>
          <div>
            <div className="text-3xl font-black text-secondary">{insights.avgScore}%</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scor Mediu Echipă</div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex items-center gap-6"
        >
          <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
            <PieChart size={32} />
          </div>
          <div>
            <div className="text-3xl font-black text-secondary">{insights.expertsCount}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nivel Expert</div>
          </div>
        </motion.div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-secondary p-8 rounded-[2.5rem] text-white flex items-start gap-4 shadow-xl">
          <AlertTriangle className="text-primary shrink-0" size={24} />
          <div>
            <h4 className="font-bold mb-1">Top Weak Area: {insights.topWeakArea}</h4>
            <p className="text-sm text-white/70">Recomandare: Programează o sesiune de refresh procedural.</p>
          </div>
        </div>
        <div className="bg-primary p-8 rounded-[2.5rem] text-white flex items-start gap-4 shadow-xl">
          <Award className="text-white shrink-0" size={24} />
          <div>
            <h4 className="font-bold mb-1">{insights.expertsCount} Mentori Potențiali</h4>
            <p className="text-sm text-white/70">Cei cu nivel Expert pot ghida noii angajați.</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex items-start gap-4 shadow-xl">
          <Mail className="text-primary shrink-0" size={24} />
          <div>
            <h4 className="font-bold text-secondary mb-1">Reminder Activitate</h4>
            <p className="text-sm text-gray-400">
              {insights.inactiveCount > 0 
                ? `${insights.inactiveCount} angajați nu au activitate de 7 zile. Trimite reminder?`
                : 'Toți angajații au fost activi în ultimele 7 zile.'}
            </p>
          </div>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="bg-white rounded-[3rem] p-10 md:p-12 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Target className="text-primary" size={24} />
            <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">Harta Competențelor (Heatmap)</h3>
          </div>
          {selectedCell && (
            <button 
              onClick={() => setSelectedCell(null)}
              className="text-xs font-bold text-primary hover:underline"
            >
              Resetează Filtru Heatmap
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b">Categorie / Rol</th>
                {roles.map(role => (
                  <th key={role} className="p-4 text-center text-[10px] font-bold text-secondary uppercase tracking-widest border-b capitalize">{role}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat}>
                  <td className="p-4 font-bold text-secondary capitalize border-b">{cat}</td>
                  {roles.map(role => {
                    const score = heatmapData[cat][role];
                    const isSelected = selectedCell?.category === cat && selectedCell?.role === role;
                    return (
                      <td key={role} className="p-2 border-b">
                        <button
                          onClick={() => setSelectedCell({ category: cat, role })}
                          className={`w-full h-12 rounded-xl flex items-center justify-center font-bold transition-all ${
                            isSelected ? 'ring-4 ring-primary/30 scale-105 z-10' : ''
                          } ${
                            score >= 90 ? 'bg-primary text-white' :
                            score >= 70 ? 'bg-green-100 text-green-700' :
                            'bg-secondary/10 text-secondary'
                          }`}
                        >
                          {score}%
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-xs text-gray-400 italic">
          * Click pe o celulă pentru a filtra angajații care au nevoie de suport în acea categorie.
        </p>
      </div>

      {/* Employee List Section */}
      <div className="bg-white rounded-[3rem] p-10 md:p-12 shadow-2xl border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-primary" size={24} />
            <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">Listă Angajați</h3>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Caută angajat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm w-full focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-6 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-secondary outline-none"
            >
              <option value="all">Toate Rolurile</option>
              {roles.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
            </select>
            <select 
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-6 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-secondary outline-none"
            >
              <option value="all">Toate Nivelurile</option>
              <option value="Expert">Expert</option>
              <option value="Competent">Competent</option>
              <option value="Needs Development">Needs Development</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th 
                  className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors"
                  onClick={() => toggleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Angajat {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rol</th>
                <th 
                  className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors"
                  onClick={() => toggleSort('score')}
                >
                  <div className="flex items-center gap-1">
                    Scor {sortConfig.key === 'score' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nivel</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Arii de Îmbunătățit</th>
                <th className="pb-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-secondary font-bold">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-secondary">{emp.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{new Date(emp.lastActive).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-widest capitalize">
                      {emp.role}
                    </span>
                  </td>
                  <td className="py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${emp.score >= 80 ? 'bg-primary' : 'bg-secondary'}`} style={{ width: `${emp.score}%` }} />
                      </div>
                      <span className="font-bold text-secondary">{emp.score}%</span>
                    </div>
                  </td>
                  <td className="py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      emp.competenceLevel === 'Expert' ? 'bg-primary/10 text-primary' :
                      emp.competenceLevel === 'Competent' ? 'bg-green-100 text-green-700' :
                      'bg-secondary/10 text-secondary'
                    }`}>
                      {emp.competenceLevel}
                    </span>
                  </td>
                  <td className="py-6">
                    <div className="flex flex-wrap gap-1">
                      {emp.weakAreas.length > 0 ? emp.weakAreas.map(area => (
                        <span key={area} className="text-[10px] font-bold text-secondary/60 bg-secondary/5 px-2 py-0.5 rounded capitalize">
                          {area}
                        </span>
                      )) : <span className="text-[10px] text-gray-300 italic">Nicio arie critică</span>}
                    </div>
                  </td>
                  <td className="py-6 text-right">
                    <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                      <ArrowRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEmployees.length === 0 && (
            <div className="py-20 text-center text-gray-400 italic">
              Niciun angajat nu corespunde filtrelor selectate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
