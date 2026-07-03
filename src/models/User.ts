import mongoose, { Schema, Document, Model, Types } from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES, type Role } from "../config/constants.js";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: Role;
  avatarUrl?: string;
  isActive: boolean;
  isSuspended: boolean;
  lastLoginAt?: Date;
  favorites: Types.ObjectId[];
  providerProfile?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(plain: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
    },
    avatarUrl: { type: String },
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    lastLoginAt: { type: Date },

    // Customer-specific convenience field, kept on base user to avoid
    // an extra join for the common case
    favorites: [{ type: Schema.Types.ObjectId, ref: "Listing" }],

    // Populated when role === PROVIDER, links to the Provider profile doc
    providerProfile: { type: Schema.Types.ObjectId, ref: "Provider" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("passwordHash")) return;
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

userSchema.methods.comparePassword = function comparePassword(
  this: IUser,
  plain: string
): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.index({ email: 1 });

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
