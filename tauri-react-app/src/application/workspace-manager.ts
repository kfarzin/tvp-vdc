import { WorkspaceItem } from './workspace-item';

/**
 * WorkspaceManager manages a collection of workspace items
 */
export class WorkspaceManager {
  /**
   * Name of the workspace
   */
  name: string;

  /**
   * Description of the workspace
   */
  description: string;

  /**
   * Collection of workspace items
   */
  items: WorkspaceItem[];

  constructor(name: string, description: string, items: WorkspaceItem[] = []) {
    this.name = name;
    this.description = description;
    this.items = items;
  }

  /**
   * Add a workspace item
   */
  addItem(item: WorkspaceItem): void {
    this.items.push(item);
  }

  /**
   * Remove a workspace item by id
   */
  removeItem(id: string): boolean {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get a workspace item by id
   */
  getItem(id: string): WorkspaceItem | undefined {
    return this.items.find(item => item.id === id);
  }

  /**
   * Get all workspace items
   */
  getAllItems(): WorkspaceItem[] {
    return [...this.items];
  }

  /**
   * Update a workspace item
   */
  updateItem(id: string, updates: Partial<WorkspaceItem>): boolean {
    const item = this.getItem(id);
    if (item) {
      Object.assign(item, updates);
      item.modifiedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Clear all items
   */
  clearItems(): void {
    this.items = [];
  }

  /**
   * Get the count of items
   */
  getItemCount(): number {
    return this.items.length;
  }

  /**
   * Convert to JSON representation
   */
  toJSON(): object {
    return {
      name: this.name,
      description: this.description,
      items: this.items.map(item => item.toJSON()),
    };
  }

  /**
   * Create from JSON representation
   */
  static fromJSON(json: any): WorkspaceManager {
    const items = json.items?.map((itemJson: any) => WorkspaceItem.fromJSON(itemJson)) || [];
    return new WorkspaceManager(json.name, json.description, items);
  }
}

export default WorkspaceManager;
