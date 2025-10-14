import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Європа Сервіс - CRM",
  description: "Система управління кандидатами та оплатами",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uk">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

