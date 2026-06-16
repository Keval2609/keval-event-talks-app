document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refresh-btn');
    const loader = document.getElementById('loader');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const notesContainer = document.getElementById('notes-container');

    const fetchNotes = async () => {
        // UI Reset
        refreshBtn.classList.add('spinning');
        refreshBtn.disabled = true;
        loader.classList.remove('hidden');
        errorContainer.classList.add('hidden');
        notesContainer.classList.add('hidden');
        notesContainer.innerHTML = '';

        try {
            const response = await fetch('/api/notes');
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch release notes');
            }

            if (data.entries.length === 0) {
                throw new Error('No release notes found.');
            }

            renderNotes(data.entries);
        } catch (error) {
            errorMessage.textContent = error.message;
            errorContainer.classList.remove('hidden');
        } finally {
            loader.classList.add('hidden');
            refreshBtn.classList.remove('spinning');
            refreshBtn.disabled = false;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const stripHtml = (html) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    const renderNotes = (entries) => {
        entries.forEach(entry => {
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
            content.innerHTML = entry.content; // The feed has HTML content

            const actions = document.createElement('div');
            actions.className = 'note-actions';

            const tweetBtn = document.createElement('a');
            tweetBtn.className = 'tweet-btn';
            tweetBtn.target = '_blank';
            tweetBtn.rel = 'noopener noreferrer';
            
            // Generate Twitter Intent URL
            // Grab a short snippet of plain text from the content to tweet
            const plainContent = stripHtml(entry.content).trim();
            const tweetSnippet = plainContent.length > 150 ? plainContent.substring(0, 147) + '...' : plainContent;
            
            const tweetText = encodeURIComponent(`BigQuery Update: ${entry.title}\n\n${tweetSnippet}`);
            const tweetUrl = encodeURIComponent(entry.link);
            tweetBtn.href = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}&hashtags=BigQuery,GoogleCloud`;

            tweetBtn.innerHTML = `<i class='bx bxl-twitter'></i> Share Update`;

            actions.appendChild(tweetBtn);

            card.appendChild(header);
            card.appendChild(content);
            card.appendChild(actions);

            notesContainer.appendChild(card);
        });

        notesContainer.classList.remove('hidden');
    };

    // Initial fetch
    fetchNotes();

    // Refresh button event
    refreshBtn.addEventListener('click', fetchNotes);
});
