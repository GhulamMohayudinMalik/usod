const levelColors = {
  low: {
    bg: 'bg-green-50 dark:bg-green-900/30',
    border: 'border-green-200 dark:border-green-900/50',
    text: 'text-green-700 dark:text-green-400',
    icon: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
  },
  medium: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/30',
    border: 'border-yellow-200 dark:border-yellow-900/50',
    text: 'text-yellow-700 dark:text-yellow-400',
    icon: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400'
  },
  high: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    border: 'border-red-200 dark:border-red-900/50',
    text: 'text-red-700 dark:text-red-400',
    icon: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
  },
  critical: {
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    border: 'border-purple-200 dark:border-purple-900/50',
    text: 'text-purple-700 dark:text-purple-400',
    icon: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400'
  }
};

// Default colors in case level isn't in the map
const defaultColors = {
  bg: 'bg-gray-50 dark:bg-gray-800',
  border: 'border-gray-200 dark:border-gray-700',
  text: 'text-gray-700 dark:text-gray-300',
  icon: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
};

export function ThreatCard({ level, source, timestamp, description, confidence, recommendations, onViewDetails, onTakeAction }) {
  const colors = levelColors[level] || defaultColors;
  
  return (
    <div className={`border rounded-lg ${colors.border} ${colors.bg} overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="mr-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colors.icon}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className={`text-base font-semibold ${colors.text} capitalize`}>{level} Threat Level</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">{timestamp}</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{description}</p>
            <div className="mt-2 text-xs">
              <span className="text-gray-600 dark:text-gray-400">Source: </span>
              <span className="text-gray-900 dark:text-gray-200">{source}</span>
            </div>
            <div className="mt-1 text-xs">
              <span className="text-gray-600 dark:text-gray-400">Confidence: </span>
              <span className="text-gray-900 dark:text-gray-200">{Math.round(confidence * 100)}%</span>
            </div>
          </div>
        </div>
        
        {recommendations && recommendations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Recommendations:</h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 pl-4 list-disc">
              {recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex border-t border-gray-200 dark:border-gray-700 divide-x divide-gray-200 dark:divide-gray-700">
        <button 
          onClick={onViewDetails}
          className="flex-1 py-2 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 transition-colors duration-200"
        >
          View Details
        </button>
        <button 
          onClick={onTakeAction}
          className="flex-1 py-2 text-xs font-medium bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 transition-colors duration-200"
        >
          Take Action
        </button>
      </div>
    </div>
  );
} 