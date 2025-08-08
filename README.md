# PKM Data Entry Assistant Chrome Extension

A Chrome extension for automating data entry tasks on the PKM (Punjab Police Knowledge Management) website.

## Features

- Auto-fill CNIC fields on the PKM website forms
- Configure CNIC numbers for different roles (Constable, Moharar, Front Desk)
- Manual trigger button for auto-filling forms
- Enable/disable auto-fill functionality
- Note-taking capabilities for general use

## Installation

### Development Mode

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension should now be installed and visible in your Chrome toolbar

### From Chrome Web Store

*Coming soon*

## Usage

### Setting Up CNIC Auto-Fill

1. Click the extension icon in the toolbar to open the popup
2. Click on "Settings" in the top-right corner
3. Enter the CNIC numbers for each role (Constable, Moharar, Front Desk)
4. Make sure the "Enable automatic form filling" checkbox is checked
5. Click "Save Settings"

### Using Auto-Fill on PKM Website

- When you visit the PKM website, the extension will automatically fill in the CNIC fields
- If the fields are not automatically filled, you can click the "Auto-fill CNIC" button in the top-right corner of the page
- You can disable auto-fill functionality in the extension settings if needed

### Using Note-Taking Features

- Click the extension icon to open the popup
- Type your note in the text area and click "Save Note"
- To add tags, click "Save with Tags" and enter comma-separated tags when prompted
- View recent notes in the popup
- Use the search box to find specific notes

## Development

### Project Structure

- `manifest.json`: Extension configuration
- `popup.html`: User interface for the extension popup
- `popup.js`: JavaScript for the popup functionality
- `settings.html`: Settings page for configuring CNIC numbers
- `settings.js`: JavaScript for the settings functionality
- `styles.css`: Styling for the popup and settings pages
- `background.js`: Background script for handling events
- `content.js`: Content script that runs on web pages and handles auto-filling
- `images/`: Directory containing extension icons

### Building and Testing

This extension doesn't require a build step. To test changes:

1. Make your modifications to the code
2. Go to `chrome://extensions/`
3. Find the extension and click the refresh icon
4. Test your changes

## License

MIT