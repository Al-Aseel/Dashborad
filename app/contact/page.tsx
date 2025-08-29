"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/hooks/use-messages";

export default function ContactPage() {
  const { addMessage } = useMessages();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    body: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.subject || !form.body)
      return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 600));
    addMessage(form);
    setSending(false);
    setSent(true);
    setForm({ name: "", email: "", phone: "", subject: "", body: "" });
  };

  return (
    <DashboardLayout
      title="اتصل بنا"
      description="أرسل لنا رسالة وسنعاود التواصل معك"
    >
      <Card>
        <CardHeader>
          <CardTitle>نموذج الاتصال</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">الموضوع</Label>
              <Input
                id="subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="body">الرسالة</Label>
              <Textarea
                id="body"
                rows={5}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              {sent && (
                <span className="text-green-600 text-sm">
                  تم إرسال رسالتك بنجاح
                </span>
              )}
              <Button type="submit" disabled={sending}>
                {sending ? "جار الإرسال..." : "إرسال"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
