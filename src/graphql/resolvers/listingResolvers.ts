import { GraphQLError } from "graphql";
import { Listing } from "../../models/listings/Listing";
import { HotelListing } from "../../models/listings/HotelListing";
import { AirbnbListing } from "../../models/listings/AirbnbListing";
import { CarRentalListing } from "../../models/listings/CarRentalListing";
import { FoodVendorListing } from "../../models/listings/FoodVendorListing";
import { SalonListing } from "../../models/listings/SalonListing";
import { AirlineListing } from "../../models/listings/AirlineListing";
import { TourGuideListing } from "../../models/listings/TourGuideListing";
import { MakeupArtistListing } from "../../models/listings/MakeupArtistListing";
import { PhotographerListing } from "../../models/listings/PhotographerListing";
import { EventCenterListing } from "../../models/listings/EventCenterListing";
import { MassageTherapyListing } from "../../models/listings/MassageTherapyListing";
import { TherapyListing } from "../../models/listings/TherapyListing";
import { Provider } from "../../models/Provider";
import { requireRole } from "../../middleware/permissions";
import { ROLES, PROVIDER_CATEGORIES, ProviderCategory } from "../../config/constants";
import type { GraphQLContext } from "../../types/context";
import type { Model } from "mongoose";

// Single lookup table driving every category-specific operation. Adding
// vertical #13 later means adding ONE line here (plus the model + typeDefs
// type) — no branching logic elsewhere needs to change.
const CATEGORY_MODEL: Record<ProviderCategory, Model<any>> = {
  [PROVIDER_CATEGORIES.HOTEL]: HotelListing,
  [PROVIDER_CATEGORIES.AIRBNB_HOST]: AirbnbListing,
  [PROVIDER_CATEGORIES.CAR_RENTAL]: CarRentalListing,
  [PROVIDER_CATEGORIES.FOOD_VENDOR]: FoodVendorListing,
  [PROVIDER_CATEGORIES.SALON]: SalonListing,
  [PROVIDER_CATEGORIES.AIRLINE]: AirlineListing,
  [PROVIDER_CATEGORIES.TOUR_GUIDE]: TourGuideListing,
  [PROVIDER_CATEGORIES.MAKEUP_ARTIST]: MakeupArtistListing,
  [PROVIDER_CATEGORIES.PHOTOGRAPHER]: PhotographerListing,
  [PROVIDER_CATEGORIES.EVENT_CENTER]: EventCenterListing,
  [PROVIDER_CATEGORIES.MASSAGE_THERAPY]: MassageTherapyListing,
  [PROVIDER_CATEGORIES.PROFESSIONAL_THERAPY]: TherapyListing,
};

const CATEGORY_TYPENAME: Record<ProviderCategory, string> = {
  [PROVIDER_CATEGORIES.HOTEL]: "HotelListing",
  [PROVIDER_CATEGORIES.AIRBNB_HOST]: "AirbnbListing",
  [PROVIDER_CATEGORIES.CAR_RENTAL]: "CarRentalListing",
  [PROVIDER_CATEGORIES.FOOD_VENDOR]: "FoodVendorListing",
  [PROVIDER_CATEGORIES.SALON]: "SalonListing",
  [PROVIDER_CATEGORIES.AIRLINE]: "AirlineListing",
  [PROVIDER_CATEGORIES.TOUR_GUIDE]: "TourGuideListing",
  [PROVIDER_CATEGORIES.MAKEUP_ARTIST]: "MakeupArtistListing",
  [PROVIDER_CATEGORIES.PHOTOGRAPHER]: "PhotographerListing",
  [PROVIDER_CATEGORIES.EVENT_CENTER]: "EventCenterListing",
  [PROVIDER_CATEGORIES.MASSAGE_THERAPY]: "MassageTherapyListing",
  [PROVIDER_CATEGORIES.PROFESSIONAL_THERAPY]: "TherapyListing",
};

interface SearchInput {
  category?: ProviderCategory;
  city?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}

export const listingResolvers = {
  Query: {
    listing: (_: unknown, { id }: { id: string }) => Listing.findById(id),

    searchListings: async (_: unknown, { input }: { input: SearchInput }) => {
      const { category, city, query, minPrice, maxPrice, page = 1, pageSize = 20 } = input;

      const filter: Record<string, unknown> = { status: "ACTIVE" };
      if (category) filter.category = category;
      if (city) filter["location.city"] = new RegExp(`^${city}$`, "i");
      if (query) filter.$text = { $search: query };
      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.basePrice = {
          ...(minPrice !== undefined ? { $gte: minPrice } : {}),
          ...(maxPrice !== undefined ? { $lte: maxPrice } : {}),
        };
      }

      const [items, total] = await Promise.all([
        Listing.find(filter)
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .sort({ createdAt: -1 }),
        Listing.countDocuments(filter),
      ]);

      return {
        items,
        pageInfo: { total, page, pageSize, hasNextPage: page * pageSize < total },
      };
    },

    myListings: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const authUser = requireRole(ctx, ROLES.PROVIDER);
      const provider = await Provider.findOne({ user: authUser.id });
      if (!provider) return [];
      return Listing.find({ provider: provider._id });
    },
  },

  Mutation: {
    createListing: async (
      _: unknown,
      { category, input }: { category: ProviderCategory; input: Record<string, unknown> },
      ctx: GraphQLContext
    ) => {
      const authUser = requireRole(ctx, ROLES.PROVIDER);
      const provider = await Provider.findOne({ user: authUser.id });
      if (!provider) {
        throw new GraphQLError("Create a provider profile before adding listings.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      if (provider.category !== category) {
        throw new GraphQLError("Listing category must match your provider category.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const Model = CATEGORY_MODEL[category];
      const { categoryData, ...baseFields } = input as { categoryData?: Record<string, unknown> } & Record<string, unknown>;

      return Model.create({
        ...baseFields,
        ...(categoryData ?? {}),
        provider: provider._id,
      });
    },

    updateListing: async (
      _: unknown,
      { id, input }: { id: string; input: Record<string, unknown> },
      ctx: GraphQLContext
    ) => {
      const authUser = requireRole(ctx, ROLES.PROVIDER);
      const provider = await Provider.findOne({ user: authUser.id });
      const listing = await Listing.findById(id);

      if (!listing) throw new GraphQLError("Listing not found.", { extensions: { code: "NOT_FOUND" } });
      if (!provider || String(listing.provider) !== String(provider._id)) {
        throw new GraphQLError("You do not own this listing.", { extensions: { code: "FORBIDDEN" } });
      }

      const { categoryData, ...baseFields } = input as { categoryData?: Record<string, unknown> } & Record<string, unknown>;
      Object.assign(listing, baseFields, categoryData ?? {});
      await listing.save();
      return listing;
    },

    deleteListing: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const authUser = requireRole(ctx, ROLES.PROVIDER);
      const provider = await Provider.findOne({ user: authUser.id });
      const listing = await Listing.findById(id);

      if (!listing) throw new GraphQLError("Listing not found.", { extensions: { code: "NOT_FOUND" } });
      if (!provider || String(listing.provider) !== String(provider._id)) {
        throw new GraphQLError("You do not own this listing.", { extensions: { code: "FORBIDDEN" } });
      }

      await listing.deleteOne();
      return true;
    },
  },

  Listing: {
    __resolveType: (parent: { category: ProviderCategory }) => CATEGORY_TYPENAME[parent.category],
  },
};
