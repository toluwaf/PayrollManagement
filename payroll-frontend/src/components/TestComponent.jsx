import React from 'react';

const TestComponent = () => {
  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
      <div className="shrink-0">
        <div className="h-12 w-12 bg-blue-500 rounded-full"></div>
      </div>
      <div>
        <div className="text-xl font-medium text-black">Tailwind is working!</div>
        <p className="text-gray-500">If you see styled components, Tailwind CSS is properly configured.</p>
      </div>
    </div>
  );
};

export default TestComponent;