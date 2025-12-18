import React from 'react';
const TaxBandVisualization = ({ calculations, formatCurrency }) => {
  const { taxBreakdown } = calculations.taxCalculation;
  const totalTax = calculations.taxCalculation.annualTax;
  const taxableIncome = calculations.taxCalculation.annualTaxableIncome;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Progressive Tax Calculation</h3>
      
      {/* Visual Tax Band Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Taxable Income: {formatCurrency(taxableIncome)}</span>
          <span>Total Tax: {formatCurrency(totalTax)}</span>
        </div>
        <div className="flex h-6 bg-gray-200 rounded-full overflow-hidden">
          {taxBreakdown.map((band, index) => (
            <div
              key={index}
              className="h-full transition-all duration-500"
              style={{
                width: `${(band.taxableAmount / taxableIncome) * 100}%`,
                backgroundColor: `hsl(${index * 40}, 70%, 50%)`
              }}
              title={`${band.band}: ${band.rate} = ${formatCurrency(band.tax)}`}
            />
          ))}
        </div>
      </div>

      {/* Detailed Band Breakdown */}
      <div className="space-y-3">
        {taxBreakdown.map((band, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center flex-1">
              <div 
                className="w-4 h-4 rounded mr-3"
                style={{ backgroundColor: `hsl(${index * 40}, 70%, 50%)` }}
              ></div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{band.band}</div>
                <div className="text-sm text-gray-500">{band.rate} tax rate</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {formatCurrency(band.taxableAmount)} × {band.rate}
              </div>
              <div className="font-semibold text-red-600">{formatCurrency(band.tax)}</div>
            </div>
          </div>
        ))}
        
        {/* Tax Efficiency Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-sm text-gray-600">Effective Tax Rate</div>
            <div className="text-lg font-bold text-gray-900">
              {((totalTax / calculations.annualGrossEmolument) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Marginal Tax Rate</div>
            <div className="text-lg font-bold text-gray-900">
              {taxBreakdown[taxBreakdown.length - 1]?.rate || '0%'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxBandVisualization;