# god

### 📁 **External JSON File System**

### 📱 **Responsive Design**

* **Mobile Friendly** : Works great on all screen sizes
* **Flexible Layout** : Adapts to different viewport widths
* **Touch Optimized** : Large buttons and touch targets for mobile users

### **File Management**

* **Upload JSON Files** : Simply click "Upload JSON File" to select and load external JSON files
* **Automatic Validation** : Files are validated on upload with clear success/error feedback
* **Structure Checking** : Ensures uploaded files have the correct startNode/nodes structure

### **Editor Enhancements**

* **Tab Support** : Press Tab key for proper indentation (adds 2 spaces)
* **Copy to Clipboard** : One-click copying of entire JSON content
* **Clear Editor** : Safety-confirmed clearing of all content
* **Live Statistics** : See exactly how many lines, characters, and nodes you have

### **Smart Tools**

* **Format & Clean** : Automatically formats messy JSON with proper indentation
* **Validate** : Check syntax and structure without downloading
* **Preview Changes** : Test your changes by temporarily loading them into the experience
* **Visual Status** : Color-coded status indicators throughout

### **Professional Workflow**

1. **Upload** your existing JSON file or **Load Current** to start with existing data
2. **Edit** in the enhanced editor with syntax highlighting and tab support
3. **Validate** to ensure everything is correct
4. **Format** to clean up the structure
5. **Preview** to test changes live
6. **Download** the updated JSON file

## 🎨 **Visual Improvements**

* **Icons** : Beautiful SVG icons for every action
* **Color Coding** : Green for success, red for errors, amber for warnings, blue for info
* **Status Messages** : Non-intrusive notifications that auto-hide
* **Professional Layout** : Clean grid system with proper spacing and typography
* **Dark Theme** : Consistent with the cosmic theme of the main experience

The config page is now a full-featured content management system that makes it easy for users to:

* Upload and manage their JSON content files
* Edit with confidence using validation and formatting tools
* Preview changes before committing
* Download updated files with a professional workflow
* **Removed Embedded Data** : No longer uses hardcoded JSON in the HTML
* **External File Loading** : Now fetches content from `data.json` using fetch API
* **Dynamic Loading** : Loads content asynchronously on application start
* **Error Handling** : Graceful fallback when `data.json` is missing or invalid

### ✨ **Beautiful Splash Screen**

* **Dramatic Opening** : "In the beginning there was nothing but..." text
* **Smooth Animation** : Text fades in with elegant transition effects
* **Cosmic Styling** : Ethereal glow effects and cosmic background
* **Mobile Responsive** : Adapts text size for different screen sizes
* **Auto-Hide** : Disappears after 4 seconds to reveal the universe

### 🔄 **Enhanced Loading Experience**

1. **Splash Screen** → Shows philosophical opening text
2. **Loading Screen** → Displays while fetching data.json
3. **3D Universe** → Begins after successful data load
4. **Error Screen** → Helpful messages if data.json fails to load

### 🛡️ **Robust Error Handling**

* **File Not Found** : Clear message when data.json is missing
* **Invalid JSON** : Helpful error when JSON structure is wrong
* **Network Issues** : Handles fetch failures gracefully
* **Recovery Options** : Retry button and link to config page

### 📋 **Setup Instructions for Users**

To use this application, users need to:

1. **Create data.json** : Place a JSON file in the same directory as the HTML
2. **Use Config Page** : Visit `#config` to create/edit the JSON structure
3. **Download & Replace** : Use the download feature to get properly formatted JSON

### 🎨 **Enhanced Config Page**

* **Updated Instructions** : Now explains the external file requirement
* **Default Data** : Shows example structure when no external file is loaded
* **File Management** : Upload, edit, validate, and download workflow

## 📄 **Required data.json Structure**

Users need to create a `data.json` file with this structure:

json

```json
{
"startNode":"node1",
"nodes":{
"node1":{
"question":"Your Question Here",
"answer":"Your answer content...",
"followUps":[
{
"prompt":"Next question prompt",
"nextNodeId":"node2"
}
]
}
}
}
```

## 🌟 **User Experience Flow**

1. **Splash** : "In the beginning there was nothing but..."
2. **Loading** : "Loading cosmic data..." while fetching JSON
3. **Universe** : 3D animation begins with loaded content
4. **Journey** : Interactive Q&A using external data
5. **Management** : Config page for JSON editing



## 🎬 **Rich Media Support**

### 📹 **Video Embeds**

* **YouTube Integration** : Automatic embedding with video ID extraction
* **Vimeo Support** : Professional video hosting integration
* **Direct Video Files** : Support for MP4, WebM, and other formats
* **Autoplay Options** : Configurable autoplay settings
* **Responsive Design** : 16:9 aspect ratio with full responsiveness

### 🔗 **Link Previews**

* **Rich Cards** : Beautiful preview cards with images and descriptions
* **Favicon Display** : Shows website icons for brand recognition
* **Domain Information** : Displays source domain
* **Hover Effects** : Interactive hover states with smooth transitions
* **External Link Safety** : Opens in new tabs with security attributes

### 🖼️ **Image Support**

* **Modal Viewing** : Click images to view in full-screen modal
* **Lazy Loading** : Performance-optimized image loading
* **Responsive Sizing** : Automatic scaling for different screens
* **Captions** : Support for titles and descriptions
* **Hover Effects** : Subtle zoom effects on hover

### 🎵 **Audio Embeds**

* **Multiple Formats** : MP3, WAV, OGG support
* **Custom Controls** : Styled audio players
* **Autoplay Options** : Configurable auto-start
* **Metadata Display** : Titles and descriptions

## 📋 **JSON Structure for Media**

Each node can now include a `media` array:

json

```json
{
"question":"Your question here",
"answer":"Your text content...",
"media":[
{
"type":"video",
"url":"https://www.youtube.com/watch?v=VIDEO_ID",
"title":"Video Title",
"description":"Video description",
"autoplay":false
},
{
"type":"link", 
"url":"https://example.com/article",
"title":"Article Title",
"description":"Article summary",
"image":"https://example.com/preview.jpg",
"domain":"example.com"
},
{
"type":"image",
"url":"https://example.com/image.jpg",
"title":"Image Title",
"description":"Image caption"
},
{
"type":"audio",
"url":"https://example.com/audio.mp3",
"title":"Audio Title",
"description":"Audio description",
"autoplay":false
}
],
"followUps":[...]
}
```

## 🎨 **Visual Design Features**

* **Seamless Integration** : Media appears after text content with elegant separation
* **Dark Theme Consistency** : All elements match the cosmic theme
* **Smooth Animations** : Hover effects and transitions throughout
* **Mobile Optimized** : Responsive design for all screen sizes
* **Interactive Elements** : Clickable previews and modal overlays

## 🔧 **Technical Features**

* **Platform Detection** : Automatic YouTube/Vimeo ID extraction
* **Error Handling** : Graceful fallbacks for unsupported formats
* **Performance** : Lazy loading and optimized rendering
* **Security** : Safe external link handling with proper attributes
* **Accessibility** : Proper alt texts and semantic HTML

## 📖 **Enhanced Config Page**

* **Media Documentation** : Complete guide for all supported media types
* **Example Structure** : Shows exactly how to structure media arrays
* **Type Reference** : Details for videos, links, images, and audio
* **Best Practices** : Guidelines for optimal media integration
