import siteMetadata from '@/data/siteMetadata'

const SearchButton = () => {
  if (siteMetadata.search) {
    return (
      <div className="relative mr-1">
        <input
          type="text"
          placeholder={(siteMetadata.search as any).placeholder}
          className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 pr-12 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>
    )
  }
}

export default SearchButton
