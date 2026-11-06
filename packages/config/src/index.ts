import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Attempt to load .env from monorepo root or current directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Discord Configuration
  DISCORD_TOKEN: z.string().default('placeholder_bot_token'),
  DISCORD_CLIENT_ID: z.string().default('placeholder_client_id'),
  DISCORD_CLIENT_SECRET: z.string().default('placeholder_client_secret'),
  DISCORD_GUILD_ID: z.string().default('placeholder_guild_id'),
  DISCORD_REDIRECT_URI: z.string().url().default('http://localhost:3000/api/auth/callback/discord'),

  // Database
  DATABASE_URL: z.string().default('postgresql://nexus:password@localhost:5432/tatakae_nexus?schema=public'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Web & API Ports & URLs
  API_PORT: z.coerce.number().default(4000),
  API_URL: z.string().url().default('http://localhost:4000'),
  DASHBOARD_PORT: z.coerce.number().default(3000),
  DASHBOARD_URL: z.string().url().default('http://localhost:3000'),

  // Secrets & Encryption
  SESSION_SECRET: z.string().min(16).default('tatakae_nexus_session_secret_32_characters_min'),
  ENCRYPTION_KEY: z.string().min(16).default('tatakae_nexus_encryption_32_bytes_key_00'),

  // Timezone & Logging
  DEFAULT_TIMEZONE: z.string().default('Asia/Kolkata'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type AppConfig = z.infer<typeof configSchema>;

let parsedConfig: AppConfig;

try {
  parsedConfig = configSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.warn('⚠️ Warning: Environment configuration missing or invalid fields:');
    for (const issue of error.issues) {
      console.warn(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
  }
  // Fallback to defaults
  parsedConfig = configSchema.parse({});
}

export const env = parsedConfig;

