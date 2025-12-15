import React, { useState } from "react";
import CommunityComingSoon from "./commmunity";
import LearningComingSoon from "./learning";
import EventsComingSoon from "./event";

export const useComingSoonPopups = () => {
  const [showCommunityPopup, setShowCommunityPopup] = useState(false);
  const [showLearningPopup, setShowLearningPopup] = useState(false);
  const [showEventsPopup, setShowEventsPopup] = useState(false);

  const openCommunityPopup = () => setShowCommunityPopup(true);
  const openLearningPopup = () => setShowLearningPopup(true);
  const openEventsPopup = () => setShowEventsPopup(true);

  const closeAllPopups = () => {
    setShowCommunityPopup(false);
    setShowLearningPopup(false);
    setShowEventsPopup(false);
  };

  const ComingSoonPopups = () => (
    <>
      <CommunityComingSoon
        isOpen={showCommunityPopup}
        onClose={() => setShowCommunityPopup(false)}
      />
      <LearningComingSoon
        isOpen={showLearningPopup}
        onClose={() => setShowLearningPopup(false)}
      />
      <EventsComingSoon
        isOpen={showEventsPopup}
        onClose={() => setShowEventsPopup(false)}
      />
    </>
  );

  return {
    openCommunityPopup,
    openLearningPopup,
    openEventsPopup,
    closeAllPopups,
    ComingSoonPopups,
  };
};

// Usage in your Header component:
// 1. Import the hook:
// import { useComingSoonPopups } from "./hooks/useComingSoonPopups";

// 2. In your Header component:
// const { 
//   openCommunityPopup, 
//   openLearningPopup, 
//   openEventsPopup,
//   ComingSoonPopups 
// } = useComingSoonPopups();

// 3. Update your featureItems:
// const featureItems = [
//   { 
//     Icon: Users, 
//     label: "Community", 
//     onClick: openCommunityPopup  // Changed from toast to popup
//   },
//   // ... other items
// ];

// 4. Render the popups in your Header return:
// return (
//   <Fragment>
//     {/* ... existing code ... */}
//     <ComingSoonPopups />
//   </Fragment>
// );