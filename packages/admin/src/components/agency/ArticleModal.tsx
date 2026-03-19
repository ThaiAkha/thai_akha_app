import React, { useState } from 'react';
import { Modal } from '../ui/modal';
import Badge from '../ui/badge/Badge';
import { Calendar, X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

interface Article {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    cover_image_url?: string;
    category?: string;
    created_at: string;
    author?: string;
    reading_time?: string;
}

interface ArticleModalProps {
    article: Article | null;
    isOpen: boolean;
    onClose: () => void;
    onPrev?: () => void;
    onNext?: () => void;
    hasPrev?: boolean;
    hasNext?: boolean;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ 
    article, 
    isOpen, 
    onClose,
    onPrev,
    onNext,
    hasPrev = false,
    hasNext = false
}) => {
    const [isPhotoMode, setIsPhotoMode] = useState(false);

    if (!article) return null;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const togglePhotoMode = () => {
        setIsPhotoMode(!isPhotoMode);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} className="max-w-7xl w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className={`flex flex-col md:flex-row h-[75vh] md:h-[75vh] transition-all duration-500 ease-in-out ${
                isPhotoMode ? 'photo-mode' : ''
            }`}>
                {/* Left: Full height square image */}
                <div className={`
                    relative h-full
                    transition-all duration-500 ease-in-out
                    ${isPhotoMode 
                        ? 'w-full md:w-3/5' 
                        : 'w-full md:w-2/5'
                    }
                `}>
                    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                        {article.cover_image_url ? (
                            <img 
                                src={article.cover_image_url} 
                                alt={article.title} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-white/20 font-black text-6xl uppercase tracking-widest transform -rotate-12">AKHA</span>
                            </div>
                        )}
                        
                        {/* Dark overlay for better text readability - hidden in photo mode */}
                        <div className={`
                            absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent
                            transition-opacity duration-500
                            ${isPhotoMode ? 'opacity-0' : 'opacity-100'}
                        `} />
                        
                        {/* Title overlay on image - hidden in photo mode */}
                        <div className={`
                            absolute bottom-0 left-0 right-0 p-8
                            transition-opacity duration-500
                            ${isPhotoMode ? 'opacity-0' : 'opacity-100'}
                        `}>
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white leading-tight">
                                {article.title}
                            </h2>
                        </div>

                        {/* Photo mode toggle button - top left */}
                        {article.cover_image_url && (
                            <button
                                onClick={togglePhotoMode}
                                aria-label={isPhotoMode ? "Exit photo view" : "Expand photo"}
                                className="absolute top-4 left-4 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-all duration-200 border border-white/20"
                            >
                                {isPhotoMode ? (
                                    <Minimize2 className="w-4 h-4 text-white" />
                                ) : (
                                    <Maximize2 className="w-4 h-4 text-white" />
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: Content */}
                <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 h-full overflow-hidden relative">
                    {/* Hero Quote - appears only in photo mode when excerpt exists */}
                    {isPhotoMode && article.excerpt && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center p-12 pointer-events-none">
                            <div className="max-w-2xl text-center animate-fade-in">
                                <div className="relative">
                                    {/* Large opening quote mark */}
                                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-8xl font-serif text-primary-500/20 dark:text-primary-400/20">
                                        "
                                    </div>
                                    
                                    {/* Quote text */}
                                    <p className="text-2xl md:text-3xl lg:text-4xl font-light italic text-gray-900 dark:text-white leading-relaxed">
                                        {article.excerpt}
                                    </p>
                                    
                                    {/* Decorative line */}
                                    <div className="w-24 h-0.5 bg-gradient-to-r from-primary-500/50 to-primary-600/50 mx-auto mt-6" />
                                    
                                    {/* Optional author or category */}
                                    {(article.author || article.category) && (
                                        <p className="mt-4 text-sm uppercase tracking-widest text-gray-600 dark:text-gray-400 font-semibold">
                                            {article.author || article.category}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content container with blur effect */}
                    <div className={`
                        flex-1 flex flex-col h-full
                        transition-all duration-500 ease-in-out
                        ${isPhotoMode 
                            ? 'md:opacity-20 md:blur-sm' 
                            : ''
                        }
                    `}>
                        {/* Top bar with date and close button */}
                        <div className="flex-none px-8 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                            <div className="flex items-center justify-between">
                                {/* Category badge on left */}
                                {article.category && (
                                    <Badge color="primary" variant="solid" className="px-5 py-2.5 text-xs uppercase font-black tracking-widest">
                                        {article.category}
                                    </Badge>
                                )}
                                
                                {/* Date and close button at same height */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                        <Calendar className="w-4 h-4 text-primary-500" />
                                        <span className="text-xs font-bold uppercase tracking-widest">{formatDate(article.created_at)}</span>
                                    </div>
                                    
                                    <button
                                        onClick={onClose}
                                        aria-label="Close article"
                                        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <X className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable content area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6 bg-white dark:bg-gray-900">
                            {/* Excerpt - hidden in photo mode since it appears as hero quote */}
                            {!isPhotoMode && article.excerpt && (
                                <>
                                    <p className="text-lg md:text-xl font-medium text-gray-900 dark:text-white leading-relaxed mb-6">
                                        {article.excerpt}
                                    </p>
                                    
                                    {/* Divider line */}
                                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent my-6" />
                                </>
                            )}
                            
                            {/* Content */}
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {article.content}
                                </p>
                            </div>
                        </div>

                        {/* Bottom right navigation buttons */}
                        {(hasPrev || hasNext) && (
                            <div className="flex-none px-8 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                                <div className="flex items-center justify-end gap-3">
                                    {hasPrev && (
                                        <button
                                            onClick={onPrev}
                                            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                                            aria-label="Previous article"
                                        >
                                            <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300 group-hover:-translate-x-0.5 transition-transform" />
                                            <span className="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">Prev</span>
                                        </button>
                                    )}
                                    {hasNext && (
                                        <button
                                            onClick={onNext}
                                            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                                            aria-label="Next article"
                                        >
                                            <span className="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">Next</span>
                                            <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300 group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Aggiungiamo anche degli stili CSS per gestire meglio la transizione */}
            <style>{`
                .photo-mode .prose,
                .photo-mode .custom-scrollbar {
                    transition: all 0.5s ease-in-out;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                
                @media (min-width: 768px) {
                    .photo-mode .custom-scrollbar {
                        opacity: 0.2;
                        filter: blur(4px);
                    }
                }
            `}</style>
        </Modal>
    );
};

export default ArticleModal;