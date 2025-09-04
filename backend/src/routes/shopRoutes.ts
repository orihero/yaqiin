import { Router } from 'express';
import Shop from '../models/Shop';
import { parseQuery } from '../utils/queryHelper';
import mongoose from 'mongoose';
import Group from '../models/Group';
import multer from 'multer';
import path from 'path';

const router = Router();

// Multer setup for shop images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'shop-' + uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// List all shops with pagination, filtering, and search
router.get('/', async (req, res, next) => {
  try {
    const { filter, page, limit, skip } = parseQuery(req, ['name', 'description']);
    const [shops, total] = await Promise.all([
      Shop.find(filter).skip(skip).limit(limit),
      Shop.countDocuments(filter)
    ]);
    res.json({
      success: true,
      data: shops,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return next({ status: 404, message: 'Shop not found' });
    res.json({ success: true, data: shop });
  } catch (err) {
    next(err);
  }
});

router.post('/', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'logo', maxCount: 1 }
]), async (req, res, next) => {
  try {
    const body = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    console.log('Shop create request body:', body);
    console.log('Shop create files:', files);
    
    // Parse JSON strings from FormData
    if (typeof body.contactInfo === 'string') {
      try {
        body.contactInfo = JSON.parse(body.contactInfo);
        console.log('Parsed contactInfo:', body.contactInfo);
      } catch (e) {
        console.log('Failed to parse contactInfo:', e);
        // If parsing fails, keep as is
      }
    }
    if (typeof body.address === 'string') {
      try {
        body.address = JSON.parse(body.address);
        console.log('Parsed address:', body.address);
      } catch (e) {
        console.log('Failed to parse address:', e);
        // If parsing fails, keep as is
      }
    }
    if (typeof body.operatingHours === 'string') {
      try {
        body.operatingHours = JSON.parse(body.operatingHours);
        console.log('Parsed operatingHours:', body.operatingHours);
      } catch (e) {
        console.log('Failed to parse operatingHours:', e);
        // If parsing fails, keep as is
      }
    }
    if (typeof body.deliveryZones === 'string') {
      try {
        body.deliveryZones = JSON.parse(body.deliveryZones);
        console.log('Parsed deliveryZones:', body.deliveryZones);
      } catch (e) {
        console.log('Failed to parse deliveryZones:', e);
        // If parsing fails, keep as is
      }
    }
    
    // Handle uploaded files
    const baseUrl = req.protocol + '://' + req.get('host');
    console.log('Base URL for file uploads (POST):', baseUrl);
    if (files && files.photo && files.photo.length > 0) {
      body.photo = baseUrl + '/uploads/' + files.photo[0].filename;
      console.log('Photo file uploaded (POST):', files.photo[0].filename);
      console.log('Photo URL set to (POST):', body.photo);
    }
    if (files && files.logo && files.logo.length > 0) {
      body.logo = baseUrl + '/uploads/' + files.logo[0].filename;
      console.log('Logo file uploaded (POST):', files.logo[0].filename);
      console.log('Logo URL set to (POST):', body.logo);
    }
    
    // Handle external URLs if provided
    if (body.photoUrl && !body.photo) {
      body.photo = body.photoUrl;
    }
    if (body.logoUrl && !body.logo) {
      body.logo = body.logoUrl;
    }
    
    const shop = new Shop(body);
    await shop.save();
    res.status(201).json({ success: true, data: shop, message: 'Shop created' });
  } catch (err) {
    next({ status: 400, message: 'Failed to create shop', details: err });
  }
});

router.put('/:id', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'logo', maxCount: 1 }
]), async (req, res, next) => {
  try {
    const body = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    console.log('Shop update request body:', body);
    console.log('Shop update files:', files);
    console.log('Fields being updated:', Object.keys(body));
    console.log('Request headers:', req.headers);
    console.log('Content-Type:', req.get('Content-Type'));
    
    // Parse JSON strings from FormData
    if (typeof body.contactInfo === 'string') {
      try {
        body.contactInfo = JSON.parse(body.contactInfo);
        console.log('Parsed contactInfo:', body.contactInfo);
      } catch (e) {
        console.log('Failed to parse contactInfo:', e);
        // If parsing fails, keep as is
      }
    }
    if (typeof body.address === 'string') {
      try {
        body.address = JSON.parse(body.address);
        console.log('Parsed address:', body.address);
      } catch (e) {
        console.log('Failed to parse address:', e);
        // If parsing fails, keep as is
      }
    }
    if (typeof body.operatingHours === 'string') {
      try {
        body.operatingHours = JSON.parse(body.operatingHours);
        console.log('Parsed operatingHours:', body.operatingHours);
      } catch (e) {
        console.log('Failed to parse operatingHours:', e);
        // If parsing fails, keep as is
      }
    }
    if (typeof body.deliveryZones === 'string') {
      try {
        body.deliveryZones = JSON.parse(body.deliveryZones);
        console.log('Parsed deliveryZones:', body.deliveryZones);
      } catch (e) {
        console.log('Failed to parse deliveryZones:', e);
        // If parsing fails, keep as is
      }
    }
    
    // Handle uploaded files
    const baseUrl = req.protocol + '://' + req.get('host');
    console.log('Base URL for file uploads (PUT):', baseUrl);
    if (files && files.photo && files.photo.length > 0) {
      body.photo = baseUrl + '/uploads/' + files.photo[0].filename;
      console.log('Photo file uploaded (PUT):', files.photo[0].filename);
      console.log('Photo URL set to (PUT):', body.photo);
    }
    if (files && files.logo && files.logo.length > 0) {
      body.logo = baseUrl + '/uploads/' + files.logo[0].filename;
      console.log('Logo file uploaded (PUT):', files.logo[0].filename);
      console.log('Logo URL set to (PUT):', body.logo);
    }
    
    // Handle remove flags
    if (body.removePhoto === 'true' || body.removePhoto === true) {
      body.photo = null;
      console.log('Removing photo as requested');
    }
    if (body.removeLogo === 'true' || body.removeLogo === true) {
      body.logo = null;
      console.log('Removing logo as requested');
    }
    
    // Handle external URLs if provided
    if (body.photoUrl && !body.photo) {
      body.photo = body.photoUrl;
    }
    if (body.logoUrl && !body.logo) {
      body.logo = body.logoUrl;
    }
    
    console.log('Final body to update:', JSON.stringify(body, null, 2));
    
    const shop = await Shop.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!shop) return next({ status: 404, message: 'Shop not found' });
    
    console.log('Updated shop data:', JSON.stringify(shop, null, 2));
    console.log('Shop photo field:', shop.photo);
    console.log('Shop logo field:', shop.logo);
    
    res.json({ success: true, data: shop, message: 'Shop updated' });
  } catch (err) {
    console.error('Shop update error:', err);
    console.error('Error details:', JSON.stringify(err, null, 2));
    next({ status: 400, message: 'Failed to update shop', details: err });
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) return next({ status: 404, message: 'Shop not found' });
    res.json({ success: true, data: null, message: 'Shop deleted' });
  } catch (err) {
    next(err);
  }
});

// Assign a courier to a shop
router.post('/:id/couriers/:courierId', async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return next({ status: 404, message: 'Shop not found' });
    const courierId = req.params.courierId;
    if (!shop.couriers) shop.couriers = [];
    if (!shop.couriers.some(id => id.toString() === courierId)) {
      shop.couriers.push(new mongoose.Types.ObjectId(courierId));
      await shop.save();
    }
    res.json({ success: true, data: shop, message: 'Courier assigned to shop' });
  } catch (err) {
    next({ status: 400, message: 'Failed to assign courier', details: err });
  }
});

// Unassign a courier from a shop
router.delete('/:id/couriers/:courierId', async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return next({ status: 404, message: 'Shop not found' });
    const courierId = req.params.courierId;
    if (shop.couriers) {
      shop.couriers = shop.couriers.filter(id => id.toString() !== courierId);
      await shop.save();
    }
    res.json({ success: true, data: shop, message: 'Courier unassigned from shop' });
  } catch (err) {
    next({ status: 400, message: 'Failed to unassign courier', details: err });
  }
});

// Get all couriers assigned to a shop
router.get('/:id/couriers', async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('couriers');
    if (!shop) return next({ status: 404, message: 'Shop not found' });
    res.json({ success: true, data: shop.couriers || [] });
  } catch (err) {
    next({ status: 400, message: 'Failed to get assigned couriers', details: err });
  }
});

// Get all couriers not assigned to a shop (available for assignment)
router.get('/:id/available-couriers', async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return next({ status: 404, message: 'Shop not found' });
    const assignedIds = (shop.couriers || []).map(id => id.toString());
    // Find users with role 'courier' and _id not in assignedIds
    const availableCouriers = await require('../models/User').default.find({
      role: 'courier',
      _id: { $nin: assignedIds },
    });
    res.json({ success: true, data: availableCouriers });
  } catch (err) {
    next({ status: 400, message: 'Failed to get available couriers', details: err });
  }
});

// List all unassigned groups (shopId is null)
router.get('/groups/unassigned', async (req, res, next) => {
  try {
    const groups = await Group.find({ shopId: null });
    res.json({ success: true, data: groups });
  } catch (err) {
    next({ status: 400, message: 'Failed to fetch groups', details: err });
  }
});

export default router; 