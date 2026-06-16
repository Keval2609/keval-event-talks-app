document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refresh-btn');
    const exportBtn = document.getElementById('export-btn');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    const loader = document.getElementById('loader');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const notesContainer = document.getElementById('notes-container');

    let currentNotes = []; // Store fetched notes for CSV export

    // Theme Toggle Logic
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        if (document.body.classList.contains('light-theme')) {
            themeIcon.classList.remove('bx-sun');
            themeIcon.classList.add('bx-moon');
        } else {
            themeIcon.classList.remove('bx-moon');
            themeIcon.classList.add('bx-sun');
        }
    });

    // Export to CSV Logic
    exportBtn.addEventListener('click', () => {
        if (currentNotes.length === 0) return;

        // CSV Header
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Title,Link,Content\n";

        currentNotes.forEach(note => {
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
    });

    const fetchNotes = async () => {
        // UI Reset
        refreshBtn.classList.add('spinning');
        refreshBtn.disabled = true;
        exportBtn.disabled = true;
        loader.classList.remove('hidden');
        errorContainer.classList.add('hidden');
        notesContainer.classList.add('hidden');
        notesContainer.innerHTML = '';
        currentNotes = [];

        try {
            const response = await fetch('/api/notes');
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch release notes');
            }

            if (data.entries.length === 0) {
                throw new Error('No release notes found.');
            }

            currentNotes = data.entries;
            renderNotes(data.entries);
            exportBtn.disabled = false;
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
            content.innerHTML = entry.content;

            const actions = document.createElement('div');
            actions.className = 'note-actions';

            // Copy to Clipboard Button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = `<i class='bx bx-copy'></i> Copy text`;
            copyBtn.addEventListener('click', async () => {
                try {
                    const textToCopy = `BigQuery Update (${formatDate(entry.updated)}): ${entry.title}\n\n${stripHtml(entry.content).trim()}\n\nLink: ${entry.link}`;
                    await navigator.clipboard.writeText(textToCopy);
                    copyBtn.innerHTML = `<i class='bx bx-check'></i> Copied!`;
                    setTimeout(() => {
                        copyBtn.innerHTML = `<i class='bx bx-copy'></i> Copy text`;
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy', err);
                }
            });

            // Tweet Button
            const tweetBtn = document.createElement('a');
            tweetBtn.className = 'tweet-btn';
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
    };

    // Initial fetch
    fetchNotes();

    // Refresh button event
    refreshBtn.addEventListener('click', fetchNotes);
});
