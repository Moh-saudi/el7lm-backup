import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface SkillsData {
  skill: string;
  technical: number;
  physical: number;
  social: number;
}

interface SkillsRadarChartProps {
  technicalSkills: Record<string, number>;
  physicalSkills: Record<string, number>;
  socialSkills: Record<string, number>;
}

const SkillsRadarChart: React.FC<SkillsRadarChartProps> = ({
  technicalSkills,
  physicalSkills,
  socialSkills
}) => {
  // تحويل البيانات لمخطط الرادار
  const radarData = Object.keys(technicalSkills).map(skill => ({
    skill: skill === 'ball_control' ? 'التحكم بالكرة'
          : skill === 'passing' ? 'التمرير'
          : skill === 'shooting' ? 'التسديد'
          : skill === 'dribbling' ? 'المراوغة'
          : skill,
    technical: technicalSkills[skill] || 0,
    physical: physicalSkills[skill] || 0,
    social: socialSkills[skill] || 0
  }));

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">تحليل المهارات</h3>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="skill" 
            tick={{ fontSize: 12, fill: '#374151' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 5]} 
            tick={{ fontSize: 10, fill: '#6b7280' }}
          />
          <Radar
            name="المهارات الفنية"
            dataKey="technical"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
          />
          <Radar
            name="المهارات البدنية"
            dataKey="physical"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.3}
          />
          <Radar
            name="المهارات الاجتماعية"
            dataKey="social"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.3}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillsRadarChart; 
