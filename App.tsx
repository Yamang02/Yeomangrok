
import React, { useState, useEffect, useMemo } from 'react';
import { storageService } from './services';
import type { Activity, ActivityType, Movie, Book, Event } from './types';
import { Header, Modal, MovieCard, BookCard, EventCard, MovieForm, BookForm, EventForm } from './components';

const App: React.FC = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [currentView, setCurrentView] = useState<ActivityType>('movie');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Activity | null>(null);

    useEffect(() => {
        setMovies(storageService.getMovies());
        setBooks(storageService.getBooks());
        setEvents(storageService.getEvents());
    }, []);

    const handleOpenModal = (itemToEdit?: Activity) => {
        setEditingItem(itemToEdit || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSaveMovie = (movie: Movie) => {
        const newMovies = editingItem
            ? movies.map(m => m.id === movie.id ? movie : m)
            : [...movies, movie];
        setMovies(newMovies);
        storageService.saveMovies(newMovies);
        handleCloseModal();
    };
    
    const handleSaveBook = (book: Book) => {
        const newBooks = editingItem
            ? books.map(b => b.id === book.id ? book : b)
            : [...books, book];
        setBooks(newBooks);
        storageService.saveBooks(newBooks);
        handleCloseModal();
    };

    const handleSaveEvent = (event: Event) => {
        const newEvents = editingItem
            ? events.map(e => e.id === event.id ? event : e)
            : [...events, event];
        setEvents(newEvents);
        storageService.saveEvents(newEvents);
        handleCloseModal();
    };

    const handleDelete = (id: string, type: ActivityType) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            switch (type) {
                case 'movie':
                    const updatedMovies = movies.filter(m => m.id !== id);
                    setMovies(updatedMovies);
                    storageService.saveMovies(updatedMovies);
                    break;
                case 'book':
                    const updatedBooks = books.filter(b => b.id !== id);
                    setBooks(updatedBooks);
                    storageService.saveBooks(updatedBooks);
                    break;
                case 'event':
                    const updatedEvents = events.filter(e => e.id !== id);
                    setEvents(updatedEvents);
                    storageService.saveEvents(updatedEvents);
                    break;
            }
        }
    };
    
    const getModalContent = () => {
        const itemToEdit = editingItem;
        const view = itemToEdit?.type || currentView;
        
        switch(view) {
            case 'movie':
                return {
                    title: itemToEdit ? 'Edit Movie Log' : 'Log New Movie',
                    form: <MovieForm onSave={handleSaveMovie} onClose={handleCloseModal} itemToEdit={itemToEdit as Movie} />
                };
            case 'book':
                return {
                    title: itemToEdit ? 'Edit Book Log' : 'Log New Book',
                    form: <BookForm onSave={handleSaveBook} onClose={handleCloseModal} itemToEdit={itemToEdit as Book} />
                };
            case 'event':
                return {
                    title: itemToEdit ? 'Edit Event Log' : 'Log New Event',
                    form: <EventForm onSave={handleSaveEvent} onClose={handleCloseModal} itemToEdit={itemToEdit as Event} />
                };
            default:
                return { title: '', form: null };
        }
    };

    const {title: modalTitle, form: modalForm } = getModalContent();

    const sortedItems = useMemo(() => {
        const sortFn = (a: Activity, b: Activity) => new Date(b.date).getTime() - new Date(a.date).getTime();
        switch(currentView) {
            case 'movie': return [...movies].sort(sortFn);
            case 'book': return [...books].sort(sortFn);
            case 'event': return [...events].sort(sortFn);
            default: return [];
        }
    }, [currentView, movies, books, events]);


    const renderContent = () => {
        if (sortedItems.length === 0) {
            return (
                <div className="text-center py-20">
                    <h2 className="text-2xl text-gray-400">No {currentView}s logged yet.</h2>
                    <p className="text-gray-500 mt-2">Click the button above to add your first one!</p>
                </div>
            );
        }

        const gridClasses = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";

        switch (currentView) {
            case 'movie':
                return (
                    <div className={gridClasses}>
                        {(sortedItems as Movie[]).map(item => <MovieCard key={item.id} item={item} onEdit={() => handleOpenModal(item)} onDelete={(id) => handleDelete(id, 'movie')} />)}
                    </div>
                );
            case 'book':
                return (
                    <div className={gridClasses}>
                        {(sortedItems as Book[]).map(item => <BookCard key={item.id} item={item} onEdit={() => handleOpenModal(item)} onDelete={(id) => handleDelete(id, 'book')} />)}
                    </div>
                );
            case 'event':
                return (
                    <div className={gridClasses}>
                        {(sortedItems as Event[]).map(item => <EventCard key={item.id} item={item} onEdit={() => handleOpenModal(item)} onDelete={(id) => handleDelete(id, 'event')} />)}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <Header currentView={currentView} onNavigate={setCurrentView} />
            <main className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold capitalize">{currentView}s</h2>
                    <button 
                        onClick={() => handleOpenModal()} 
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
                    >
                        + Add New {currentView}
                    </button>
                </div>
                {renderContent()}
            </main>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={modalTitle}>
                {modalForm}
            </Modal>
        </div>
    );
};

export default App;
