// src/components/ForumsSection.jsx
import React, { useState } from "react";
import {
  MessageCircle,
  Reply,
  Heart,
  Bookmark,
  Bell,
  Eye,
  MessageSquare,
  TrendingUp,
  Clock,
} from "lucide-react";

export default function ForumsSection() {
  const [activeSubTab, setActiveSubTab] = useState("topics");

  // Dummy data – replace with real API later
  const topicsStarted = [
    { id: 1, title: "Best React 19 Features?", replies: 12, views: 189, lastActivity: "2h ago", category: "Tech" },
    { id: 2, title: "Weekend Cycling Routes?", replies: 8, views: 67, lastActivity: "1d ago", category: "Sports" },
  ];

  const repliesCreated = [
    { id: 3, topic: "React 19 Features", preview: "You can now use the new use() hook for...", time: "3h ago", likes: 5 },
    { id: 4, topic: "Cycling Routes", preview: "Try the coastal path near...", time: "2d ago", likes: 2 },
  ];

  const engagement = [
    { type: "like", count: 24, icon: Heart },
    { type: "reply", count: 18, icon: MessageSquare },
    { type: "view", count: 456, icon: Eye },
  ];

  const favourites = [
    { id: 5, title: "Tailwind vs CSS-in-JS", author: "John", replies: 34, lastActivity: "5h ago" },
    { id: 6, title: "Book Recommendations 2025", author: "Sarah", replies: 21, lastActivity: "1d ago" },
  ];

  const subscriptions = [
    { id: 7, title: "React Developers", newPosts: 3, icon: <TrendingUp className="w-4 h-4" /> },
    { id: 8, title: "Cycling Enthusiasts", newPosts: 1, icon: <MessageCircle className="w-4 h-4" /> },
  ];

  const subTabs = [
    { id: "topics", label: "Topics Started", Icon: MessageCircle },
    { id: "replies", label: "Replies", Icon: Reply },
    { id: "engagement", label: "Engagement", Icon: TrendingUp },
    { id: "favourites", label: "Favourites", Icon: Bookmark },
    { id: "subscriptions", label: "Subscriptions", Icon: Bell },
  ];

  const renderContent = () => {
    switch (activeSubTab) {
      case "topics": return <TopicsStartedTab topics={topicsStarted} />;
      case "replies": return <RepliesCreatedTab replies={repliesCreated} />;
      case "engagement": return <EngagementTab stats={engagement} />;
      case "favourites": return <FavouritesTab topics={favourites} />;
      case "subscriptions": return <SubscriptionsTab subs={subscriptions} />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Sub-tab navigation */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto scrollbar-hide">
        {subTabs.map((tab) => {
          const Icon = tab.Icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium capitalize whitespace-nowrap transition-all
                ${activeSubTab === tab.id
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-gray-600 hover:text-gray-900"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-6">{renderContent()}</div>
    </div>
  );
}

/* ────── Sub-Tab Components ────── */

function TopicsStartedTab({ topics }) {
  if (topics.length === 0) return <EmptyState icon={<MessageCircle className="w-8 h-8 text-gray-400" />}>No topics started yet</EmptyState>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Topics You've Started ({topics.length})</h3>
      {topics.map((t) => (
        <div key={t.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-gray-900">{t.title}</h4>
            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">{t.category}</span>
          </div>
          <div className="flex gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1"><Reply className="w-3 h-3" /> {t.replies}</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {t.views}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {t.lastActivity}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function RepliesCreatedTab({ replies }) {
  if (replies.length === 0) return <EmptyState icon={<Reply className="w-8 h-8 text-gray-400" />}>No replies yet</EmptyState>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Replies ({replies.length})</h3>
      {replies.map((r) => (
        <div key={r.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-gray-900 mb-1">Re: {r.topic}</h4>
          <p className="text-sm text-gray-700 mb-2 line-clamp-2">{r.preview}</p>
          <div className="flex justify-between text-xs text-gray-600">
            <span>{r.time}</span>
            <span className="flex items-center gap-1 text-pink-600">
              <Heart className="w-3 h-3 fill-current" /> {r.likes}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EngagementTab({ stats }) {
  const total = stats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <h3 className="text-3xl font-bold text-purple-600">{total}</h3>
        <p className="text-sm text-gray-600">Total Engagement This Month</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          const bgColor = i === 0 ? "bg-pink-100" : i === 1 ? "bg-blue-100" : "bg-green-100";
          const textColor = i === 0 ? "text-pink-600" : i === 1 ? "text-blue-600" : "text-green-600";
          return (
            <div key={s.type} className={`${bgColor} p-4 rounded-lg text-center`}>
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-white flex items-center justify-center">
                <Icon className={`w-5 h-5 ${textColor}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.count}</p>
              <p className="text-xs capitalize text-gray-700">{s.type}s</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FavouritesTab({ topics }) {
  if (topics.length === 0) return <EmptyState icon={<Bookmark className="w-8 h-8 text-gray-400" />}>No favourites saved</EmptyState>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Favourite Topics ({topics.length})</h3>
      {topics.map((t) => (
        <div key={t.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-yellow-600 fill-current" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{t.title}</h4>
              <p className="text-xs text-gray-600">by {t.author} • {t.lastActivity}</p>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {t.replies}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SubscriptionsTab({ subs }) {
  if (subs.length === 0) return <EmptyState icon={<Bell className="w-8 h-8 text-gray-400" />}>No subscriptions</EmptyState>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Subscribed Topics ({subs.length})</h3>
      {subs.map((s) => (
        <div key={s.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              {s.icon}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{s.title}</h4>
              <p className="text-xs text-gray-600">Get notified on new replies</p>
            </div>
          </div>
          {s.newPosts > 0 && (
            <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {s.newPosts} new
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ────── Shared Empty State ────── */
function EmptyState({ children, icon }) {
  return (
    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <p className="text-lg font-semibold text-gray-800 mb-2">{children}</p>
      <p className="text-sm text-gray-600">This section will fill up as you participate!</p>
    </div>
  );
}