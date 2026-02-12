import React from "react";
import { motion } from "framer-motion";
import PostcardWrapper from "./postCardWraper";

const MobileFeedView = ({
    feeds,
    authUser,
    token,
    handleHideFromUI,
    handleNotInterestedFromUI,
    activeVideoId,
    setActiveVideoId,
    viewMode
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="flex items-center flex-col gap-0 w-full snap-y snap-mandatory overflow-y-auto h-screen"
        >
            {feeds.map((item, idx) => {
                const stableId = item._id || item.feedId || idx;
                return (
                    <motion.div
                        layout
                        key={`mobile-${item.__kind}-${stableId}-${idx}`}
                        className="w-full snap-start"
                        transition={{
                            layout: { duration: 0.4, type: "spring", stiffness: 200, damping: 25 }
                        }}
                    >
                        <PostcardWrapper
                            postData={item}
                            authUser={authUser}
                            token={token}
                            onHideFromUI={handleHideFromUI}
                            onNotInterested={handleNotInterestedFromUI}
                            isVisible={true}
                            viewMode={viewMode}
                            activeVideoId={activeVideoId}
                            setActiveVideoId={setActiveVideoId}
                        />
                    </motion.div>
                );
            })}
        </motion.div>
    );
};

export default MobileFeedView;
