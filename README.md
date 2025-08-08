
# PKM Magic Chrome Extension

Yeh extension Police Khidmat Markez (PKM) ki website pe data entry ka kaam bohat asaan aur tez bana deta hai. Sab kuch Roman Urdu mein samjhaya gaya hai taake aapko har cheez asaani se samajh aaye.

## Features

- **CNIC, OTP, Email fields auto-fill hoti hain** Constable, Moharar, aur Front Desk ke liye.
- **Har role ke liye CNIC number set kar sakte hain** (Constable, Moharar, Front Desk).
- **Manual button bhi hai form auto-fill karne ke liye**.
- **Auto-fill enable/disable kar sakte hain** settings se.
- **Note-taking bhi kar sakte hain** extension ke popup mein.

## Installation

### Development Mode

1. Repository download ya clone karen.
2. Chrome mein `chrome://extensions/` pe jayein.
3. "Developer mode" enable karen.
4. "Load unpacked" pe click karen aur yeh folder select karen.
5. Extension ka icon Chrome toolbar mein aa jayega.

### Chrome Web Store Se

*Jald aaraha hai*

## Istemaal Ka Tareeqa

### CNIC Auto-Fill Set Karna

1. Extension icon pe click karen, popup khulega.
2. "Settings" pe click karen (upar right corner mein).
3. Har role ke liye CNIC number daal dein (Constable, Moharar, Front Desk).
4. "Enable automatic form filling" ka checkbox check karen.
5. "Save Settings" pe click karen.

### PKM Website Pe Auto-Fill Ka Istemaal

- Jab aap Police Khidmat Markez ki website pe jate hain, extension khud CNIC fields fill kar dega.
- Agar fields khud fill nahi hoti, to "Auto-fill CNIC" button pe click karen (upar right corner pe).
- Auto-fill ko settings se disable bhi kar sakte hain.

### Note-Taking Features Ka Istemaal

- Extension icon pe click karen, popup khulega.
- Apna note likhein aur "Save Note" pe click karen.
- Tags add karne hain to "Save with Tags" pe click karen, comma se alag alag tags likhein.
- Recent notes popup mein dekh sakte hain.
- Search box se koi bhi note dhoond sakte hain.

## Development

### Project Structure

- `manifest.json`: Extension ki configuration.
- `popup.html`: Extension popup ka user interface.
- `popup.js`: Popup ki functionality ka JavaScript.
- `settings.html`: CNIC numbers set karne ki settings page.
- `settings.js`: Settings ki functionality ka JavaScript.
- `styles.css`: Popup aur settings pages ki styling.
- `background.js`: Background script jo events handle karta hai.
- `content.js`: Web pages pe chalne wala script jo auto-filling karta hai.
- `images/`: Extension icons ka folder.

### Building aur Testing

Is extension ko build karne ki zaroorat nahi. Test karne ke liye:

1. Code mein jo bhi changes karen.
2. `chrome://extensions/` pe jayein.
3. Extension dhoondein aur refresh icon pe click karen.
4. Apne changes test karen.

## License

MIT