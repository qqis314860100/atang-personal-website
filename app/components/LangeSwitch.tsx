'use client'

import { useState, Fragment } from 'react'
import {
  useParams,
  useRouter,
  useSelectedLayoutSegments,
} from 'next/navigation'
import siteMetadata from '@/data/siteMetadata'
import { Menu, Transition, RadioGroup } from '@headlessui/react'

const { languages } = siteMetadata

const LangSwitch = () => {
  const urlSegments = useSelectedLayoutSegments()
  const router = useRouter()
  const params = useParams()
  const [locale, setLocale] = useState(params?.locale as string)

  const handleLocaleChange = (newLocale: string) => {
    const newUrl = `/${newLocale}/${urlSegments.join('/')}`
    return newUrl
  }

  const handleLinkClick = (newLocale: string) => {
    const resolvedUrl = handleLocaleChange(newLocale)
    router.push(resolvedUrl)
  }

  return (
    <div className="relative inline-block text-left">
      <Menu>
        <div>
          <Menu.Button
            id="dropdown-menu-icon"
            type="button"
            className="dropdown-toggle btn btn-text btn-primary btn-sm"
            aria-haspopup="menu"
            aria-expanded="false"
            aria-label="Dropdown"
          >
            <span className="icon-[solar--planet-bold-duotone] size-6"></span>
            {/* {locale?.charAt(0).toUpperCase() + locale?.slice(1)} */}
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition-all ease-out duration-300"
          enterFrom="opacity-0 scale-95 translate-y-[-10px]"
          enterTo="opacity-100 scale-100 translate-y-0"
          leave="transition-all ease-in duration-200"
          leaveFrom="opacity-100 scale-100 translate-y-0"
          leaveTo="opacity-0 scale-95 translate-y-[10px]"
        >
          <Menu.Items className="absolute right-0 z-50 mt-2 w-12 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800">
            <RadioGroup value={locale} onChange={handleLinkClick}>
              <div className="py-1">
                {languages.map((newLocale: string) => (
                  <RadioGroup.Option key={newLocale} value={newLocale}>
                    <Menu.Item as="div">
                      <div className="group flex w-full items-center rounded-md px-2 py-2 text-sm cursor-pointer">
                        {newLocale.charAt(0).toUpperCase() + newLocale.slice(1)}
                      </div>
                    </Menu.Item>
                  </RadioGroup.Option>
                ))}
              </div>
            </RadioGroup>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
}

export default LangSwitch
