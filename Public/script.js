/********************************
 * 1) FORM SUBMISSION LOGIC
 ********************************/
document.getElementById('convertForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const url = document.getElementById('url').value;
  const bitrate = document.getElementById('bitrate').value;
  const result = document.getElementById('result');
  
  result.textContent = "Processing...";

  try {
    const response = await fetch('/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, bitrate })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // data.filePath will be something like "/downloads/Amazing_Video_Title.mp3"
      result.innerHTML = `<a href="${data.filePath}" download>Download MP3</a>`;
    } else {
      result.textContent = data.message || "Conversion failed.";
    }
  } catch (error) {
    console.error(error);
    result.textContent = "Error occurred while processing.";
  }
});



/********************************
 * 2) TRANSLATION LOGIC
 ********************************/

// Example translations for various languages.
// Each key is the two-letter (or two-character) language code used in the <select>.
const translations = {
  en: {
    title: "YouTube to MP3",
    description: "Paste your YouTube link below and convert to MP3 instantly!",
    urlLabel: "YouTube Video URL",
    bitrateLabel: "Bitrate",
    convertButton: "Convert & Download"
  },
  zh: {
    title: "YouTube 转 MP3",
    description: "在下方粘贴您的 YouTube 链接，即可快速转换为 MP3！",
    urlLabel: "YouTube 视频网址",
    bitrateLabel: "比特率",
    convertButton: "转换并下载"
  },
  hi: {
    title: "YouTube से MP3",
    description: "अपना YouTube लिंक नीचे पेस्ट करें और तुरंत MP3 में बदलें!",
    urlLabel: "YouTube वीडियो URL",
    bitrateLabel: "बिटरेट",
    convertButton: "कन्वर्ट & डाउनलोड"
  },
  es: {
    title: "Convertidor de YouTube a MP3",
    description: "¡Pega tu enlace de YouTube abajo y convierte a MP3 al instante!",
    urlLabel: "URL del video de YouTube",
    bitrateLabel: "Tasa de bits",
    convertButton: "Convertir y Descargar"
  },
  fr: {
    title: "YouTube en MP3",
    description: "Collez votre lien YouTube ci-dessous et convertissez en MP3 instantanément!",
    urlLabel: "URL de la vidéo YouTube",
    bitrateLabel: "Débit",
    convertButton: "Convertir & Télécharger"
  },
  ar: {
    title: "تحويل يوتيوب إلى MP3",
    description: "الصق رابط اليوتيوب أدناه وحوله إلى MP3 على الفور!",
    urlLabel: "رابط فيديو اليوتيوب",
    bitrateLabel: "معدل البت",
    convertButton: "تحويل وتحميل"
  }
  // ...Add more languages as needed...
};

// Function to update text based on selected language
function setLanguage(langCode) {
  const lang = translations[langCode] || translations.en; // Fallback to English if not found

  document.getElementById("titleText").textContent = lang.title;
  document.getElementById("descriptionText").textContent = lang.description;
  document.getElementById("urlLabel").textContent = lang.urlLabel;
  document.getElementById("bitrateLabel").textContent = lang.bitrateLabel;
  document.getElementById("convertButton").textContent = lang.convertButton;
}

// Listen for language changes
document.getElementById("languageSelector").addEventListener("change", (e) => {
  setLanguage(e.target.value);
});



// Initialize the page with default language
setLanguage("en");


// 1) Detect changes in the URL field
const urlInput = document.getElementById('url');
urlInput.addEventListener('input', handleURLChange);

// 2) Function to parse the YouTube link and show the thumbnail
function handleURLChange() {
  const urlValue = urlInput.value.trim();
  const videoID = extractYouTubeID(urlValue);

  const thumbnail = document.getElementById('videoThumbnail');

  if (videoID) {
    // Build the thumbnail URL
    const thumbURL = `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`;
    thumbnail.src = thumbURL;
    thumbnail.style.display = 'block';
  } else {
    // Hide the thumbnail if the input is not a valid YT link
    thumbnail.src = '';
    thumbnail.style.display = 'none';
  }
}

/**
 * Extract the YouTube video ID from various types of URLs.
 * Returns null if not a valid YouTube link.
 */
function extractYouTubeID(url) {
  try {
    // Examples of patterns we want to handle:
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID
    // Optional: https://youtube.com/shorts/VIDEO_ID, etc.

    // 1. Try the "v" parameter approach: e.g. watch?v=VIDEO_ID
    const vParamMatch = url.match(/[?&]v=([^&#]+)/);
    if (vParamMatch && vParamMatch[1]) {
      return vParamMatch[1];
    }

    // 2. Try the shortened youtu.be links: e.g. youtu.be/VIDEO_ID
    const shortLinkMatch = url.match(/youtu\.be\/([^?]+)/);
    if (shortLinkMatch && shortLinkMatch[1]) {
      return shortLinkMatch[1];
    }

    // 3. Optional: If you want to handle youtube.com/shorts/VIDEO_ID
    const shortsMatch = url.match(/youtube\.com\/shorts\/([^?]+)/);
    if (shortsMatch && shortsMatch[1]) {
      return shortsMatch[1];
    }

    // If no pattern matched, return null
    return null;
  } catch (err) {
    return null;
  }
}
