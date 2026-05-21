import React from 'react';

const VideoBackground = ({ children }) => {
  return (
    <div className="video-background-container">
      <video
        className="video-background"
        autoPlay
        loop
        muted
        playsInline
        poster="https://res.cloudinary.com/dubzz4vcv/video/upload/v1754848771/carsoulll_l9btwv.mp4"
      >
        <source 
          src="https://res.cloudinary.com/dubzz4vcv/video/upload/v1754848771/carsoulll_l9btwv.mp4" 
          type="video/mp4" 
        />
        Your browser does not support the video tag.
      </video>
      <div className="video-overlay">
        {children}
      </div>
    </div>
  );
};

export default VideoBackground;
