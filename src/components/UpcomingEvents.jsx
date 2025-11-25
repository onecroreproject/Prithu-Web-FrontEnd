import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Star,
  Ticket,
  Heart,
  Share2,
  Filter,
  Search,
  ChevronRight
} from "lucide-react";
 
// Sample event data with high-quality images
const sampleEvents = [
  {
    id: 1,
    title: "Tech Innovation Summit 2024",
    date: "2024-12-15",
    time: "09:00 AM - 06:00 PM",
    venue: "Convention Center",
    city: "San Francisco, CA",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80%22",
    attendees: 1250,
    price: "$199",
    rating: 4.8,
    featured: true,
    description: "Join the biggest tech conference of the year with industry leaders and innovators."
  },
  {
    id: 2,
    title: "Sunset Music Festival",
    date: "2024-11-20",
    time: "04:00 PM - 11:00 PM",
    venue: "Golden Gate Park",
    city: "San Francisco, CA",
    category: "Music",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80%22",
    attendees: 5000,
    price: "$89",
    rating: 4.6,
    featured: true,
    description: "Experience the best electronic music under the stars with world-class DJs."
  },
  {
    id: 3,
    title: "Startup Pitch Competition",
    date: "2024-12-05",
    time: "10:00 AM - 04:00 PM",
    venue: "Innovation Hub",
    city: "Palo Alto, CA",
    category: "Business",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80%22",
    attendees: 300,
    price: "Free",
    rating: 4.4,
    description: "Watch promising startups pitch to top investors and win funding."
  },
  {
    id: 4,
    title: "Art & Wine Exhibition",
    date: "2024-11-25",
    time: "06:00 PM - 10:00 PM",
    venue: "Modern Art Museum",
    city: "San Francisco, CA",
    category: "Art",
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80%22",
    attendees: 200,
    price: "$75",
    rating: 4.7,
    description: "An evening of fine art and exquisite wines from local vineyards."
  },
  {
    id: 5,
    title: "Yoga & Wellness Retreat",
    date: "2024-12-10",
    time: "08:00 AM - 04:00 PM",
    venue: "Ocean View Resort",
    city: "Santa Cruz, CA",
    category: "Wellness",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80%22",
    attendees: 100,
    price: "$120",
    rating: 4.9,
    description: "Rejuvenate your mind and body with expert yoga instructors."
  },
  {
    id: 6,
    title: "Food & Culture Festival",
    date: "2024-11-30",
    time: "11:00 AM - 09:00 PM",
    venue: "Civic Center Plaza",
    city: "San Francisco, CA",
    category: "Food",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80%22",
    attendees: 3000,
    price: "$25",
    rating: 4.5,
    description: "Taste diverse cuisines and experience cultural performances."
  }
];
 
const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setEvents(sampleEvents);
      setLoading(false);
    }, 1500);
 
    return () => clearTimeout(timer);
  }, []);
 
  const categories = ["all", "Technology", "Music", "Business", "Art", "Wellness", "Food"];
 
  const filteredEvents = events.filter(event => {
    const matchesCategory = filter === "all" || event.category === filter;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
 
  const featuredEvents = events.filter(event => event.featured);
 
  if (selectedEvent) {
    return <EventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} />;
  }
 
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Upcoming Events</h1>
              <p className="text-blue-100 text-lg">Discover amazing experiences around you</p>
            </div>
          </div>
        </div>
      </div>
 
      {/* Search and Filter Bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                    filter === category
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  {category === "all" ? "All Events" : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
 
      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 animate-pulse">
                <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {/* Featured Events */}
            {featuredEvents.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                  Featured Events
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {featuredEvents.map(event => (
                    <FeaturedEventCard
                      key={event.id}
                      event={event}
                      onClick={() => setSelectedEvent(event)}
                    />
                  ))}
                </div>
              </section>
            )}
 
            {/* All Events */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                All Events ({filteredEvents.length})
              </h2>
              {filteredEvents.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                  <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No events found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500 max-w-md mx-auto">
                    Try adjusting your search or filter criteria to find more events
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => setSelectedEvent(event)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
 
// Event Card Component
const EventCard = ({ event, onClick }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-700"
    onClick={onClick}
  >
    <div className="relative h-40 overflow-hidden">
      <img
        src={event.image}
        alt={event.title}
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
      />
      <div className="absolute top-3 left-3">
        <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
          {event.category}
        </span>
      </div>
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        {event.rating}
      </div>
    </div>
 
    <div className="p-4">
      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">
        {event.title}
      </h3>
 
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span>{new Date(event.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <MapPin className="w-4 h-4 text-blue-500" />
          <span className="truncate">{event.venue}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Users className="w-4 h-4 text-blue-500" />
          <span>{event.attendees.toLocaleString()} attending</span>
        </div>
      </div>
 
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
          {event.price === "Free" ? "FREE" : `From ${event.price}`}
        </span>
        <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
    </div>
  </motion.div>
);
 
// Featured Event Card Component
const FeaturedEventCard = ({ event, onClick }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-blue-200 dark:border-gray-700"
    onClick={onClick}
  >
    <div className="flex flex-col md:flex-row">
      <div className="md:w-2/5 h-48 md:h-auto">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            {event.category}
          </span>
          <div className="flex items-center gap-1 text-yellow-600">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-xs font-medium">{event.rating}</span>
          </div>
        </div>
       
        <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-3">
          {event.title}
        </h3>
       
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>
 
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>{new Date(event.date).toLocaleDateString()} • {event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>{event.venue}, {event.city}</span>
          </div>
        </div>
 
        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {event.price === "Free" ? "FREE" : event.price}
          </span>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-colors">
            Get Tickets
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);
 
// Event Detail Component
const EventDetail = ({ event, onBack }) => (
  <div className="min-h-screen bg-white dark:bg-gray-900">
    {/* Back Button */}
    <div className="container mx-auto px-4 py-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mb-4"
      >
        <ChevronRight className="w-5 h-5 rotate-180" />
        Back to Events
      </button>
    </div>
 
    {/* Event Hero */}
    <div className="relative h-64 sm:h-80 lg:h-96">
      <img
        src={event.image}
        alt={event.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
 
      <div className="absolute bottom-4 left-4 text-white">
        <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-medium mb-2 inline-block">
          {event.category}
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{event.title}</h1>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{event.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{event.attendees.toLocaleString()} attending</span>
          </div>
        </div>
      </div>
    </div>
 
    {/* Event Content */}
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
            {event.description}
          </p>
 
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-500" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-gray-600 dark:text-gray-300">{event.time}</p>
              </div>
            </div>
 
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <MapPin className="w-6 h-6 text-blue-500" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{event.venue}</p>
                <p className="text-gray-600 dark:text-gray-300">{event.city}</p>
              </div>
            </div>
          </div>
        </div>
 
        <div className="lg:col-span-1">
          <div className="bg-blue-50 dark:bg-gray-800 rounded-2xl p-6 border border-blue-200 dark:border-gray-700 sticky top-4">
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {event.price === "Free" ? "FREE" : event.price}
              </p>
              <p className="text-gray-600 dark:text-gray-300">per person</p>
            </div>
 
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold mb-4 transition-colors flex items-center justify-center gap-2">
              <Ticket className="w-5 h-5" />
              Get Tickets Now
            </button>
 
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-white dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <Heart className="w-4 h-4" />
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-white dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
 
export default UpcomingEvents;
 