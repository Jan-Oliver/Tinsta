# Email Sender Chrome Extension

A Chrome extension that allows you to quickly generate and send emails to creators and influencers directly through Gmail.

## Features

- Persistent side panel interface
- Template emails for both creators and influencers
- Personalization with recipient name
- Direct Gmail integration (no mailto: links)
- Saves last used name and email

## Installation

1. Download or clone this repository to your local machine
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click "Load unpacked" and select the directory containing the extension files
5. The extension should now appear in your Chrome toolbar

## Usage

1. Click the extension icon in your Chrome toolbar to open the side panel
2. Enter the recipient's name and email address
3. Click either "Notify Creator" or "Notify Influencer" depending on the email template you want to use
4. A new Gmail compose window will open with the pre-filled template
5. Review the email and click "Send" when ready

## File Structure

- `manifest.json` - Extension configuration
- `panel.html` - Side panel HTML structure
- `panel.css` - Side panel styling
- `panel.js` - Side panel functionality
- `background.js` - Background service worker
- `icons/` - Extension icons (you'll need to create these)

## Notes

- You must be logged into Gmail in your Chrome browser for this extension to work properly
- The extension requires the "sidePanel" and "tabs" permissions to function