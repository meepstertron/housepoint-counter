import { Link, useLocation } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const sidebarNavItems = [
    {
        title: "Account",
        href: "/settings",
    },
    {
        title: (
            <span className="flex items-center space-x-1">
                <ArrowRight className="w-4 h-4 text-current" /> <span>Go back</span>
            </span>
        ),
        href: "/",
    },
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const location = useLocation()

  return (
    <div className="space-y-6 p-10 pb-16 md:block">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and set email preferences.
        </p>
      </div>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3 py-2 transition-colors hover:text-gray-900 ${
                  location.pathname === item.href
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  )
}

