/**
 * useDockerHubSearch - Hook for Docker Hub repository search with debouncing
 */

import { useState, useCallback, useRef } from 'react';
import { DockerHubService, DockerRepository, DockerTag } from '../services/docker-hub-service';

export function useDockerHubSearch() {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Local state for the hook
  const [searchTerm, setSearchTerm] = useState('');
  const [repositories, setRepositories] = useState<DockerRepository[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [tags, setTags] = useState<DockerTag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  const searchRepositories = useCallback((query: string) => {
    setSearchTerm(query);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 3) {
      setRepositories([]);
      return;
    }

    setIsSearching(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await DockerHubService.searchRepositories(query);
        setRepositories(results.results);
      } catch (error) {
        console.error('Error searching Docker Hub repos:', error);
        setRepositories([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  const fetchTags = useCallback(async (repoName: string) => {
    setIsLoadingTags(true);

    try {
      const tagsResponse = await DockerHubService.getRepositoryTags(repoName, 10, 1);
      setTags(tagsResponse.results);
    } catch (error) {
      console.error('Error fetching repository tags:', error);
      setTags([]);
    } finally {
      setIsLoadingTags(false);
    }
  }, []);

  const clearTags = useCallback(() => {
    setTags([]);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setRepositories([]);
    setTags([]);
  }, []);

  return {
    // State
    searchTerm,
    setSearchTerm: searchRepositories,
    repositories,
    tags,
    isSearching,
    isLoadingTags,
    // Actions
    fetchTags,
    clearTags,
    clearSearch,
  };
}
