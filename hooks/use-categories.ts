"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export type CategoryModule = "news-activities" | "projects";

export interface CategoryItem {
  id: string;
  name: string;
  module: CategoryModule;
  isUsed?: boolean;
}

function moduleToType(module: CategoryModule): "activity" | "projects" {
  return module === "news-activities" ? "activity" : "projects";
}

export function useCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const modules: CategoryModule[] = useMemo(
    () => ["news-activities", "projects"],
    []
  );

  // Note: We no longer fetch on mount to avoid duplicate requests.
  // Consumers should call refreshCategories(module) explicitly.

  const byModule = useCallback(
    (module: CategoryModule) => categories.filter((c) => c.module === module),
    [categories]
  );

  const addCategory = useCallback(
    async (name: string, module: CategoryModule) => {
      const normalize = (s: string) => s.trim().toLowerCase();
      const exists = categories.some(
        (c) => normalize(c.name) === normalize(name) && c.module === module
      );
      if (exists) return null;
      try {
        const type = moduleToType(module);
        const { data } = await api.post("/category", { name, type });
        const newItem: CategoryItem = {
          id: String(
            data?.id ?? data?._id ?? data?.uuid ?? data?.value ?? name
          ),
          name,
          module,
        };
        setCategories((prev) => [newItem, ...prev]);
        return newItem;
      } catch (error) {
        toast({
          title: "خطأ",
          description: "تعذر إنشاء الفئة",
          variant: "destructive",
        });
        return null;
      }
    },
    [categories]
  );

  const updateCategory = useCallback(async (id: string, name: string) => {
    try {
      await api.put(`/category/${id}`, { name });
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name } : c))
      );
    } catch (error) {
      toast({
        title: "خطأ",
        description: "تعذر تحديث الفئة",
        variant: "destructive",
      });
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await api.delete(`/category/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      toast({
        title: "خطأ",
        description: "تعذر حذف الفئة",
        variant: "destructive",
      });
    }
  }, []);

  const refreshCategories = useCallback(async (module?: CategoryModule) => {
    try {
      if (!module) {
        // Fetch all
        const [activityRes, projectRes] = await Promise.all([
          api.get("/category", { params: { type: "activity" } }),
          api
            .get("/category", { params: { type: "project" } })
            .catch(() => ({ data: [] })),
        ]);
        const activityArray = Array.isArray((activityRes as any)?.data?.data)
          ? (activityRes as any).data.data
          : Array.isArray((activityRes as any)?.data)
          ? (activityRes as any).data
          : [];
        const projectArray = Array.isArray((projectRes as any)?.data?.data)
          ? (projectRes as any).data.data
          : Array.isArray((projectRes as any)?.data)
          ? (projectRes as any).data
          : [];
        const activityItems: CategoryItem[] = activityArray.map((c: any) => ({
          id: String(c.id ?? c._id ?? c.uuid ?? c.value ?? c.name),
          name: c.name,
          module: "news-activities",
          isUsed: Boolean(c.isUsed),
        }));
        const projectItems: CategoryItem[] = projectArray.map((c: any) => ({
          id: String(c.id ?? c._id ?? c.uuid ?? c.value ?? c.name),
          name: c.name,
          module: "projects",
          isUsed: Boolean(c.isUsed),
        }));
        setCategories([...activityItems, ...projectItems]);
      } else {
        const type = moduleToType(module);
        const res = await api.get("/category", { params: { type } });
        const dataArray = Array.isArray((res as any)?.data?.data)
          ? (res as any).data.data
          : Array.isArray((res as any)?.data)
          ? (res as any).data
          : [];
        const items: CategoryItem[] = dataArray.map((c: any) => ({
          id: String(c.id ?? c._id ?? c.uuid ?? c.value ?? c.name),
          name: c.name,
          module,
          isUsed: Boolean(c.isUsed),
        }));
        setCategories((prev) => {
          const others = prev.filter((c) => c.module !== module);
          return [...others, ...items];
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "تعذر تحميل الفئات",
        variant: "destructive",
      });
    }
  }, []);

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    byModule,
    modules,
    refreshCategories,
  };
}
