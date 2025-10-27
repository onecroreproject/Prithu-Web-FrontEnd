import React from "react";
import { FiPlus } from "react-icons/fi";

// Demo data: Add avatars as `profileImg` as shown in the screenshot format
const dummyStories = [
  {
    id: 1,
    name: "Tamana Bhatia",
    img: "https://randomuser.me/api/portraits/women/1.jpg",
    profileImg: "https://randomuser.me/api/portraits/men/11.jpg"
  },
  {
    id: 2,
    name: "Emily Caros",
    img: "https://randomuser.me/api/portraits/women/3.jpg",
    profileImg: "https://randomuser.me/api/portraits/men/12.jpg"
  },
  {
    id: 3,
    name: "Daniel Cardos",
    img: "https://randomuser.me/api/portraits/men/4.jpg",
    profileImg: "https://randomuser.me/api/portraits/men/13.jpg"
  },
  {
    id: 4,
    name: "Emma Watson",
    img: "https://randomuser.me/api/portraits/women/5.jpg",
    profileImg: "https://randomuser.me/api/portraits/men/14.jpg"
  }
];

const Stories = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm max-w-[900px] ">
      {/* <div className="flex items-center justify-between mb-4">
        <span className="text-[17px] font-semibold">Recent Stories</span>
        <a href="#" className="text-blue-500 text-sm font-medium hover:underline">
          See all
        </a>
      </div> */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
        {/* Add Your Story Box */}
        <div className="flex-shrink-0 w-28">
          <div className="relative rounded-xl overflow-hidden h-40 w-28 bg-gray-200 flex items-center justify-center">
            <img
              src="https://randomuser.me/api/portraits/men/15.jpg"
              alt="Your Story"
              className="object-cover h-full w-full"
            />
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-white rounded-full border-[3px] border-blue-600 p-1">
              <FiPlus className="text-xl text-blue-600" />
            </div>
          </div>
          <div className="mt-2 text-center text-[15px] font-medium">Add Your Story</div>
        </div>
        {/* Other Stories */}
        {dummyStories.map((story) => (
          <div key={story.id} className="flex-shrink-0 w-28">
            <div className="relative rounded-xl overflow-hidden h-40 w-28 bg-gray-300">
              <img
                src={story.img}
                alt={story.name}
                className="object-cover h-full w-full"
              />
              {/* Profile avatar in the corner */}
              <img
                src={story.profileImg}
                alt={story.name}
                className="absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-white object-cover"
              />
            </div>
            <div className="mt-2 text-center text-[15px] font-medium truncate">
              {story.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stories;
