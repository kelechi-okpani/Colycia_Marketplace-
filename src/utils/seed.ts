import { connectDB, disconnectDB } from "../config/db";
import { User } from "../models/User";
import { Provider } from "../models/Provider";
import { Wallet } from "../models/Wallet";
import { HotelListing } from "../models/listings/HotelListing";
import { SalonListing } from "../models/listings/SalonListing";
import { FoodVendorListing } from "../models/listings/FoodVendorListing";
import { ROLES, PROVIDER_CATEGORIES, LISTING_STATUS } from "../config/constants";

async function seed() {
  await connectDB();
  console.log("[seed] Clearing existing sample data is skipped — seed is additive.");

  const admin = await User.create({
    firstName: "Admin",
    lastName: "User",
    email: "admin@servicehub.africa",
    passwordHash: "AdminPass123!",
    role: ROLES.ADMIN,
  });
  await Wallet.create({ owner: admin._id });

  const hotelOwnerUser = await User.create({
    firstName: "Chioma",
    lastName: "Eze",
    email: "chioma@lagosgrandhotel.com",
    passwordHash: "Password123!",
    role: ROLES.PROVIDER,
  });
  const hotelProvider = await Provider.create({
    user: hotelOwnerUser._id,
    category: PROVIDER_CATEGORIES.HOTEL,
    businessName: "Lagos Grand Hotel",
    bio: "4-star hotel in Victoria Island with pool and conference facilities.",
    location: { city: "Lagos", state: "Lagos", country: "Nigeria" },
  });
  await Wallet.create({ owner: hotelOwnerUser._id });

  await HotelListing.create({
    provider: hotelProvider._id,
    title: "Lagos Grand Hotel - Victoria Island",
    description: "Comfortable rooms minutes from the business district.",
    basePrice: 45000,
    status: LISTING_STATUS.ACTIVE,
    location: { city: "Lagos", state: "Lagos", country: "Nigeria" },
    roomTypes: [
      { name: "Standard Room", pricePerNight: 45000, totalRooms: 10, maxOccupancy: 2, amenities: ["WiFi", "AC"] },
      { name: "Executive Suite", pricePerNight: 90000, totalRooms: 4, maxOccupancy: 3, amenities: ["WiFi", "AC", "Balcony"] },
    ],
    amenities: ["Pool", "Free WiFi", "Parking", "Conference Room"],
    starRating: 4,
  });

  const salonOwnerUser = await User.create({
    firstName: "Amara",
    lastName: "Okafor",
    email: "amara@glowsalon.com",
    passwordHash: "Password123!",
    role: ROLES.PROVIDER,
  });
  const salonProvider = await Provider.create({
    user: salonOwnerUser._id,
    category: PROVIDER_CATEGORIES.SALON,
    businessName: "Glow Beauty Salon",
    location: { city: "Abuja", state: "FCT", country: "Nigeria" },
  });
  await Wallet.create({ owner: salonOwnerUser._id });

  await SalonListing.create({
    provider: salonProvider._id,
    title: "Glow Beauty Salon - Wuse II",
    basePrice: 8000,
    status: LISTING_STATUS.ACTIVE,
    location: { city: "Abuja", state: "FCT", country: "Nigeria" },
    servicePackages: [
      { name: "Full Weave Installation", durationMinutes: 120, price: 15000 },
      { name: "Manicure + Pedicure", durationMinutes: 60, price: 8000 },
    ],
    staff: [{ name: "Blessing", specialties: ["Weaves", "Braiding"] }],
  });

  const foodOwnerUser = await User.create({
    firstName: "Tunde",
    lastName: "Bakare",
    email: "tunde@jollofcorner.com",
    passwordHash: "Password123!",
    role: ROLES.PROVIDER,
  });
  const foodProvider = await Provider.create({
    user: foodOwnerUser._id,
    category: PROVIDER_CATEGORIES.FOOD_VENDOR,
    businessName: "Jollof Corner",
    location: { city: "Lagos", state: "Lagos", country: "Nigeria" },
  });
  await Wallet.create({ owner: foodOwnerUser._id });

  await FoodVendorListing.create({
    provider: foodProvider._id,
    title: "Jollof Corner - Ikeja",
    basePrice: 2500,
    status: LISTING_STATUS.ACTIVE,
    location: { city: "Lagos", state: "Lagos", country: "Nigeria" },
    menu: [
      { name: "Party Jollof Rice + Chicken", price: 2500, category: "Main" },
      { name: "Pounded Yam + Egusi", price: 3000, category: "Main" },
    ],
    cuisineTypes: ["Nigerian", "West African"],
  });

  const customer = await User.create({
    firstName: "Kelechi",
    lastName: "Okpani",
    email: "kelechi@example.com",
    passwordHash: "Password123!",
    role: ROLES.CUSTOMER,
  });
  await Wallet.create({ owner: customer._id });

  console.log("[seed] Done. Sample login: kelechi@example.com / Password123!");
  await disconnectDB();
}

seed().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
