require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Courier = require('../models/Courier');

const seedCouriers = async () => {
  await connectDB();

  const defaults = [
    {
      name: 'TCS Express',
      code: 'TCS',
      phone: '021-111-123-456',
      hubs: ['Warehouse', 'Lahore Hub', 'Islamabad Hub', 'Rawalpindi', 'Karachi Hub'],
      employees: [{ name: 'Ali Rider', phone: '0300-1111111', role: 'Rider' }],
      vehicles: [{ type: 'Bike', number: 'LEC-1234', model: 'Honda CD70' }],
    },
    {
      name: 'Leopards Courier',
      code: 'LCS',
      phone: '042-111-300-300',
      hubs: ['Warehouse', 'Lahore Hub', 'Islamabad Hub', 'Rawalpindi'],
      employees: [{ name: 'Hassan Khan', phone: '0300-2222222', role: 'Rider' }],
      vehicles: [{ type: 'Van', number: 'LED-5678', model: 'Suzuki Bolan' }],
    },
    {
      name: 'LuxeWatch Express',
      code: 'LX',
      phone: '051-0000000',
      hubs: ['Warehouse', 'Lahore Hub', 'Islamabad Hub', 'Rawalpindi', 'Out for Delivery'],
      employees: [{ name: 'Bilal Delivery', phone: '0300-3333333', role: 'Rider' }],
      vehicles: [{ type: 'Bike', number: 'RIX-9999', model: 'Yamaha' }],
    },
  ];

  for (const c of defaults) {
    await Courier.findOneAndUpdate({ code: c.code }, c, { upsert: true, new: true });
  }

  console.log('Couriers seeded:', defaults.map((d) => d.code).join(', '));
  await mongoose.connection.close();
  process.exit(0);
};

seedCouriers().catch((e) => {
  console.error(e);
  process.exit(1);
});
