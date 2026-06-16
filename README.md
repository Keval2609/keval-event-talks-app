# BigQuery Release Notes App

A modern, dynamic web application built with Python Flask and vanilla JavaScript that fetches and displays the latest [BigQuery Release Notes](https://cloud.google.com/bigquery/docs/release-notes). 

## Features

- **Live Aggregation**: Automatically fetches the latest release notes directly from the official Google Cloud BigQuery XML (Atom) feed.
- **CORS Bypass**: Utilizes a Python Flask backend as a proxy to safely bypass browser CORS restrictions and parse the XML into clean JSON.
- **Modern UI/UX**: Features a premium interface with glassmorphism effects, dynamic backgrounds, and a **Light/Dark Mode toggle**. Includes a sticky header for easy navigation.
- **Search & Filter**: Real-time search bar to instantly filter release notes by title or content.
- **Pagination**: Implements a "Load More" system to prevent overwhelming walls of text, loading 10 notes at a time.
- **Export to CSV**: Easily download your currently filtered release notes into a formatted CSV file.
- **One-Click Actions**: Every note card includes a "Copy Text" button for clipboard copying and a "Share Update" button to instantly tweet about specific BigQuery updates.
- **Accessibility & Feedback**: Global toast notifications for system events (copying, exporting), friendly empty/error states with retry logic, and full screen reader/keyboard navigation support.

## Architecture

* **Backend**: Python 3.x, Flask (`app.py`)
* **Frontend**: Vanilla HTML5, CSS3 (`static/styles.css`), and JavaScript (`static/script.js`)

## Getting Started

### Prerequisites
* Python 3.8+ installed on your machine.
* `pip` (Python package manager).

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/Keval2609/keval-event-talks-app.git
   cd keval-event-talks-app
   ```

2. Install the required Python dependencies (Flask):
   ```bash
   pip install flask
   ```

3. Run the application:
   ```bash
   python app.py
   ```

4. Open your web browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```

## Usage

* Upon loading, the app will automatically fetch and display the latest release notes.
* Use the **Search Bar** below the header to filter notes by keyword.
* Toggle the **Sun/Moon icon** to switch between Light and Dark themes.
* Click **Export CSV** to download the currently visible notes.
* Use the **Copy text** or **Share Update** buttons on individual cards for quick sharing.
* Scroll down and use the **Load More** button to view older notes, and the **Back to Top** floating button to instantly return to the header.

## License
MIT License
