import { LoginForm } from '@/components/auth/LoginForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Logo } from '@/components/brand/Logo';

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
      {/* Muted Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--color-background))] via-[hsl(var(--color-muted)_/_0.3)] to-[hsl(var(--color-primary)_/_0.1)]" />

      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--color-primary)_/_0.1),transparent_50%)]" />

      {/* Floating Orbs for Visual Interest */}
      <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-[hsl(var(--color-primary)_/_0.1)] blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-[hsl(var(--color-secondary)_/_0.2)] blur-3xl" />

      {/* Content */}
      <Card className="relative w-full max-w-md shadow-2xl backdrop-blur-sm border-[hsl(var(--color-border))]">
        <CardHeader className="text-center space-y-4">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <Logo size="xl" className="rounded-2xl shadow-xl" />
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription className="text-base mt-2">
              Sign in to Digitization Finder
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
