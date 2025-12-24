
const YTDProjectionSection = ({ projection, formatCurrency }) => {
  if (!projection || projection.completionPercentage === 100) return null;
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Year-to-Date Analysis</h3>
          <p className="text-sm text-gray-600">
            Based on {projection.monthsWorked.toFixed(1)} months worked
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {projection.completionPercentage.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Year completed</div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-sm text-gray-500">YTD Gross</div>
          <div className="text-xl font-semibold mt-1">{formatCurrency(projection.ytdGross)}</div>
          <div className="text-xs text-gray-500 mt-1">
            {((projection.ytdGross / projection.projectedAnnual.gross) * 100).toFixed(1)}% of annual
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-gray-500">YTD Tax</div>
          <div className="text-xl font-semibold text-red-600 mt-1">{formatCurrency(projection.ytdTax)}</div>
          <div className="text-xs text-gray-500 mt-1">
            {((projection.ytdTax / projection.projectedAnnual.tax) * 100).toFixed(1)}% of annual
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-gray-500">YTD Net</div>
          <div className="text-xl font-semibold text-green-600 mt-1">{formatCurrency(projection.ytdNet)}</div>
          <div className="text-xs text-gray-500 mt-1">
            {((projection.ytdNet / projection.projectedAnnual.net) * 100).toFixed(1)}% of annual
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Remaining months in year:</span>
            <span className="font-medium">{projection.remainingMonths.toFixed(1)}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Projected remaining income:</span>
            <span className="font-medium">
              {formatCurrency(projection.projectedAnnual.gross - projection.ytdGross)}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Projected remaining tax:</span>
            <span className="font-medium text-red-600">
              {formatCurrency(projection.projectedAnnual.tax - projection.ytdTax)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YTDProjectionSection;