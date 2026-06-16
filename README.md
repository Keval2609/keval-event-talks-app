# BigQuery Release Notes App

A modern, dynamic web application built with Python Flask and vanilla JavaScript that fetches and displays the latest [BigQuery Release Notes](https://cloud.google.com/bigquery/docs/release-notes). 

## Features

- **Live Aggregation**: Automatically fetches the latest release notes directly from the official Google Cloud BigQuery XML (Atom) feed.
- **CORS Bypass**: Utilizes a Python Flask backend as a proxy to safely bypass browser CORS restrictions and parse the XML into clean JSON.
- **Modern UI/UX**: Features a premium dark-mode interface with glassmorphism effects, dynamic backgrounds, and loading states.
- **One-Click Social Sharing**: Includes a built-in "Share Update" button for every note to instantly tweet about specific BigQuery updates.

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
* Click the **Refresh Notes** button at the top to re-fetch the feed manually.
* Click **Share Update** at the bottom of any release note card to post a formatted snippet to X (Twitter).

## License
MIT License
