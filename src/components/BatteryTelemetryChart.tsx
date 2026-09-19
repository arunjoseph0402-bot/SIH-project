import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Zap } from 'lucide-react';

export function BatteryTelemetryChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Initial data population
    const initialData = [];
    const now = new Date();
    for (let i = 20; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 1000);
      initialData.push({
        time: time.toLocaleTimeString([], { hour12: false, second: '2-digit', minute: '2-digit', hour: '2-digit' }),
        voltage: 24.0 + (Math.random() * 0.4 - 0.2), // Fluctuates around 24V
        current: 3.5 + (Math.random() * 1.5 - 0.5),  // Fluctuates around 3.5A
      });
    }
    setData(initialData);

    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData.slice(1)];
        const time = new Date().toLocaleTimeString([], { hour12: false, second: '2-digit', minute: '2-digit', hour: '2-digit' });
        newData.push({
          time,
          voltage: 24.0 + (Math.random() * 0.4 - 0.2),
          current: 3.5 + (Math.random() * 1.5 - 0.5),
        });
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col border border-abyssal-border bg-abyssal-base p-3 mt-4 shrink-0">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] text-abyssal-muted tracking-widest uppercase font-mono">LIVE POWER DRAW & VOLTAGE</span>
        <Zap size={14} className="text-abyssal-amber" />
      </div>
      
      <div className="h-32 w-full font-mono text-[9px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#64748B" 
              tick={{ fill: '#64748B', fontSize: 9 }} 
              tickMargin={5}
              minTickGap={15}
            />
            <YAxis 
              yAxisId="left" 
              stroke="#00f0ff" 
              tick={{ fill: '#00f0ff', fontSize: 9 }} 
              domain={[23, 25]} 
              tickCount={5}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#ffb95f" 
              tick={{ fill: '#ffb95f', fontSize: 9 }} 
              domain={[0, 6]} 
              tickCount={5}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0B111B', border: '1px solid #334155', color: '#dde2f1' }}
              itemStyle={{ fontSize: '10px' }}
              labelStyle={{ fontSize: '10px', color: '#64748B', marginBottom: '4px' }}
            />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="voltage" 
              name="Voltage (V)" 
              stroke="#00f0ff" 
              strokeWidth={1.5}
              dot={false} 
              isAnimationActive={false}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="current" 
              name="Current (A)" 
              stroke="#ffb95f" 
              strokeWidth={1.5}
              dot={false} 
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
