const Vendor = require('../models/Vendor');
const User = require('../models/User');
const { createAuditLog } = require('../utils/auditHelper');

const createVendor = async (req, res) => {
  try {
    const { companyName, category, gstNumber, address, contacts, status, email, password } = req.body;

    if (!companyName || !category || !gstNumber || !address) {
      return res.status(400).json({ message: 'Company name, category, GST number, and address are required' });
    }

    if (!email || !password) {
      return res.status(400).json({ message: 'Vendor email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const vendor = await Vendor.create({
      companyName,
      category,
      gstNumber,
      address,
      contacts: contacts || [],
      status: status || 'pending',
      createdBy: req.user._id,
    });

    const contactName = contacts?.[0]?.name || companyName;
    await User.create({
      name: contactName,
      email: normalizedEmail,
      password,
      role: 'vendor',
      vendorId: vendor._id,
      authProvider: 'local',
    });

    await createAuditLog({
      action: 'vendor_created',
      entityType: 'Vendor',
      entityId: vendor._id,
      performedBy: req.user._id,
      description: `Vendor ${companyName} registered`,
    });

    res.status(201).json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVendors = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { gstNumber: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;
    if (status) filter.status = status;

    const vendors = await Vendor.find(filter).sort({ createdAt: -1 });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await createAuditLog({
      action: 'vendor_updated',
      entityType: 'Vendor',
      entityId: vendor._id,
      performedBy: req.user._id,
      description: `Vendor ${vendor.companyName} updated`,
    });

    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await createAuditLog({
      action: 'vendor_status_changed',
      entityType: 'Vendor',
      entityId: vendor._id,
      performedBy: req.user._id,
      description: `Vendor ${vendor.companyName} status changed to ${status}`,
    });

    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const linkVendorUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { vendorId: vendor._id, role: 'vendor' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await User.updateMany({ vendorId: vendor._id }, { vendorId: null });

    await createAuditLog({
      action: 'vendor_deleted',
      entityType: 'Vendor',
      entityId: vendor._id,
      performedBy: req.user._id,
      description: `Vendor ${vendor.companyName} deleted by admin`,
    });

    await Vendor.findByIdAndDelete(req.params.id);

    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  updateVendorStatus,
  linkVendorUser,
  deleteVendor,
};
