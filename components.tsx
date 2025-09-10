
import React, { useState, useEffect, useCallback } from 'react';
import type { Movie, Book, Event, ActivityType, TmdbMovieSearchResult } from './types';
import { tmdbService } from './services';
import { TMDB_IMAGE_BASE_URL } from './constants';

// --- Custom Hook ---
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};


// --- UI Components ---

export const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin border-top-color-transparent"></div>
    </div>
);

interface HeaderProps {
    currentView: ActivityType;
    onNavigate: (view: ActivityType) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
    const navItems: { key: ActivityType; label: string }[] = [
        { key: 'movie', label: 'Movies' },
        { key: 'book', label: 'Books' },
        { key: 'event', label: 'Events' },
    ];
    return (
        <header className="bg-gray-800 shadow-lg sticky top-0 z-20">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white tracking-wider">CulturaLog</h1>
                <ul className="flex space-x-4">
                    {navItems.map(item => (
                        <li key={item.key}>
                            <button
                                onClick={() => onNavigate(item.key)}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                    currentView === item.key
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 relative animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

interface StarRatingProps {
    rating: number;
    setRating?: (rating: number) => void;
    readOnly?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, setRating, readOnly = false }) => {
    const [hover, setHover] = useState(0);
    const stars = Array.from({ length: 5 }, (_, i) => i + 1);

    return (
        <div className="flex items-center">
            {stars.map((starIndex) => (
                <svg
                    key={starIndex}
                    className={`w-6 h-6 cursor-${readOnly ? 'default' : 'pointer'} transition-colors duration-150`}
                    fill={starIndex <= (hover || rating) ? '#FBBF24' : '#6B7280'}
                    viewBox="0 0 24 24"
                    onClick={() => !readOnly && setRating && setRating(starIndex)}
                    onMouseEnter={() => !readOnly && setHover(starIndex)}
                    onMouseLeave={() => !readOnly && setHover(0)}
                >
                    <path d="M12 .587l3.668 7.568L24 9.423l-6 5.845L19.335 24 12 19.563 4.665 24 6 15.268l-6-5.845 7.332-1.268z" />
                </svg>
            ))}
        </div>
    );
};


// --- Card Components ---

interface CardProps<T> {
    item: T;
    onEdit: (item: T) => void;
    onDelete: (id: string) => void;
}

export const MovieCard: React.FC<CardProps<Movie>> = ({ item, onEdit, onDelete }) => (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
        <div className="relative h-64">
            <img 
                src={item.posterPath ? `${TMDB_IMAGE_BASE_URL}${item.posterPath}` : 'https://picsum.photos/500/750'} 
                alt={item.title}
                className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded">{item.releaseYear}</div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
            <div className="flex items-center mb-3">
                <StarRating rating={item.rating} readOnly />
                <span className="text-sm text-gray-400 ml-2">{new Date(item.date).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-300 text-sm mb-4 flex-grow">{item.review.substring(0, 100)}{item.review.length > 100 && '...'}</p>
            <div className="mt-auto flex justify-end space-x-2">
                <button onClick={() => onEdit(item)} className="text-sm bg-gray-600 hover:bg-gray-500 text-white py-1 px-3 rounded transition-colors">Edit</button>
                <button onClick={() => onDelete(item.id)} className="text-sm bg-red-600 hover:bg-red-500 text-white py-1 px-3 rounded transition-colors">Delete</button>
            </div>
        </div>
    </div>
);

export const BookCard: React.FC<CardProps<Book>> = ({ item, onEdit, onDelete }) => (
     <div className="bg-gray-800 rounded-lg p-4 shadow-lg transform hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full">
        <h3 className="text-lg font-bold text-white">{item.title}</h3>
        <p className="text-sm text-gray-400 mb-2">{item.author}</p>
        <div className="flex items-center my-2">
            <StarRating rating={item.rating} readOnly />
             <span className="text-sm text-gray-400 ml-auto">{new Date(item.date).toLocaleDateString()}</span>
        </div>
        <p className="text-gray-300 text-sm mb-4 flex-grow">{item.review.substring(0, 150)}{item.review.length > 150 && '...'}</p>
        <p className="text-xs text-gray-500">ISBN: {item.isbn}</p>
        <div className="mt-auto pt-4 flex justify-end space-x-2">
            <button onClick={() => onEdit(item)} className="text-sm bg-gray-600 hover:bg-gray-500 text-white py-1 px-3 rounded transition-colors">Edit</button>
            <button onClick={() => onDelete(item.id)} className="text-sm bg-red-600 hover:bg-red-500 text-white py-1 px-3 rounded transition-colors">Delete</button>
        </div>
    </div>
);

export const EventCard: React.FC<CardProps<Event>> = ({ item, onEdit, onDelete }) => (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg transform hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full">
        <h3 className="text-lg font-bold text-white">{item.title}</h3>
        <p className="text-sm text-gray-400 mb-2">{item.venue}</p>
        <div className="flex items-center my-2">
            <StarRating rating={item.rating} readOnly />
            <span className="text-sm text-gray-400 ml-auto">{new Date(item.date).toLocaleDateString()}</span>
        </div>
        <p className="text-gray-300 text-sm mb-4 flex-grow">{item.review.substring(0, 150)}{item.review.length > 150 && '...'}</p>
        <div className="mt-auto pt-4 flex justify-end space-x-2">
            <button onClick={() => onEdit(item)} className="text-sm bg-gray-600 hover:bg-gray-500 text-white py-1 px-3 rounded transition-colors">Edit</button>
            <button onClick={() => onDelete(item.id)} className="text-sm bg-red-600 hover:bg-red-500 text-white py-1 px-3 rounded transition-colors">Delete</button>
        </div>
    </div>
);

// --- Form Components ---

const commonInputClasses = "w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500";
const commonLabelClasses = "block text-sm font-medium text-gray-300 mb-1";
const commonFormSectionClasses = "mb-4";

interface FormProps<T> {
    onSave: (item: T) => void;
    onClose: () => void;
    itemToEdit?: T | null;
}

export const MovieForm: React.FC<FormProps<Movie>> = ({ onSave, onClose, itemToEdit }) => {
    const [formData, setFormData] = useState<Omit<Movie, 'id' | 'type'>>(() => itemToEdit ? {...itemToEdit} : { title: '', releaseYear: '', posterPath: null, tmdbId: 0, review: '', rating: 0, date: new Date().toISOString().split('T')[0] });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<TmdbMovieSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    useEffect(() => {
        const search = async () => {
            if (debouncedSearchQuery) {
                setIsLoading(true);
                const results = await tmdbService.searchMovies(debouncedSearchQuery);
                setSearchResults(results);
                setIsLoading(false);
            } else {
                setSearchResults([]);
            }
        };
        search();
    }, [debouncedSearchQuery]);

    const handleSelectMovie = (movie: TmdbMovieSearchResult) => {
        setFormData(prev => ({ ...prev, title: movie.title, tmdbId: movie.id, posterPath: movie.poster_path, releaseYear: movie.release_date?.substring(0, 4) || '' }));
        setSearchQuery('');
        setSearchResults([]);
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData: Movie = {
            ...formData,
            id: itemToEdit?.id || crypto.randomUUID(),
            type: 'movie',
        };
        onSave(finalData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div className="relative">
                <label htmlFor="movieSearch" className={commonLabelClasses}>Search Movie (TMDB)</label>
                <input id="movieSearch" type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search for a movie title..." className={commonInputClasses} />
                 {isLoading && <div className="absolute right-2 top-8"><LoadingSpinner/></div>}
                {searchResults.length > 0 && (
                    <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-60 overflow-y-auto">
                        {searchResults.map(movie => (
                            <li key={movie.id} onClick={() => handleSelectMovie(movie)} className="p-2 hover:bg-blue-600 cursor-pointer text-white flex items-center space-x-3">
                                <img src={movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : 'https://picsum.photos/40/60'} alt="" className="w-10 h-15 object-cover rounded"/>
                                <span>{movie.title} ({movie.release_date?.substring(0, 4)})</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            <div className={commonFormSectionClasses}>
                <label htmlFor="title" className={commonLabelClasses}>Title</label>
                <input id="title" type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required className={commonInputClasses} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className={commonFormSectionClasses}>
                    <label htmlFor="date" className={commonLabelClasses}>Date Watched</label>
                    <input id="date" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required className={commonInputClasses} />
                </div>
                 <div className={commonFormSectionClasses}>
                    <label className={commonLabelClasses}>Rating</label>
                    <StarRating rating={formData.rating} setRating={rating => setFormData({ ...formData, rating })} />
                </div>
            </div>

            <div className={commonFormSectionClasses}>
                <label htmlFor="review" className={commonLabelClasses}>Review</label>
                <textarea id="review" value={formData.review} onChange={e => setFormData({ ...formData, review: e.target.value })} required rows={4} className={commonInputClasses}></textarea>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors">Save Movie</button>
            </div>
        </form>
    );
};

export const BookForm: React.FC<FormProps<Book>> = ({ onSave, onClose, itemToEdit }) => {
    const [formData, setFormData] = useState<Omit<Book, 'id' | 'type'>>(() => itemToEdit ? {...itemToEdit} : { title: '', author: '', isbn: '', review: '', rating: 0, date: new Date().toISOString().split('T')[0] });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData: Book = {
            ...formData,
            id: itemToEdit?.id || crypto.randomUUID(),
            type: 'book',
        };
        onSave(finalData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div className={commonFormSectionClasses}>
                <label htmlFor="title" className={commonLabelClasses}>Title</label>
                <input id="title" type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required className={commonInputClasses} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className={commonFormSectionClasses}>
                    <label htmlFor="author" className={commonLabelClasses}>Author</label>
                    <input id="author" type="text" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} required className={commonInputClasses} />
                </div>
                <div className={commonFormSectionClasses}>
                    <label htmlFor="isbn" className={commonLabelClasses}>ISBN</label>
                    <input id="isbn" type="text" value={formData.isbn} onChange={e => setFormData({ ...formData, isbn: e.target.value })} className={commonInputClasses} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className={commonFormSectionClasses}>
                    <label htmlFor="date" className={commonLabelClasses}>Date Read</label>
                    <input id="date" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required className={commonInputClasses} />
                </div>
                 <div className={commonFormSectionClasses}>
                    <label className={commonLabelClasses}>Rating</label>
                    <StarRating rating={formData.rating} setRating={rating => setFormData({ ...formData, rating })} />
                </div>
            </div>
            <div className={commonFormSectionClasses}>
                <label htmlFor="review" className={commonLabelClasses}>Review</label>
                <textarea id="review" value={formData.review} onChange={e => setFormData({ ...formData, review: e.target.value })} required rows={4} className={commonInputClasses}></textarea>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors">Save Book</button>
            </div>
        </form>
    );
};

export const EventForm: React.FC<FormProps<Event>> = ({ onSave, onClose, itemToEdit }) => {
    const [formData, setFormData] = useState<Omit<Event, 'id' | 'type'>>(() => itemToEdit ? {...itemToEdit} : { title: '', venue: '', review: '', rating: 0, date: new Date().toISOString().split('T')[0] });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData: Event = {
            ...formData,
            id: itemToEdit?.id || crypto.randomUUID(),
            type: 'event',
        };
        onSave(finalData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div className={commonFormSectionClasses}>
                <label htmlFor="title" className={commonLabelClasses}>Title</label>
                <input id="title" type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required className={commonInputClasses} />
            </div>
            <div className={commonFormSectionClasses}>
                <label htmlFor="venue" className={commonLabelClasses}>Venue / Location</label>
                <input id="venue" type="text" value={formData.venue} onChange={e => setFormData({ ...formData, venue: e.target.value })} required className={commonInputClasses} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className={commonFormSectionClasses}>
                    <label htmlFor="date" className={commonLabelClasses}>Date Attended</label>
                    <input id="date" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required className={commonInputClasses} />
                </div>
                 <div className={commonFormSectionClasses}>
                    <label className={commonLabelClasses}>Rating</label>
                    <StarRating rating={formData.rating} setRating={rating => setFormData({ ...formData, rating })} />
                </div>
            </div>
            <div className={commonFormSectionClasses}>
                <label htmlFor="review" className={commonLabelClasses}>Review</label>
                <textarea id="review" value={formData.review} onChange={e => setFormData({ ...formData, review: e.target.value })} required rows={4} className={commonInputClasses}></textarea>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors">Save Event</button>
            </div>
        </form>
    );
};
