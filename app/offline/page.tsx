export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <svg className="w-24 h-24 mx-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">You're Offline</h1>
        
        <p className="text-gray-600 mb-6">
          It looks like you've lost your internet connection. Don't worry - the Clinical Critical Calculator works offline!
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h2 className="font-semibold text-blue-900 mb-2">Available Offline:</h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ All 13 calculators fully functional</li>
            <li>✓ Patient information saved locally</li>
            <li>✓ PDF generation (downloads when online)</li>
            <li>✓ All clinical protocols and guidelines</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
          <h2 className="font-semibold text-yellow-900 mb-2">⚠️ Limited Features:</h2>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Updates require internet connection</li>
            <li>• Some resources may not load</li>
          </ul>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
        >
          Try Reconnecting
        </button>

        <p className="text-xs text-gray-500 mt-4">
          The app will automatically sync when you're back online
        </p>
      </div>
    </div>
  );
}
