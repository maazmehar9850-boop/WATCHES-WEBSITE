const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, default: 'LuxeWatch' },
    images: [{ type: String }],
    stock: { type: Number, required: true, min: 0, default: 0 },
    sold: { type: Number, default: 0 },
    features: [String],
    specifications: {
      movement: String,
      caseMaterial: String,
      strapMaterial: String,
      waterResistance: String,
      dialColor: String,
      caseSize: String,
      gender: { type: String, enum: ['Men', 'Women', 'Unisex'], default: 'Unisex' },
    },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', brand: 'text' });

productSchema.virtual('discount').get(function () {
  if (this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
