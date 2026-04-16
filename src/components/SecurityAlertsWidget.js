import React, { useEffect, useState } from 'react';

export default function SecurityAlertsWidget() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/behavior/stats');
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // 30s update
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (id) => {
    // Local state dismissal for UX (in real system, would call API mark-resolved)
    setStats(prev => ({
        ...prev,
        recentThreats: prev.recentThreats.filter(t => t.id !== id)
    }));
  };

  if (loading) return <div className="p-4 border rounded shadow-sm bg-white animate-pulse">Loading Security Alerts...</div>;
  if (!stats) return null;

  return (
    <div className="p-4 border rounded shadow-sm bg-white text-sm">
      <h3 className="font-bold text-lg mb-2">Behavioral Security Engine</h3>
      
      <div className="flex gap-4 mb-4">
        <div className="bg-blue-50 p-2 rounded w-1/2">
          <p className="text-gray-500">Total Analyzed Events</p>
          <p className="text-2xl font-bold">{stats.totalEvents}</p>
        </div>
        <div className="bg-red-50 p-2 rounded w-1/2">
          <p className="text-gray-500">Blocked Attempts</p>
          <p className="text-2xl font-bold text-red-600">{stats.blockedAttempts}</p>
        </div>
      </div>

      <h4 className="font-semibold text-gray-700 mb-2">Recent Threats</h4>
      <div className="space-y-2">
        {stats.recentThreats.length === 0 ? (
            <p className="text-gray-400">No recent anomalies detected.</p>
        ) : stats.recentThreats.map((threat) => (
          <div key={threat.id} className="flex flex-col border-l-2 pl-2 border-orange-400">
            <div className="flex justify-between">
               <span className="font-bold text-orange-700">Risk Score: {threat.riskScore}</span>
               <span className="text-xs text-gray-400">{new Date(threat.createdAt).toLocaleTimeString()}</span>
            </div>
            <p className="text-gray-600">Action: {threat.actionTaken.toUpperCase()}</p>
            <div className="mt-1 flex gap-2">
              <button 
                onClick={() => handleDismiss(threat.id)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
              >
                Dismiss
              </button>
              <button className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded">
                Investigate User
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
