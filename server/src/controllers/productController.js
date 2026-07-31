const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { slugify } = require('../utils/helpers');

// @desc    Get all products with filters, sort, pagination
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12,
      featured,
      trending,
      bestseller,
      gender,
    } = req.query;

    const filter = { isActive: true };

    if (keyword) filter.$text = { $search: keyword };
    if (category) filter.category = category;
    if (gender) filter['specifications.gender'] = gender;
    if (featured === 'true') filter.isFeatured = true;
    if (trending === 'true') filter.isTrending = true;
    if (bestseller === 'true') filter.isBestSeller = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    switch (sort) {
      case 'price-asc':
        sortOption = { price: 1 };
        break;
      case 'price-desc':
        sortOption = { price: -1 };
        break;
      case 'popularity':
        sortOption = { sold: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      default:
        break;
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      products,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('reviews.user', 'name avatar');
    if (!product || !product.isActive) {
      return next(new AppError('Product not found', 404));
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug')
      .populate('reviews.user', 'name avatar');
    if (!product) return next(new AppError('Product not found', 404));
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product (admin)
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (typeof data.specifications === 'string') {
      data.specifications = JSON.parse(data.specifications);
    }
    if (typeof data.features === 'string') {
      data.features = JSON.parse(data.features);
    }
    data.slug = slugify(data.name) + '-' + Date.now().toString(36);
    if (req.uploadedImages?.length) data.images = req.uploadedImages;
    if (typeof data.images === 'string') data.images = JSON.parse(data.images);

    const product = await Product.create(data);
    await product.populate('category', 'name slug');
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (admin)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('Product not found', 404));

    const data = { ...req.body };
    if (typeof data.specifications === 'string') {
      data.specifications = JSON.parse(data.specifications);
    }
    if (typeof data.features === 'string') {
      data.features = JSON.parse(data.features);
    }
    if (data.name && data.name !== product.name) {
      data.slug = slugify(data.name) + '-' + Date.now().toString(36);
    }
    if (req.uploadedImages?.length) {
      data.images = [...(product.images || []), ...req.uploadedImages];
    }

    Object.assign(product, data);
    await product.save();
    await product.populate('category', 'name slug');
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('Product not found', 404));
    product.isActive = false;
    await product.save();
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review
// @route   POST /api/products/:id/reviews
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('Product not found', 404));

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return next(new AppError('You already reviewed this product', 400));
    }

    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    });
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ success: true, message: 'Review added' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products for admin (including inactive)
// @route   GET /api/products/admin/all
exports.getAdminProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};
