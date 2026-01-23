// ✅ src/components/CreatePostFilter.jsx
import React, { useState } from 'react';
import { Check, Sliders } from 'lucide-react';

const CreatePostFilter = ({ 
  onFilterSelect, 
  onAdjustmentChange,
  currentFilter,
  adjustments,
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState('filters');
  
  // Filter options
  const filters = [
    { id: 'original', name: 'Original' },
    { id: 'aden', name: 'Aden' },
    { id: 'clarendon', name: 'Clarendon' },
    { id: 'crema', name: 'Crema' },
    { id: 'gingham', name: 'Gingham' },
    { id: 'juno', name: 'Juno' },
    { id: 'lark', name: 'Lark' },
    { id: 'ludwig', name: 'Ludwig' },
    { id: 'moon', name: 'Moon' },
    { id: 'perpetua', name: 'Perpetua' },
    { id: 'reyes', name: 'Reyes' },
    { id: 'slumber', name: 'Slumber' }
  ];
  
  // Adjustment options
  const adjustmentOptions = [
    { id: 'brightness', name: 'Brightness', min: -100, max: 100, value: adjustments?.brightness || 0, unit: '%' },
    { id: 'contrast', name: 'Contrast', min: -100, max: 100, value: adjustments?.contrast || 0, unit: '%' },
    { id: 'fade', name: 'Fade', min: 0, max: 100, value: adjustments?.fade || 0, unit: '%' },
    { id: 'saturation', name: 'Saturation', min: -100, max: 100, value: adjustments?.saturation || 0, unit: '%' },
    { id: 'temperature', name: 'Temperature', min: -100, max: 100, value: adjustments?.temperature || 0, unit: '' },
    { id: 'vignette', name: 'Vignette', min: 0, max: 100, value: adjustments?.vignette || 0, unit: '%' }
  ];

  const handleAdjustmentChange = (id, value) => {
    onAdjustmentChange?.(id, parseInt(value));
  };

  const handleResetAdjustments = () => {
    adjustmentOptions.forEach(adj => {
      onAdjustmentChange?.(adj.id, 0);
    });
  };

  // Filter preview styles
  const getFilterPreviewStyle = (filterId) => {
    switch(filterId) {
      case 'aden':
        return { filter: 'sepia(0.2) brightness(1.15) saturate(1.4)' };
      case 'clarendon':
        return { filter: 'contrast(1.2) saturate(1.35)' };
      case 'crema':
        return { filter: 'sepia(0.5) contrast(1.25) brightness(1.15) saturate(0.9)' };
      case 'gingham':
        return { filter: 'contrast(1.1) brightness(1.1)' };
      case 'juno':
        return { filter: 'sepia(0.35) contrast(1.15) brightness(1.15) saturate(1.8)' };
      case 'lark':
        return { filter: 'contrast(0.9)' };
      case 'ludwig':
        return { filter: 'sepia(0.25) contrast(1.05) brightness(1.05) saturate(2)' };
      case 'moon':
        return { filter: 'grayscale(1) contrast(1.1) brightness(1.1)' };
      case 'perpetua':
        return { filter: 'contrast(1.1) brightness(1.25) saturate(1.1)' };
      case 'reyes':
        return { filter: 'sepia(0.75) contrast(0.75) brightness(1.25) saturate(1.4)' };
      case 'slumber':
        return { filter: 'saturate(0.66) brightness(1.05)' };
      default:
        return {};
    }
  };

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-gray-200 flex items-center justify-between shrink-0">
        <h2 className="text-base md:text-lg font-semibold">Edit</h2>
        <button
          onClick={onClose}
          className="text-blue-500 hover:text-blue-600 font-medium text-xs md:text-sm"
        >
          Done
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 shrink-0">
        <button
          className={`flex-1 py-2.5 md:py-3 text-xs md:text-sm font-medium text-center ${activeTab === 'filters' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('filters')}
        >
          Filters
        </button>
        <button
          className={`flex-1 py-2.5 md:py-3 text-xs md:text-sm font-medium text-center ${activeTab === 'adjustments' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('adjustments')}
        >
          Adjust
        </button>
      </div>

      {/* Content - Scrollable area */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        {activeTab === 'filters' ? (
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3">Filters</h3>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 ${currentFilter === filter.id ? 'border-blue-500' : 'border-transparent'}`}
                  onClick={() => onFilterSelect?.(filter.id)}
                >
                  <div 
                    className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center"
                    style={getFilterPreviewStyle(filter.id)}
                  >
                    <span className="text-xs font-medium text-gray-700 bg-white/80 px-1.5 md:px-2 py-0.5 md:py-1 rounded text-center">
                      {filter.name}
                    </span>
                  </div>
                  {currentFilter === filter.id && (
                    <div className="absolute top-1 right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check size={10} className="text-white md:text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3">Adjustments</h3>
            <div className="space-y-3 md:space-y-5">
              {adjustmentOptions.map((adj) => (
                <div key={adj.id} className="space-y-1.5 md:space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm font-medium text-gray-700">{adj.name}</span>
                    <span className="text-xs text-gray-500">
                      {adj.value > 0 ? '+' : ''}{adj.value}{adj.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-xs text-gray-400 w-6 md:w-8 text-center">{adj.min}{adj.unit}</span>
                    <input
                      type="range"
                      min={adj.min}
                      max={adj.max}
                      value={adj.value}
                      onChange={(e) => handleAdjustmentChange(adj.id, e.target.value)}
                      className="flex-1 h-1.5 md:h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 md:[&::-webkit-slider-thumb]:h-4 md:[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                    />
                    <span className="text-xs text-gray-400 w-6 md:w-8 text-center">{adj.max}{adj.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleResetAdjustments}
              className="w-full py-2 md:py-2.5 mt-4 md:mt-6 text-xs md:text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Reset All Adjustments
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePostFilter;
