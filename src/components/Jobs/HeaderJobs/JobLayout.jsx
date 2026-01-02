import React, { useState, useEffect, useMemo } from "react";
import JobHeader from "./jobHeader";
import TopCompanies from "./topCompanies";
import FilterSection from "./filterSection";
import JobCards from "./JobCards";
import JobRightSide from "./jobRrightSide";
import CoursesSection from "./courseSection";
import FamousCompanies from "./famouesCompany";
import { getAllJobs } from "../../../Service/jobservices";
import { useLocation, useSearchParams } from "react-router-dom";
import { Briefcase, Filter, X } from "lucide-react";
import Header from "../../Header";

const JobLayout = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [jobTitleSearch, setJobTitleSearch] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [distanceRadius, setDistanceRadius] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationDetails, setLocationDetails] = useState(null);
  
  const [showLocationFilters, setShowLocationFilters] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({
    state: false,
    city: false,
    area: false,
    distance: false
  });
  
  const [searchParams, setSearchParams] = useSearchParams();
  const jobIdParam = searchParams.get("jobId");
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const radiusParam = searchParams.get("radius");

  const location = useLocation();

  const roleParam = searchParams.get("role");
  const cityParam = searchParams.get("city");
  const stateParam = searchParams.get("state");
  const countryParam = searchParams.get("country");
  const companyParam = searchParams.get("company");
  const jobTitleParam = searchParams.get("jobTitle");

  const isSingleJobView = Boolean(jobIdParam);

  // Get company name from company ID
  const companyName = useMemo(() => {
    if (!companyParam || !jobs.length) return companyParam;
    const job = jobs.find(job => job.companyId === companyParam);
    return job ? job.companyName : companyParam;
  }, [companyParam, jobs]);

  // Initialize from URL parameters
  useEffect(() => {
    if (roleParam) setSearchText(roleParam);
    if (jobTitleParam) setJobTitleSearch(jobTitleParam);
    if (cityParam) setSelectedCity(cityParam);
    if (stateParam) setSelectedState(stateParam);
    if (countryParam) setSelectedCountry(countryParam);
    if (radiusParam) setDistanceRadius(radiusParam);

    if (latParam && lngParam) {
      const location = {
        lat: parseFloat(latParam),
        lng: parseFloat(lngParam)
      };
      setUserLocation(location);
      setShowLocationFilters(true);
      
      getLocationName(location.lat, location.lng)
        .then(details => {
          if (details) {
            setLocationDetails(details);
            if (details.city && !selectedCity) setSelectedCity(details.city);
            if (details.state && !selectedState) setSelectedState(details.state);
            if (details.country && !selectedCountry) setSelectedCountry(details.country);
          }
        })
        .catch(err => console.error("Failed to get location name:", err));
    }

    if (selectedCountry || selectedState || selectedCity || userLocation) {
      setShowLocationFilters(true);
    }
  }, [roleParam, jobTitleParam, cityParam, stateParam, countryParam, companyParam, jobIdParam, latParam, lngParam, radiusParam]);

  const [filters, setFilters] = useState({
    employmentType: [],
    workMode: [],
    salaryRange: "",
    experience: "",
    education: [],
    skills: [],
    companyIndustry: "",
    jobFreshness: "",
  });

  // Debug: Monitor filter changes
  useEffect(() => {
    console.log("Filters changed:", filters);
    console.log("Employment Type changed:", filters.employmentType);
  }, [filters]);

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (selectedCategory !== "All") count++;
    if (jobTitleSearch) count++;
    if (selectedState) count++;
    if (selectedCity) count++;
    if (selectedArea) count++;
    if (selectedCountry) count++;
    if (distanceRadius) count++;
    if (filters.employmentType.length > 0) count++;
    if (filters.workMode.length > 0) count++;
    if (filters.salaryRange) count++;
    if (filters.experience) count++;
    if (filters.education.length > 0) count++;
    if (filters.skills.length > 0) count++;
    if (filters.companyIndustry) count++;
    if (filters.jobFreshness) count++;
    setActiveFiltersCount(count);
  }, [selectedCategory, jobTitleSearch, selectedState, selectedCity, selectedArea, selectedCountry, distanceRadius, filters]);

  // Reverse Geocode API
  const getLocationName = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      return {
        city: data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || "",
        state: data.address?.state || "",
        country: data.address?.country || "",
        displayName: data.display_name || ""
      };
    } catch (error) {
      console.error("Reverse geocode failed", error);
      return null;
    }
  };

  // Calculate available filters
  const availableFilters = useMemo(() => {
    if (!jobs || jobs.length === 0) {
      return {
        locations: {
          cities: [],
          states: [],
          countries: []
        }
      };
    }

    const locations = {
      cities: {},
      states: {},
      countries: {}
    };

    jobs.forEach(job => {
      if (job.city) locations.cities[job.city] = (locations.cities[job.city] || 0) + 1;
      if (job.state) locations.states[job.state] = (locations.states[job.state] || 0) + 1;
      if (job.country) locations.countries[job.country] = (locations.countries[job.country] || 0) + 1;
    });

    return {
      locations: {
        cities: Object.entries(locations.cities).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        states: Object.entries(locations.states).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        countries: Object.entries(locations.countries).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
      }
    };
  }, [jobs]);

  // Get unique states
  const states = availableFilters.locations?.states || [];

  // Get cities for selected state
  const citiesForSelectedState = useMemo(() => {
    if (!selectedState || !jobs.length) return [];
    const cityMap = {};
    jobs.forEach(job => {
      if (job.state === selectedState && job.city) {
        cityMap[job.city] = (cityMap[job.city] || 0) + 1;
      }
    });
    return Object.entries(cityMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [selectedState, jobs]);

  // Get areas for selected city
  const areasForSelectedCity = useMemo(() => {
    if (!selectedCity || !jobs.length) return [];
    const areaMap = {};
    jobs.forEach(job => {
      if (job.city === selectedCity && job.area) {
        areaMap[job.area] = (areaMap[job.area] || 0) + 1;
      }
    });
    if (Object.keys(areaMap).length === 0) return [];
    return Object.entries(areaMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [selectedCity, jobs]);

  // Get user's current location
  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);
    setLocationError("");
    setLocationDetails(null);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude } = position.coords;
      const location = { lat: latitude, lng: longitude };
      
      setUserLocation(location);
      setShowLocationFilters(true);
      
      const place = await getLocationName(latitude, longitude);
      
      if (place) {
        setLocationDetails(place);
        if (place.state) setSelectedState(place.state);
        if (place.city) setSelectedCity(place.city);
        if (place.country) setSelectedCountry(place.country);
      }

      setLocationLoading(false);
    } catch (error) {
      setLocationLoading(false);
      handleLocationError(error);
    }
  };

  const handleLocationError = (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setLocationError("Location access denied. Please enable location services in your browser settings.");
        break;
      case error.POSITION_UNAVAILABLE:
        setLocationError("Location information unavailable. Please check your internet connection.");
        break;
      case error.TIMEOUT:
        setLocationError("Location request timed out. Please try again.");
        break;
      default:
        setLocationError("An unknown error occurred while getting your location.");
    }
  };

  // Clear location and radius
  const clearLocationSearch = () => {
    setUserLocation(null);
    setLocationDetails(null);
    setDistanceRadius("");
    setSelectedState("");
    setSelectedCity("");
    setSelectedArea("");
    setSelectedCountry("");
    setLocationError("");
    setShowLocationFilters(false);
    setDropdownOpen({
      state: false,
      city: false,
      area: false,
      distance: false
    });
    
    const params = new URLSearchParams(searchParams);
    params.delete("lat");
    params.delete("lng");
    params.delete("radius");
    params.delete("state");
    params.delete("city");
    setSearchParams(params);
  };

  // Toggle dropdown
  const toggleDropdown = (dropdown) => {
    setDropdownOpen(prev => ({
      state: false,
      city: false,
      area: false,
      distance: false,
      [dropdown]: !prev[dropdown]
    }));
  };

  // Handle state selection
  const handleStateSelect = (state) => {
    setSelectedState(state);
    setSelectedCity("");
    setSelectedArea("");
    setDropdownOpen({
      state: false,
      city: true,
      area: false,
      distance: false
    });
  };

  // Handle city selection
  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setSelectedArea("");
    if (areasForSelectedCity.length > 0) {
      setDropdownOpen({
        state: false,
        city: false,
        area: true,
        distance: false
      });
    } else {
      setDropdownOpen({
        state: false,
        city: false,
        area: false,
        distance: true
      });
    }
  };

  // Handle area selection
  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    setDropdownOpen({
      state: false,
      city: false,
      area: false,
      distance: true
    });
  };

  // Handle distance selection
  const handleDistanceSelect = (radius) => {
    setDistanceRadius(radius);
    setDropdownOpen({
      state: false,
      city: false,
      area: false,
      distance: false
    });
  };

  const fetchJobs = async () => {
    console.log("fetchJobs called with filters:", filters);
    setLoading(true);
    setFadeOut(true);

    try {
      const apiFilters = {};

      if (jobIdParam) {
        apiFilters.jobId = jobIdParam;
        const jobsFromApi = await getAllJobs(apiFilters);
        setJobs(jobsFromApi);
        setFadeOut(false);
        return;
      }

      if (selectedCategory && selectedCategory !== "All")
        apiFilters.category = selectedCategory;

      // Add job title search to API filters
      if (jobTitleSearch) {
        apiFilters.jobTitle = jobTitleSearch;
      }

      if (selectedCity) apiFilters.city = selectedCity;
      if (selectedState) apiFilters.state = selectedState;
      if (selectedCountry) apiFilters.country = selectedCountry;

      if (userLocation && distanceRadius) {
        apiFilters.lat = userLocation.lat;
        apiFilters.lng = userLocation.lng;
        apiFilters.radius = distanceRadius;
      }

      if (searchText) apiFilters.search = searchText;
      if (companyParam) apiFilters.companyId = companyParam;

      // Apply employmentType filter - ensure proper formatting
      if (filters.employmentType.length > 0) {
        console.log("Adding employmentType filter:", filters.employmentType);
        // Format the values to match database format
        apiFilters.employmentType = filters.employmentType.map(type => 
          type.toLowerCase().trim().replace(/\s+/g, '-')
        );
        console.log("Formatted employmentType:", apiFilters.employmentType);
      }
      
      if (filters.workMode.length > 0) {
        console.log("Adding workMode filter:", filters.workMode);
        apiFilters.workMode = filters.workMode;
      }
      
      if (filters.salaryRange) {
        console.log("Adding salaryRange filter:", filters.salaryRange);
        apiFilters.salaryRange = filters.salaryRange;
      }
      
      if (filters.experience) {
        console.log("Adding experience filter:", filters.experience);
        apiFilters.experience = filters.experience;
      }
      
      if (filters.education.length > 0) {
        console.log("Adding education filter:", filters.education);
        apiFilters.education = filters.education;
      }
      
      if (filters.skills.length > 0) {
        console.log("Adding skills filter:", filters.skills);
        apiFilters.skills = filters.skills;
      }
      
      if (filters.companyIndustry) {
        console.log("Adding companyIndustry filter:", filters.companyIndustry);
        apiFilters.companyIndustry = filters.companyIndustry;
      }
      
      if (filters.jobFreshness) {
        console.log("Adding jobFreshness filter:", filters.jobFreshness);
        apiFilters.jobFreshness = filters.jobFreshness;
      }

      console.log("Final API filters being sent:", apiFilters);

      const jobsFromApi = await getAllJobs(apiFilters);
      
      console.log("Jobs received from API:", jobsFromApi);
      
      // Apply client-side filtering as fallback
      let filteredJobs = jobsFromApi;
      
      if (filters.employmentType.length > 0) {
        console.log("Applying client-side employmentType filter");
        filteredJobs = filteredJobs.filter(job => {
          if (!job.employmentType) return false;
          const jobType = job.employmentType.toLowerCase();
          return filters.employmentType.some(type => 
            jobType.includes(type.toLowerCase()) ||
            jobType.includes(type.toLowerCase().replace('-', ' '))
          );
        });
        console.log("After client-side filtering:", filteredJobs.length, "jobs");
      }

      setTimeout(() => {
        setJobs(filteredJobs);
        setFadeOut(false);
      }, 200);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobs([]);
      setFadeOut(false);
    } finally {
      setLoading(false);
    }
  };

  // Debug: Monitor when fetchJobs should be called
  useEffect(() => {
    console.log("fetchJobs dependencies changed:", {
      selectedCategory,
      jobTitleSearch,
      selectedState,
      selectedCity,
      selectedArea,
      selectedCountry,
      searchText,
      filters,
      cityParam,
      countryParam,
      companyParam,
      jobIdParam,
      userLocation,
      distanceRadius
    });
  }, [selectedCategory, jobTitleSearch, selectedState, selectedCity, selectedArea, selectedCountry, searchText, filters, cityParam, countryParam, companyParam, jobIdParam, userLocation, distanceRadius]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs();
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [
    selectedCategory, jobTitleSearch, selectedState, selectedCity, 
    selectedArea, selectedCountry, searchText, filters,
    cityParam, countryParam, companyParam, jobIdParam, 
    userLocation, distanceRadius
  ]);

  const handleFilterChange = (key, value) => {
    console.log(`Filter change: ${key} =`, value);
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearAllFilters = () => {
    console.log("Clearing all filters");
    setSelectedCategory("All");
    setJobTitleSearch("");
    setSelectedState("");
    setSelectedCity("");
    setSelectedArea("");
    setSelectedCountry("");
    setSearchText("");
    setUserLocation(null);
    setLocationDetails(null);
    setDistanceRadius("");
    setShowLocationFilters(false);
    setDropdownOpen({
      state: false,
      city: false,
      area: false,
      distance: false
    });
    setFilters({
      employmentType: [],
      workMode: [],
      salaryRange: "",
      experience: "",
      education: [],
      skills: [],
      companyIndustry: "",
      jobFreshness: "",
    });
    
    if (searchParams.toString()) {
      setSearchParams({});
    }
  };

  const updateUrlFilters = () => {
    const params = new URLSearchParams(searchParams);
    
    if (jobIdParam) return;
    
    params.set("role", searchText || "");
    
    if (jobTitleSearch) {
      params.set("jobTitle", jobTitleSearch);
    } else {
      params.delete("jobTitle");
    }

    if (selectedState) params.set("state", selectedState);
    else params.delete("state");

    if (selectedCity) params.set("city", selectedCity);
    else params.delete("city");

    if (selectedCountry) params.set("country", selectedCountry);
    else params.delete("country");

    if (userLocation) {
      params.set("lat", userLocation.lat);
      params.set("lng", userLocation.lng);
    } else {
      params.delete("lat");
      params.delete("lng");
    }

    if (distanceRadius) {
      params.set("radius", distanceRadius);
    } else {
      params.delete("radius");
    }

    setSearchParams(params);
  };

  useEffect(() => {
    if (jobIdParam) return;
    updateUrlFilters();
  }, [searchText, jobTitleSearch, selectedState, selectedCity, selectedCountry, userLocation, distanceRadius]);

  // Helper functions for labels
  const getSalaryLabel = (range) => {
    const labels = {
      "0-3": "₹0-3L",
      "3-6": "₹3-6L",
      "6-10": "₹6-10L",
      "10-15": "₹10-15L",
      "15-25": "₹15-25L",
      "25+": "₹25L+"
    };
    return labels[range] || range;
  };

  const getExperienceLabel = (level) => {
    const labels = {
      "0": "Fresher",
      "1-3": "1-3 yrs",
      "3-5": "3-5 yrs",
      "5-8": "5-8 yrs",
      "8+": "8+ yrs"
    };
    return labels[level] || level;
  };

  // Distance radius options
  const distanceOptions = [
    { value: "5", label: "Within 5 km" },
    { value: "10", label: "Within 10 km" },
    { value: "20", label: "Within 20 km" },
    { value: "50", label: "Within 50 km" },
    { value: "100", label: "Within 100 km" }
  ];

  // Debug component to show filter status
  const FilterDebugger = () => {
    const partTimeJobs = useMemo(() => {
      return jobs.filter(job => 
        job.employmentType && 
        (job.employmentType.toLowerCase().includes('part-time') || 
         job.employmentType.toLowerCase().includes('part time'))
      );
    }, [jobs]);

    const jobsWithEmploymentType = useMemo(() => {
      return jobs.filter(job => job.employmentType);
    }, [jobs]);

   
  };

  return (
    <>
      <Header/>
      <JobHeader 
        searchText={searchText}
        onSearchChange={setSearchText}
        jobTitleSearch={jobTitleSearch}
        onJobTitleChange={setJobTitleSearch}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        selectedCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        filters={filters}
        onFilterChange={handleFilterChange}
        
        showLocationFilters={showLocationFilters}
        locationLoading={locationLoading}
        locationError={locationError}
        userLocation={userLocation}
        selectedState={selectedState}
        selectedArea={selectedArea}
        distanceRadius={distanceRadius}
        dropdownOpen={dropdownOpen}
        states={states}
        citiesForSelectedState={citiesForSelectedState}
        areasForSelectedCity={areasForSelectedCity}
        distanceOptions={distanceOptions}
        getUserLocation={getUserLocation}
        clearLocationSearch={clearLocationSearch}
        toggleDropdown={toggleDropdown}
        handleStateSelect={handleStateSelect}
        handleCitySelect={handleCitySelect}
        handleAreaSelect={handleAreaSelect}
        handleDistanceSelect={handleDistanceSelect}
      />
      
      {/* Mobile Filters Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="relative bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Filter className="w-5 h-5" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      <div className="w-full px-0 mt-10">
        <div className="w-full">
          <TopCompanies jobs={jobs} />
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && <FilterDebugger />}

        {/* Courses Section */}
        <div className="mb-12">
          <CoursesSection />
        </div>

        {/* Famous Companies Section */}
        <div className="mb-12">
          <FamousCompanies />
        </div>

        {/* Mobile Filters Overlay */}
        {showMobileFilters && !isSingleJobView && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="absolute inset-0 bg-white overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <FilterSection
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  selectedCountry={selectedCountry}
                  onCountryChange={setSelectedCountry}
                  selectedCity={selectedCity}
                  onCityChange={setSelectedCity}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  distanceRadius={distanceRadius}
                  onDistanceChange={setDistanceRadius}
                  userLocation={userLocation}
                  onGetLocation={getUserLocation}
                  locationLoading={locationLoading}
                  locationError={locationError}
                  locationDetails={locationDetails}
                  distanceOptions={distanceOptions}
                  availableFilters={availableFilters}
                  jobs={jobs}
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(roleParam || jobTitleParam || selectedState || selectedCity || selectedArea || countryParam || companyParam || latParam || activeFiltersCount > 0) && (
          <div className="mb-6 w-full px-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Active Filters</h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {roleParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Role: {roleParam}
                  <button
                    onClick={() => {
                      setSearchText("");
                      const params = new URLSearchParams(searchParams);
                      params.delete("role");
                      setSearchParams(params);
                    }}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {jobTitleParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  Job Title: {jobTitleParam}
                  <button
                    onClick={() => {
                      setJobTitleSearch("");
                      const params = new URLSearchParams(searchParams);
                      params.delete("jobTitle");
                      setSearchParams(params);
                    }}
                    className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedState && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  State: {selectedState}
                  <button
                    onClick={() => setSelectedState("")}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCity && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  City: {selectedCity}
                  <button
                    onClick={() => setSelectedCity("")}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedArea && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  Area: {selectedArea}
                  <button
                    onClick={() => setSelectedArea("")}
                    className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCountry && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  Country: {selectedCountry}
                  <button
                    onClick={() => setSelectedCountry("")}
                    className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {companyParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  Company: {companyName}
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.delete("company");
                      setSearchParams(params);
                    }}
                    className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {latParam && lngParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Near Me
                  <button
                    onClick={clearLocationSearch}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {distanceRadius && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  Within {distanceRadius} km
                  <button
                    onClick={() => setDistanceRadius("")}
                    className="ml-1 hover:bg-red-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory !== "All" && !roleParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Category: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.employmentType.map(type => (
                <span key={type} className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                  <button
                    onClick={() => {
                      const updatedTypes = filters.employmentType.filter(t => t !== type);
                      handleFilterChange("employmentType", updatedTypes);
                    }}
                    className="ml-1 hover:bg-pink-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {filters.workMode.map(mode => (
                <span key={mode} className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  <button
                    onClick={() => {
                      const updatedModes = filters.workMode.filter(m => m !== mode);
                      handleFilterChange("workMode", updatedModes);
                    }}
                    className="ml-1 hover:bg-yellow-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {filters.salaryRange && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  Salary: {getSalaryLabel(filters.salaryRange)}
                  <button
                    onClick={() => handleFilterChange("salaryRange", "")}
                    className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.experience && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
                  Exp: {getExperienceLabel(filters.experience)}
                  <button
                    onClick={() => handleFilterChange("experience", "")}
                    className="ml-1 hover:bg-teal-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.education.map(edu => (
                <span key={edu} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  {edu}
                  <button
                    onClick={() => {
                      const updatedEdu = filters.education.filter(e => e !== edu);
                      handleFilterChange("education", updatedEdu);
                    }}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {filters.skills.map(skill => (
                <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                  {skill}
                  <button
                    onClick={() => {
                      const updatedSkills = filters.skills.filter(s => s !== skill);
                      handleFilterChange("skills", updatedSkills);
                    }}
                    className="ml-1 hover:bg-amber-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {filters.companyIndustry && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm">
                  Industry: {filters.companyIndustry}
                  <button
                    onClick={() => handleFilterChange("companyIndustry", "")}
                    className="ml-1 hover:bg-rose-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.jobFreshness && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-lime-100 text-lime-800 rounded-full text-sm">
                  {filters.jobFreshness}
                  <button
                    onClick={() => handleFilterChange("jobFreshness", "")}
                    className="ml-1 hover:bg-lime-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Filters - Desktop */}
            <div className="hidden lg:block lg:col-span-3 pl-4">
              <div className="sticky top-24">
                <FilterSection
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  selectedCountry={selectedCountry}
                  onCountryChange={setSelectedCountry}
                  selectedCity={selectedCity}
                  onCityChange={setSelectedCity}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  distanceRadius={distanceRadius}
                  onDistanceChange={setDistanceRadius}
                  userLocation={userLocation}
                  onGetLocation={getUserLocation}
                  locationLoading={locationLoading}
                  locationError={locationError}
                  locationDetails={locationDetails}
                  distanceOptions={distanceOptions}
                  availableFilters={availableFilters}
                  jobs={jobs}
                />
              </div>
            </div>

            {/* Job Cards - Center */}
            <div className="lg:col-span-6 px-4 lg:px-0">
              {/* Results Count */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Available Jobs
                    </h1>
                    <p className="text-gray-600 mt-2">
                      {isSingleJobView 
                        ? `Showing job details` 
                        : `${jobs.length} job${jobs.length !== 1 ? "s" : ""} found`}
                      {jobTitleSearch && ` for "${jobTitleSearch}"`}
                      {activeFiltersCount > 0 &&
                        ` • ${activeFiltersCount} filter${
                          activeFiltersCount !== 1 ? "s" : ""
                        } active`}
                      {userLocation && distanceRadius && 
                        ` • Showing jobs within ${distanceRadius} km`}
                      {selectedArea && 
                        ` • In ${selectedArea}, ${selectedCity}`}
                      {selectedCity && !selectedArea && 
                        ` • In ${selectedCity}`}
                      {selectedState && !selectedCity && 
                        ` • In ${selectedState}`}
                      {selectedCountry && 
                        ` • In ${selectedCountry}`}
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    <span className="text-sm text-gray-500">Sort by:</span>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                      <option>Most Relevant</option>
                      <option>Newest First</option>
                      <option>Salary: High to Low</option>
                      <option>Salary: Low to High</option>
                      {userLocation && <option>Distance: Nearest First</option>}
                    </select>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                  <p className="text-gray-600">
                    {isSingleJobView ? "Loading job details..." : 
                     jobTitleSearch ? `Searching for "${jobTitleSearch}"...` :
                     userLocation && distanceRadius ? `Finding jobs within ${distanceRadius} km...` : 
                     "Finding the best jobs for you..."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Job Cards with Animation */}
                  <div
                    className={`transition-all duration-300 ease-out ${
                      fadeOut
                        ? "opacity-0 translate-y-4"
                        : "opacity-100 translate-y-0"
                    }`}
                  >
                    {jobs.length > 0 ? (
                      <JobCards jobs={jobs} showDistance={!!userLocation} />
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <Briefcase className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {isSingleJobView ? "Job not found" : "No jobs found"}
                        </h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                          {isSingleJobView 
                            ? "The job you're looking for doesn't exist or has been removed."
                            : jobTitleSearch || roleParam || selectedState || selectedCity || selectedArea || selectedCountry || userLocation
                              ? `No jobs found ${jobTitleSearch ? `for "${jobTitleSearch}"` : ''}${
                                  roleParam && !jobTitleSearch ? `for "${roleParam}"` : ''
                                }${
                                  selectedCountry ? ` in ${selectedCountry}` : ''
                                }${selectedState ? `, ${selectedState}` : ''}${
                                  selectedCity ? `, ${selectedCity}` : ''}${
                                  selectedArea ? ` (${selectedArea})` : ''
                                }${
                                  userLocation && distanceRadius ? ` within ${distanceRadius} km` : ''
                                }.`
                              : "We couldn't find any jobs matching your criteria."
                          }
                        </p>
                        {activeFiltersCount > 0 && (
                          <button
                            onClick={clearAllFilters}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            Clear all filters
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block lg:col-span-3 pr-4">
              <div className="sticky top-24 space-y-6">
                <JobRightSide />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobLayout;