import React from 'react';
import { motion } from 'framer-motion';

const CategoryHeader = ({ categoryName }) => {
    if (!categoryName) return null;

    return (
        <div className="relative z-30 mb-2">
            <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-gray-900 text-base md:text-xl font-extrabold uppercase tracking-tight"
            >
                {categoryName}
            </motion.h2>
            <div className="h-1 w-12 bg-amber-500 mt-1 rounded-full" />
        </div>
    );
};

export default CategoryHeader;
