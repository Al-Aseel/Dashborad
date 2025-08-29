"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/shared/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ImageGallery } from "@/components/shared/image-gallery"
import { ProjectStats } from "@/components/projects/project-stats"
import { ProjectForm } from "@/components/projects/project-form"
import { useDebounce } from "@/hooks/use-debounce"
import { Plus, Search, Filter, Edit, Trash2, Eye, Target, Activity, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface Project {
  id: number
  title: string
  description: string
  status: string
  progress: number
  budget: string
  beneficiaries: string
  location: string
  startDate: string
  endDate: string
  category: string
  manager: string
  objectives: string[]
  activities: string[]
  details: string
  mainImage?: string
  gallery: Array<{ url: string; title: string }>
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      title: "مشروع كفالة الأيتام",
      description: "برنامج شامل لكفالة ورعاية الأطفال الأيتام",
      status: "نشط",
      progress: 75,
      budget: "50,000",
      beneficiaries: "120",
      location: "الرياض",
      startDate: "2024-01-15",
      endDate: "2024-12-31",
      category: "الرعاية الاجتماعية",
      manager: "أحمد محمد",
      objectives: ["توفير الرعاية الكاملة للأيتام", "التعليم والتأهيل", "الدعم النفسي"],
      activities: ["كفالة شهرية", "برامج تعليمية", "أنشطة ترفيهية"],
      details: "مشروع شامل يهدف إلى رعاية الأطفال الأيتام وتوفير احتياجاتهم الأساسية",
      mainImage: "/charity-hope-main.png",
      gallery: [
        { url: "/food-aid-distribution.png", title: "توزيع السلال الغذائية" },
        { url: "/youth-education-programs.png", title: "برامج تعليمية" },
      ],
    },
    {
      id: 2,
      title: "مشروع توزيع المواد الغذائية",
      description: "توزيع السلال الغذائية للأسر المحتاجة",
      status: "مكتمل",
      progress: 100,
      budget: "30,000",
      beneficiaries: "200",
      location: "جدة",
      startDate: "2024-02-01",
      endDate: "2024-03-31",
      category: "الإغاثة",
      manager: "فاطمة علي",
      objectives: ["توفير الغذاء للأسر المحتاجة", "تحسين الأمن الغذائي"],
      activities: ["توزيع السلال الغذائية", "متابعة الأسر المستفيدة"],
      details: "مشروع إغاثي لتوزيع المواد الغذائية على الأسر الأكثر احتياجاً",
      mainImage: "/food-aid-distribution.png",
      gallery: [],
    },
    {
      id: 3,
      title: "مشروع التعليم المجاني",
      description: "برنامج تعليمي مجاني للأطفال من الأسر الفقيرة",
      status: "قيد التنفيذ",
      progress: 45,
      budget: "80,000",
      beneficiaries: "150",
      location: "الدمام",
      startDate: "2024-03-01",
      endDate: "2024-08-31",
      category: "التعليم",
      manager: "خالد السعد",
      objectives: ["توفير التعليم المجاني", "تطوير المهارات", "دعم الأسر الفقيرة"],
      activities: ["دروس تقوية", "ورش تدريبية", "توفير الأدوات المدرسية"],
      details: "برنامج تعليمي شامل يهدف إلى دعم الأطفال من الأسر الفقيرة",
      mainImage: "/youth-education-programs.png",
      gallery: [],
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("الكل")
  const [categoryFilter, setCategoryFilter] = useState("الكل")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      const matchesStatus = statusFilter === "الكل" || project.status === statusFilter
      const matchesCategory = categoryFilter === "الكل" || project.category === categoryFilter
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [projects, debouncedSearchTerm, statusFilter, categoryFilter])

  const { toast } = useToast()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "نشط":
        return "bg-green-100 text-green-800"
      case "مكتمل":
        return "bg-blue-100 text-blue-800"
      case "قيد التنفيذ":
        return "bg-yellow-100 text-yellow-800"
      case "متوقف":
        return "bg-red-100 text-red-800"
      case "مخطط":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAddProject = async (projectData: any) => {
    setIsLoading(true)
    try {
      // محاكاة API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newProject: Project = {
        id: Date.now(),
        title: projectData.name,
        description: projectData.description,
        status: projectData.status,
        progress: 0,
        budget: projectData.budget,
        beneficiaries: projectData.beneficiaries,
        location: projectData.location,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        category: projectData.category,
        manager: projectData.manager,
        objectives: projectData.objectives,
        activities: projectData.activities,
        details: projectData.details,
        mainImage: projectData.mainImage,
        gallery: projectData.gallery,
      }
      setProjects([...projects, newProject])
      setIsAddDialogOpen(false)

      toast({
        title: "تم إضافة المشروع بنجاح",
        description: `تم إضافة مشروع "${projectData.name}" بنجاح`,
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "خطأ في إضافة المشروع",
        description: "حدث خطأ أثناء إضافة المشروع. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditProject = async (projectData: any) => {
    if (!selectedProject) return
    setIsLoading(true)
    try {
      // محاكاة API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const updatedProjects = projects.map((project) =>
        project.id === selectedProject.id
          ? {
              ...project,
              title: projectData.name,
              description: projectData.description,
              manager: projectData.manager,
              location: projectData.location,
              budget: projectData.budget,
              beneficiaries: projectData.beneficiaries,
              category: projectData.category,
              status: projectData.status,
              startDate: projectData.startDate,
              endDate: projectData.endDate,
              objectives: projectData.objectives,
              activities: projectData.activities,
              details: projectData.details,
              mainImage: projectData.mainImage,
              gallery: projectData.gallery,
            }
          : project,
      )
      setProjects(updatedProjects)
      setSelectedProject(null)
      setIsEditDialogOpen(false)

      toast({
        title: "تم تحديث المشروع بنجاح",
        description: `تم تحديث مشروع "${projectData.name}" بنجاح`,
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "خطأ في تحديث المشروع",
        description: "حدث خطأ أثناء تحديث المشروع. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProject = async (id: number) => {
    setDeletingId(id)
    try {
      // محاكاة API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const projectToDelete = projects.find((p) => p.id === id)
      setProjects(projects.filter((project) => project.id !== id))

      toast({
        title: "تم حذف المشروع بنجاح",
        description: `تم حذف مشروع "${projectToDelete?.title}" بنجاح`,
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "خطأ في حذف المشروع",
        description: "حدث خطأ أثناء حذف المشروع. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const openEditDialog = (project: Project) => {
    setSelectedProject(project)
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (project: Project) => {
    setSelectedProject(project)
    setIsViewDialogOpen(true)
  }

  const categories = ["الرعاية الاجتماعية", "التعليم", "الصحة", "الإغاثة", "التنمية", "البيئة", "الثقافة"]
  const statuses = ["نشط", "قيد التنفيذ", "مكتمل", "متوقف", "مؤجل", "مخطط"]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة المشاريع</h1>
            <p className="text-gray-600 mt-2">إدارة ومتابعة جميع مشاريع الجمعية</p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsAddDialogOpen(true)}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Plus className="w-4 h-4 ml-2" />}
            مشروع جديد
          </Button>
        </div>

        <ProjectStats projects={projects} />

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في المشاريع..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 ml-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الكل">كل الحالات</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الكل">كل الفئات</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>قائمة المشاريع</CardTitle>
            <CardDescription>جميع المشاريع مع المعلومات الأساسية والإجراءات</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المشروع</TableHead>
                  <TableHead>المدير</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الموقع</TableHead>
                  <TableHead>الميزانية</TableHead>
                  <TableHead>المستفيدون</TableHead>
                  <TableHead>التقدم</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.title}</div>
                        <div className="text-sm text-gray-500">{project.category}</div>
                      </div>
                    </TableCell>
                    <TableCell>{project.manager}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                    </TableCell>
                    <TableCell>{project.location}</TableCell>
                    <TableCell>{project.budget} ريال</TableCell>
                    <TableCell>{project.beneficiaries}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={project.progress} className="h-2 w-16" />
                        <span className="text-sm">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => openViewDialog(project)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(project)}
                          disabled={isLoading}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                              disabled={deletingId === project.id}
                            >
                              {deletingId === project.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف مشروع "{project.title}"؟ لا يمكن التراجع عن هذا الإجراء.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteProject(project.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deletingId === project.id}
                              >
                                {deletingId === project.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    جاري الحذف...
                                  </>
                                ) : (
                                  "حذف"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <ProjectForm
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSubmit={handleAddProject}
          title="إضافة مشروع جديد"
          isLoading={isLoading}
        />

        <ProjectForm
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSubmit={handleEditProject}
          initialData={
            selectedProject
              ? {
                  name: selectedProject.title,
                  description: selectedProject.description,
                  manager: selectedProject.manager,
                  location: selectedProject.location,
                  budget: selectedProject.budget,
                  beneficiaries: selectedProject.beneficiaries,
                  category: selectedProject.category,
                  status: selectedProject.status,
                  startDate: selectedProject.startDate,
                  endDate: selectedProject.endDate,
                  objectives: selectedProject.objectives,
                  activities: selectedProject.activities,
                  details: selectedProject.details,
                  mainImage: selectedProject.mainImage,
                  gallery: selectedProject.gallery,
                }
              : undefined
          }
          title="تعديل المشروع"
          isLoading={isLoading}
        />

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedProject?.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusColor(selectedProject?.status || "")}>{selectedProject?.status}</Badge>
                <Badge variant="outline">{selectedProject?.category}</Badge>
              </div>
            </DialogHeader>
            {selectedProject && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">معلومات أساسية</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">المدير:</span>
                          <span className="font-medium">{selectedProject.manager}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">الموقع:</span>
                          <span className="font-medium">{selectedProject.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">الميزانية:</span>
                          <span className="font-medium">{selectedProject.budget} ريال</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">المستفيدون:</span>
                          <span className="font-medium">{selectedProject.beneficiaries}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">تاريخ البداية:</span>
                          <span className="font-medium">{selectedProject.startDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">تاريخ النهاية:</span>
                          <span className="font-medium">{selectedProject.endDate}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">التقدم</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">نسبة الإنجاز</span>
                          <span className="font-medium">{selectedProject.progress}%</span>
                        </div>
                        <Progress value={selectedProject.progress} className="h-3" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedProject.mainImage && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">الصورة الرئيسية</h4>
                        <img
                          src={selectedProject.mainImage || "/placeholder.svg"}
                          alt={selectedProject.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">الوصف</h4>
                  <p className="text-gray-700">{selectedProject.description}</p>
                </div>

                {selectedProject.objectives.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      الأهداف
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.objectives.map((objective, index) => (
                        <Badge key={index} variant="secondary">
                          {objective}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.activities.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      الأنشطة الرئيسية
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.activities.map((activity, index) => (
                        <Badge key={index} variant="outline">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.details && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">تفاصيل المشروع</h4>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <div dangerouslySetInnerHTML={{ __html: selectedProject.details }} />
                    </div>
                  </div>
                )}

                {selectedProject.gallery.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">معرض الصور الإضافي</h4>
                    <ImageGallery
                      images={selectedProject.gallery.map((img) => img.url)}
                      title={selectedProject.title}
                    />
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedProject.gallery.map((img, index) => (
                        <div key={index} className="text-center">
                          <p className="text-sm text-gray-600 mt-2">{img.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                إغلاق
              </Button>
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false)
                  if (selectedProject) openEditDialog(selectedProject)
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                تعديل المشروع
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Toaster />
    </DashboardLayout>
  )
}
