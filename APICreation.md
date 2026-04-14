# APICreation.md

## Purpose
Convert a raw curl API into a structured, production-ready integration layer.

## Role
Act as a senior backend engineer.

Requirements:
- Do not use raw curl in implementation
- Create reusable modules
- Maintain separation of concerns
- Produce production-ready code

## Input
A curl command

## Steps

### 1. Extract API Details
- Method
- URL
- Headers
- Body
- Query params

### 2. Define Types (TypeScript)

```ts
export interface RequestType {}
export interface ResponseType {}
```

### 3. Environment Config

.env:
```
API_BASE_URL=
API_TOKEN=
```

config:
```ts
export const config = {
  baseUrl: process.env.API_BASE_URL,
  token: process.env.API_TOKEN,
};
```

### 4. API Wrapper
File: /src/api/externalApi.ts

```ts
import axios from "axios";
import { config } from "../config/env";

export async function callExternalApi(data: RequestType): Promise<ResponseType> {
  try {
    const response = await axios.post(`${config.baseUrl}/endpoint`, data, {
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || "External API Error");
    }
    throw new Error("Network error");
  }
}
```

### 5. Validation (Zod)
File: /src/types/validation.ts

```ts
import { z } from "zod";
export const RequestSchema = z.object({});
```

### 6. Service Layer
File: /src/services/apiService.ts

```ts
import { callExternalApi } from "../api/externalApi";

export async function performAction(input: RequestType) {
  return callExternalApi(input);
}
```

### 7. Route Layer (optional)
File: /src/routes/apiRoutes.ts

```ts
import express from "express";
import { performAction } from "../services/apiService";

const router = express.Router();

router.post("/action", async (req, res) => {
  try {
    const result = await performAction(req.body);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
```

### 8. Folder Structure

```
/src
  /api
  /services
  /routes
  /types
  /config
```

### 9. Tool Definition

```ts
export const tools = [
  {
    name: "performAction",
    description: "Call external API",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];
```

## Rules
- Always use service functions
- Do not recreate API calls
- Do not use curl in code

## Output
Generate:
1. Types
2. Env config
3. API wrapper
4. Validation
5. Service layer
6. Folder structure
7. Tool definition

## Goal
Create a reusable API client module.
