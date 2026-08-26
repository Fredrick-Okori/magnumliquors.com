import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: "users",
  },
  collections: [
    {
      slug: "users",
      admin: {
        group: "System & Access",
      },
      auth: true,
      fields: [],
    },
    {
      slug: "orders",
      admin: {
        useAsTitle: "orderNumber",
        group: "Sales & Orders",
      },
      fields: [
        {
          name: "orderNumber",
          type: "text",
          required: true,
        },
        {
          name: "customerName",
          type: "text",
          required: true,
        },
        {
          name: "customerEmail",
          type: "text",
          required: true,
        },
        {
          name: "customerPhone",
          type: "text",
          required: true,
        },
        {
          name: "deliveryAddress",
          type: "textarea",
          required: true,
        },
        {
          name: "orderStatus",
          type: "select",
          options: [
            { label: "Pending", value: "Pending" },
            { label: "Processing", value: "Processing" },
            { label: "Out for Delivery", value: "Out for Delivery" },
            { label: "Delivered", value: "Delivered" },
            { label: "Cancelled", value: "Cancelled" },
          ],
          defaultValue: "Pending",
          required: true,
        },
        {
          name: "paymentMethod",
          type: "select",
          options: [
            { label: "Cash on Delivery", value: "Cash on Delivery" },
            { label: "MTN / Airtel Mobile Money", value: "Mobile Money" },
            { label: "Credit / Debit Card", value: "Card" },
          ],
          defaultValue: "Cash on Delivery",
          required: true,
        },
        {
          name: "paymentStatus",
          type: "select",
          options: [
            { label: "Pending", value: "Pending" },
            { label: "Paid", value: "Paid" },
            { label: "Refunded", value: "Refunded" },
          ],
          defaultValue: "Pending",
          required: true,
        },
        {
          name: "totalAmountUSD",
          type: "number",
          required: true,
        },
        {
          name: "totalAmountUGX",
          type: "number",
          required: true,
        },
        {
          name: "items",
          type: "array",
          fields: [
            {
              name: "productName",
              type: "text",
              required: true,
            },
            {
              name: "quantity",
              type: "number",
              required: true,
            },
            {
              name: "unitPriceUSD",
              type: "number",
              required: true,
            },
            {
              name: "subtotalUSD",
              type: "number",
              required: true,
            },
          ],
        },
      ],
    },
    {
      slug: "customers",
      admin: {
        useAsTitle: "fullName",
        group: "Sales & Orders",
      },
      fields: [
        {
          name: "fullName",
          type: "text",
          required: true,
        },
        {
          name: "email",
          type: "text",
          required: true,
        },
        {
          name: "phone",
          type: "text",
          required: true,
        },
        {
          name: "address",
          type: "textarea",
        },
        {
          name: "cellarClubPoints",
          type: "number",
          defaultValue: 0,
        },
        {
          name: "ageVerified",
          type: "checkbox",
          defaultValue: true,
        },
      ],
    },
    {
      slug: "products",
      admin: {
        useAsTitle: "name",
        group: "Store Catalog",
      },
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
        },
        {
          name: "producer",
          type: "text",
          required: true,
        },
        {
          name: "origin",
          type: "text",
          required: true,
        },
        {
          name: "category",
          type: "select",
          options: [
            { label: "Spirits", value: "Spirits" },
            { label: "Wine", value: "Wine" },
            { label: "Bourbon", value: "Bourbon" },
            { label: "Beer", value: "Beer" },
            { label: "Non-alcoholic", value: "Non-alcoholic" },
          ],
          required: true,
        },
        {
          name: "price",
          type: "text",
          required: true,
        },
        {
          name: "numericPrice",
          type: "number",
          required: true,
        },
        {
          name: "badge",
          type: "text",
        },
        {
          name: "abv",
          type: "text",
          required: true,
        },
        {
          name: "volume",
          type: "text",
          required: true,
        },
        {
          name: "vintage",
          type: "text",
        },
        {
          name: "cask",
          type: "text",
        },
        {
          name: "rating",
          type: "text",
          required: true,
        },
        {
          name: "description",
          type: "textarea",
          required: true,
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "inStock",
          type: "checkbox",
          defaultValue: true,
        },
        {
          name: "tastingNotes",
          type: "group",
          fields: [
            { name: "nose", type: "textarea", required: true },
            { name: "palate", type: "textarea", required: true },
            { name: "finish", type: "textarea", required: true },
            { name: "pairing", type: "textarea", required: true },
          ],
        },
      ],
    },
    {
      slug: "brands",
      admin: {
        useAsTitle: "name",
        group: "Store Catalog",
      },
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
        },
        {
          name: "origin",
          type: "text",
          required: true,
        },
        {
          name: "description",
          type: "textarea",
        },
        {
          name: "isFeatured",
          type: "checkbox",
          defaultValue: true,
        },
      ],
    },
    {
      slug: "categories",
      admin: {
        useAsTitle: "name",
        group: "Store Catalog",
      },
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
        },
        {
          name: "slug",
          type: "text",
          required: true,
        },
        {
          name: "description",
          type: "textarea",
        },
      ],
    },
    {
      slug: "discounts",
      admin: {
        useAsTitle: "code",
        group: "Marketing & Store Info",
      },
      fields: [
        {
          name: "code",
          type: "text",
          required: true,
        },
        {
          name: "discountType",
          type: "select",
          options: [
            { label: "Percentage (%)", value: "percentage" },
            { label: "Fixed Amount ($)", value: "fixed" },
          ],
          defaultValue: "percentage",
          required: true,
        },
        {
          name: "value",
          type: "number",
          required: true,
        },
        {
          name: "isActive",
          type: "checkbox",
          defaultValue: true,
        },
      ],
    },
    {
      slug: "locations",
      admin: {
        useAsTitle: "name",
        group: "Marketing & Store Info",
      },
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
        },
        {
          name: "address",
          type: "text",
          required: true,
        },
        {
          name: "openingHours",
          type: "text",
          required: true,
        },
        {
          name: "phone",
          type: "text",
        },
      ],
    },
    {
      slug: "media",
      admin: {
        group: "Marketing & Store Info",
      },
      upload: {
        staticDir: path.resolve(dirname, "public/media"),
        adminThumbnail: "thumbnail",
        mimeTypes: ["image/*"],
      },
      fields: [
        {
          name: "alt",
          type: "text",
        },
      ],
    },
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "magnum-secret-key-123456789",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: sqliteAdapter({
    client: {
      url: "file:./magnum.db",
    },
  }),
});

