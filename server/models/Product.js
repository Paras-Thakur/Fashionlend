const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    // Removed enum restriction to allow all categories from the Category model
  },
  subCategory: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  rentalPrice: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  sizes: [{
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']
  }],
  colors: [{
    type: String
  }],
  fabric: {
    type: String
  },
  occasion: [{
    type: String,
    enum: ['wedding', 'party', 'festival', 'casual', 'formal']
  }],
  state: {
    type: String,
    trim: true
  },
  region: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair'],
    default: 'excellent'
  },
  rentalDuration: {
    min: {
      type: Number,
      default: 1
    },
    max: {
      type: Number,
      default: 7
    }
  },
  availability: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 1,
    min: 0
  },
  stockStatus: {
    type: String,
    enum: ['in_stock', 'out_of_stock'],
    default: 'in_stock'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    images: [{
      type: String
    }],
    helpful: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      date: {
        type: Date,
        default: Date.now
      }
    }],
    date: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
productSchema.methods.updateStockState = function() {
  const numericStock = typeof this.stock === 'number' && !isNaN(this.stock)
    ? this.stock
    : 0;

  this.stock = Math.max(0, numericStock);
  this.stockStatus = this.stock > 0 ? 'in_stock' : 'out_of_stock';
  this.availability = this.stock > 0;
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[updateStockState] ${this.name}: stock=${this.stock}, status=${this.stockStatus}, availability=${this.availability}`);
  }
};

productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[pre-save hook] Updating stock state for: ${this.name}, current stock: ${this.stock}`);
  }
  this.updateStockState();
  next();
});

// Create indexes for faster queries
productSchema.index({ owner: 1 });
productSchema.index({ category: 1 });
productSchema.index({ availability: 1, stockStatus: 1 });
productSchema.index({ featured: 1, availability: 1 });
productSchema.index({ state: 1 });
productSchema.index({ createdAt: -1 });

// Calculate average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) return 0;
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating = totalRating / this.reviews.length;
  return this.rating;
};

productSchema.methods.adjustStock = async function(quantityChange) {
  if (typeof quantityChange !== 'number' || isNaN(quantityChange)) {
    throw new Error('Invalid stock adjustment value');
  }

  const nextStock = this.stock + quantityChange;
  if (nextStock < 0) {
    throw new Error('Insufficient stock to fulfill the request');
  }

  this.stock = nextStock;
  this.updateStockState();
  await this.save();
  return this.stock;
};

module.exports = mongoose.model('Product', productSchema); 