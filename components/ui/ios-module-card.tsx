import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Button } from "./button"
import Link from "next/link"

interface IOSModuleCardProps {
  href: string
  icon: string
  title: string
  description: string
  gradientFrom: string
  gradientTo: string
  variant?: "default" | "danger"
}

export function IOSModuleCard({
  href,
  icon,
  title,
  description,
  gradientFrom,
  gradientTo,
  variant = "default"
}: IOSModuleCardProps) {
  const cardClass = variant === "danger"
    ? "backdrop-blur-xl bg-red-50/80 border border-red-200 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer h-full group"
    : "backdrop-blur-xl bg-white/60 border-0 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer h-full group"

  const titleClass = variant === "danger"
    ? "text-red-700"
    : `bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`

  const buttonClass = variant === "danger"
    ? "w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-md transition-all duration-300"
    : "w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md transition-all duration-300"

  return (
    <Link href={href}>
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <span className="text-4xl group-hover:scale-110 transition-transform">
              {icon}
            </span>
            <span className={titleClass}>{title}</span>
          </CardTitle>
          <CardDescription className={variant === "danger" ? "text-red-600" : "text-gray-600"}>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className={buttonClass}>
            Відкрити модуль
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}

