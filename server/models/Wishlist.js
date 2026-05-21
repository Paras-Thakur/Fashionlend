const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a unique index on the user field
wishlistSchema.index({ user: 1 }, { unique: true });

// Update the updatedAt field before saving
wishlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add product to wishlist
wishlistSchema.methods.addProduct = function(productId) {
  console.log(`Adding product ${productId} to wishlist. Current products:`, this.products.length);
  
  // Check if product already exists in wishlist
  const existingProduct = this.products.find(
    item => item.product.toString() === productId.toString()
  );
  
  if (!existingProduct) {
    console.log(`Product ${productId} not found in wishlist, adding it`);
    this.products.push({
      product: productId,
      addedAt: new Date()
    });
    console.log(`Product ${productId} added. New count:`, this.products.length);
  } else {
    console.log(`Product ${productId} already exists in wishlist`);
  }
  
  return this;
};

// Remove product from wishlist
wishlistSchema.methods.removeProduct = function(productId) {
  this.products = this.products.filter(
    item => item.product.toString() !== productId.toString()
  );
  return this;
};

// Check if product is in wishlist
wishlistSchema.methods.hasProduct = function(productId) {
  return this.products.some(
    item => item.product.toString() === productId.toString()
  );
};

// Get wishlist count
wishlistSchema.methods.getCount = function() {
  return this.products.length;
};

module.exports = mongoose.model('Wishlist', wishlistSchema); 