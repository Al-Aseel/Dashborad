"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/shared/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useMessages } from "@/hooks/use-messages"
import { Eye, Mail, Reply, Trash2, Archive as ArchiveIcon, Filter, Search } from "lucide-react"

export default function MessagesPage() {
  const { messages, deleteMessage, reply, markRead, archive, counts } = useMessages()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")

  const selected = messages.find((m) => m.id === selectedId) || null

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      const matchesStatus = statusFilter === "all" || m.status === statusFilter
      const s = search.trim().toLowerCase()
      const matchesSearch =
        s.length === 0 ||
        m.name.toLowerCase().includes(s) ||
        m.email.toLowerCase().includes(s) ||
        m.subject.toLowerCase().includes(s)
      return matchesStatus && matchesSearch
    })
  }, [messages, statusFilter, search])

  const statusBadge = (st: string) => {
    const map: Record<string, string> = {
      new: "bg-blue-100 text-blue-800",
      read: "bg-gray-100 text-gray-800",
      replied: "bg-green-100 text-green-800",
      archived: "bg-yellow-100 text-yellow-800",
    }
    return <Badge className={map[st] || "bg-gray-100 text-gray-800"}>{st}</Badge>
  }

  return (
    <DashboardLayout title="إدارة الرسائل" description="عرض رسائل اتصل بنا والرد عليها">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">الجديدة</p><p className="text-2xl font-bold">{counts.new}</p></div><Mail className="w-5 h-5 text-gray-400"/></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">المقروءة</p><p className="text-2xl font-bold">{counts.read}</p></div><Eye className="w-5 h-5 text-gray-400"/></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">تم الرد</p><p className="text-2xl font-bold">{counts.replied}</p></div><Reply className="w-5 h-5 text-gray-400"/></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium">إجمالي</p><p className="text-2xl font-bold">{counts.total}</p></div><ArchiveIcon className="w-5 h-5 text-gray-400"/></div></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="...ابحث بالاسم أو البريد أو الموضوع" value={search} onChange={(e)=>setSearch(e.target.value)} className="pl-10" />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="border rounded-md p-2 text-sm">
                  <option value="all">جميع الحالات</option>
                  <option value="new">جديدة</option>
                  <option value="read">مقروءة</option>
                  <option value="replied">تم الرد</option>
                  <option value="archived">مؤرشفة</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الرسائل ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المرسل</TableHead>
                  <TableHead>البريد</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>الموضوع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m)=> (
                  <TableRow key={m.id}>
                    <TableCell>{m.name}</TableCell>
                    <TableCell>{m.email}</TableCell>
                    <TableCell>{m.phone}</TableCell>
                    <TableCell className="max-w-xs truncate">{m.subject}</TableCell>
                    <TableCell>{statusBadge(m.status)}</TableCell>
                    <TableCell>{new Date(m.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={()=>{setSelectedId(m.id); setReplyText(m.reply || ""); markRead(m.id, true)}}>عرض</Button>
                        <Button size="sm" variant="outline" onClick={()=>archive(m.id, m.status!=="archived")} className="bg-transparent">{m.status==="archived"?"إزالة من الأرشيف":"أرشفة"}</Button>
                        <Button size="sm" variant="outline" className="text-red-600 bg-transparent" onClick={()=>deleteMessage(m.id)}>
                          <Trash2 className="w-4 h-4"/>
                          حذف
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={!!selectedId} onOpenChange={() => setSelectedId(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selected && (
              <>
                <DialogHeader>
                  <DialogTitle>تفاصيل الرسالة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-600">الاسم:</span> {selected.name}</div>
                    <div><span className="text-gray-600">البريد:</span> {selected.email}</div>
                    <div><span className="text-gray-600">الهاتف:</span> {selected.phone}</div>
                    <div><span className="text-gray-600">التاريخ:</span> {new Date(selected.createdAt).toLocaleString()}</div>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">الموضوع:</p>
                    <p className="font-medium">{selected.subject}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">الرسالة:</p>
                    <div className="p-3 border rounded-md bg-gray-50 whitespace-pre-wrap text-sm">{selected.body}</div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-600 text-sm">الرد:</p>
                    <Textarea rows={4} value={replyText} onChange={(e)=>setReplyText(e.target.value)} placeholder="أكتب ردك هنا" />
                    <div className="flex justify-end">
                      <Button onClick={()=>{reply(selected.id, replyText); setSelectedId(null)}}>إرسال الرد</Button>
                    </div>
                  </div>
                </div>
                <DialogFooter/>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}


