/**
 * Centralized TypeScript types for the Visual Docker Compose application
 */

import { Node } from '@xyflow/react';
export type { ServiceNode } from '../models/ServiceNode';
export type { ServiceContainer, NetworkDefinition } from '../models/ServiceContainer';

// ==================== UI State Types ====================

export interface EditingProperty {
  serviceName: string;
  property: string;
}

export interface ImageSearchState {
  query: Record<string, string>;
  results: Record<string, DockerRepository[]>;
  loading: Record<string, boolean>;
  showSuggestions: Record<string, boolean>;
}

// ==================== Modal Types ====================

export type ModalInputMode = 'manual' | 'search';
export type NetworkModalMode = 'add' | 'edit';

export interface ImageModalState {
  isOpen: boolean;
  serviceName: string | null;
  serviceId: string | null;
  currentValue: string;
  inputMode: ModalInputMode;
  manualInput: string;
  repoSearch: string;
  repoResults: DockerRepository[];
  repoLoading: boolean;
  repoSelectedIndex: number;
  selectedRepo: string | null;
  selectedTag: string | null;
  tags: DockerTag[];
  tagsLoading: boolean;
  tagsPage: number;
  tagsCount: number;
  tagsNext: string | null;
  tagsPrevious: string | null;
}

export interface PortModalState {
  isOpen: boolean;
  serviceName: string | null;
  serviceId: string | null;
  currentValue: string;
  portIndex: number | null;
  localPort: string;
  containerPort: string;
}

export interface NetworkModalState {
  isOpen: boolean;
  mode: NetworkModalMode;
  originalName: string;
  name: string;
  driver: string;
  external: boolean;
  internal: boolean;
  attachable: boolean;
  enableIpv6: boolean;
  enableIpam: boolean;
  ipamDriver: string;
  ipamSubnet: string;
  ipamIpRange: string;
  ipamGateway: string;
}

// ==================== Docker Hub API Types ====================

export interface DockerRepository {
  repo_name: string;
  short_description: string;
  star_count: number;
  pull_count: number;
  repo_owner: string;
  is_automated: boolean;
  is_official: boolean;
}

export interface DockerHubSearchResponse {
  count: number;
  next: string;
  previous: string;
  results: DockerRepository[];
}

export interface DockerImage {
  architecture: string;
  features: string;
  variant: string | null;
  digest: string;
  os: string;
  os_features: string;
  os_version: string | null;
  size: number;
  status: string;
  last_pulled: string;
  last_pushed: string;
}

export interface DockerTag {
  creator: number;
  id: number;
  images: DockerImage[];
  last_updated: string;
  last_updater: number;
  last_updater_username: string;
  name: string;
  repository: number;
  full_size: number;
  v2: boolean;
  tag_status: string;
  tag_last_pulled: string;
  tag_last_pushed: string;
  media_type: string;
  content_type: string;
  digest: string;
}

export interface DockerHubTagsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DockerTag[];
}

// ==================== Service Icon Types ====================

export interface ServiceIcon {
  value: string;
  label: string;
}

export const SERVICE_ICONS: ServiceIcon[] = [
  { value: 'container', label: 'Container' },
  { value: 'database', label: 'Database' },
  { value: 'server', label: 'Server' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'cube', label: 'Cube' },
  { value: 'circle', label: 'Circle' },
  { value: 'hexagon', label: 'Hexagon' },
];

// ==================== Compose Version Types ====================

export const COMPOSE_VERSIONS = [
  "latest",
  "3.9", "3.8", "3.7", "3.6", "3.5", "3.4", "3.3", "3.2", "3.1", "3.0",
  "2.4", "2.3", "2.2", "2.1", "2.0",
  "1.0"
] as const;

export type ComposeVersion = typeof COMPOSE_VERSIONS[number];

// ==================== Network Colors ====================

export const NETWORK_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
] as const;

// ==================== React Flow Types ====================

export interface ServiceNodeData extends Record<string, unknown> {
  label: string;
  icon: string;
}

export type ServiceFlowNode = Node<ServiceNodeData>;

