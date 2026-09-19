### Language:</br>
<img src="https://etf2l.org/images/flags/UnitedKingdom.gif" height="13"> - [Read in English](README.md)</br>
<img src="https://etf2l.org/images/flags/Russia.gif" height="13"> - [Читать на русском языке](README.ru.md)

---

<div align="middle">
   <img width="128" height="auto" src="img/icon128.png" />
</div>

# WebMatch – Domain Checker

**WebMatch** is a lightweight and simple Chromium-based browser extension designed for anti-phishing protection and website authentication. The extension checks the current domain of the active tab against your personal list of trusted resources and instantly informs you of its security status.


## Screenshots
<div align="middle">
   <img width="626" height="auto" align="top" alt="Trusted Site" src="https://github.com/user-attachments/assets/71daf9ff-4f48-4117-b909-b204f9353712" /><br><br>
   <img width="300" height="auto" align="top" alt="Phishing Site" src="https://github.com/user-attachments/assets/092cbc65-5dcd-42a5-bd7c-bd7b900e2c10" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
   <img width="300" height="auto" align="top" alt="Adding Site to List" src="https://github.com/user-attachments/assets/6d3cde24-d554-4467-9141-2503ab3c724f" />
</div>


## Key Features

* **Instant Domain Check:** Automatically detects whether the open website is in your trusted list.
* **Phishing Warning:** Alerts the user if the current website is not on the whitelist or appears to be a spoof.
* **Convenient Site Addition:** Add the current website with a single click or enter domains manually.
* **Database Import & Export:** Save and load your trusted lists in `.json` format for data migration or backup.
* **Self-Contained:** The extension includes no pre-installed trusted websites.
* **Multilingual Support:** Automatically activates based on your application language.
* **Lightweight & Private:** Operates locally within your browser; no data is sent to external servers.


## Manual Extension Installation

1. Download the archive from GitHub.

   <img width="600" height="auto" alt="How to download the archive" src="https://github.com/user-attachments/assets/33f37226-3a1a-4a1c-95d2-36dbb8e9dc3d" />

2. Unzip the `WebMatch-main` folder anywhere on your computer.
3. In your Chromium-based browser, go to **Manage Extensions** (or open `chrome://extensions/`).
4. Enable **Developer mode** in the top-right corner.
5. Click **Load unpacked**.
6. Select the `WebMatch-main` folder.


## Extension Settings

### Adding a Website Address

**Automatically:**
1. Navigate to the desired page.
2. Click **Current**.
3. Specify a custom name for the website.
4. Click **Save**.

**Manually:**
1. Click **Manual**.
2. Specify a custom name for the website and the required address.
3. Click **Save**.

### Importing and Exporting Addresses

**Exporting your list of sites:**
1. Click **Download list**.
2. Select a location to save the file.

**Replacing the list with a new one** (*ATTENTION:* Loading will completely overwrite the existing list, rather than merging missing addresses!)
1. Click **Replace list**.
2. Select a file in `.json` format.


## License

This project is distributed under the **MIT** License. For details, see the [LICENSE](LICENSE) file.
