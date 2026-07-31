const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const { slugify } = require('../utils/helpers');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return next(new AppError('Category name is required', 400));

    const category = await Category.create({
      name,
      slug: slugify(name),
      description: description || '',
      image: req.uploadedImages?.[0] || req.body.image || '',
    });
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new AppError('Category not found', 404));

    if (req.body.name) {
      category.name = req.body.name;
      category.slug = slugify(req.body.name);
    }
    if (req.body.description !== undefined) category.description = req.body.description;
    if (req.body.isActive !== undefined) category.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    if (req.uploadedImages?.[0]) category.image = req.uploadedImages[0];
    else if (req.body.image) category.image = req.body.image;

    await category.save();
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new AppError('Category not found', 404));
    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};
