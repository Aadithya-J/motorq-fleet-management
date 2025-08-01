import React, { useEffect, useState } from 'react';

export interface Alert {
  id: number;
  alert: string;
  telemetryid: number;
  vehicleid: number;
  timestamp: string;
}

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const getBorderColor = (msg: string) => {
    const text = msg.toLowerCase();
    if (text.includes('speed')) return 'border-red-500';
    if (text.includes('fuel')) return 'border-yellow-500';
    return 'border-blue-500';
  };

  useEffect(() => {
    // Connect to the SSE endpoint
    // connect to backend via Vite proxy at /alert/stream
    const evtSource = new EventSource('/alerts/stream');

    evtSource.onmessage = (e) => {
      try {
        const alertData: Alert = JSON.parse(e.data);
        setAlerts((prev) => [alertData, ...prev]);
      } catch (err) {
        console.error('Failed to parse SSE alert', err);
      }
    };

    evtSource.onerror = (err) => {
      console.error('SSE error', err);
      evtSource.close();
    };

    return () => {
      evtSource.close();
    };
  }, []);

  return (
    <div className="p-4 mx-auto max-w-4xl bg-blue-800 text-white rounded-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Real-time Alerts</h1>
      <div className="max-h-[70vh] overflow-y-auto space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 bg-gray-800 rounded-md flex justify-between items-start shadow hover:bg-gray-700 transition ${getBorderColor(alert.alert)} border-l-4`}
          >
            <div>
              <p className="font-semibold text-white">{alert.alert}</p>
              <p className="text-sm text-gray-400">Vehicle: {alert.vehicleid}</p>
            </div>
            <div className="text-right text-xs text-gray-500">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alerts;
