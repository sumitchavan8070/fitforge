"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RevenueChart({ points }: { points: { label: string; total: number }[] }) {
  const data = points.map((point) => ({
    label: new Date(point.label).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    total: point.total,
  }));
  if (!data.length) return <p className="text-sm text-muted">No sales in this range.</p>;
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#e6e8ec" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="total" fill="#c6f135" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MixChart({ rows }: { rows: { name: string; total: number }[] }) {
  if (!rows.length) return <p className="text-sm text-muted">No category sales in this range.</p>;
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid stroke="#e6e8ec" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="total" fill="#16181d" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
