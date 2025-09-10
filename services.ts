import { TMDB_API_KEY, TMDB_API_BASE_URL, STORAGE_KEY_MOVIES, STORAGE_KEY_BOOKS, STORAGE_KEY_EVENTS } from './constants';
import type { Movie, Book, Event, TmdbMovieSearchResult } from './types';

// --- TMDB API Service ---

export const tmdbService = {
  searchMovies: async (query: string): Promise<TmdbMovieSearchResult[]> => {
    if (!query || TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
        return [];
    }
    try {
      const response = await fetch(`${TMDB_API_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch from TMDB API');
      }
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error("Error searching movies:", error);
      return [];
    }
  },
};

// --- Storage Service (using localStorage) ---

// Fix: Removed trailing comma from generic type parameter list, which is a syntax error.
function getItemsFromStorage<T>(key: string): T[] {
    try {
        const itemsJson = localStorage.getItem(key);
        return itemsJson ? JSON.parse(itemsJson) : [];
    } catch (error) {
        console.error(`Error reading from localStorage key "${key}":`, error);
        return [];
    }
}

// Fix: Removed trailing comma from generic type parameter list, which is a syntax error.
function saveItemsToStorage<T>(key:string, items: T[]): void {
    try {
        localStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
        console.error(`Error writing to localStorage key "${key}":`, error);
    }
}

export const storageService = {
    getMovies: (): Movie[] => getItemsFromStorage<Movie>(STORAGE_KEY_MOVIES),
    saveMovies: (movies: Movie[]) => saveItemsToStorage<Movie>(STORAGE_KEY_MOVIES, movies),

    getBooks: (): Book[] => getItemsFromStorage<Book>(STORAGE_KEY_BOOKS),
    saveBooks: (books: Book[]) => saveItemsToStorage<Book>(STORAGE_KEY_BOOKS, books),

    getEvents: (): Event[] => getItemsFromStorage<Event>(STORAGE_KEY_EVENTS),
    saveEvents: (events: Event[]) => saveItemsToStorage<Event>(STORAGE_KEY_EVENTS, events),
};