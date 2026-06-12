import {z} from "zod"
import { PropertyType, OfferStatus  } from "@prisma/client"

export const OfferSchema = z.object({
    body: z.object({
        title: z.string().nonempty("Title is required"),
        description: z.string().optional(),
        price: z.number().nonnegative("Insert valid price"),
        areaM2: z.number().nonnegative("Insert valid area in sqm²"),
        bedrooms: z.number().nonnegative("Insert valid bedroom number"),
        bathrooms: z.number().nonnegative("Insert valid bathroom number"),
        parkingSpots: z.number().nonnegative("Insert valid parking spot number"),
        propertyType: z.nativeEnum(PropertyType),
        status: z.nativeEnum(OfferStatus),
        neighborhood: z.string().nonempty("Neighborhood is required"),
        city: z.string().nonempty("City is required"),
        state: z.string().nonempty("State is required"),
        address: z.string().optional(),
        userId: z.string()

    })
})
