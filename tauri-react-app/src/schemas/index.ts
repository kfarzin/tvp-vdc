/**
 * Zod validation schemas for forms
 */

import { z } from 'zod';

// ==================== Port Modal Schema ====================

export const portMappingSchema = z.object({
  localPort: z
    .string()
    .min(1, 'Local port is required')
    .regex(/^\d+(-\d+)?$/, 'Invalid port format (e.g., 8080 or 8080-8090)'),
  containerPort: z
    .string()
    .min(1, 'Container port is required')
    .regex(/^\d+(\/tcp|\/udp)?$/, 'Invalid port format (e.g., 80 or 80/tcp)'),
});

export type PortMappingFormData = z.infer<typeof portMappingSchema>;

// ==================== Network Modal Schema ====================

export const ipamConfigSchema = z.object({
  subnet: z.string().optional(),
  gateway: z.string().optional(),
  ip_range: z.string().optional(),
});

export const networkFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Network name is required')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Name can only contain letters, numbers, underscores, and hyphens'),
  driver: z.string().default('bridge'),
  external: z.boolean().default(false),
  enableIPv6: z.boolean().default(false),
  ipamDriver: z.string().default('default'),
  ipamConfig: z.array(ipamConfigSchema).default([]),
  driverOpts: z.record(z.string(), z.string()).default({}),
  labels: z.record(z.string(), z.string()).default({}),
});

export type NetworkFormData = z.infer<typeof networkFormSchema>;
export type IPAMConfigData = z.infer<typeof ipamConfigSchema>;

// ==================== Service Property Schemas ====================

export const containerNameSchema = z.object({
  containerName: z
    .string()
    .min(1, 'Container name is required')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/, 'Invalid container name format'),
});

export type ContainerNameFormData = z.infer<typeof containerNameSchema>;

export const volumeMappingSchema = z.object({
  volume: z
    .string()
    .min(1, 'Volume mapping is required')
    .regex(/^[^:]+:[^:]+(:ro|:rw)?$/, 'Invalid volume format (e.g., ./data:/app/data or ./data:/app/data:ro)'),
});

export type VolumeMappingFormData = z.infer<typeof volumeMappingSchema>;

export const environmentVariableSchema = z.object({
  envVar: z
    .string()
    .min(1, 'Environment variable is required')
    .regex(/^[A-Z_][A-Z0-9_]*=.+$/, 'Invalid format (e.g., MY_VAR=value)'),
});

export type EnvironmentVariableFormData = z.infer<typeof environmentVariableSchema>;

export const labelSchema = z.object({
  label: z
    .string()
    .min(1, 'Label is required'),
});

export type LabelFormData = z.infer<typeof labelSchema>;

// ==================== Image Modal Schema ====================

export const imageSchema = z.object({
  image: z
    .string()
    .min(1, 'Image is required')
    .regex(/^[a-z0-9._/-]+(:[a-zA-Z0-9._-]+)?$/, 'Invalid image format (e.g., nginx:latest)'),
});

export type ImageFormData = z.infer<typeof imageSchema>;

// ==================== Workspace Item Schema ====================

export const workspaceItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less'),
  description: z.string().optional(),
});

export type WorkspaceItemFormData = z.infer<typeof workspaceItemSchema>;

// ==================== Compose Header Schema ====================

export const composeNameSchema = z.object({
  name: z
    .string()
    .min(1, 'Compose name is required')
    .max(100, 'Name must be 100 characters or less'),
});

export type ComposeNameFormData = z.infer<typeof composeNameSchema>;

// ==================== Service Name Schema ====================

export const serviceNameSchema = z.object({
  name: z
    .string()
    .min(1, 'Service name is required')
    .regex(/^[a-z][a-z0-9_-]*$/, 'Service name must start with lowercase letter and contain only lowercase letters, numbers, underscores, and hyphens'),
});

export type ServiceNameFormData = z.infer<typeof serviceNameSchema>;
