document.addEventListener("DOMContentLoaded", () => {
	initLocalization();
});

const links = document.querySelectorAll('.urlLink');
links.forEach(function(link) {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const url = this.getAttribute('data-url');
        
        if (url) {
            chrome.tabs.create({ url: url });
        }
    });
});

function initLocalization() {
	// Localization text in HTML
	document.querySelectorAll("[data-i18n]").forEach(element => {
		const messageKey = element.getAttribute("data-i18n");
		const translatedText = chrome.i18n.getMessage(messageKey);
    
		if (translatedText) {
			element.textContent = translatedText;
		}
	});
	
	// Localization button's title in HTML
	document.querySelectorAll("[data-i18n-title]").forEach(element => {
		const messageKey = element.getAttribute("data-i18n-title");
		const translatedText = chrome.i18n.getMessage(messageKey);
    
		if (translatedText) {
		element.setAttribute("title", translatedText);
		}
	});
	
	// Localization inputs's placeholder in HTML
	document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
		const messageKey = element.getAttribute("data-i18n-placeholder");
		const translatedText = chrome.i18n.getMessage(messageKey);
    
		if (translatedText) {
			element.setAttribute("placeholder", translatedText);
		}
	});
}

const DEFAULT_WHITELIST = {
};

function getLevenshteinDistance(a, b) {
	const strA = String(a || "").trim();
	const strB = String(b || "").trim();
	if (!strA || !strB) return 999;
  
	const lenA = strA.length;
	const lenB = strB.length;
  
	const matrix = Array(lenB + 1).fill(null).map(() => Array(lenA + 1).fill(0));
  
	for (let i = 0; i <= lenB; i++) matrix[i][0] = i;
	for (let j = 0; j <= lenA; j++) matrix[0][j] = j;
  
	for (let i = 1; i <= lenB; i++) {
		for (let j = 1; j <= lenA; j++) {
		if (strB.charAt(i - 1) === strA.charAt(j - 1)) {
			matrix[i][j] = matrix[i - 1][j - 1];
		}
		else {
			matrix[i][j] = Math.min(
			matrix[i - 1][j - 1] + 1,
			matrix[i][j - 1] + 1,
			matrix[i - 1][j] + 1
			);
		}
		}
	}
	return matrix[lenB][lenA];
}

function getMainDomain(hostname) {
	const parts = hostname.replace(/^www\./, "").split('.');
	if (parts.length > 2) {
		return parts.slice(-2).join('.');
	}
	return parts.join('.');
}

function getBrandName(domainString) {
	if (!domainString || !domainString.includes('.')) return domainString;
	return domainString.substring(0, domainString.lastIndexOf('.'));
}

function showNotification(text, isError = false) {
	const notif = document.getElementById('notification');
	notif.innerText = text;
	notif.className = isError ? 'notif-box notif-error' : 'notif-box notif-success';
	notif.style.display = 'block';
	setTimeout(() => { notif.style.display = 'none'; }, 3000);
}

let detectedMainDomain = "";


chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	
	const statusDiv = document.getElementById("status");
  
	if (!tabs || tabs.length === 0 || !tabs[0].url) {
		statusDiv.innerText = chrome.i18n.getMessage("domainError");
		return;
	}

	const currentTab = tabs[0]; 
	const urlString = currentTab.url;
  
	if (!urlString.startsWith('http')) {
		statusDiv.innerText = chrome.i18n.getMessage("pageType_system");
		return;
	}

	const url = new URL(urlString);
	const fullHostname = url.hostname.replace(/^www\./, "").toLowerCase();
	detectedMainDomain = getMainDomain(fullHostname); 

	chrome.storage.local.get({ whitelist: DEFAULT_WHITELIST }, function(data) {
		const whitelist = data.whitelist;

		if (whitelist[fullHostname] || whitelist[detectedMainDomain]) {
			const siteName = whitelist[fullHostname] || whitelist[detectedMainDomain];
			statusDiv.className = "status-box safe";
			statusDiv.innerText = chrome.i18n.getMessage("pageType_valid") + `\n${siteName} – ${detectedMainDomain}`;
			chrome.action.setIcon({ tabId: currentTab.id, path: "img/icon_green.png" });
			return;
		}

		let suspectTarget = null;
		let suspectDomain = null;
		const currentBrand = getBrandName(detectedMainDomain); 

		for (const cleanDomain of Object.keys(whitelist)) {
			const targetBrand = getBrandName(cleanDomain); 

			if (fullHostname.includes(targetBrand)) { 
				suspectTarget = whitelist[cleanDomain]; 
				suspectDomain = cleanDomain;
				break; 
			}
		  
			const distance = getLevenshteinDistance(targetBrand, currentBrand);
		  
			if (distance > 0 && distance <= 2) { 
				suspectTarget = whitelist[cleanDomain]; 
				suspectDomain = cleanDomain;
				break; 
			}
		}

		if (suspectTarget) {
			statusDiv.className = "status-box danger";
			statusDiv.innerText = chrome.i18n.getMessage("pageType_alarm") + `\n ${suspectTarget} – ${suspectDomain}`;
			chrome.action.setIcon({ tabId: currentTab.id, path: "img/icon_red.png" });
		}
		else {
			statusDiv.className = "status-box unknown";
			statusDiv.innerText = chrome.i18n.getMessage("pageType_unknown") + `\n${detectedMainDomain}`;
			chrome.action.setIcon({ tabId: currentTab.id, path: "img/icon_yellow.png" });
		}
	});
});


document.getElementById('addCurrentBtn').onclick = function() {
	if (!detectedMainDomain) return;
	document.getElementById('manualForm').style.display = 'none';
	const currentForm = document.getElementById('currentForm');
	document.getElementById('inputCurrentDomain').value = detectedMainDomain;
	currentForm.style.display = currentForm.style.display === 'flex' ? 'none' : 'flex';
};

document.getElementById('saveCurrentBtn').onclick = function() {
	const name = document.getElementById('inputCurrentName').value.trim();
	if (!name) { showNotification(chrome.i18n.getMessage("formAddCurrentDomain_error"), true); return; }

	chrome.storage.local.get({ whitelist: DEFAULT_WHITELIST }, function(data) {
		data.whitelist[detectedMainDomain] = name;
		chrome.storage.local.set({ whitelist: data.whitelist }, () => {
			showNotification(chrome.i18n.getMessage("formAddDomain_success"));
			setTimeout(() => { window.close(); }, 1000);
		});
	});
};

document.getElementById('toggleFormBtn').onclick = () => {
	document.getElementById('currentForm').style.display = 'none';
	const form = document.getElementById('manualForm');
	form.style.display = form.style.display === 'flex' ? 'none' : 'flex';
};

document.getElementById('saveManualBtn').onclick = () => {
	let domain = document.getElementById('inputManualDomain').value.trim().toLowerCase();
	const name = document.getElementById('inputManualName').value.trim();
  
	if (!domain || !name) { showNotification(chrome.i18n.getMessage("formAddManualDomain_error"), true); return; }
  
	domain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/');
	domain = getMainDomain(domain[0]); 

	chrome.storage.local.get({ whitelist: DEFAULT_WHITELIST }, function(data) {
		data.whitelist[domain] = name;
		chrome.storage.local.set({ whitelist: data.whitelist }, () => {
			showNotification(chrome.i18n.getMessage("formAddDomain_success"));
			setTimeout(() => { window.close(); }, 1000);
		});
	});
};

document.getElementById('exportBtn').onclick = () => {
	chrome.storage.local.get({ whitelist: DEFAULT_WHITELIST }, function(data) {
		const blob = new Blob([JSON.stringify(data.whitelist, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = "my_site_list.json";
		a.click();
	});
};

document.getElementById('importBtn').onclick = () => {
	document.getElementById('fileInput').click();
};

document.getElementById('fileInput').onchange = (e) => {
	const files = e.target.files;
	if (!files || files.length === 0) return;
  
	const reader = new FileReader();
	reader.onload = function(event) {
		try {
		const importedData = JSON.parse(event.target.result);
		if (typeof importedData === 'object' && importedData !== null) {
			chrome.storage.local.set({ whitelist: importedData }, () => {
			showNotification(chrome.i18n.getMessage("importSiteList_success"));
			setTimeout(() => { window.close(); }, 1000);
			});
		}
		else {
			showNotification(chrome.i18n.getMessage("importSiteList_errorFormat"), true);
		}
		}
		catch(err) { 
			showNotification(chrome.i18n.getMessage("importSiteList_errorJson"), true); 
		}
	};
	reader.readAsText(files[0]);
};
