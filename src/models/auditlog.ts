import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAuditLog extends Document {
  admin: Types.ObjectId;
  action: string; // e.g. "SUSPEND_USER", "REINSTATE_USER", "APPROVE_VERIFICATION"
  targetType: string; // "User" | "Provider" | "Booking" | ...
  targetId: Types.ObjectId;
  reason?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
auditLogSchema.index({ admin: 1, createdAt: -1 });

export const AuditLog: Model<IAuditLog> = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);