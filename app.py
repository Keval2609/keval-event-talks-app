import urllib.request
import xml.etree.ElementTree as ET
from flask import Flask, jsonify, render_template

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/notes")
def get_notes():
    try:
        req = urllib.request.Request(FEED_URL, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            xml_data = response.read()
        
        # Parse XML (Atom feed)
        root = ET.fromstring(xml_data)
        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        
        entries = []
        for entry in root.findall('atom:entry', ns):
            title_elem = entry.find('atom:title', ns)
            link_elem = entry.find('atom:link', ns)
            updated_elem = entry.find('atom:updated', ns)
            content_elem = entry.find('atom:content', ns)
            
            entries.append({
                'title': title_elem.text if title_elem is not None else '',
                'link': link_elem.attrib['href'] if link_elem is not None else '',
                'updated': updated_elem.text if updated_elem is not None else '',
                'content': content_elem.text if content_elem is not None else ''
            })
            
        return jsonify({"success": True, "entries": entries})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
