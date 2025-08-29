"use client"

import { DashboardLayout } from "@/components/shared/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Archive, Search, Calendar, FileText, ImageIcon, Trash2, Download } from "lucide-react"

export default function ArchivePage() {
  const archivedItems = [
    {
      id: 1,
      title: "مشروع كفالة الأيتام 2023",
      type: "مشروع",
      date: "2023-12-31",
      size: "15.2 MB",
      description: "ملفات مشروع كفالة الأيتام المكتمل",
      status: "مؤرشف",
    },
    {
      id: 2,
      title: "صور حملة رمضان الخيرية",
      type: "صور",
      date: "2023-05-15",
      size: "45.8 MB",
      description: "مجموعة صور من حملة رمضان الخيرية",
      status: "مؤرشف",
    },
    {
      id: 3,
      title: "تقرير المالي السنوي 2022",
      type: "تقرير",
      date: "2023-01-31",
      size: "3.4 MB",
      description: "التقرير المالي الشامل لعام 2022",
      status: "مؤرشف",
    },
    {
      id: 4,
      title: "أخبار وأنشطة الربع الأول",
      type: "أخبار",
      date: "2023-04-01",
      size: "8.7 MB",
      description: "مجموعة الأخبار والأنشطة للربع الأول",
      status: "مؤرشف",
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case "مشروع":
        return "bg-blue-100 text-blue-800"
      case "صور":
        return "bg-green-100 text-green-800"
      case "تقرير":
        return "bg-purple-100 text-purple-800"
      case "أخبار":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "مشروع":
        return <FileText className="w-4 h-4" />
      case "صور":
        return <ImageIcon className="w-4 h-4" />
      case "تقرير":
        return <FileText className="w-4 h-4" />
      case "أخبار":
        return <FileText className="w-4 h-4" />
      default:
        return <Archive className="w-4 h-4" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الأخبار والأنشطة</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Archive className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">التقارير</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">المشاريع</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <ImageIcon className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">إجمالي العناصر</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <Archive className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="جميع الأنواع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="أخبار">الأخبار والأنشطة</SelectItem>
                  <SelectItem value="تقرير">التقارير</SelectItem>
                  <SelectItem value="مشروع">المشاريع</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="...البحث في الأرشيف" className="pl-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>العناصر المؤرشفة (1)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              <div className="py-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-lg">مشروع الإسكان الطارئ</h3>
                    <Badge variant="outline">مشروع</Badge>
                    <span className="text-xs text-gray-500">نشط</span>
                  </div>
                  <div className="text-sm text-gray-700">السبب: انتهاء المشروع</div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span>تاريخ الأرشفة:</span>
                      <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />10-01-2024</div>
                    </div>
                    <div className="flex items-center gap-1 sm:ml-4">
                      <span>بواسطة:</span>
                      <span>أحمد محمد</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" className="bg-transparent">استرجاع</Button>
                  <Button variant="outline" className="text-red-600 bg-transparent">حذف نهائي</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
