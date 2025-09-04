'use client';

import React, { memo } from 'react';
import { Card } from "@/components/ui/card";

interface PlayerSkillsProps {
  userData: Record<string, unknown>;
  loading: boolean;
}

interface Skill {
  name: string;
  value: number;
  color: string;
}

// مكون شريط المهارة محسن
const SkillBar = memo(({ skill }: { skill: Skill }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="font-medium">{skill.name}</span>
      <span className="text-gray-600">{skill.value}%</span>
    </div>
    <div className="h-3 overflow-hidden bg-gray-100 rounded-full">
      <div
        className={`h-full ${skill.color} rounded-full transition-all duration-1000 ease-out`}
        style={{ width: `${skill.value}%` }}
      />
    </div>
  </div>
));

SkillBar.displayName = 'SkillBar';

// البيانات الافتراضية للمهارات
const getSkillsData = (userData: Record<string, unknown>) => ({
  technical: [
    { name: "التحكم بالكرة", value: Number(userData.ball_control) || 85, color: "bg-blue-600" },
    { name: "التمرير", value: Number(userData.passing) || 78, color: "bg-blue-600" },
    { name: "التسديد", value: Number(userData.shooting) || 90, color: "bg-blue-600" },
    { name: "المراوغة", value: Number(userData.dribbling) || 82, color: "bg-blue-600" }
  ],
  physical: [
    { name: "السرعة", value: Number(userData.speed) || 88, color: "bg-green-600" },
    { name: "القوة", value: Number(userData.strength) || 75, color: "bg-green-600" },
    { name: "التحمل", value: Number(userData.stamina) || 85, color: "bg-green-600" },
    { name: "الرشاقة", value: Number(userData.agility) || 80, color: "bg-green-600" }
  ],
  social: [
    { name: "العمل الجماعي", value: Number(userData.teamwork) || 90, color: "bg-purple-600" },
    { name: "التواصل", value: Number(userData.communication) || 85, color: "bg-purple-600" },
    { name: "الانضباط", value: Number(userData.discipline) || 95, color: "bg-purple-600" },
    { name: "الثقة بالنفس", value: Number(userData.confidence) || 88, color: "bg-purple-600" }
  ]
});

const PlayerSkills = memo(({ userData, loading }: PlayerSkillsProps) => {
  const skillsData = getSkillsData(userData);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              {[...Array(4)].map((_, skillIndex) => (
                <div key={skillIndex} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* المهارات في شكل بطاقات */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="mb-6 text-xl font-bold text-blue-600">المهارات الفنية</h3>
          <div className="space-y-6">
            {skillsData.technical.map((skill, index) => (
              <SkillBar key={index} skill={skill} />
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-6 text-xl font-bold text-green-600">المهارات البدنية</h3>
          <div className="space-y-6">
            {skillsData.physical.map((skill, index) => (
              <SkillBar key={index} skill={skill} />
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-6 text-xl font-bold text-purple-600">المهارات الاجتماعية</h3>
          <div className="space-y-6">
            {skillsData.social.map((skill, index) => (
              <SkillBar key={index} skill={skill} />
            ))}
          </div>
        </Card>
      </div>

      {/* ملخص المهارات */}
      <Card className="p-6">
        <h3 className="mb-6 text-xl font-bold">ملخص المهارات</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(skillsData.technical.reduce((sum, skill) => sum + skill.value, 0) / skillsData.technical.length)}%
            </div>
            <div className="text-sm text-gray-600">المهارات الفنية</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(skillsData.physical.reduce((sum, skill) => sum + skill.value, 0) / skillsData.physical.length)}%
            </div>
            <div className="text-sm text-gray-600">المهارات البدنية</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(skillsData.social.reduce((sum, skill) => sum + skill.value, 0) / skillsData.social.length)}%
            </div>
            <div className="text-sm text-gray-600">المهارات الاجتماعية</div>
          </div>
        </div>
      </Card>
    </div>
  );
});

PlayerSkills.displayName = 'PlayerSkills';

export default PlayerSkills;
