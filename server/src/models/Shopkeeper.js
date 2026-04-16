import mongoose from 'mongoose';

const shopkeeperSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    shopAddress: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: 'shopkeeper',
    },
  },
  {
    timestamps: true,
  }
);

const Shopkeeper = mongoose.model('Shopkeeper', shopkeeperSchema);

export default Shopkeeper;
