'use client'

import siteMetadata from '@/data/siteMetadata'
import Link from 'next/link'
import Image from 'next/image'
import headerNavLinks from '@/data/headerNavLink'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'
import LangSwitch from './LangeSwitch'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const Header = ({ locale }: { locale: string }) => {
  // let headerClass =
  //   'flex items-center w-full bg-white dark:bg-gray-950 justify-between py-10'
  // if (siteMetadata.stickyNav) {
  //   headerClass += ' sticky top-0 z-50'
  // }
  const user = { user_metadata: { username: 'test' }, email: 'test@test.com' }
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState<string>('light')

  const handleLocaleChange = (newLocale: string) => {
    const path = pathname.split('/').slice(2).join('/')
    router.push(`/${newLocale}/${path}`)
  }

  const handleSignOut = async () => {
    router.push(`/${locale}/signIn`)
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)

    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme)
      localStorage.setItem('theme', newTheme)

      // 如果使用 dark 类模式，还需要处理 dark 类
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  // 然后在 useEffect 中初始化主题
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'light'
      handleThemeChange(savedTheme)
    }
  }, [])

  return (
    <>
      <nav className="navbar rounded-box justify-between gap-4 shadow">
        <div className="navbar-start">
          <div className="mr-3 rounded-2xl overflow-hidden"></div>
          <button
            type="button"
            className="btn btn-sm btn-text btn-circle swap swap-rotate"
            aria-haspopup="dialog"
            aria-expanded="false"
            aria-controls="overlay-navigation-example"
            data-overlay="#overlay-navigation-example"
          >
            <input aria-label="checkbox" type="checkbox" />
            <span className="icon-[solar--menu-dots-bold-duotone] swap-off size-6"></span>
            <span className="icon-[solar--x] swap-on"></span>
          </button>
        </div>

        <div className="flex gap-2 shrink-0 items-center">
          <div className="input max-md:hidden rounded-full max-w-56">
            <span className="icon-[tabler--search] text-base-content/80 my-auto me-3 size-5 shrink-0"></span>
            <label className="sr-only" htmlFor="searchInput">
              Full Name
            </label>
            <input
              type="search"
              className="grow"
              placeholder="Search"
              id="searchInput"
            />
          </div>
          <ThemeSwitch />
          <LangSwitch />

          {/* Authentication Buttons (Sign In & Register) */}
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="skeleton skeleton-animated animate-pulse h-8 w-24 rounded-full"></div>{' '}
            </div>
          ) : user ? (
            <div className="dropdown relative inline-flex [--auto-close:inside] [--offset:8] [--placement:bottom-end]">
              <button
                id="dropdown-scrollable"
                type="button"
                className="dropdown-toggle flex items-center"
                aria-haspopup="menu"
                aria-expanded="false"
                aria-label="Dropdown"
              >
                <div className="avatar">
                  <div className="size-9.5 rounded-full">
                    <Image
                      src={siteMetadata.siteLogo}
                      alt="avatar 1"
                      width={30}
                      height={30}
                      className="rounded-full"
                    />
                  </div>
                </div>
              </button>
              <ul
                className="dropdown-menu dropdown-open:opacity-100 hidden min-w-60"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="dropdown-avatar"
              >
                <li className="dropdown-header gap-2">
                  <div className="avatar">
                    <div className="w-10 rounded-full">
                      <Image
                        src={siteMetadata.siteLogo}
                        alt="avatar"
                        width={30}
                        height={30}
                      />
                    </div>
                  </div>
                  <div>
                    <h6 className="text-base-content text-base font-semibold">
                      John Doe
                    </h6>
                    <small className="text-base-content/50">Admin</small>
                  </div>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    <span className="icon-[tabler--user]"></span>
                    My Profile
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    <span className="icon-[tabler--settings]"></span>
                    Settings
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    <span className="icon-[tabler--receipt-rupee]"></span>
                    Billing
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    <span className="icon-[tabler--help-triangle]"></span>
                    FAQs
                  </a>
                </li>
                <li className="dropdown-footer gap-2">
                  <a className="btn btn-error btn-soft btn-block" href="#">
                    <span className="icon-[tabler--logout]"></span>
                    Sign out
                  </a>
                </li>
              </ul>
            </div>
          ) : (
            <div className="join">
              <button className="btn btn-outline btn-primary join-item waves waves-primary btn-sm">
                <Link href={`/${locale}/signIn`}>登录</Link>
              </button>
              <button className="btn btn-gradient btn-primary join-item waves waves-primary btn-sm">
                <Link href={`/${locale}/register`}>注册</Link>
              </button>
            </div>
          )}
        </div>
      </nav>

      <aside
        id="overlay-navigation-example"
        className="overlay overlay-open:translate-x-0 drawer drawer-start hidden max-w-72"
        tabIndex={-1}
      >
        {/* Sidebar Header */}
        <div className="drawer-header">
          <h3 className="drawer-title">itsteatv</h3>
          {/* Close Button for Sidebar */}
          <button
            type="button"
            className="btn btn-text btn-circle btn-sm absolute end-3 top-3"
            aria-label="Close"
            data-overlay="#overlay-navigation-example"
          >
            <span className="icon-[solar--close-circle-bold-duotone] size-[1.375rem]"></span>
          </button>
        </div>

        {/* Sidebar Menu */}
        <div className="drawer-body justify-start pb-6">
          <ul className="menu space-y-0.5 p-0 [&_.nested-collapse-wrapper]:space-y-0.5 [&_ul]:space-y-0.5">
            {/* Home Link */}
            {headerNavLinks.map((link) => {
              return (
                <li key={link.href}>
                  <Link
                    href={`/${locale}/${link.href}`}
                    className="flex items-center gap-2"
                  >
                    <span className="icon-[solar--home-bold-duotone] size-5"></span>
                    {link.title}
                  </Link>
                </li>
              )
            })}

            {/* Theme Selection Dropdown */}
            <div className="dropdown relative inline-flex rtl:[--placement:bottom-end] mx-5 pt-3">
              <button
                id="dropdown-default"
                type="button"
                className="dropdown-toggle btn btn-primary btn-outline max-sm:btn-square"
                aria-haspopup="menu"
                aria-expanded="false"
                aria-label="Dropdown"
              >
                <span className="max-sm:hidden">Theme</span>
                <span className="icon-[tabler--aperture] block size-6 sm:hidden"></span>
                <span className="icon-[tabler--chevron-down] dropdown-open:rotate-180 size-5 max-sm:hidden"></span>
              </button>
              {/* Theme Options */}
              <ul
                className="dropdown-menu dropdown-open:opacity-100 hidden min-w-40"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="dropdown-default"
              >
                {[
                  'light',
                  'dark',
                  'gourmet',
                  'corporate',
                  'luxury',
                  'soft',
                ].map((themeOption) => (
                  <li key={themeOption}>
                    <input
                      type="radio"
                      name="theme-dropdown"
                      className="theme-controller btn btn-text w-full justify-start"
                      aria-label={themeOption}
                      value={themeOption}
                      checked={theme === themeOption}
                      onChange={() => handleThemeChange(themeOption)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </ul>
        </div>
      </aside>
    </>
  )
}

export default Header
