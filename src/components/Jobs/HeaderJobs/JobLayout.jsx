import React, { useState, useEffect, useMemo } from "react";
import JobHeader from "./jobHeader";
import TopCompanies from "./topCompanies";
import FilterSection from "./filterSection";
import JobCards from "./JobCards";
import { getAllJobs } from "../../../Service/jobservices";
import { useLocation, useSearchParams } from "react-router-dom";
import { Heart, X, Briefcase, MapPin, Navigation, MapPinOff, Map, ChevronDown, ChevronUp } from "lucide-react";
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
  const [fadeOut, setFadeOut] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [distanceRadius, setDistanceRadius] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationDetails, setLocationDetails] = useState(null);
  
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [showDistanceDropdown, setShowDistanceDropdown] = useState(false);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const jobIdParam = searchParams.get("jobId");
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const radiusParam = searchParams.get("radius");

  const location = useLocation();

  // Get URL parameters
  const roleParam = searchParams.get("role");
  const cityParam = searchParams.get("city");
  const stateParam = searchParams.get("state");
  const countryParam = searchParams.get("country");
  const companyParam = searchParams.get("company");

  // Check if we're viewing a single job
  const isSingleJobView = Boolean(jobIdParam);

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

  // Reverse Geocode API to get location name from coordinates
  const getLocationName = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      console.log(data);

      return {
        city:
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.municipality ||
          "",
        state: data.address?.state || "",
        country: data.address?.country || "",
        displayName: data.display_name || ""
      };
    } catch (error) {
      console.error("Reverse geocode failed", error);
      return null;
    }
  };

  // Initialize from URL parameters
  useEffect(() => {
    console.log("URL Parameters:", {
      role: roleParam,
      city: cityParam,
      state: stateParam,
      country: countryParam,
      company: companyParam,
      jobId: jobIdParam,
      lat: latParam,
      lng: lngParam,
      radius: radiusParam
    });

    // Initialize search text
    if (roleParam) {
      setSearchText(roleParam);
    }

    // Initialize location filters
    if (cityParam) {
      setSelectedCity(cityParam);
    }
    if (stateParam) {
      setSelectedState(stateParam);
    }
    if (countryParam) {
      setSelectedCountry(countryParam);
    }

    // Initialize radius from URL
    if (radiusParam) {
      setDistanceRadius(radiusParam);
    }

    // Initialize geo coordinates from URL
    if (latParam && lngParam) {
      const location = {
        lat: parseFloat(latParam),
        lng: parseFloat(lngParam)
      };
      setUserLocation(location);
      
      // Try to get location name from coordinates
      getLocationName(location.lat, location.lng)
        .then(details => {
          if (details) {
            setLocationDetails(details);
            if (details.city && !selectedCity) {
              setSelectedCity(details.city);
            }
            if (details.state && !selectedState) {
              setSelectedState(details.state);
            }
            if (details.country && !selectedCountry) {
              setSelectedCountry(details.country);
            }
          }
        })
        .catch(err => console.error("Failed to get location name:", err));
    }

    // Map role to category
    if (roleParam) {
      const roleToCategoryMap = {
        'Designer': 'Design',
        'Developer': 'Technology',
        'Manager': 'Business',
      };
      
      if (roleToCategoryMap[roleParam]) {
        setSelectedCategory(roleToCategoryMap[roleParam]);
      }
    }
  }, [roleParam, cityParam, stateParam, countryParam, companyParam, jobIdParam, latParam, lngParam, radiusParam]);

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

  // Calculate active filters count including distance radius
  useEffect(() => {
    let count = 0;
    if (selectedCategory !== "All") count++;
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
  }, [selectedCategory, selectedState, selectedCity, selectedArea, selectedCountry, distanceRadius, filters]);

  // Calculate available filters from jobs
  const availableFilters = useMemo(() => {
    if (!jobs || jobs.length === 0) {
      return {
        employmentTypes: [],
        workModes: [],
        salaryRanges: [],
        experienceLevels: [],
        locations: {
          cities: [],
          states: [],
          countries: []
        },
        categories: []
      };
    }

    const employmentTypes = {};
    const workModes = {};
    const salaryRanges = {};
    const experienceLevels = {};
    const locations = {
      cities: {},
      states: {},
      countries: {}
    };
    const categories = {};

    jobs.forEach(job => {
      // Count employment types
      if (job.employmentType) {
        const types = Array.isArray(job.employmentType) ? job.employmentType : [job.employmentType];
        types.forEach(type => {
          employmentTypes[type] = (employmentTypes[type] || 0) + 1;
        });
      }

      // Count work modes
      if (job.workMode) {
        const modes = Array.isArray(job.workMode) ? job.workMode : [job.workMode];
        modes.forEach(mode => {
          workModes[mode] = (workModes[mode] || 0) + 1;
        });
      }

      // Categorize salary ranges
      if (job.salaryMin || job.salaryMax) {
        const avgSalary = job.salaryMin ? (job.salaryMin + (job.salaryMax || job.salaryMin)) / 2 : job.salaryMax;
        const inLakhs = avgSalary / 100000;
        
        let range = "";
        if (inLakhs < 3) range = "0-3";
        else if (inLakhs < 6) range = "3-6";
        else if (inLakhs < 10) range = "6-10";
        else if (inLakhs < 15) range = "10-15";
        else if (inLakhs < 25) range = "15-25";
        else range = "25+";
        
        salaryRanges[range] = (salaryRanges[range] || 0) + 1;
      }

      // Categorize experience levels
      if (job.minimumExperience !== undefined) {
        const exp = job.minimumExperience;
        let level = "";
        if (exp === 0) level = "0";
        else if (exp <= 3) level = "1-3";
        else if (exp <= 5) level = "3-5";
        else if (exp <= 8) level = "5-8";
        else level = "8+";
        
        experienceLevels[level] = (experienceLevels[level] || 0) + 1;
      }

      // Count locations
      if (job.city) {
        locations.cities[job.city] = (locations.cities[job.city] || 0) + 1;
      }
      if (job.state) {
        locations.states[job.state] = (locations.states[job.state] || 0) + 1;
      }
      if (job.country) {
        locations.countries[job.country] = (locations.countries[job.country] || 0) + 1;
      }

      // Count categories
      if (job.jobCategory) {
        categories[job.jobCategory] = (categories[job.jobCategory] || 0) + 1;
      }
    });

    return {
      employmentTypes: Object.entries(employmentTypes).map(([value, count]) => ({
        value,
        label: value.charAt(0).toUpperCase() + value.slice(1),
        count
      })).sort((a, b) => b.count - a.count),
      
      workModes: Object.entries(workModes).map(([value, count]) => ({
        value,
        label: value.charAt(0).toUpperCase() + value.slice(1),
        count
      })).sort((a, b) => b.count - a.count),
      
      salaryRanges: Object.entries(salaryRanges).map(([value, count]) => ({
        value,
        label: getSalaryLabel(value),
        count
      })).sort((a, b) => parseInt(a.value.split('-')[0]) - parseInt(b.value.split('-')[0])),
      
      experienceLevels: Object.entries(experienceLevels).map(([value, count]) => ({
        value,
        label: getExperienceLabel(value),
        count
      })).sort((a, b) => {
        const aNum = parseInt(a.value.split('-')[0]) || 0;
        const bNum = parseInt(b.value.split('-')[0]) || 0;
        return aNum - bNum;
      }),
      
      locations: {
        cities: Object.entries(locations.cities).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        states: Object.entries(locations.states).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        countries: Object.entries(locations.countries).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
      },
      
      categories: Object.entries(categories).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
    };
  }, [jobs]);

  // Get unique states
  const states = availableFilters.locations?.states || [];

  // Get cities for selected state
  const citiesForSelectedState = useMemo(() => {
    if (!selectedState || !jobs.length) return [];
    
    // Filter jobs by selected state and get unique cities
    const cityMap = {};
    jobs.forEach(job => {
      if (job.state === selectedState && job.city) {
        cityMap[job.city] = (cityMap[job.city] || 0) + 1;
      }
    });
    
    return Object.entries(cityMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [selectedState, jobs]);

  // Get areas for selected city (mock data - replace with actual area data from your backend)
  const areasForSelectedCity = useMemo(() => {
    if (!selectedCity || !jobs.length) return [];
    
    // Filter jobs by selected city and get unique areas from job data
    const areaMap = {};
    jobs.forEach(job => {
      // Check if job has area field and it matches selected city
      if (job.city === selectedCity && job.area) {
        areaMap[job.area] = (areaMap[job.area] || 0) + 1;
      }
    });
    
    // If no areas in job data, return empty array
    if (Object.keys(areaMap).length === 0) return [];
    
    return Object.entries(areaMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [selectedCity, jobs]);

  // Get user's current location with reverse geocoding
  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);
    setLocationError("");
    setLocationDetails(null);

    try {
      // 1️⃣ Fast attempt (low accuracy)
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 60000
          }
        );
      });

      const { latitude, longitude } = position.coords;
      const location = { lat: latitude, lng: longitude };
      
      setUserLocation(location);
      console.log("📍 Fast location:", latitude, longitude);

      // 2️⃣ Get location name via reverse geocoding
      const place = await getLocationName(latitude, longitude);
      
      if (place) {
        setLocationDetails(place);
        
        // Auto-fill location filters based on detected location
        if (place.state) {
          setSelectedState(place.state);
        }
        if (place.city) {
          setSelectedCity(place.city);
        }
        if (place.country) {
          setSelectedCountry(place.country);
        }
        
        console.log("📍 Location details:", place);
      }

      setLocationLoading(false);
      
    } catch (error) {
      setLocationLoading(false);
      
      if (error.code === error.TIMEOUT) {
        // 3️⃣ Fallback to high accuracy if timeout
        try {
          const highAccuracyPosition = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              reject,
              {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0
              }
            );
          });

          const { latitude, longitude } = highAccuracyPosition.coords;
          const location = { lat: latitude, lng: longitude };
          
          setUserLocation(location);
          console.log("📍 High accuracy location:", latitude, longitude);

          // Get location name
          const place = await getLocationName(latitude, longitude);
          
          if (place) {
            setLocationDetails(place);
            if (place.state) setSelectedState(place.state);
            if (place.city) setSelectedCity(place.city);
            if (place.country) setSelectedCountry(place.country);
          }

          setLocationLoading(false);
        } catch (highAccError) {
          handleLocationError(highAccError);
        }
      } else {
        handleLocationError(error);
      }
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
    console.error("Location error:", error);
  };

  // Clear location and radius
  const clearLocationSearch = () => {
    setUserLocation(null);
    setLocationDetails(null);
    setDistanceRadius("");
    setSelectedState("");
    setSelectedCity("");
    setSelectedArea("");
    setLocationError("");
    
    // Remove from URL
    const params = new URLSearchParams(searchParams);
    params.delete("lat");
    params.delete("lng");
    params.delete("radius");
    params.delete("state");
    params.delete("city");
    setSearchParams(params);
  };

  // Handle state selection
  const handleStateSelect = (state) => {
    setSelectedState(state);
    setSelectedCity("");
    setSelectedArea("");
    setShowStateDropdown(false);
    // Open city dropdown automatically after selecting state
    setShowCityDropdown(true);
    // Close other dropdowns
    setShowAreaDropdown(false);
    setShowDistanceDropdown(false);
  };

  // Handle city selection
  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setSelectedArea("");
    setShowCityDropdown(false);
    // Check if there are areas for this city
    if (areasForSelectedCity.length > 0) {
      setShowAreaDropdown(true);
    } else {
      setShowAreaDropdown(false);
    }
    setShowDistanceDropdown(false);
  };

  // Handle area selection
  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    setShowAreaDropdown(false);
    setShowDistanceDropdown(true);
  };

  // Handle distance selection
  const handleDistanceSelect = (radius) => {
    setDistanceRadius(radius);
    setShowDistanceDropdown(false);
  };

  // Handle country selection from FilterSection
  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    // When country is selected, open state dropdown automatically
    if (country && states.length > 0) {
      setShowStateDropdown(true);
      setShowCityDropdown(false);
      setShowAreaDropdown(false);
      setShowDistanceDropdown(false);
    }
  };

  const fetchJobs = async () => {
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

      // Apply category filter
      if (selectedCategory && selectedCategory !== "All")
        apiFilters.category = selectedCategory;

      // Apply location filters
      if (selectedCity) {
        apiFilters.city = selectedCity;
      }
      if (selectedState) {
        apiFilters.state = selectedState;
      }
      if (selectedCountry) {
        apiFilters.country = selectedCountry;
      }

      // Apply geo search if available
      if (userLocation && distanceRadius) {
        apiFilters.lat = userLocation.lat;
        apiFilters.lng = userLocation.lng;
        apiFilters.radius = distanceRadius;
      }

      // Apply search text
      if (searchText) apiFilters.search = searchText;

      // Add company filter from URL
      if (companyParam) apiFilters.companyId = companyParam;

      // Advanced filters
      if (filters.employmentType.length > 0)
        apiFilters.employmentType = filters.employmentType;

      if (filters.workMode.length > 0)
        apiFilters.workMode = filters.workMode;

      if (filters.salaryRange)
        apiFilters.salaryRange = filters.salaryRange;

      if (filters.experience)
        apiFilters.experience = filters.experience;

      if (filters.education.length > 0)
        apiFilters.education = filters.education;

      if (filters.skills.length > 0)
        apiFilters.skills = filters.skills;

      if (filters.companyIndustry)
        apiFilters.companyIndustry = filters.companyIndustry;

      if (filters.jobFreshness)
        apiFilters.jobFreshness = filters.jobFreshness;

      const jobsFromApi = await getAllJobs(apiFilters);

      setTimeout(() => {
        setJobs(jobsFromApi);
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs();
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [
    selectedCategory, selectedState, selectedCity, selectedArea, selectedCountry, searchText, filters,
    cityParam, countryParam, companyParam, jobIdParam, userLocation, distanceRadius
  ]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedState("");
    setSelectedCity("");
    setSelectedArea("");
    setSelectedCountry("");
    setSearchText("");
    setUserLocation(null);
    setLocationDetails(null);
    setDistanceRadius("");
    // Close all dropdowns
    setShowStateDropdown(false);
    setShowCityDropdown(false);
    setShowAreaDropdown(false);
    setShowDistanceDropdown(false);
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
    
    // Clear URL parameters
    if (searchParams.toString()) {
      setSearchParams({});
    }
  };

  const updateUrlFilters = () => {
    const params = new URLSearchParams(searchParams);
    
    if (jobIdParam) return;  // ⛔ Never overwrite when jobId is present
    
    params.set("role", searchText || "");
    
    if (selectedState) params.set("state", selectedState);
    else params.delete("state");

    if (selectedCity) params.set("city", selectedCity);
    else params.delete("city");

    if (selectedCountry) params.set("country", selectedCountry);
    else params.delete("country");

    // Add geo parameters if available
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

  // Call updateUrlFilters when relevant filters change
  useEffect(() => {
    if (jobIdParam) return; // ⛔ Do NOT modify URL when viewing single job
    updateUrlFilters();
  }, [searchText, selectedState, selectedCity, selectedCountry, userLocation, distanceRadius]);

  // Distance radius options
  const distanceOptions = [
    { value: "5", label: "Within 5 km" },
    { value: "10", label: "Within 10 km" },
    { value: "20", label: "Within 20 km" },
    { value: "50", label: "Within 50 km" },
    { value: "100", label: "Within 100 km" }
  ];
console.log(selectedCountry)
  return (
    <>
    <Header/>
      <JobHeader 
        searchText={searchText}
        onSearchChange={setSearchText}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        selectedCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      
      {/* Mobile Filters Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="relative bg-cyan-600 text-white p-4 rounded-full shadow-lg hover:bg-cyan-700 transition-colors"
        >
          <FilterSection className="w-6 h-6" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filters Overlay */}
      {showMobileFilters && !isSingleJobView && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute inset-0 bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              <div className="flex items-center gap-4">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    Clear all
                  </button>
                )}
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
                onCountryChange={handleCountryChange} // Use the new handler
                selectedCity={selectedCity}
                onCityChange={setSelectedCity}
                filters={filters}
                onFilterChange={handleFilterChange}
                // Pass distance filter props
                distanceRadius={distanceRadius}
                onDistanceChange={setDistanceRadius}
                userLocation={userLocation}
                onGetLocation={getUserLocation}
                locationLoading={locationLoading}
                locationError={locationError}
                locationDetails={locationDetails}
                distanceOptions={distanceOptions}
                // Pass available filters
                availableFilters={availableFilters}
                jobs={jobs}
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 mt-10">
        <TopCompanies jobs={jobs} />
        
        {/* Location Search Section */}
        {!isSingleJobView && (
          <div className="mb-6 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-4 border border-cyan-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-cyan-600" />
                  Find Jobs Near You
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Use your current location to find jobs within your preferred distance
                </p>
                
                {locationError && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-md">
                    <p className="text-red-600 dark:text-red-400 text-sm">{locationError}</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={getUserLocation}
                  disabled={locationLoading}
                  className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium ${
                    userLocation
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                      : "bg-cyan-600 hover:bg-cyan-700 text-white"
                  } ${locationLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {locationLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Getting Location...</span>
                    </>
                  ) : userLocation ? (
                    <>
                      <MapPin className="w-4 h-4" />
                      <span>Location Set ✓</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      <span>Use My Location</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Location Details Display */}
            {locationDetails && (
              <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Map className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        Your Current Location
                      </h4>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {userLocation && `(${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {locationDetails.city && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 dark:text-gray-300">City:</span>
                          <span className="text-sm font-medium text-gray-800 dark:text-white">
                            {locationDetails.city}
                          </span>
                        </div>
                      )}
                      
                      {locationDetails.state && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 dark:text-gray-300">State:</span>
                          <span className="text-sm text-gray-700 dark:text-gray-200">
                            {locationDetails.state}
                          </span>
                        </div>
                      )}
                      
                      {locationDetails.country && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 dark:text-gray-300">Country:</span>
                          <span className="text-sm text-gray-700 dark:text-gray-200">
                            {locationDetails.country}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {/* Active Filters Display */}
        {(roleParam || selectedState || selectedCity || selectedArea || countryParam || companyParam || latParam || activeFiltersCount > 0) && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Active Filters</h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {roleParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 rounded-full text-sm">
                  Role: {roleParam}
                </span>
              )}
              {selectedState && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm">
                  <MapPin className="w-3 h-3" />
                  State: {selectedState}
                </span>
              )}
              {selectedCity && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                  <MapPin className="w-3 h-3" />
                  City: {selectedCity}
                </span>
              )}
              {selectedArea && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
                  <MapPin className="w-3 h-3" />
                  Area: {selectedArea}
                </span>
              )}
              {selectedCountry && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
                  <MapPin className="w-3 h-3" />
                  Country: {selectedCountry}
                </span>
              )}
              {companyParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-sm">
                  Company: {companyParam}
                </span>
              )}
              {latParam && lngParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                  <Navigation className="w-3 h-3" />
                  Near Me
                </span>
              )}
              {distanceRadius && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-sm">
                  Within {distanceRadius} km
                </span>
              )}
              {selectedCategory !== "All" && !roleParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                  Category: {selectedCategory}
                </span>
              )}
              {filters.employmentType.map(type => (
                <span key={type} className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 rounded-full text-sm">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
              ))}
              {filters.workMode.map(mode => (
                <span key={mode} className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm">
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </span>
              ))}
              {filters.salaryRange && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm">
                  Salary: {getSalaryLabel(filters.salaryRange)}
                </span>
              )}
              {filters.experience && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 rounded-full text-sm">
                  Exp: {getExperienceLabel(filters.experience)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Location Filter Chain - Horizontal */}
        {!isSingleJobView && selectedCountry &&(
     
          <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
            {/* State Dropdown */}
            {states.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowStateDropdown(!showStateDropdown);
                    setShowCityDropdown(false);
                    setShowAreaDropdown(false);
                    setShowDistanceDropdown(false);
                  }}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm min-w-[120px]"
                >
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {selectedState || "State"}
                  </span>
                  {showStateDropdown ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                
                {showStateDropdown && (
                  <div className="absolute z-50 right-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 px-2">Select a state</p>
                    </div>
                    {states.map((state) => (
                      <button
                        key={state.name}
                        onClick={() => handleStateSelect(state.name)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 last:border-b-0 text-sm"
                      >
                        <span className="text-gray-700 dark:text-gray-300">{state.name}</span>
                        <span className="text-cyan-500 text-xs">({state.count})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* City Dropdown - Only show if state is selected */}
            {selectedState && citiesForSelectedState.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowCityDropdown(!showCityDropdown);
                    setShowAreaDropdown(false);
                    setShowDistanceDropdown(false);
                  }}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm min-w-[120px]"
                >
                  <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {selectedCity || "City"}
                  </span>
                  {showCityDropdown ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                
                {showCityDropdown && (
                  <div className="absolute z-50 right-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 px-2">Select a city in {selectedState}</p>
                    </div>
                    {citiesForSelectedState.map((city) => (
                      <button
                        key={city.name}
                        onClick={() => handleCitySelect(city.name)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 last:border-b-0 text-sm"
                      >
                        <span className="text-gray-700 dark:text-gray-300">{city.name}</span>
                        <span className="text-cyan-500 text-xs">({city.count})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Area Dropdown - Only show if city is selected AND there are areas available */}
            {selectedCity && areasForSelectedCity.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowAreaDropdown(!showAreaDropdown);
                    setShowDistanceDropdown(false);
                  }}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm min-w-[120px]"
                >
                  <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {selectedArea || "Area"}
                  </span>
                  {showAreaDropdown ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                
                {showAreaDropdown && (
                  <div className="absolute z-50 right-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 px-2">Select an area in {selectedCity} (optional)</p>
                    </div>
                    {areasForSelectedCity.map((area) => (
                      <button
                        key={area.name}
                        onClick={() => handleAreaSelect(area.name)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 last:border-b-0 text-sm"
                      >
                        <span className="text-gray-700 dark:text-gray-300">{area.name}</span>
                        <span className="text-cyan-500 text-xs">({area.count})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Distance Dropdown - Only show if area is selected OR user location is available */}
            {(selectedArea || userLocation) && (
              <div className="relative">
                <button
                  onClick={() => setShowDistanceDropdown(!showDistanceDropdown)}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm min-w-[120px]"
                >
                  <Navigation className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {distanceRadius ? `${distanceRadius}km` : "Distance"}
                  </span>
                  {showDistanceDropdown ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                
                {showDistanceDropdown && (
                  <div className="absolute z-50 right-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 px-2">Select distance radius</p>
                    </div>
                    {distanceOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleDistanceSelect(option.value)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 last:border-b-0 text-sm"
                      >
                        <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
                        {distanceRadius === option.value && (
                          <span className="text-green-500 text-xs">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-10">
          {/* Left Filters - Desktop */}
          <div className="hidden md:block md:col-span-1">
            <FilterSection
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedCountry={selectedCountry}
              onCountryChange={handleCountryChange} // Use the new handler
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
              filters={filters}
              onFilterChange={handleFilterChange}
              // Pass distance filter props
              distanceRadius={distanceRadius}
              onDistanceChange={setDistanceRadius}
              userLocation={userLocation}
              onGetLocation={getUserLocation}
              locationLoading={locationLoading}
              locationError={locationError}
              locationDetails={locationDetails}
              distanceOptions={distanceOptions}
              // Pass available filters
              availableFilters={availableFilters}
              jobs={jobs}
            />
          </div>

          {/* Job Cards */}
          <div className="md:col-span-3">
            {/* Results Count */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Available Jobs
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    {isSingleJobView 
                      ? `Showing job details` 
                      : `${jobs.length} job${jobs.length !== 1 ? "s" : ""} found`}
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
                  <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
                  <select className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200">
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
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent"></div>
                <p className="text-gray-600 dark:text-gray-300">
                  {isSingleJobView ? "Loading job details..." : 
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
                      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <Briefcase className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        {isSingleJobView ? "Job not found" : "No jobs found"}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {isSingleJobView 
                          ? "The job you're looking for doesn't exist or has been removed."
                          : roleParam || selectedState || selectedCity || selectedArea || selectedCountry || userLocation
                            ? `No jobs found for "${roleParam || ''}"${
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
                          className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
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
        </div>
      </div>
    </>
  );
};

export default JobLayout;