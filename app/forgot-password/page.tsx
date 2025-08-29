"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Mail, Loader2, CheckCircle2 } from "lucide-react"
import { api } from "@/lib/api"

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("")
	const [loading, setLoading] = useState(false)
	const [done, setDone] = useState(false)
	const [error, setError] = useState("")

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!email) return
		setLoading(true)
		setError("")
		try {
			// Try real API if configured; otherwise simulate
			if (process.env.NEXT_PUBLIC_API_BASE_URL) {
				await api.post("/auth/forgot-password", { email })
			} else {
				await new Promise((r) => setTimeout(r, 800))
			}
			setDone(true)
		} catch (err: any) {
			setError(err?.response?.data?.message || "حدث خطأ أثناء إرسال الرابط. حاول مرةً أخرى.")
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<Card>
					<CardHeader>
						<CardTitle className="text-right">نسيت كلمة المرور</CardTitle>
					</CardHeader>
					<CardContent>
						{done ? (
							<div className="text-center space-y-2 py-4">
								<CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
								<p>تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني إن كان مسجلاً لدينا.</p>
								<Button className="mt-2" onClick={() => (window.location.href = "/login")}>العودة لتسجيل الدخول</Button>
							</div>
						) : (
							<form onSubmit={onSubmit} className="space-y-4" dir="rtl">
								<div className="space-y-2">
									<Label htmlFor="email" className="text-right block">البريد الإلكتروني</Label>
									<div className="relative">
										<Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
										<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pr-10 text-right" placeholder="example@mail.com" required />
									</div>
								</div>
								{error && <p className="text-sm text-red-600">{error}</p>}
								<Button type="submit" className="w-full" disabled={loading}>
									{loading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
									إرسال رابط إعادة التعيين
								</Button>
								<div className="text-center text-sm mt-2">
									<Button type="button" variant="link" onClick={() => (window.location.href = "/login")}>العودة لتسجيل الدخول</Button>
								</div>
							</form>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}


