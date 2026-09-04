'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type DashboardGrowthChartItem = {
  date: string;
  newUsers: number;
  newPosts: number;
  newComments: number;
};

type DashboardGrowthChartProps = {
  data: DashboardGrowthChartItem[];
};

export function DashboardGrowthChart({ data }: DashboardGrowthChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl border border-white/10 bg-white/4 text-sm text-slate-400">
        아직 집계된 통계가 없습니다. 통계 재집계를 먼저 실행해주세요.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">일별 증가 추이</h2>
        <p className="mt-1 text-sm text-slate-400">
          유저, 게시글, 댓글이 날짜별로 얼마나 증가했는지 확인합니다.
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" />

            <XAxis
              dataKey="date"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickMargin={10}
            />

            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickMargin={10}
              allowDecimals={false}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#020617',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                color: '#f8fafc',
              }}
              labelStyle={{
                color: '#c4b5fd',
              }}
            />

            <Line
              type="monotone"
              dataKey="newUsers"
              name="신규 유저"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="newPosts"
              name="신규 게시글"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="newComments"
              name="신규 댓글"
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
