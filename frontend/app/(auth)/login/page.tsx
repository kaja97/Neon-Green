"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Leaf } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import api from "@/lib/api"
import { useAuthStore } from "@/lib/stores/authStore"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setError(null)
    try {
      // Must use form-data since OAuth2PasswordRequestForm in FastAPI expects it
      const res = await api.post("/auth/login", {
        email_or_phone: data.email,
        password: data.password
      })
      
      const { access_token, refresh_token } = res.data
      
      // Fetch user profile info
      const meRes = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` }
      })
      
      login(meRes.data, access_token, refresh_token)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to login. Please check your credentials.")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mb-8 flex items-center space-x-2">
        <Leaf className="h-8 w-8 text-green-600" />
        <span className="text-2xl font-bold tracking-tight text-green-900">AgriFarm AI</span>
      </div>
      
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Enter your email and password to login to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="farmer@example.com" {...register("email")} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button variant="link" className="p-0" onClick={() => router.push("/register")}>
              Sign up
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
