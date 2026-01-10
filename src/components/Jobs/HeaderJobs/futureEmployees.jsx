import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import axios from '../../../api/axios';

const FeaturedEmployers = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCompany, setHoveredCompany] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/get/all/companies', {
        params: {
          sortBy: 'createdAt',
          sortOrder: 'desc',
          limit: 6,
          isVerified: true,
        }
      });

      if (response.data.success) {
        const companyData = response.data.data
          .slice(0, 6)
          .filter(company => company.profile?.logo || company.profileAvatar)
          .map(company => ({
            id: company._id,
            name: company.companyName || company.name || 'Company',
            logoUrl: company.profile?.logo || company.profileAvatar,
          }));
        
        setCompanies(companyData);
        
        if (companyData.length === 0) {
          setCompanies(getSampleCompanies());
        }
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      setCompanies(getSampleCompanies());
    } finally {
      setLoading(false);
    }
  };

  const getSampleCompanies = () => [
    {
      id: 1,
      name: 'Virtusa',
      logoUrl: 'https://via.placeholder.com/120x120/003366/FFFFFF?text=V',
    },
    {
      id: 2,
      name: 'Infinite',
      logoUrl: 'https://via.placeholder.com/120x120/2E8B57/FFFFFF?text=I',
    },
    {
      id: 3,
      name: 'Qubriux',
      logoUrl: 'https://via.placeholder.com/120x120/8A2BE2/FFFFFF?text=Q',
    },
    {
      id: 4,
      name: 'RAPIDT',
      logoUrl: 'https://via.placeholder.com/120x120/FF4500/FFFFFF?text=R',
    },
    {
      id: 5,
      name: 'APTIV',
      logoUrl: 'https://via.placeholder.com/120x120/1E90FF/FFFFFF?text=A',
    },
    {
      id: 6,
      name: 'Backbase',
      logoUrl: 'https://via.placeholder.com/120x120/228B22/FFFFFF?text=B',
    }
  ];

  const handleLogoError = (e, companyName) => {
    e.target.onerror = null;
    e.target.src = `https://via.placeholder.com/120x120/4F46E5/FFFFFF?text=${companyName.substring(0, 1)}`;
  };

  // Different leaf shapes for variety
  const leafShapes = [
    'rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%]',
    'rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%]',
    'rounded-[30%_70%_50%_50%_/_50%_40%_60%_60%]',
    'rounded-[70%_30%_60%_40%_/_40%_60%_30%_70%]',
    'rounded-[50%_50%_40%_60%_/_60%_40%_70%_30%]',
    'rounded-[45%_55%_65%_35%_/_55%_45%_35%_65%]',
  ];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Featured Employers</h3>
          <p className="text-sm text-gray-600">Hover to see names</p>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-5 sm:grid-cols-5 gap-2">
          {[...Array(6)].map((_, index) => (
            <div 
              key={index} 
              className={`aspect-square ${leafShapes[index]} bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse`}
            ></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-5 sm:grid-cols-5 gap-2">
          {companies.map((company, index) => (
            <div 
              key={company.id}
              className="relative group"
              onMouseEnter={() => setHoveredCompany(company.id)}
              onMouseLeave={() => setHoveredCompany(null)}
            >
              {/* Hover tooltip */}
              {hoveredCompany === company.id && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded whitespace-nowrap">
                    {company.name}
                  </div>
                </div>
              )}
              
              {/* Leaf-shaped logo */}
              <div className={`
                aspect-square overflow-hidden cursor-pointer
                ${leafShapes[index]}
                transition-all duration-500 ease-out
                hover:scale-110
                hover:rotate-3
                hover:shadow-sm
                ${hoveredCompany === company.id ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
              `}>
                <img 
                  src={company.logoUrl}
                  alt={company.name}
                  className="w-full h-full object-cover"
                  onError={(e) => handleLogoError(e, company.name)}
                  loading="lazy"
                />
              </div>
              
              {/* Featured badge */}
              {index < 2 && (
                <div className="absolute -top-1 -right-1 z-10">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedEmployers;