import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

// Create the Company Context
const CompanyContext = createContext();

// Company Provider Component
export const CompanyProvider = ({ children }) => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch company data from API
  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/company');
      if (response.data.success) {
        setCompany(response.data.company);
      } else {
        throw new Error('Failed to fetch company data');
      }
    } catch (err) {
      console.error('Error fetching company data:', err);
      setError(err.message || 'Failed to load company information');
      // Set fallback data for critical functionality
      setCompany({
        name: 'Prithu',
        tagline: 'Professional Networking Platform',
        about: 'Prithu is your professional networking platform where you can connect, share, and grow your career.',
        email: 'support@prithu.com',
        phone: '+1 (555) 123-4567',
        address: '123 Business Street, Tech City, TC 12345',
        logo: '/assets/prithu_logo.webp',
        favicon: '/favicon.ico',
        socialLinks: {
          linkedin: 'https://linkedin.com/company/prithu',
          twitter: 'https://twitter.com/prithu',
          instagram: 'https://instagram.com/prithu',
          github: 'https://github.com/prithu',
          facebook: 'https://facebook.com/prithu'
        },
        footerText: `© ${new Date().getFullYear()} Prithu. All rights reserved.`
      });
    } finally {
      setLoading(false);
    }
  };

  // Refresh company data
  const refreshCompanyData = () => {
    fetchCompanyData();
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const value = {
    company,
    loading,
    error,
    refreshCompanyData
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};

// Custom hook to use Company Context
export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
