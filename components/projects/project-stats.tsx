"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, DollarSign, Users, Target } from "lucide-react";

type ProjectLike = {
  status: string;
  budget: string;
  beneficiaries: string;
};

interface ProjectStatsProps {
  projects: ProjectLike[];
  totalNumberOfPrograms?: number;
  numberOfActivePrograms?: number;
  totalBudget?: number;
  totalNumberOfBeneficiaries?: number;
}

export function ProjectStats({
  projects,
  totalNumberOfPrograms,
  numberOfActivePrograms,
  totalBudget,
  totalNumberOfBeneficiaries,
}: ProjectStatsProps) {
  // Use API stats if available, otherwise fallback to calculated stats
  const stats = useMemo(() => {
    if (
      totalNumberOfPrograms !== undefined &&
      numberOfActivePrograms !== undefined &&
      totalBudget !== undefined &&
      totalNumberOfBeneficiaries !== undefined
    ) {
      return {
        total: totalNumberOfPrograms,
        active: numberOfActivePrograms,
        budget: totalBudget,
        beneficiaries: totalNumberOfBeneficiaries,
      };
    }

    // Fallback to calculated stats from projects array
    const activeProjects = projects.filter((p) => p.status === "نشط").length;
    const calculatedBudget = projects.reduce((sum, p) => {
      const budget = Number.parseFloat(p.budget.replace(/[^\d.]/g, "")) || 0;
      return sum + budget;
    }, 0);
    const calculatedBeneficiaries = projects.reduce((sum, p) => {
      const beneficiaries =
        Number.parseInt(p.beneficiaries.replace(/[^\d]/g, "")) || 0;
      return sum + beneficiaries;
    }, 0);

    return {
      total: projects.length,
      active: activeProjects,
      budget: calculatedBudget,
      beneficiaries: calculatedBeneficiaries,
    };
  }, [
    projects,
    totalNumberOfPrograms,
    numberOfActivePrograms,
    totalBudget,
    totalNumberOfBeneficiaries,
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المشاريع</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المشاريع النشطة</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.active}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            إجمالي الميزانية
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.budget.toLocaleString("en-US")} دولار
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            إجمالي المستفيدين
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {stats.beneficiaries.toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
