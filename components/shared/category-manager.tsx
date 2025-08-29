"use client";

import { useMemo, useState, useEffect } from "react";
import {
  useCategories,
  type CategoryModule,
  type CategoryItem,
} from "@/hooks/use-categories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Plus, Trash2, Loader2 } from "lucide-react";

interface CategoryManagerProps {
  module: CategoryModule;
  inUseNames?: string[];
}

export function CategoryManager({
  module,
  inUseNames = [],
}: CategoryManagerProps) {
  const {
    byModule,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,
  } = useCategories();
  const categories = byModule(module);

  useEffect(() => {
    // Fetch only the module-specific categories on mount/open
    refreshCategories(module);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module]);

  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [deleting, setDeleting] = useState<CategoryItem | null>(null);

  const normalize = (s: string) => s.trim().toLowerCase();
  const isDuplicate = useMemo(
    () => categories.some((c) => normalize(c.name) === normalize(name)),
    [categories, name]
  );
  const canSubmit = useMemo(
    () => name.trim().length > 0 && !isDuplicate,
    [name, isDuplicate]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة الفئات</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Label>اسم الفئة</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اكتب اسم الفئة"
              disabled={isSubmitting}
            />
            {isDuplicate && !isSubmitting && (
              <p className="text-sm text-red-600 mt-1">
                هذه الفئة موجودة بالفعل
              </p>
            )}
          </div>
          <Button
            className="shrink-0 h-10 px-5 rounded-md font-medium"
            onClick={async () => {
              if (!canSubmit || isSubmitting) return;
              setIsSubmitting(true);
              const currentName = name.trim();
              const created = await addCategory(currentName, module);
              if (created) {
                // Clear input immediately to avoid transient duplicate warning
                setName("");
                await refreshCategories(module);
              }
              setIsSubmitting(false);
            }}
            disabled={!canSubmit || isSubmitting}
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة
          </Button>
        </div>

        <div className="max-h-80 overflow-y-auto rounded-md border">
          {categories.length === 0 && (
            <div className="flex items-center justify-center py-6 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              جارِ التحميل...
            </div>
          )}
          <Table>
            <TableHeader className="sticky top-0 bg-white">
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditing(cat)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => setDeleting(cat)}
                        disabled={!!cat.isUsed}
                        title={
                          cat.isUsed ? "لا يمكن حذف فئة مستخدمة" : undefined
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل الفئة</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="space-y-2">
                <Label>الاسم</Label>
                <Input
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
                {editing &&
                  categories.some(
                    (c) =>
                      c.id !== editing.id &&
                      normalize(c.name) === normalize(editing.name)
                  ) && (
                    <p className="text-sm text-red-600">
                      اسم الفئة موجود بالفعل
                    </p>
                  )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>
                إلغاء
              </Button>
              <Button
                onClick={async () => {
                  if (!editing) return;
                  const duplicate = categories.some(
                    (c) =>
                      c.id !== editing.id &&
                      normalize(c.name) === normalize(editing.name)
                  );
                  if (duplicate) return;
                  await updateCategory(editing.id, editing.name.trim());
                  await refreshCategories(module);
                  setEditing(null);
                }}
                disabled={
                  !editing ||
                  editing.name.trim().length === 0 ||
                  categories.some(
                    (c) =>
                      c.id !== editing.id &&
                      normalize(c.name) === normalize(editing.name)
                  )
                }
              >
                حفظ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تأكيد الحذف</DialogTitle>
            </DialogHeader>
            <p>
              سيتم حذف الفئة المحددة. هذا لن يحذف العناصر المرتبطة، لكنه قد
              يجعلها بدون فئة.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleting(null)}>
                إلغاء
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={async () => {
                  if (deleting && !deleting.isUsed) {
                    await deleteCategory(deleting.id);
                    await refreshCategories(module);
                  }
                  setDeleting(null);
                }}
                disabled={!!deleting && !!deleting.isUsed}
              >
                حذف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <p className="text-sm text-gray-500">
          ملاحظة: لا يمكن حذف الفئات المرتبطة بعناصر موجودة.
        </p>
      </CardContent>
    </Card>
  );
}
