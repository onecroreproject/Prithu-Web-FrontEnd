// services/locationService.js

class LocationService {
  constructor() {
    // CSC API
    this.cscBaseURL = "https://api.countrystatecity.in/v1";
    this.cscApiKey =
      "cUFpaWVBUnd1NEFxMVVZazFNNzRHUDZpalVjeUlkRjhkeU1UZnhGUw==";

    // Nominatim
    this.nominatimURL = "https://nominatim.openstreetmap.org";

    // India Post
    this.indiaPostURL = "https://api.postalpincode.in";

    // Simple cache
    this.cache = {};
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  /* -------------------------------
   * 🔹 CACHE HELPERS
   * ------------------------------- */
  getCache(key) {
    const entry = this.cache[key];
    if (!entry) return null;
    if (Date.now() - entry.time > this.cacheTTL) return null;
    return entry.data;
  }

  setCache(key, data) {
    this.cache[key] = { data, time: Date.now() };
  }

  /* -------------------------------
   * 🌍 COUNTRIES
   * ------------------------------- */
  async getCountries() {
    const cacheKey = "countries";
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const res = await fetch(`${this.cscBaseURL}/countries`, {
      headers: { "X-CSCAPI-KEY": this.cscApiKey }
    });

    const data = await res.json();

    const countries = data.map(c => ({
      name: c.name,
      iso2: c.iso2,
      iso3: c.iso3
    }));

    this.setCache(cacheKey, countries);
    return countries;
  }

  /* -------------------------------
   * 🏛 STATES
   * ------------------------------- */
  async getStates(country) {
    if (!country) return [];

    let countryIso2 = country;

    if (country.length > 2) {
      const countries = await this.getCountries();
      const found = countries.find(
        c => c.name.toLowerCase() === country.toLowerCase()
      );
      if (!found) return [];
      countryIso2 = found.iso2;
    }

    const cacheKey = `states_${countryIso2}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const res = await fetch(
      `${this.cscBaseURL}/countries/${countryIso2}/states`,
      { headers: { "X-CSCAPI-KEY": this.cscApiKey } }
    );

    if (!res.ok) return [];

    const states = await res.json();
    this.setCache(cacheKey, states);
    return states;
  }

  /* -------------------------------
   * 🏙 CITIES (WITH FALLBACK)
   * ------------------------------- */
  async getCities(country, state) {
    if (!country || !state) return [];

    // Country ISO
    let countryIso2 = country;
    if (country.length > 2) {
      const countries = await this.getCountries();
      const found = countries.find(
        c => c.name.toLowerCase() === country.toLowerCase()
      );
      if (!found) return [];
      countryIso2 = found.iso2;
    }

    // State ISO
    let stateIso2 = state;
    if (state.length > 3) {
      const states = await this.getStates(countryIso2);
      const found = states.find(
        s => s.name.toLowerCase() === state.toLowerCase()
      );
      if (!found) return [];
      stateIso2 = found.iso2;
    }

    const cacheKey = `cities_${countryIso2}_${stateIso2}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    // Try CSC first
   const res = await fetch(
  `${this.cscBaseURL}/countries/${countryIso2}/states/${stateIso2}/cities`,
  { headers: { "X-CSCAPI-KEY": this.cscApiKey } }
);

console.log("CSC cities status:", res.status);

if (res.ok) {
  const data = await res.json();
  console.log("CSC cities data:", data);

  const cities = data.map(c => c.name).sort();
  this.setCache(cacheKey, cities);
  return cities;
}

    // 🔁 FALLBACK → Nominatim
    return this.getCitiesFallback(country, state);
  }

  async getCitiesFallback(country, state) {
    const params = new URLSearchParams({
      country,
      state,
      format: "json",
      addressdetails: "1",
      limit: "30"
    });

    const res = await fetch(
      `${this.nominatimURL}/search?${params.toString()}`,
      {
        headers: {
          "User-Agent": "LocationService/1.0 (support@yourdomain.com)"
        }
      }
    );

    const data = await res.json();
    const cities = new Set();

    data.forEach(item => {
      const a = item.address || {};
      if (a.city) cities.add(a.city);
      if (a.town) cities.add(a.town);
      if (a.village) cities.add(a.village);
      if (a.county) cities.add(a.county);
    });

    return [...cities].sort();
  }

  /* -------------------------------
   * 🏘 AREAS / VILLAGES
   * ------------------------------- */
/* -------------------------------
 * 🏘 AREAS / VILLAGES
 * ------------------------------- */
async getAreas({ country, state, city }) {
  if (!city) {
    console.warn("❌ getAreas called without city");
    return [];
  }

  console.log("📍 getAreas → Input:", { country, state, city });

  /* ----------------------------------
   * 1️⃣ FETCH CITY DETAILS
   * ---------------------------------- */
  const cityUrl =
    `${this.nominatimURL}/search?` +
    new URLSearchParams({
      city,
      state,
      country,
      format: "json",
      limit: "1"
    });

  console.log("🌐 City search URL:", cityUrl);

  const cityRes = await fetch(cityUrl, {
    headers: {
      "User-Agent": "LocationService/1.0 (support@yourdomain.com)"
    }
  });

  console.log("📡 City response status:", cityRes.status);

  if (!cityRes.ok) {
    console.error("❌ City search failed");
    return [];
  }

  const cityData = await cityRes.json();
  console.log("🏙 City search response:", cityData);

  if (!cityData.length) {
    console.warn("⚠️ No city data found");
    return [];
  }

  const { lat, lon, boundingbox } = cityData[0];
  console.log("📌 City coordinates:", { lat, lon, boundingbox });

  /* ----------------------------------
   * 2️⃣ FETCH NEARBY AREAS
   * ---------------------------------- */
  const areaUrl =
    `${this.nominatimURL}/search?` +
    new URLSearchParams({
      lat,
      lon,
      city,
      state,
      country,
      format: "json",
      addressdetails: "1",
      limit: "50"
    });

  console.log("🌐 Area search URL:", areaUrl);

  const areaRes = await fetch(areaUrl, {
    headers: {
      "User-Agent": "LocationService/1.0 (support@yourdomain.com)"
    }
  });

  console.log("📡 Area response status:", areaRes.status);

  if (!areaRes.ok) {
    console.error("❌ Area search failed");
    return [];
  }

  const areaData = await areaRes.json();
  console.log("🏘 Raw area results count:", areaData.length);
  console.log("🏘 Raw area data:", areaData);

  /* ----------------------------------
   * 3️⃣ EXTRACT AREAS
   * ---------------------------------- */
  const areas = new Set();

  areaData.forEach((item, index) => {
    const a = item.address || {};

    console.log(`🔍 Area item [${index}] address:`, a);

    if (a.suburb) areas.add(a.suburb);
    if (a.neighbourhood) areas.add(a.neighbourhood);
    if (a.village) areas.add(a.village);
    if (a.hamlet) areas.add(a.hamlet);
    if (a.town && a.town !== city) areas.add(a.town);
  });

  const result = [...areas].sort();

  console.log("✅ Final extracted areas:", result);

  return result;
}






  /* -------------------------------
   * 📮 PINCODES
   * ------------------------------- */
  async getPincodes({ country, area }) {
    if (!area) return [];

    if (country === "India" || country === "IN") {
      const res = await fetch(
        `${this.indiaPostURL}/postoffice/${encodeURIComponent(area)}`
      );
      const data = await res.json();

      if (data[0]?.Status === "Success") {
        return [...new Set(data[0].PostOffice.map(p => p.Pincode))];
      }
      return [];
    }

    return [];
  }

  clearCache() {
    this.cache = {};
  }
}

export const locationService = new LocationService();
