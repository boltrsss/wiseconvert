// lib/toolsConfig.ts

export type Lang = "en" | "zh";

export type ToolCategory = "image" | "video" | "audio" | "document" | "archive" | "other";

export interface ToolDefinition {
  slug: string;
  category: ToolCategory;
  inputFormats: string[];
  outputFormats: string[];
  title: { en: string; zh: string };
  shortDescription: { en: string; zh: string };
  seoTitle: { en: string; zh: string };
  seoDescription: { en: string; zh: string };
}

export const TOOLS: ToolDefinition[] = [
  // ===== Image converters =====
  {
    slug: "jpg-to-png",
    category: "image",
    inputFormats: ["jpg", "jpeg"],
    outputFormats: ["png"],
    title: {
      en: "JPG to PNG Converter",
      zh: "JPG 轉 PNG 線上轉檔工具"
    },
    shortDescription: {
      en: "Convert JPG/JPEG images to high-quality PNG in your browser.",
      zh: "將 JPG/JPEG 圖片一鍵轉成高品質 PNG，免安裝、免註冊。"
    },
    // 新增：給 tools/[slug] page 用的長說明 & SEO
    seoTitle: {
      en: "JPG to PNG Converter – Free Online Image Converter | WiseConvert",
      zh: "JPG 轉 PNG 線上免費轉檔工具｜WiseConvert"
    },
    seoDescription: {
      en: "Free online JPG to PNG converter. Keep image quality, remove background transparently, and convert multiple JPG/JPEG files to PNG in your browser.",
      zh: "免費線上 JPG 轉 PNG 工具，保留畫質、支援透明背景，多張 JPG/JPEG 圖片一次轉成 PNG，全部在瀏覽器完成。"
    },
    longDescription: {
      en: [
        "WiseConvert’s JPG to PNG converter lets you quickly turn JPG/JPEG images into high-quality PNG files directly in your browser.",
        "No software installation, no registration. Upload your images, choose PNG as output, and download your converted files in seconds."
      ],
      zh: [
        "WiseConvert 的 JPG 轉 PNG 工具，讓你在瀏覽器中快速把 JPG/JPEG 圖片轉成高品質 PNG 檔。",
        "不需安裝軟體、不用註冊帳號，上傳圖片、選擇 PNG 輸出格式，幾秒鐘內就能下載完成的檔案。"
      ]
    },
    useCases: {
      en: [
        "Keep transparent background for logos and icons.",
        "Prepare images for web design or UI assets.",
        "Reduce JPG artifacts by exporting to PNG.",
        "Convert screenshots to lossless PNG for better readability."
      ],
      zh: [
        "將 Logo、Icon 轉成 PNG，保留透明背景。",
        "為網頁設計或介面素材準備 PNG 圖片。",
        "把壓縮感較重的 JPG 轉成 PNG，減少壓縮雜訊。",
        "把螢幕截圖轉成無損 PNG，讓文字更清晰易讀。"
      ]
    },
    faq: {
      en: [
        {
          q: "Will converting JPG to PNG improve image quality?",
          a: "PNG will not magically add details, but it preserves existing quality better and avoids additional compression artifacts compared to JPG."
        },
        {
          q: "Is there a file size limit?",
          a: "In the free plan, each file can be up to 1GB. Larger limits may be available in the Pro plan in the future."
        },
        {
          q: "Are my images stored on your servers?",
          a: "Files are processed in the cloud, then automatically deleted after a short period as part of our privacy-first design."
        }
      ],
      zh: [
        {
          q: "JPG 轉成 PNG 會變比較清楚嗎？",
          a: "PNG 不會神奇變高清，但會避免再次壓縮造成的失真，對有文字或排版的圖片會比較乾淨。"
        },
        {
          q: "檔案有大小限制嗎？",
          a: "目前免費方案單檔上限為 1GB，未來 Pro 方案會提供更高上限。"
        },
        {
          q: "你們會長期保存我的圖片嗎？",
          a: "檔案只會在雲端暫存處理，完成後會在短時間內自動刪除，設計上以隱私優先。"
        }
      ]
    }
  },
  {
    slug: "png-to-jpg",
    category: "image",
    inputFormats: ["png"],
    outputFormats: ["jpg", "jpeg"],
    title: {
      en: "PNG to JPG Converter",
      zh: "PNG 轉 JPG 線上工具",
    },
    shortDescription: {
      en: "Turn PNG images into compressed JPG files.",
      zh: "將 PNG 轉成容量較小的 JPG 圖片。",
    },
    seoTitle: {
      en: "PNG to JPG – Free Online Converter | WiseConvert",
      zh: "PNG 轉 JPG 線上免費工具 | WiseConvert",
    },
    seoDescription: {
      en: "Free online PNG to JPG converter. Reduce file size while keeping good image quality.",
      zh: "免費 PNG 轉 JPG 工具，輕鬆減少檔案大小，同時保留畫質。",
    },
  },
  {
    slug: "heic-to-jpg",
    category: "image",
    inputFormats: ["heic"],
    outputFormats: ["jpg"],
    title: {
      en: "HEIC to JPG Converter",
      zh: "HEIC 轉 JPG 線上工具",
    },
    shortDescription: {
      en: "Convert iPhone HEIC photos to standard JPG.",
      zh: "把 iPhone 拍攝的 HEIC 照片轉成通用 JPG。",
    },
    seoTitle: {
      en: "HEIC to JPG – Convert iPhone Photos | WiseConvert",
      zh: "HEIC 轉 JPG 線上免費工具 | WiseConvert",
    },
    seoDescription: {
      en: "Convert HEIC photos from iPhone to JPG so you can open them everywhere.",
      zh: "線上把 iPhone 的 HEIC 照片轉成 JPG，方便在各種裝置開啟。",
    },
  },
  {
    slug: "webp-to-png",
    category: "image",
    inputFormats: ["webp"],
    outputFormats: ["png"],
    title: {
      en: "WEBP to PNG Converter",
      zh: "WEBP 轉 PNG 線上工具",
    },
    shortDescription: {
      en: "Convert WEBP files back to PNG format.",
      zh: "將 WEBP 圖片還原成 PNG 格式。",
    },
    seoTitle: {
      en: "WEBP to PNG – Free Converter | WiseConvert",
      zh: "WEBP 轉 PNG 線上免費工具 | WiseConvert",
    },
    seoDescription: {
      en: "Free online WEBP to PNG converter for browsers and design tools that don’t support WEBP.",
      zh: "免費 WEBP 轉 PNG，適合不支援 WEBP 的瀏覽器或設計工具使用。",
    },
  },

  // ===== Document converters =====
  {
    slug: "pdf-to-jpg",
    category: "document",
    inputFormats: ["pdf"],
    outputFormats: ["jpg"],
    title: {
      en: "PDF to JPG Converter",
      zh: "PDF 轉 JPG 線上工具",
    },
    shortDescription: {
      en: "Turn each page of your PDF into a JPG image.",
      zh: "把 PDF 每一頁轉成 JPG 圖片。",
    },
    seoTitle: {
      en: "PDF to JPG – Free Online Converter | WiseConvert",
      zh: "PDF 轉 JPG 線上免費工具 | WiseConvert",
    },
    seoDescription: {
      en: "Convert PDF pages to JPG images for easier sharing and previews.",
      zh: "免費線上 PDF 轉 JPG，把文件頁面轉成圖片方便預覽與分享。",
    },
  },
  {
    slug: "jpg-to-pdf",
    category: "document",
    inputFormats: ["jpg", "jpeg", "png"],
    outputFormats: ["pdf"],
    title: {
      en: "JPG to PDF Converter",
      zh: "JPG 轉 PDF 線上工具",
    },
    shortDescription: {
      en: "Combine images into a single PDF file.",
      zh: "將多張圖片合併成一個 PDF 檔案。",
    },
    seoTitle: {
      en: "JPG to PDF – Merge Images to PDF | WiseConvert",
      zh: "JPG 轉 PDF 線上免費工具 | WiseConvert",
    },
    seoDescription: {
      en: "Easily convert JPG and PNG images into a single PDF document.",
      zh: "把 JPG、PNG 圖片一鍵轉成 PDF 文件，方便傳送與列印。",
    },
  },

  // ===== Video converters =====
  {
    slug: "mp4-to-mp3",
    category: "video",
    inputFormats: ["mp4", "mov", "m4v"],
    outputFormats: ["mp3"],
    title: {
      en: "MP4 to MP3 Converter",
      zh: "MP4 轉 MP3 線上工具",
    },
    shortDescription: {
      en: "Extract audio from MP4 video as MP3.",
      zh: "從 MP4 影片中擷取音訊並轉成 MP3。",
    },
    seoTitle: {
      en: "MP4 to MP3 – Extract Audio Online | WiseConvert",
      zh: "MP4 轉 MP3 線上免費工具 | WiseConvert",
    },
    seoDescription: {
      en: "Convert MP4 videos to MP3 audio files directly in your browser.",
      zh: "在瀏覽器中直接把 MP4 影片轉成 MP3 音訊檔，免安裝軟體。",
    },
  },
  {
    slug: "mov-to-mp4",
    category: "video",
    inputFormats: ["mov"],
    outputFormats: ["mp4"],
    title: {
      en: "MOV to MP4 Converter",
      zh: "MOV 轉 MP4 線上工具",
    },
    shortDescription: {
      en: "Make MOV videos compatible by converting to MP4.",
      zh: "將 MOV 影片轉成相容性更高的 MP4。",
    },
    seoTitle: {
      en: "MOV to MP4 – Free Online Converter | WiseConvert",
      zh: "MOV 轉 MP4 線上免費工具 | WiseConvert",
    },
    seoDescription: {
      en: "Convert MOV files to MP4 so they play smoothly on any device.",
      zh: "把 MOV 轉成 MP4，方便在各種裝置與平台播放。",
    },
  },
  {
    slug: "video-to-gif",
    category: "video",
    inputFormats: ["mp4", "mov", "webm"],
    outputFormats: ["gif"],
    title: {
      en: "Video to GIF Converter",
      zh: "影片轉 GIF 線上工具",
    },
    shortDescription: {
      en: "Turn short videos into animated GIFs.",
      zh: "把短影片轉成動態 GIF 圖。",
    },
    seoTitle: {
      en: "Video to GIF – Create GIFs Online | WiseConvert",
      zh: "影片轉 GIF 線上免費工具 | WiseConvert",
    },
    seoDescription: {
      en: "Convert MP4, MOV, or WEBM videos into GIF animations for memes and social media.",
      zh: "將 MP4、MOV、WEBM 影片轉成 GIF 動畫，適合製作梗圖與社群內容。",
    },
  },

  // ===== Audio converters =====
  {
    slug: "wav-to-mp3",
    category: "audio",
    inputFormats: ["wav"],
    outputFormats: ["mp3"],
    title: {
      en: "WAV to MP3 Converter",
      zh: "WAV 轉 MP3 線上工具",
    },
    shortDescription: {
      en: "Compress WAV audio into MP3 format.",
      zh: "將 WAV 音訊壓縮轉成 MP3 檔。",
    },
    seoTitle: {
      en: "WAV to MP3 – Free Online Converter | WiseConvert",
      zh: "WAV 轉 MP3 線上免費工具 | WiseConvert",
    },
    seoDescription: {
      en: "Convert large WAV files into smaller MP3 files while keeping good quality.",
      zh: "把容量較大的 WAV 檔轉成 MP3，節省空間又保留音質。",
    },
  },
  {
    slug: "m4a-to-mp3",
    category: "audio",
    inputFormats: ["m4a"],
    outputFormats: ["mp3"],
    title: {
      en: "M4A to MP3 Converter",
      zh: "M4A 轉 MP3 線上工具",
    },
    shortDescription: {
      en: "Convert iPhone / iTunes M4A files to MP3.",
      zh: "將 iPhone 或 iTunes 的 M4A 檔轉成 MP3。",
    },
    seoTitle: {
      en: "M4A to MP3 – Free Converter | WiseConvert",
      zh: "M4A 轉 MP3 線上免費工具 | WiseConvert",
    },
    seoDescription: {
      en: "Easily convert M4A audio to MP3 so it works on any device or player.",
      zh: "把 M4A 音訊轉成通用 MP3 格式，方便在各種播放器上使用。",
    },
  },

  // ===== Archive / other =====
  {
    slug: "zip-to-extract",
    category: "archive",
    inputFormats: ["zip"],
    outputFormats: ["zip"],
    title: {
      en: "Extract ZIP Online",
      zh: "線上解壓 ZIP 檔",
    },
    shortDescription: {
      en: "Preview and extract ZIP contents in your browser.",
      zh: "在瀏覽器中預覽並解壓 ZIP 壓縮檔內容。",
    },
    seoTitle: {
      en: "Extract ZIP Files Online | WiseConvert",
      zh: "線上解壓縮 ZIP 檔案 | WiseConvert",
    },
    seoDescription: {
      en: "Open and extract ZIP archives directly from your browser, no software required.",
      zh: "免安裝解壓縮軟體，直接在線上開啟並解壓 ZIP 檔案。",
    },
  },
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
