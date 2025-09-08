export const metadata = {
  title: 'El7lm - تسجيل الدخول',
description: 'تسجيل الدخول إلى منصة El7lm',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-purple-950">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
