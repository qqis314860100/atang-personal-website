const NoVideoIDErrot = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-8xl animate-bounce">⚠️</div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">视频ID未提供</h1>
          <p className="text-gray-600 leading-relaxed">
            请确保从正确的链接访问此页面，或者检查URL参数是否正确。
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            返回上一页
          </button>
          <button
            onClick={() => (window.location.href = '/project/video-manage')}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            视频管理
          </button>
        </div>
      </div>
    </div>
  )
}

export default NoVideoIDErrot
