/**
 * Docker Hub API Service
 * Provides methods to interact with Docker Hub's public API
 */

import { fetch } from '@tauri-apps/plugin-http';

/**
 * Represents a single Docker repository from search results
 */
export interface DockerRepository {
  repo_name: string;
  short_description: string;
  star_count: number;
  pull_count: number;
  repo_owner: string;
  is_automated: boolean;
  is_official: boolean;
}

/**
 * Represents the response from Docker Hub search API
 */
export interface DockerHubSearchResponse {
  count: number;
  next: string;
  previous: string;
  results: DockerRepository[];
}

/**
 * Represents a Docker image within a tag
 */
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

/**
 * Represents a Docker image tag
 */
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

/**
 * Represents the response from Docker Hub tags API
 */
export interface DockerHubTagsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DockerTag[];
}

/**
 * Service for interacting with Docker Hub API
 */
export class DockerHubService {
  private static readonly BASE_URL = 'https://hub.docker.com/v2';

  /**
   * Search for Docker repositories by query string
   * @param query - The search query string
   * @returns Promise containing the search results
   */
  static async searchRepositories(query: string): Promise<DockerHubSearchResponse> {
    try {
      const url = `${this.BASE_URL}/search/repositories/?query=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Docker Hub API error: ${response.status} ${response.statusText}`);
      }
      
      const data: DockerHubSearchResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Docker Hub repositories:', error);
      throw error;
    }
  }

  /**
   * Search for Docker repositories with pagination support
   * @param query - The search query string
   * @param page - The page number (default: 1)
   * @returns Promise containing the search results
   */
  static async searchRepositoriesWithPage(query: string, page: number = 1): Promise<DockerHubSearchResponse> {
    try {
      const url = `${this.BASE_URL}/search/repositories/?query=${encodeURIComponent(query)}&page=${page}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Docker Hub API error: ${response.status} ${response.statusText}`);
      }
      
      const data: DockerHubSearchResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Docker Hub repositories:', error);
      throw error;
    }
  }

  /**
   * Get tags for a Docker repository
   * @param repoName - The repository name (e.g., "library/alpine" or "alpine")
   * @param pageSize - Number of results per page (default: 10)
   * @param page - The page number (default: 1)
   * @returns Promise containing the tags
   */
  static async getRepositoryTags(repoName: string, pageSize: number = 10, page: number = 1): Promise<DockerHubTagsResponse> {
    try {
      // If repo doesn't contain "/", assume it's an official library image
      const fullRepoName = repoName.includes('/') ? repoName : `library/${repoName}`;
      const url = `${this.BASE_URL}/repositories/${fullRepoName}/tags/?page_size=${pageSize}&page=${page}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Docker Hub API error: ${response.status} ${response.statusText}`);
      }
      
      const data: DockerHubTagsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Docker Hub tags:', error);
      throw error;
    }
  }
}

export default DockerHubService;
