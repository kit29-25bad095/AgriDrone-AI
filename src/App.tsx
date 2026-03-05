import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Plane, 
  AlertTriangle, 
  Database, 
  Search, 
  Plus, 
  User, 
  ShieldCheck, 
  Microscope,
  ChevronRight,
  Activity,
  Bell,
  Wind,
  Droplets,
  ThermometerSun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Field, Flight, AnalysisResult, Alert, UserRole, Severity } from './types';
import { analyzeCropImage } from './services/gemini';

// --- Components ---

const Sidebar = ({ activeRole, setActiveRole, activeTab, setActiveTab }: { 
  activeRole: UserRole, 
  setActiveRole: (r: UserRole) => void,
  activeTab: string,
  setActiveTab: (t: string) => void
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['farmer', 'official', 'researcher'] },
    { id: 'fields', label: 'My Fields', icon: MapIcon, roles: ['farmer'] },
    { id: 'monitoring', label: 'Drone Flights', icon: Plane, roles: ['farmer', 'official'] },
    { id: 'anomalies', label: 'Anomaly Lab', icon: Microscope, roles: ['official', 'researcher'] },
    { id: 'alerts', label: 'Alert Center', icon: Bell, roles: ['farmer', 'official', 'researcher'] },
  ];

  return (
    <div className="w-64 bg-zinc-950 text-zinc-400 h-screen flex flex-col border-r border-zinc-800">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <Plane size={24} />
        </div>
        <div>
          <h1 className="text-white font-bold tracking-tight">AgriDrone AI</h1>
          <p className="text-[10px] uppercase tracking-widest font-semibold text-emerald-500">Precision Monitoring</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {tabs.filter(t => t.roles.includes(activeRole)).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === tab.id 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            <tab.icon size={18} />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-zinc-800">
        <div className="bg-zinc-900 rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-widest font-bold mb-3 text-zinc-500">Switch Role</p>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'farmer', icon: User, label: 'Farmer' },
              { id: 'official', icon: ShieldCheck, label: 'Official' },
              { id: 'researcher', icon: Microscope, label: 'Researcher' }
            ].map(role => (
              <button
                key={role.id}
                onClick={() => {
                  setActiveRole(role.id as UserRole);
                  setActiveTab('dashboard');
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                  activeRole === role.id 
                    ? 'bg-white text-black font-bold' 
                    : 'hover:bg-zinc-800 text-zinc-400'
                }`}
              >
                <role.icon size={14} />
                {role.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SeverityBadge = ({ severity }: { severity: Severity }) => {
  const styles = {
    low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    critical: 'bg-red-500/10 text-red-500 border-red-500/20'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[severity]}`}>
      {severity}
    </span>
  );
};

// --- Main Views ---

const Dashboard = ({ activeRole, analysis, alerts }: { activeRole: UserRole, analysis: AnalysisResult[], alerts: Alert[] }) => {
  const stats = [
    { label: 'Active Fields', value: '12', icon: MapIcon, color: 'text-blue-500' },
    { label: 'Total Flights', value: '148', icon: Plane, color: 'text-emerald-500' },
    { label: 'Anomalies Found', value: '7', icon: AlertTriangle, color: 'text-amber-500' },
    { label: 'Health Index', value: '84%', icon: Activity, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight">
          {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)} Overview
        </h2>
        <p className="text-zinc-500">Real-time agricultural intelligence from autonomous drone networks.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors"
          >
            <div className={`p-3 rounded-2xl bg-zinc-800 w-fit mb-4 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Recent Analysis</h3>
            <button className="text-emerald-500 text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {analysis.slice(0, 5).map((item, i) => {
              const data = JSON.parse(item.analysis_json);
              return (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={item.id}
                  className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 hover:bg-zinc-900 transition-colors"
                >
                  <img 
                    src={item.image_url} 
                    alt="Crop" 
                    className="w-16 h-16 rounded-xl object-cover border border-zinc-800"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-bold text-sm">{item.field_name}</h4>
                      <SeverityBadge severity={item.severity} />
                      {item.is_anomaly === 1 && (
                        <span className="bg-purple-500/10 text-purple-500 border border-purple-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Anomaly
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-400 text-xs line-clamp-1">{data.issue}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-500 font-bold text-lg">{data.health_score}%</p>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold">Health</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">Critical Alerts</h3>
          <div className="space-y-4">
            {alerts.filter(a => a.severity === 'critical' || a.severity === 'high').slice(0, 4).map((alert, i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                key={alert.id}
                className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-red-500" />
                  <span className="text-red-500 font-bold text-[10px] uppercase tracking-widest">{alert.severity}</span>
                </div>
                <p className="text-white text-sm font-medium mb-1">{alert.field_name}</p>
                <p className="text-zinc-400 text-xs leading-relaxed">{alert.message}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const FieldsView = ({ fields, onAddField }: { fields: Field[], onAddField: (f: Partial<Field>) => void }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newField, setNewField] = useState({ name: '', crop_type: '', lat: 34.0522, lng: -118.2437 });

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Field Management</h2>
          <p className="text-zinc-500">Register and map your agricultural boundaries.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus size={20} />
          Add New Field
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map((field, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={field.id}
            className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden group hover:border-zinc-700 transition-all"
          >
            <div className="h-40 bg-zinc-800 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="bg-emerald-500 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-lg mb-2 inline-block">
                  {field.crop_type}
                </span>
                <h3 className="text-white font-bold text-lg">{field.name}</h3>
              </div>
              <div className="absolute top-4 right-4 bg-zinc-900/80 backdrop-blur-md p-2 rounded-xl border border-zinc-700">
                <MapIcon size={16} className="text-emerald-500" />
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Coordinates</span>
                <span className="text-zinc-300 font-mono">{field.lat.toFixed(4)}, {field.lng.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Status</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Active
                </span>
              </div>
              <button className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-sm transition-colors">
                View Detailed Map
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Register New Field</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Field Name</label>
                  <input 
                    type="text" 
                    value={newField.name}
                    onChange={e => setNewField({...newField, name: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="e.g. North Valley Corn"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Crop Type</label>
                  <input 
                    type="text" 
                    value={newField.crop_type}
                    onChange={e => setNewField({...newField, crop_type: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="e.g. Maize, Soy, Wheat"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Latitude</label>
                    <input 
                      type="number" 
                      value={newField.lat}
                      onChange={e => setNewField({...newField, lat: parseFloat(e.target.value)})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Longitude</label>
                    <input 
                      type="number" 
                      value={newField.lng}
                      onChange={e => setNewField({...newField, lng: parseFloat(e.target.value)})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button 
                    onClick={() => setShowAdd(false)}
                    className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      onAddField(newField);
                      setShowAdd(false);
                    }}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Register Field
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MonitoringView = ({ fields, flights, onStartFlight }: { fields: Field[], flights: Flight[], onStartFlight: (fieldId: number) => void }) => {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight">Drone Monitoring</h2>
        <p className="text-zinc-500">Deploy autonomous drones for real-time field analysis.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-xl font-bold text-white">Deploy Drones</h3>
          <div className="space-y-4">
            {fields.map(field => (
              <div key={field.id} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold">{field.name}</h4>
                  <p className="text-zinc-500 text-xs">{field.crop_type}</p>
                </div>
                <button 
                  onClick={() => onStartFlight(field.id)}
                  className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white p-3 rounded-2xl transition-all border border-emerald-500/20"
                >
                  <Plane size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-white">Flight History</h3>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Field</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Start Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {flights.map(flight => (
                  <tr key={flight.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium text-sm">{flight.field_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        flight.status === 'active' ? 'bg-blue-500/10 text-blue-500' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {flight.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-zinc-500 text-xs">{new Date(flight.start_time).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-emerald-500 hover:text-emerald-400 text-xs font-bold">View Data</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- App Root ---

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole>('farmer');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fields, setFields] = useState<Field[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [fRes, flRes, aRes, alRes] = await Promise.all([
        fetch('/api/fields'),
        fetch('/api/flights'),
        fetch('/api/analysis'),
        fetch('/api/alerts')
      ]);
      setFields(await fRes.json());
      setFlights(await flRes.json());
      setAnalysis(await aRes.json());
      setAlerts(await alRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddField = async (field: Partial<Field>) => {
    const res = await fetch('/api/fields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...field, farmer_id: 'user_1' })
    });
    if (res.ok) fetchData();
  };

  const handleStartFlight = async (fieldId: number) => {
    const res = await fetch('/api/flights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field_id: fieldId })
    });
    
    if (res.ok) {
      const flight = await res.json();
      fetchData();
      
      // Simulate flight and AI analysis
      setTimeout(async () => {
        const imageUrl = `https://picsum.photos/seed/${Math.random()}/800/600`;
        const aiData = await analyzeCropImage(imageUrl);
        
        await fetch('/api/analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flight_id: flight.id,
            image_url: imageUrl,
            analysis_json: aiData,
            severity: aiData.severity,
            is_anomaly: aiData.is_anomaly
          })
        });

        await fetch(`/api/flights/${flight.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'completed' })
        });

        fetchData();
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-zinc-500 font-medium animate-pulse">Initializing AgriDrone Network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden font-sans selection:bg-emerald-500/30">
      <Sidebar 
        activeRole={activeRole} 
        setActiveRole={setActiveRole} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + activeRole}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <Dashboard activeRole={activeRole} analysis={analysis} alerts={alerts} />}
              {activeTab === 'fields' && <FieldsView fields={fields} onAddField={handleAddField} />}
              {activeTab === 'monitoring' && <MonitoringView fields={fields} flights={flights} onStartFlight={handleStartFlight} />}
              
              {activeTab === 'anomalies' && (
                <div className="space-y-8">
                  <header>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Anomaly Lab</h2>
                    <p className="text-zinc-500">Deep analysis of climate-induced patterns and unfamiliar crop stressors.</p>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analysis.filter(a => a.is_anomaly).map(anomaly => (
                      <div key={anomaly.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl flex gap-6">
                        <img src={anomaly.image_url} className="w-32 h-32 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-purple-500/10 text-purple-500 border border-purple-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              Climate Anomaly
                            </span>
                            <SeverityBadge severity={anomaly.severity} />
                          </div>
                          <h4 className="text-white font-bold mb-1">{anomaly.field_name}</h4>
                          <p className="text-zinc-400 text-sm line-clamp-2 mb-4">{JSON.parse(anomaly.analysis_json).issue}</p>
                          <button className="text-emerald-500 text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all">
                            Review Patterns <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'alerts' && (
                <div className="space-y-8">
                  <header>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Alert Center</h2>
                    <p className="text-zinc-500">System notifications and critical agricultural warnings.</p>
                  </header>
                  <div className="space-y-4">
                    {alerts.map(alert => (
                      <div key={alert.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl flex items-start gap-4">
                        <div className={`p-3 rounded-2xl ${
                          alert.severity === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          <AlertTriangle size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-white font-bold">{alert.field_name}</h4>
                            <span className="text-zinc-500 text-xs">{new Date(alert.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p className="text-zinc-400 text-sm leading-relaxed">{alert.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Environment Stats */}
      <div className="fixed bottom-8 right-8 flex gap-4">
        {[
          { icon: ThermometerSun, val: '24°C', label: 'Temp' },
          { icon: Droplets, val: '62%', label: 'Humidity' },
          { icon: Wind, val: '12km/h', label: 'Wind' }
        ].map((env, i) => (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 + i * 0.1 }}
            key={env.label}
            className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-2xl"
          >
            <env.icon size={16} className="text-emerald-500" />
            <div>
              <p className="text-white font-bold text-xs">{env.val}</p>
              <p className="text-zinc-500 text-[8px] uppercase font-bold tracking-widest">{env.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
