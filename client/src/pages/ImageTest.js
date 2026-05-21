import React from 'react';

const ImageTest = () => {
  const testImages = [
    'https://via.placeholder.com/400x600/FF6B6B/FFFFFF?text=Test+Image+1',
    'https://via.placeholder.com/600x400/4ECDC4/FFFFFF?text=Test+Image+2',
    'https://via.placeholder.com/500x500/45B7D1/FFFFFF?text=Test+Image+3',
    'https://via.placeholder.com/800x300/96CEB4/FFFFFF?text=Test+Image+4'
  ];

  return (
    <div className="container py-5">
      <h1 className="mb-4">Image Coverage Test</h1>
      <p className="mb-4">This page tests if the product images are properly covering their containers.</p>
      
      <div className="row">
        {testImages.map((image, index) => (
          <div key={index} className="col-md-3 mb-4">
            <div className="card h-100 product-card">
              <div className="position-relative">
                <div className="product-image-container">
                  <img
                    src={image}
                    className="card-img-top"
                    alt={`Test Image ${index + 1}`}
                  />
                </div>
              </div>
              <div className="card-body">
                <h6 className="card-title">Test Product {index + 1}</h6>
                <p className="card-text">This is a test product to verify image coverage.</p>
                <p className="text-primary">₹{1000 + index * 100}/day</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <h3>Expected Behavior:</h3>
        <ul>
          <li>All images should fill their containers completely (no white space)</li>
          <li>Images should maintain their aspect ratio without distortion</li>
          <li>Images should be centered within their containers</li>
          <li>All containers should be the same size (300px height)</li>
        </ul>
      </div>

      <div className="mt-4">
        <h3>If images are not covering properly:</h3>
        <ol>
          <li>Clear your browser cache (Ctrl+F5 or Cmd+Shift+R)</li>
          <li>Check if the CSS file is being loaded</li>
          <li>Inspect the elements to see if CSS is being applied</li>
          <li>Check browser console for any errors</li>
        </ol>
      </div>
    </div>
  );
};

export default ImageTest;
