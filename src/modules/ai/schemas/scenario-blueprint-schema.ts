import { z } from 'zod';

const siteSchema = z.object({
  code: z.string().regex(/^[A-Z0-9_-]{2,12}$/),
  name: z.string().min(2).max(80),
  kind: z.enum(['base', 'colony', 'relay', 'charger', 'waypoint']),
  x: z.number().min(8).max(92),
  y: z.number().min(8).max(92),
  environment: z.enum(['plain', 'ridge', 'crater', 'dust', 'shadow']),
  hasCharger: z.boolean(),
});

const roverSchema = z.object({
  code: z.string().regex(/^[A-Z0-9_-]{2,16}$/),
  name: z.string().min(2).max(80),
  capacityKg: z.number().min(20).max(300),
  batteryCapacityKwh: z.number().min(15).max(160),
  startingBatteryPercent: z.number().min(10).max(100),
  baseSpeedKph: z.number().min(8).max(80),
  riskResistance: z.number().min(0).max(0.85),
});

const orderSchema = z.object({
  code: z.string().regex(/^[A-Z0-9_-]{2,16}$/),
  title: z.string().min(2).max(100),
  category: z.string().min(2).max(40),
  destinationSiteCode: z.string().regex(/^[A-Z0-9_-]{2,12}$/),
  weightKg: z.number().min(1).max(500),
  rewardCredits: z.number().min(20).max(5_000),
  failurePenaltyCredits: z.number().min(0).max(2_000),
  urgency: z.enum(['low', 'normal', 'high', 'critical']),
  deadlineMinute: z.number().min(30).max(43_200).nullable(),
});

export const scenarioBlueprintSchema = z.object({
  title: z.string().min(4).max(100),
  summary: z.string().min(20).max(400),
  seed: z.number().int().min(1).max(2_147_483_647),
  durationDays: z.number().int().min(1).max(30),
  difficulty: z.enum(['easy', 'normal', 'hard', 'crisis']),
  startingCredits: z.number().min(100).max(100_000),
  targetCredits: z.number().min(200).max(200_000),
  sites: z.array(siteSchema).min(5).max(8),
  rovers: z.array(roverSchema).min(3).max(5),
  orders: z.array(orderSchema).min(6).max(12),
  demandNarrative: z.string().min(10).max(300),
  victoryNarrative: z.string().min(10).max(200),
}).superRefine((value, context) => {
  const siteCodes = new Set(value.sites.map((site) => site.code));
  if (!value.sites.some((site) => site.kind === 'base')) {
    context.addIssue({ code: 'custom', message: 'At least one base site is required', path: ['sites'] });
  }
  if (siteCodes.size !== value.sites.length) {
    context.addIssue({ code: 'custom', message: 'Site codes must be unique', path: ['sites'] });
  }
  if (new Set(value.rovers.map((rover) => rover.code)).size !== value.rovers.length) {
    context.addIssue({ code: 'custom', message: 'Rover codes must be unique', path: ['rovers'] });
  }
  if (new Set(value.orders.map((order) => order.code)).size !== value.orders.length) {
    context.addIssue({ code: 'custom', message: 'Order codes must be unique', path: ['orders'] });
  }
  value.orders.forEach((order, index) => {
    if (!siteCodes.has(order.destinationSiteCode)) {
      context.addIssue({ code: 'custom', message: `Unknown destination ${order.destinationSiteCode}`, path: ['orders', index, 'destinationSiteCode'] });
    }
  });
});

export type ScenarioBlueprintInput = z.infer<typeof scenarioBlueprintSchema>;

export const scenarioBlueprintJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'summary', 'seed', 'durationDays', 'difficulty', 'startingCredits', 'targetCredits', 'sites', 'rovers', 'orders', 'demandNarrative', 'victoryNarrative'],
  properties: {
    title: { type: 'string', minLength: 4, maxLength: 100 },
    summary: { type: 'string', minLength: 20, maxLength: 400 },
    seed: { type: 'integer', minimum: 1, maximum: 2147483647 },
    durationDays: { type: 'integer', minimum: 1, maximum: 30 },
    difficulty: { type: 'string', enum: ['easy', 'normal', 'hard', 'crisis'] },
    startingCredits: { type: 'number', minimum: 100, maximum: 100000 },
    targetCredits: { type: 'number', minimum: 200, maximum: 200000 },
    sites: {
      type: 'array', minItems: 5, maxItems: 8,
      items: {
        type: 'object', additionalProperties: false,
        required: ['code', 'name', 'kind', 'x', 'y', 'environment', 'hasCharger'],
        properties: {
          code: { type: 'string', pattern: '^[A-Z0-9_-]{2,12}$' }, name: { type: 'string' },
          kind: { type: 'string', enum: ['base', 'colony', 'relay', 'charger', 'waypoint'] },
          x: { type: 'number', minimum: 8, maximum: 92 }, y: { type: 'number', minimum: 8, maximum: 92 },
          environment: { type: 'string', enum: ['plain', 'ridge', 'crater', 'dust', 'shadow'] },
          hasCharger: { type: 'boolean' },
        },
      },
    },
    rovers: {
      type: 'array', minItems: 3, maxItems: 5,
      items: {
        type: 'object', additionalProperties: false,
        required: ['code', 'name', 'capacityKg', 'batteryCapacityKwh', 'startingBatteryPercent', 'baseSpeedKph', 'riskResistance'],
        properties: {
          code: { type: 'string', pattern: '^[A-Z0-9_-]{2,16}$' }, name: { type: 'string' },
          capacityKg: { type: 'number', minimum: 20, maximum: 300 },
          batteryCapacityKwh: { type: 'number', minimum: 15, maximum: 160 },
          startingBatteryPercent: { type: 'number', minimum: 10, maximum: 100 },
          baseSpeedKph: { type: 'number', minimum: 8, maximum: 80 },
          riskResistance: { type: 'number', minimum: 0, maximum: 0.85 },
        },
      },
    },
    orders: {
      type: 'array', minItems: 6, maxItems: 12,
      items: {
        type: 'object', additionalProperties: false,
        required: ['code', 'title', 'category', 'destinationSiteCode', 'weightKg', 'rewardCredits', 'failurePenaltyCredits', 'urgency', 'deadlineMinute'],
        properties: {
          code: { type: 'string', pattern: '^[A-Z0-9_-]{2,16}$' }, title: { type: 'string' }, category: { type: 'string' },
          destinationSiteCode: { type: 'string' }, weightKg: { type: 'number', minimum: 1, maximum: 500 },
          rewardCredits: { type: 'number', minimum: 20, maximum: 5000 },
          failurePenaltyCredits: { type: 'number', minimum: 0, maximum: 2000 },
          urgency: { type: 'string', enum: ['low', 'normal', 'high', 'critical'] },
          deadlineMinute: { anyOf: [{ type: 'number', minimum: 30, maximum: 43200 }, { type: 'null' }] },
        },
      },
    },
    demandNarrative: { type: 'string', minLength: 10, maxLength: 300 },
    victoryNarrative: { type: 'string', minLength: 10, maxLength: 200 },
  },
} as const;
