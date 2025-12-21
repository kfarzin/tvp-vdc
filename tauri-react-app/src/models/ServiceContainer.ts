import { ServiceNode } from './ServiceNode';

/**
 * Network definition for Docker Compose
 */
export interface NetworkDefinition {
  driver?: string;
  driver_opts?: Record<string, string>;
  external?: boolean | { name: string };
  internal?: boolean;
  attachable?: boolean;
  enable_ipv6?: boolean;
  ipam?: {
    driver?: string;
    config?: {
      subnet?: string;
      ip_range?: string;
      gateway?: string;
      aux_addresses?: Record<string, string>;
    }[];
    options?: Record<string, string>;
  };
  labels?: Record<string, string> | string[];
  name?: string;
  color?: string;
}

/**
 * Volume definition for Docker Compose
 */
export interface VolumeDefinition {
  driver?: string;
  driver_opts?: Record<string, string>;
  external?: boolean | { name: string };
  labels?: Record<string, string> | string[];
  name?: string;
}

/**
 * Secret/Config definition for Docker Compose
 */
export interface SecretConfigDefinition {
  file?: string;
  external?: boolean | { name: string };
  environment?: string;
  name?: string;
  labels?: Record<string, string>;
}

/**
 * ServiceContainer represents a complete Docker Compose configuration
 */
export interface ServiceContainer {
  name?: string; // The project name (defaults to directory name if not specified)
  version?: string; // Optional in the latest Compose Specification
  services: Record<string, ServiceNode>;
  networks?: Record<string, NetworkDefinition>;
  volumes?: Record<string, VolumeDefinition | null>;
  secrets?: Record<string, SecretConfigDefinition>;
  configs?: Record<string, SecretConfigDefinition>;
}

export default ServiceContainer;
