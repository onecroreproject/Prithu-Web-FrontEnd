import React from 'react';
import { Users, CheckCircle } from 'lucide-react';

const DiversityConsciousEmployers = () => {
  const companies = [
    {
      id: 1,
      name: 'ECOLAB',
      logoUrl: 'https://via.placeholder.com/60x30/004B87/FFFFFF?text=ECOLAB',
      alt: 'ECOLAB Logo',
      description: 'Water & hygiene tech'
    },
    {
      id: 2,
      name: 'Chubb Business',
      logoUrl: 'https://via.placeholder.com/60x30/1E3A8A/FFFFFF?text=Chubb',
      alt: 'Chubb Logo',
      description: 'Insurance services'
    },
    {
      id: 3,
      name: 'DiverseTech',
      logoUrl: 'https://via.placeholder.com/60x30/7C3AED/FFFFFF?text=DT',
      alt: 'DiverseTech Logo',
      description: 'Tech with diversity'
    },
    {
      id: 4,
      name: 'InclusiveWorks',
      logoUrl: 'https://via.placeholder.com/60x30/059669/FFFFFF?text=IW',
      alt: 'InclusiveWorks Logo',
      description: 'Workplace inclusion'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 overflow-hidden">
      <div className="p-3 border-b border-indigo-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900">Diversity Employers</h3>
              <p className="text-xs text-gray-500">Inclusive workplaces</p>
            </div>
          </div>
          <div className="px-2 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 text-xs font-medium rounded">
            DE&I
          </div>
        </div>
      </div>
      
      <div className="p-3">
        <div className="space-y-2">
          {companies.map((company) => (
            <div 
              key={company.id} 
              className="bg-white/80 backdrop-blur-sm p-2 rounded border border-white/70 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0">
                  <div className="w-10 h-8 bg-white border border-gray-200 rounded flex items-center justify-center">
                    <img 
                      src={company.logoUrl} 
                      alt={company.alt}
                      className="max-w-full max-h-full object-contain p-1"
                    />
                  </div>
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-xs font-medium text-gray-900 truncate">{company.name}</h4>
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500 truncate">{company.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiversityConsciousEmployers;