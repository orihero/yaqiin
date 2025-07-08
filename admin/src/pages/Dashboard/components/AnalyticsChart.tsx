import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const mockData = [
  { day: 'Mon', value1: 0, value2: 0 },
  { day: 'Tue', value1: 18, value2: 12 },
  { day: 'Wed', value1: 14, value2: 20 },
  { day: 'Thu', value1: 17, value2: 13 },
  { day: 'Fri', value1: 23, value2: 25 },
  { day: 'Sat', value1: 27, value2: 20 },
  { day: 'Sun', value1: 30, value2: 24 },
];

function AnalyticsChart() {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="day" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ background: '#1e293b', border: 'none', color: '#f1f5f9' }} />
          <Line type="monotone" dataKey="value1" stroke="#38bdf8" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="value2" stroke="#a78bfa" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AnalyticsChart; 