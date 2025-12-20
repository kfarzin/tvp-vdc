import { ServiceContainer } from '../models/ServiceContainer';

/**
 * WorkspaceItem represents a workspace item that can hold various project-related data
 */
export class WorkspaceItem {
  /**
   * Unique identifier for the workspace item
   */
  id: string;

  /**
   * Display name of the workspace item
   */
  name: string;

  /**
   * Optional description
   */
  description?: string;

  /**
   * The service container configuration (Docker Compose services)
   */
  serviceContainer?: ServiceContainer;

  /**
   * File path or location of the workspace item
   */
  path?: string;

  /**
   * Creation timestamp
   */
  createdAt: Date;

  /**
   * Last modified timestamp
   */
  modifiedAt: Date;

  /**
   * Additional metadata that can be stored
   */
  metadata?: Record<string, any>;

  constructor(
    id: string,
    name: string,
    options?: {
      description?: string;
      serviceContainer?: ServiceContainer;
      path?: string;
      metadata?: Record<string, any>;
    }
  ) {
    this.id = id;
    this.name = name;
    this.description = options?.description;
    this.serviceContainer = options?.serviceContainer;
    this.path = options?.path;
    this.metadata = options?.metadata;
    this.createdAt = new Date();
    this.modifiedAt = new Date();
  }

  /**
   * Update the service container
   */
  setServiceContainer(serviceContainer: ServiceContainer): void {
    this.serviceContainer = serviceContainer;
    this.updateModifiedTime();
  }

  /**
   * Update metadata
   */
  updateMetadata(key: string, value: any): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata[key] = value;
    this.updateModifiedTime();
  }

  /**
   * Update modified timestamp
   */
  private updateModifiedTime(): void {
    this.modifiedAt = new Date();
  }

  /**
   * Convert to JSON representation
   */
  toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      serviceContainer: this.serviceContainer,
      path: this.path,
      createdAt: this.createdAt.toISOString(),
      modifiedAt: this.modifiedAt.toISOString(),
      metadata: this.metadata,
    };
  }

  /**
   * Create from JSON representation
   */
  static fromJSON(json: any): WorkspaceItem {
    const item = new WorkspaceItem(json.id, json.name, {
      description: json.description,
      serviceContainer: json.serviceContainer,
      path: json.path,
      metadata: json.metadata,
    });
    item.createdAt = new Date(json.createdAt);
    item.modifiedAt = new Date(json.modifiedAt);
    return item;
  }
}

export default WorkspaceItem;
