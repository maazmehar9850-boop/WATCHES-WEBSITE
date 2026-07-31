const Courier = require('../models/Courier');
const AppError = require('../utils/AppError');

exports.getCouriers = async (req, res, next) => {
  try {
    const couriers = await Courier.find().sort({ name: 1 });
    res.json({ success: true, couriers });
  } catch (error) {
    next(error);
  }
};

exports.getActiveCouriers = async (req, res, next) => {
  try {
    const couriers = await Courier.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, couriers });
  } catch (error) {
    next(error);
  }
};

exports.createCourier = async (req, res, next) => {
  try {
    const { name, code, phone, email, website, hubs, notes } = req.body;
    if (!name || !code) return next(new AppError('Name and code required', 400));

    const courier = await Courier.create({
      name,
      code: code.toUpperCase(),
      phone: phone || '',
      email: email || '',
      website: website || '',
      hubs: hubs || ['Warehouse', 'Lahore Hub', 'Islamabad Hub', 'Rawalpindi'],
      notes: notes || '',
    });
    res.status(201).json({ success: true, courier });
  } catch (error) {
    next(error);
  }
};

exports.updateCourier = async (req, res, next) => {
  try {
    const courier = await Courier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!courier) return next(new AppError('Courier not found', 404));
    res.json({ success: true, courier });
  } catch (error) {
    next(error);
  }
};

exports.addEmployee = async (req, res, next) => {
  try {
    const courier = await Courier.findById(req.params.id);
    if (!courier) return next(new AppError('Courier not found', 404));
    courier.employees.push(req.body);
    await courier.save();
    res.json({ success: true, courier });
  } catch (error) {
    next(error);
  }
};

exports.addVehicle = async (req, res, next) => {
  try {
    const courier = await Courier.findById(req.params.id);
    if (!courier) return next(new AppError('Courier not found', 404));
    courier.vehicles.push(req.body);
    await courier.save();
    res.json({ success: true, courier });
  } catch (error) {
    next(error);
  }
};

exports.deleteCourier = async (req, res, next) => {
  try {
    const courier = await Courier.findById(req.params.id);
    if (!courier) return next(new AppError('Courier not found', 404));
    courier.isActive = false;
    await courier.save();
    res.json({ success: true, message: 'Courier deactivated' });
  } catch (error) {
    next(error);
  }
};
