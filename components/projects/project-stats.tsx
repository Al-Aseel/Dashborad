"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, DollarSign, Users, Target } from "lucide-react"

interface Project {
  id: number
  name: string
  status: string
  budget: string
  beneficiaries: string
}

interface ProjectStatsProps {
  projects: Project[]
}

export function ProjectStats({ projects }: ProjectStatsProps) {
  const stats = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status === "نشط").length
    const totalBudget = projects.reduce((sum, p) => {
      const budget = Number.parseFloat(p.budget.replace(/[^\d.]/g, "")) || 0
      return sum + budget
    }, 0)
    const totalBeneficiaries = projects.reduce((sum, p) => {
      const beneficiaries = Number.parseInt(p.beneficiaries.replace(/[^\d]/g, "")) || 0
      return sum + beneficiaries
    }, 0)

    return {
      total: projects.length,
      active: activeProjects,
      budget: totalBudget,
      beneficiaries: totalBeneficiaries,
    }
  }, [projects])

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
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الميزانية</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.budget.toLocaleString()} ر.س</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المستفيدين</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.beneficiaries.toLocaleString()}</div>
        </CardContent>
      </Card>
    </div>
  )
}
