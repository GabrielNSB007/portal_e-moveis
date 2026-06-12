import { z } from "zod";
import { Amenity, PropertyType } from "@prisma/client";

const idSchema = z.string().uuid("ID inválido");

const optionalString = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}, z.string().trim().min(1, "Texto inválido").optional());

const optionalNumber = z.preprocess(
  (value) => {
    if (value === "" || value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    return Number(value);
  },
  z
    .number({
      invalid_type_error: "O valor deve ser numérico",
    })
    .nonnegative("O valor não pode ser negativo")
    .nullable()
    .optional(),
);

const optionalInteger = z.preprocess(
  (value) => {
    if (value === "" || value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    return Number(value);
  },
  z
    .number({
      invalid_type_error: "O valor deve ser numérico",
    })
    .int("O valor deve ser inteiro")
    .nonnegative("O valor não pode ser negativo")
    .nullable()
    .optional(),
);

const booleanQuery = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;

  return value;
}, z.boolean().optional());

const stringArray = z.preprocess(
  (value) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value === "") {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      return [value];
    }

    return value;
  },
  z
    .array(z.string().trim().min(1, "Item inválido"))
    .default([])
    .transform((items) => [...new Set(items)]),
);

const propertyTypeArray = z.preprocess(
  (value) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value === "") {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      return [value];
    }

    return value;
  },
  z.array(z.nativeEnum(PropertyType)).default([]),
);

const amenityArray = z.preprocess(
  (value) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value === "") {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      return [value];
    }

    return value;
  },
  z.array(z.nativeEnum(Amenity)).default([]),
);

const preferenceFieldsSchema = z.object({
  title: optionalString,

  minPrice: optionalNumber,
  maxPrice: optionalNumber,

  minAreaM2: optionalNumber,
  maxAreaM2: optionalNumber,

  minBedrooms: optionalInteger,
  minBathrooms: optionalInteger,
  minParkingSpots: optionalInteger,

  propertyTypes: propertyTypeArray,
  neighborhoods: stringArray,

  city: z.string().trim().min(1, "Cidade é obrigatória"),
  state: z.string().trim().min(1, "Estado é obrigatório"),

  desiredAmenities: amenityArray,

  isActive: z.boolean().optional(),
});

type PreferenceRangeData = {
  minPrice?: number | null;
  maxPrice?: number | null;
  minAreaM2?: number | null;
  maxAreaM2?: number | null;
};

function validatePreferenceRanges(
  data: PreferenceRangeData,
  ctx: z.RefinementCtx,
) {
  if (
    data.minPrice !== undefined &&
    data.minPrice !== null &&
    data.maxPrice !== undefined &&
    data.maxPrice !== null &&
    data.minPrice > data.maxPrice
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["maxPrice"],
      message: "O preço máximo deve ser maior ou igual ao preço mínimo",
    });
  }

  if (
    data.minAreaM2 !== undefined &&
    data.minAreaM2 !== null &&
    data.maxAreaM2 !== undefined &&
    data.maxAreaM2 !== null &&
    data.minAreaM2 > data.maxAreaM2
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["maxAreaM2"],
      message: "A área máxima deve ser maior ou igual à área mínima",
    });
  }
}

export const CreatePreferenceSchema = z.object({
  body: preferenceFieldsSchema.superRefine(validatePreferenceRanges),
});

export const UpdatePreferenceSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: preferenceFieldsSchema.partial().superRefine(validatePreferenceRanges),
});

export const PreferenceIdParamsSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

export const ListPreferencesSchema = z.object({
  query: z.object({
    isActive: booleanQuery,
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

export type CreatePreferenceBody = z.infer<
  typeof CreatePreferenceSchema
>["body"];

export type UpdatePreferenceBody = z.infer<
  typeof UpdatePreferenceSchema
>["body"];
