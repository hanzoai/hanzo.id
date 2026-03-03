import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'
import { getTenantFromWindow } from '@/lib/tenant'

const SignUp = () => {
  const [searchParams] = useSearchParams()
  const tenant = getTenantFromWindow()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  })
  const [loading, setLoading] = useState(false)

  // Pass through OAuth params
  const clientId = searchParams.get('client_id') ?? searchParams.get('clientId')
  const redirectUri = searchParams.get('redirect_uri') ?? searchParams.get('redirectUri')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password || !formData.name) {
      toast.error('Please fill in all required fields')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (!formData.agreeToTerms) {
      toast.error('You must agree to the terms of service')
      return
    }

    setLoading(true)
    try {
      // Casdoor signup endpoint
      const res = await fetch(`${tenant.iamOrigin}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization: tenant.org,
          username: formData.email,
          name: formData.name,
          password: formData.password,
          email: formData.email,
          application: clientId ?? tenant.defaultClientId,
        }),
      })

      const data = await res.json()

      if (data.status !== 'ok') {
        throw new Error(data.msg || 'Signup failed')
      }

      toast.success('Account created! Please sign in.')

      // Redirect to login with the same OAuth params
      const loginUrl = new URL('/login', window.location.origin)
      searchParams.forEach((v, k) => loginUrl.searchParams.set(k, v))
      window.location.href = loginUrl.toString()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Signup failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--black)] text-[var(--white)] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <a href="/" className="inline-block mb-6">
            <img
              src={tenant.logoUrl}
              alt={`${tenant.displayName} Logo`}
              className="h-8 mx-auto"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </a>
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-neutral-400 mt-2">
            Get started with {tenant.displayName}
          </p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="name"
                  name="name"
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10"
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, agreeToTerms: checked === true }))
                }
                disabled={loading}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{' '}
                <a href={tenant.termsUrl} className="text-white hover:underline" target="_blank" rel="noopener noreferrer">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href={tenant.privacyUrl} className="text-white hover:underline" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full mt-6"
              style={{ backgroundColor: tenant.accentColor }}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Create Account
            </Button>
          </form>
        </div>

        <div className="text-center text-sm text-neutral-400">
          Already have an account?{' '}
          <a
            href={`/login${window.location.search}`}
            className="text-white hover:underline"
          >
            Sign in
          </a>
        </div>

        <div className="text-center text-xs text-neutral-600">
          <a href={tenant.termsUrl} className="hover:underline" target="_blank" rel="noopener noreferrer">Terms</a>
          {' · '}
          <a href={tenant.privacyUrl} className="hover:underline" target="_blank" rel="noopener noreferrer">Privacy</a>
        </div>
      </div>
    </div>
  )
}

export default SignUp
