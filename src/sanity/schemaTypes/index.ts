import type { SchemaTypeDefinition } from "sanity";

import { agentConfig } from "./agentConfig";
import { brand } from "./brand";
import { category } from "./category";
import { order } from "./order";
import { product } from "./product";

export const schemaTypes: SchemaTypeDefinition[] = [
  product,
  category,
  brand,
  order,
  agentConfig,
];
