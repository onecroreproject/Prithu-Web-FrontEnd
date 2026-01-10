import api from "../api/companyApi"

export const companyProfileService = {
  // Check company profile strength
  async getCompanyProfileStrength() {
    try {
      const response = await api.get('/job/company/profile/strength');
      return response.data;
    } catch (error) {
      console.error('Error checking company profile strength:', error);
      throw error;
    }
  },
};

export const companyLocationService = {
  // Check company location status
  async checkLocationStatus() {
    try {
      const response = await api.post(
        `/job/update/company/location`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('companyToken')}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error checking company location:', error);
      throw error;
    }
  },

  // Update company location
  async updateLocation(latitude, longitude) {
    try {
      const response = await api.post(
        `/job/update/company/location`,
        { latitude, longitude },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('companyToken')}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error updating company location:', error);
      throw error;
    }
  },
};

export default companyLocationService;