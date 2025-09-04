export const metadata = {
  title: 'El7lm - لوحة الإدارة',
description: 'لوحة إدارة منصة El7lm',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
