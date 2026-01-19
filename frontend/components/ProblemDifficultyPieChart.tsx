'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { motion } from 'framer-motion'

interface ProblemDifficultyPieChartProps {
  easySolved: number
  mediumSolved: number
  hardSolved: number
}

const COLORS = {
  Easy: '#10b981', // green-500
  Medium: '#f59e0b', // amber-500
  Hard: '#ef4444', // red-500
}

const RADIAN = Math.PI / 180

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
}) => {
  if (percent === 0) return null

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-sm font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function ProblemDifficultyPieChart({
  easySolved,
  mediumSolved,
  hardSolved,
}: ProblemDifficultyPieChartProps) {
  const totalSolved = easySolved + mediumSolved + hardSolved

  const data = [
    { name: 'Easy', value: easySolved },
    { name: 'Medium', value: mediumSolved },
    { name: 'Hard', value: hardSolved },
  ].filter((item) => item.value > 0)

  if (totalSolved === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <svg
          className="w-24 h-24 mb-4 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className="text-lg font-medium">No solved problems yet</p>
        <p className="text-sm mt-1">Start solving problems to see your progress!</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: number) => [value, 'Problems']}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => {
              const count =
                value === 'Easy'
                  ? easySolved
                  : value === 'Medium'
                  ? mediumSolved
                  : hardSolved
              return `${value} (${count})`
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
