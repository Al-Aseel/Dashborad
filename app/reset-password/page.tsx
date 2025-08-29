"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, KeyRound, Loader2, CheckCircle } from "lucide-react"
import { PasswordService } from "@/lib/users"

export default function ResetPasswordPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")
  const [oldPassword, setOldPassword] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
      // فك تشفير البريد الإلكتروني من الرمز المميز (محاكاة)
      try {
        const decoded = atob(tokenParam)
        const email = decoded.split("@")[0] + "@" + decoded.split("@")[1].split(/\d/)[0]
        setUserEmail(email)
      } catch (error) {
        console.error("خطأ في فك تشفير الرمز المميز:", error)
      }
    }
  }, [searchParams])

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    }
  }

  const passwordValidation = validatePassword(password)

  const handleResetPassword = async () => {
    if (!oldPassword || !password || !confirmPassword) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمة المرور وتأكيد كلمة المرور غير متطابقتين",
        variant: "destructive",
      })
      return
    }

    if (!passwordValidation.isValid) {
      toast({
        title: "كلمة مرور ضعيفة",
        description: "يرجى اتباع متطلبات كلمة المرور المحددة",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      if (!token) throw new Error("missing token")
      await PasswordService.resetPasswordWithToken(token, password, confirmPassword)
      setIsSuccess(true)
      toast({
        title: "تم بنجاح",
        description: "تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول",
      })
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إعادة تعيين كلمة المرور",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600">رابط غير صالح</h2>
              <p className="text-gray-600 mt-2">الرابط المستخدم غير صالح أو منتهي الصلاحية</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-green-600">تم بنجاح!</h2>
              <p className="text-gray-600 mt-2">تم إعادة تعيين كلمة المرور بنجاح</p>
              <Button className="mt-4" onClick={() => (window.location.href = "/login")}>
                الانتقال لتسجيل الدخول
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-6 h-6 text-orange-600" />
          </div>
          <CardTitle className="text-xl">إعادة تعيين كلمة المرور</CardTitle>
          <p className="text-gray-600">يرجى إدخال كلمة مرور جديدة لحسابك</p>
          {userEmail && <p className="text-sm text-orange-600 mt-2">{userEmail}</p>}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oldPassword" className="text-right block">كلمة المرور الحالية</Label>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الحالية"
                className="text-right"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-right block">كلمة المرور الجديدة</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الجديدة"
                className="text-right"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-right block">تأكيد كلمة المرور</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد إدخال كلمة المرور"
                className="text-right"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* متطلبات كلمة المرور */}
          <div className="bg-gray-50 p-3 rounded-lg text-right">
            <h4 className="text-sm font-medium mb-2">متطلبات كلمة المرور:</h4>
            <ul className="space-y-1 text-xs">
              <li
                className={`flex items-center gap-2 ${passwordValidation.minLength ? "text-green-600" : "text-gray-500"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${passwordValidation.minLength ? "bg-green-600" : "bg-gray-300"}`}
                />
                8 أحرف على الأقل
              </li>
              <li
                className={`flex items-center gap-2 ${passwordValidation.hasUpperCase ? "text-green-600" : "text-gray-500"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${passwordValidation.hasUpperCase ? "bg-green-600" : "bg-gray-300"}`}
                />
                حرف كبير واحد على الأقل
              </li>
              <li
                className={`flex items-center gap-2 ${passwordValidation.hasLowerCase ? "text-green-600" : "text-gray-500"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${passwordValidation.hasLowerCase ? "bg-green-600" : "bg-gray-300"}`}
                />
                حرف صغير واحد على الأقل
              </li>
              <li
                className={`flex items-center gap-2 ${passwordValidation.hasNumbers ? "text-green-600" : "text-gray-500"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${passwordValidation.hasNumbers ? "bg-green-600" : "bg-gray-300"}`}
                />
                رقم واحد على الأقل
              </li>
              <li
                className={`flex items-center gap-2 ${passwordValidation.hasSpecialChar ? "text-green-600" : "text-gray-500"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${passwordValidation.hasSpecialChar ? "bg-green-600" : "bg-gray-300"}`}
                />
                رمز خاص واحد على الأقل
              </li>
            </ul>
          </div>

          <Button onClick={handleResetPassword} disabled={isLoading || !passwordValidation.isValid} className="w-full">
            {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            إعادة تعيين كلمة المرور
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
