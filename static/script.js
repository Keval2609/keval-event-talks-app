document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const refreshBtn = document.getElementById('refresh-btn');
    const exportBtn = document.getElementById('export-btn');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    const searchInput = document.getElementById('search-input');
    const loader = document.getElementById('loader');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const retryBtn = document.getElementById('retry-btn');
    const emptyContainer = document.getElementById('empty-container');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    
    const notesContainer = document.getElementById('notes-container');
    const loadMoreContainer = document.getElementById('load-more-container');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const backToTopBtn = document.getElementById('back-to-top');
    const toastContainer = document.getElementById('toast-container');

    // State
    let allNotes = [];
    let filteredNotes = [];
    let currentPage = 1;
    const notesPerPage = 10;

    // Toast Notification System
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconClass = type === 'success' ? 'bx-check-circle' : 'bx-error-circle';
        toast.innerHTML = `<i class='bx ${iconClass}'></i> <span>${message}</span>`;
        
        toastContainer.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 3000);
    };

    // Theme Toggle Logic
    themeToggleBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        themeIcon.className = isLight ? 'bx bx-moon' : 'bx bx-sun';
        showToast(isLight ? 'Switched to Light Mode' : 'Switched to Dark Mode');
    });

    // Fetch Notes Logic
    const fetchNotes = async () => {
        // UI Reset
        refreshBtn.classList.add('spinning');
        refreshBtn.disabled = true;
        exportBtn.disabled = true;
        
        loader.classList.remove('hidden');
        errorContainer.classList.add('hidden');
        emptyContainer.classList.add('hidden');
        notesContainer.classList.add('hidden');
        loadMoreContainer.classList.add('hidden');
        
        notesContainer.innerHTML = '';
        allNotes = [];
        filteredNotes = [];
        currentPage = 1;

        try {
            const response = await fetch('/api/notes');
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch release notes');
            }

            allNotes = data.entries;
            
            if (allNotes.length === 0) {
                emptyContainer.classList.remove('hidden');
                emptyContainer.querySelector('p').textContent = "No release notes available at this time.";
            } else {
                showToast('Release notes updated successfully!');
                applyFilters();
            }
        } catch (error) {
            errorMessage.textContent = error.message;
            errorContainer.classList.remove('hidden');
            showToast('Failed to sync updates', 'error');
        } finally {
            loader.classList.add('hidden');
            refreshBtn.classList.remove('spinning');
            refreshBtn.disabled = false;
        }
    };

    // Retry Button
    retryBtn.addEventListener('click', fetchNotes);

    // Format Date helper
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Strip HTML helper
    const stripHtml = (html) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    // Render logic (Pagination)
    const renderNotes = (append = false) => {
        if (!append) {
            notesContainer.innerHTML = '';
        }

        const startIndex = (currentPage - 1) * notesPerPage;
        const endIndex = startIndex + notesPerPage;
        const notesToRender = filteredNotes.slice(startIndex, endIndex);

        notesToRender.forEach(entry => {
            const card = document.createElement('article');
            card.className = 'note-card';

            const header = document.createElement('div');
            header.className = 'note-header';
            
            const title = document.createElement('h2');
            title.className = 'note-title';
            title.textContent = entry.title || 'Update';

            const date = document.createElement('div');
            date.className = 'note-date';
            date.textContent = formatDate(entry.updated);

            header.appendChild(title);
            header.appendChild(date);

            const content = document.createElement('div');
            content.className = 'note-content';
            content.innerHTML = entry.content;

            const actions = document.createElement('div');
            actions.className = 'note-actions';

            // Copy Button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.setAttribute('aria-label', 'Copy note text');
            copyBtn.innerHTML = `<i class='bx bx-copy'></i> <span>Copy text</span>`;
            
            copyBtn.addEventListener('click', async () => {
                try {
                    const textToCopy = `BigQuery Update (${formatDate(entry.updated)}): ${entry.title}\n\n${stripHtml(entry.content).trim()}\n\nLink: ${entry.link}`;
                    await navigator.clipboard.writeText(textToCopy);
                    
                    const iconSpan = copyBtn.querySelector('i');
                    const textSpan = copyBtn.querySelector('span');
                    
                    iconSpan.className = 'bx bx-check';
                    textSpan.textContent = 'Copied!';
                    showToast('Copied to clipboard');
                    
                    setTimeout(() => {
                        iconSpan.className = 'bx bx-copy';
                        textSpan.textContent = 'Copy text';
                    }, 2000);
                } catch (err) {
                    showToast('Failed to copy', 'error');
                }
            });

            // Tweet Button
            const tweetBtn = document.createElement('a');
            tweetBtn.className = 'tweet-btn';
            tweetBtn.setAttribute('aria-label', 'Share on X');
            tweetBtn.target = '_blank';
            tweetBtn.rel = 'noopener noreferrer';
            
            const plainContent = stripHtml(entry.content).trim();
            const tweetSnippet = plainContent.length > 150 ? plainContent.substring(0, 147) + '...' : plainContent;
            const tweetText = encodeURIComponent(`BigQuery Update: ${entry.title}\n\n${tweetSnippet}`);
            const tweetUrl = encodeURIComponent(entry.link);
            
            tweetBtn.href = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}&hashtags=BigQuery,GoogleCloud`;
            tweetBtn.innerHTML = `<i class='bx bxl-twitter'></i> Share Update`;

            actions.appendChild(copyBtn);
            actions.appendChild(tweetBtn);

            card.appendChild(header);
            card.appendChild(content);
            card.appendChild(actions);

            notesContainer.appendChild(card);
        });

        notesContainer.classList.remove('hidden');

        // Handle Load More Button visibility
        if (endIndex < filteredNotes.length) {
            loadMoreContainer.classList.remove('hidden');
        } else {
            loadMoreContainer.classList.add('hidden');
        }
    };

    // Search and Filter Logic
    const applyFilters = () => {
        const query = searchInput.value.toLowerCase().trim();
        
        if (!query) {
            filteredNotes = [...allNotes];
        } else {
            filteredNotes = allNotes.filter(note => {
                const text = (note.title + " " + stripHtml(note.content)).toLowerCase();
                return text.includes(query);
            });
        }

        currentPage = 1;
        
        if (filteredNotes.length === 0) {
            notesContainer.classList.add('hidden');
            loadMoreContainer.classList.add('hidden');
            emptyContainer.classList.remove('hidden');
            exportBtn.disabled = true;
        } else {
            emptyContainer.classList.add('hidden');
            exportBtn.disabled = false;
            renderNotes(false);
        }
    };

    searchInput.addEventListener('input', applyFilters);
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        applyFilters();
    });

    // Load More Logic
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        renderNotes(true); // append new nodes
    });

    // Back to Top Logic
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.remove('hidden');
        } else {
            backToTopBtn.classList.add('hidden');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Export to CSV Logic
    exportBtn.addEventListener('click', () => {
        if (filteredNotes.length === 0) return;

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Title,Link,Content\n";

        filteredNotes.forEach(note => {
            const date = new Date(note.updated).toLocaleDateString();
            const title = `"${(note.title || '').replace(/"/g, '""')}"`;
            const link = `"${(note.link || '').replace(/"/g, '""')}"`;
            const plainContent = `"${stripHtml(note.content).replace(/"/g, '""').replace(/\n/g, ' ')}"`;
            
            csvContent += `${date},${title},${link},${plainContent}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "bigquery_release_notes.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Exported CSV successfully!');
    });

    // Initial fetch
    fetchNotes();
    refreshBtn.addEventListener('click', fetchNotes);
});
