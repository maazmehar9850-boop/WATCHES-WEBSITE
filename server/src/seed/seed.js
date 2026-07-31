require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { slugify } = require('../utils/helpers');

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in server/.env before seeding.');
  process.exit(1);
}

if (ADMIN_PASSWORD.length < 8) {
  console.error('SEED_ADMIN_PASSWORD must be at least 8 characters.');
  process.exit(1);
}

const watchImages = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
  'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
  'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800',
  'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800',
  'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800',
  'https://images.unsplash.com/photo-1622434641406-a1582322ed9a?w=800',
  'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=800',
  'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800',
];

const seed = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany(),
    Category.deleteMany(),
    Product.deleteMany(),
  ]);

  await User.create({
    name: 'Admin',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
  });

  const categoryData = [
    { name: 'Men', description: 'Elegant timepieces for men' },
    { name: 'Women', description: 'Sophisticated watches for women' },
    { name: 'Luxury', description: 'Premium luxury collections' },
    { name: 'Smart', description: 'Modern smartwatches' },
  ];

  const categories = await Category.insertMany(
    categoryData.map((c) => ({ ...c, slug: slugify(c.name) }))
  );

  const cat = (name) => categories.find((c) => c.name === name)._id;

  const products = [
    {
      name: 'Aurora Chronograph Gold',
      description:
        'A masterpiece of horology featuring a 42mm gold-plated case, sapphire crystal, and Swiss quartz movement. Perfect for formal occasions.',
      price: 89900,
      comparePrice: 120000,
      category: cat('Luxury'),
      brand: 'LuxeWatch',
      images: [watchImages[0], watchImages[1]],
      stock: 25,
      sold: 48,
      isFeatured: true,
      isBestSeller: true,
      isTrending: true,
      features: ['Sapphire Crystal', 'Water Resistant 100m', 'Chronograph'],
      specifications: {
        movement: 'Swiss Quartz',
        caseMaterial: 'Gold Plated Steel',
        strapMaterial: 'Genuine Leather',
        waterResistance: '100m',
        dialColor: 'Black',
        caseSize: '42mm',
        gender: 'Men',
      },
      rating: 4.8,
      numReviews: 12,
    },
    {
      name: 'Noir Classic Automatic',
      description:
        'Timeless automatic watch with exhibition caseback. Self-winding mechanical movement visible through the sapphire window.',
      price: 125000,
      comparePrice: 150000,
      category: cat('Men'),
      brand: 'LuxeWatch',
      images: [watchImages[2], watchImages[3]],
      stock: 15,
      sold: 32,
      isFeatured: true,
      isBestSeller: true,
      features: ['Automatic Movement', 'Exhibition Back', 'Date Display'],
      specifications: {
        movement: 'Automatic',
        caseMaterial: 'Stainless Steel',
        strapMaterial: 'Steel Bracelet',
        waterResistance: '50m',
        dialColor: 'Navy',
        caseSize: '40mm',
        gender: 'Men',
      },
      rating: 4.9,
      numReviews: 8,
    },
    {
      name: 'Pearl Elegance Rose',
      description:
        'Feminine elegance redefined. Mother-of-pearl dial with rose gold accents and a slim silhouette for everyday luxury.',
      price: 67500,
      comparePrice: 85000,
      category: cat('Women'),
      brand: 'LuxeWatch',
      images: [watchImages[4], watchImages[5]],
      stock: 30,
      sold: 56,
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      features: ['Mother of Pearl', 'Rose Gold', 'Swiss Made'],
      specifications: {
        movement: 'Quartz',
        caseMaterial: 'Rose Gold PVD',
        strapMaterial: 'Mesh Bracelet',
        waterResistance: '30m',
        dialColor: 'Pearl White',
        caseSize: '34mm',
        gender: 'Women',
      },
      rating: 4.7,
      numReviews: 15,
    },
    {
      name: 'Titan Smart Pro X',
      description:
        'Premium smartwatch with AMOLED display, SpO2 monitoring, GPS, and 7-day battery life. Titanium build for lightweight comfort.',
      price: 45900,
      comparePrice: 55000,
      category: cat('Smart'),
      brand: 'LuxeWatch',
      images: [watchImages[6], watchImages[7]],
      stock: 50,
      sold: 120,
      isFeatured: true,
      isTrending: true,
      features: ['AMOLED', 'GPS', 'SpO2', '7-Day Battery'],
      specifications: {
        movement: 'Digital Smart',
        caseMaterial: 'Titanium',
        strapMaterial: 'Fluoroelastomer',
        waterResistance: '50m',
        dialColor: 'Customizable',
        caseSize: '44mm',
        gender: 'Unisex',
      },
      rating: 4.5,
      numReviews: 34,
    },
    {
      name: 'Heritage Dive Master',
      description:
        'Professional dive watch rated to 300m. Unidirectional bezel, luminous markers, and helium escape valve for serious divers.',
      price: 98000,
      comparePrice: 110000,
      category: cat('Men'),
      brand: 'LuxeWatch',
      images: [watchImages[1], watchImages[0]],
      stock: 18,
      sold: 22,
      isTrending: true,
      features: ['300m Dive', 'Luminous Dial', 'Helium Valve'],
      specifications: {
        movement: 'Automatic',
        caseMaterial: 'Stainless Steel',
        strapMaterial: 'Rubber',
        waterResistance: '300m',
        dialColor: 'Black',
        caseSize: '43mm',
        gender: 'Men',
      },
      rating: 4.6,
      numReviews: 7,
    },
    {
      name: 'Celeste Diamond Series',
      description:
        'Luxury women\'s watch adorned with genuine diamond markers. Slim quartz movement in an 18k gold-plated case.',
      price: 185000,
      comparePrice: 220000,
      category: cat('Luxury'),
      brand: 'LuxeWatch',
      images: [watchImages[5], watchImages[4]],
      stock: 8,
      sold: 14,
      isFeatured: true,
      isBestSeller: false,
      features: ['Diamond Markers', '18K Gold Plated', 'Sapphire Crystal'],
      specifications: {
        movement: 'Swiss Quartz',
        caseMaterial: '18K Gold Plated',
        strapMaterial: 'Alligator Leather',
        waterResistance: '30m',
        dialColor: 'Ivory',
        caseSize: '32mm',
        gender: 'Women',
      },
      rating: 5.0,
      numReviews: 5,
    },
    {
      name: 'Urban Minimal Silver',
      description:
        'Clean Bauhaus-inspired design. Ultra-thin case with a brushed silver finish — understated sophistication for the modern professional.',
      price: 34900,
      comparePrice: 42000,
      category: cat('Men'),
      brand: 'LuxeWatch',
      images: [watchImages[3], watchImages[2]],
      stock: 40,
      sold: 67,
      isTrending: true,
      features: ['Ultra Thin', 'Bauhaus Design', 'Scratch Resistant'],
      specifications: {
        movement: 'Quartz',
        caseMaterial: 'Brushed Steel',
        strapMaterial: 'NATO Strap',
        waterResistance: '50m',
        dialColor: 'White',
        caseSize: '38mm',
        gender: 'Men',
      },
      rating: 4.4,
      numReviews: 19,
    },
    {
      name: 'Pulse Fitness Elite',
      description:
        'Advanced fitness smartwatch with ECG, sleep tracking, and 100+ workout modes. Stylish enough for the boardroom.',
      price: 32900,
      comparePrice: 39900,
      category: cat('Smart'),
      brand: 'LuxeWatch',
      images: [watchImages[7], watchImages[6]],
      stock: 60,
      sold: 95,
      isBestSeller: true,
      features: ['ECG', '100+ Sports', 'Always-On Display'],
      specifications: {
        movement: 'Digital Smart',
        caseMaterial: 'Aluminum',
        strapMaterial: 'Silicone',
        waterResistance: '50m',
        dialColor: 'Customizable',
        caseSize: '42mm',
        gender: 'Unisex',
      },
      rating: 4.3,
      numReviews: 28,
    },
  ];

  for (const p of products) {
    p.slug = slugify(p.name) + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    await Product.create(p);
  }

  console.log('Seed completed successfully!');
  console.log(`Admin login: ${ADMIN_EMAIL} (password from SEED_ADMIN_PASSWORD / .env)`);
  console.log('Customers shop as guests (no customer login).');
  console.log(`Created ${categories.length} categories and ${products.length} products`);
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
