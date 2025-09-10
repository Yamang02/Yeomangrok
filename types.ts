
export type ActivityType = 'movie' | 'book' | 'event';

export interface BaseActivity {
  id: string;
  title: string;
  review: string;
  rating: number; // 0-5
  date: string; // ISO 8601 format
}

export interface Movie extends BaseActivity {
  type: 'movie';
  releaseYear: string;
  posterPath: string | null;
  tmdbId: number;
}

export interface Book extends BaseActivity {
  type: 'book';
  author: string;
  isbn: string;
}

export interface Event extends BaseActivity {
  type: 'event';
  venue: string;
}

export type Activity = Movie | Book | Event;

export interface TmdbMovieSearchResult {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
}
