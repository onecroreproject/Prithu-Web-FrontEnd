import React from 'react';

const PhotoGallery = ({ photos }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">My photos</h3>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, index) => (
          <div key={index} className="aspect-square">
            <img
              src={photo}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoGallery;
