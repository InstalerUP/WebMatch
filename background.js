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
      } else {
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

const DEFAULT_WHITELIST = {
};

function checkTabAndSetIcon(tabId, urlString) {
  if (!urlString || !urlString.startsWith('http')) {
    chrome.action.setIcon({ tabId: tabId, path: "img/icon_white.png" });
    return;
  }

  chrome.storage.local.get({ whitelist: DEFAULT_WHITELIST }, function(data) {
    const whitelist = data.whitelist;
    try {
      const url = new URL(urlString);
      const fullHostname = url.hostname.replace(/^www\./, "").toLowerCase();
      const mainDomain = getMainDomain(fullHostname);

      if (whitelist[fullHostname] || whitelist[mainDomain]) {
        chrome.action.setIcon({ tabId: tabId, path: "img/icon_green.png" });
        return;
      }

      let isPhishing = false;
      const currentBrand = getBrandName(mainDomain); 

      for (const cleanDomain of Object.keys(whitelist)) {
        const targetBrand = getBrandName(cleanDomain); 

        if (fullHostname.includes(targetBrand)) { 
          isPhishing = true; 
          break; 
        }
        
        const distance = getLevenshteinDistance(targetBrand, currentBrand);
        if (distance > 0 && distance <= 2) { 
          isPhishing = true; 
          break; 
        }
      }

      if (isPhishing) {
        chrome.action.setIcon({ tabId: tabId, path: "img/icon_red.png" });
      } else {
        chrome.action.setIcon({ tabId: tabId, path: "img/icon_yellow.png" });
      }
    } catch (e) {
      chrome.action.setIcon({ tabId: tabId, path: "img/icon_yellow.png" });
    }
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    checkTabAndSetIcon(tabId, changeInfo.url);
  } else if (tab.url) {
    checkTabAndSetIcon(tabId, tab.url);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url) checkTabAndSetIcon(activeInfo.tabId, tab.url);
  });
});
