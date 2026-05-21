const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  rentalDuration: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  size: {
    type: String,
    required: false,
    default: 'Free Size'
  },
  color: String,
  rentalPrice: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productImage: {
    type: String,
    required: true
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a unique index on the user field, but allow sparse indexing to handle null values
// Note: This will be created when the model is first loaded
// Using sparse: true allows null values but ensures each user has only one cart
cartSchema.index({ user: 1 }, { unique: true, sparse: true });

// Update the updatedAt field before saving
cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate cart totals
cartSchema.methods.calculateTotals = function() {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalAmount = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  return {
    totalItems: this.totalItems,
    totalAmount: this.totalAmount
  };
};

// Add item to cart
cartSchema.methods.addItem = function(itemData) {
  const existingItemIndex = this.items.findIndex(
    item => item.product.toString() === itemData.productId && 
            item.size === itemData.size && 
            item.color === itemData.color
  );

  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += itemData.quantity;
    this.items[existingItemIndex].rentalDuration = itemData.rentalDuration;
    this.items[existingItemIndex].totalPrice = 
      this.items[existingItemIndex].rentalPrice * 
      this.items[existingItemIndex].quantity * 
      this.items[existingItemIndex].rentalDuration;
  } else {
    // Add new item
    this.items.push({
      product: itemData.productId,
      quantity: itemData.quantity,
      rentalDuration: itemData.rentalDuration,
      size: itemData.size,
      color: itemData.color,
      rentalPrice: itemData.rentalPrice,
      totalPrice: itemData.rentalPrice * itemData.quantity * itemData.rentalDuration,
      productName: itemData.productName,
      productImage: itemData.productImage
    });
  }
};

// Remove item from cart
cartSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(item => item.product.toString() !== productId);
};

// Update item quantity
cartSchema.methods.updateItemQuantity = function(productId, quantity, rentalDuration) {
  const item = this.items.find(item => item.product.toString() === productId);
  if (item) {
    if (quantity) item.quantity = quantity;
    if (rentalDuration) item.rentalDuration = rentalDuration;
    item.totalPrice = item.rentalPrice * item.quantity * item.rentalDuration;
  }
};

// Clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
};

module.exports = mongoose.model('Cart', cartSchema); 