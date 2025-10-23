# USOD Paper Diagrams Guide

This guide explains the diagram collections created for both the technical conference paper and the journal paper.

---

## 📁 **What Was Created**

### **Technical Paper Diagrams**
📄 **Location**: `papers/technical/figures/diagram.html`
📊 **Status**: ✅ **Complete** - 10 comprehensive diagrams
🎯 **Purpose**: Conference paper (8-12 pages, IEEE format)

### **Journal Paper Diagrams**
📄 **Location**: `papers/journal/figures/diagram.html`
📊 **Status**: ⚙️ **Template Started** - 2 diagrams complete, 13+ to add
🎯 **Purpose**: Journal paper (15-30+ pages, IEEE Transactions format)

---

## 🎨 **Technical Paper Diagrams (10 Complete)**

### **What's Included**:

1. ✅ **System Architecture** - Multi-tier design with all components
2. ✅ **Multi-Platform Architecture** - Unified backend across Web/Desktop/Mobile
3. ✅ **Security Detection Pipeline** - Request flow through detection system
4. ✅ **AI Detection Architecture** - ML models and integration
5. ✅ **Blockchain Integration Flow** - Hyperledger Fabric workflow
6. ✅ **Cloud Deployment Architecture** - Terraform/Ansible automation
7. ✅ **Performance Comparison Chart** - USOD vs competitors (bar charts)
8. ✅ **Detection Accuracy by Attack Type** - 12 attack types analysis
9. ✅ **Real-Time Event Flow (SSE)** - Sub-100ms latency breakdown ⭐ **NEW**
10. ✅ **ML Training Pipeline** - Complete training workflow ⭐ **NEW**

### **Enhancements Made**:
- Added 2 new diagrams (#9 and #10)
- Updated summary section
- Added export instructions
- Comprehensive usage guide

---

## 📚 **Journal Paper Diagrams (Template Started)**

### **Completed (2/15)**:

1. ✅ **Extended System Architecture** - Complete 4-layer architecture with all services
2. ✅ **MongoDB Schema & Data Flow** - 30 event types, 7 indexes, retention strategy

### **To Be Added (13+ diagrams)**:

These should be adapted from the technical paper and expanded with more detail:

3. ⏳ **Real-Time Infrastructure (SSE/EventBus/Webhooks)**
4. ⏳ **Security Detection Pipeline (Detailed)**
5. ⏳ **ML Training & Inference Pipeline**
6. ⏳ **Blockchain Architecture (Hyperledger Fabric detailed)**
7. ⏳ **Cloud Automation Flow (Terraform + Ansible)**
8. ⏳ **UI/UX Design Mockups** (Web/Desktop/Mobile)
9. ⏳ **Performance Benchmarks** (Multiple charts)
10. ⏳ **Scalability Analysis** (Users vs. performance)
11. ⏳ **Security Analysis** (Attack surface, threat model)
12. ⏳ **Component Interaction Sequence** (Sequence diagram)
13. ⏳ **Deployment Architecture** (Complete production setup)
14. ⏳ **Evaluation Results** (Comparison tables)
15. ⏳ **User Study Results** (If conducted)

---

## 🚀 **How to Use These Diagrams**

### **Option 1: View in Browser** (Easiest)
1. Open `diagram.html` in Chrome or Firefox
2. Browse all diagrams with descriptions
3. Right-click on any diagram to save as image

### **Option 2: Export for Papers**

#### **Method A: Screenshot (Quick)**
```
1. Open diagram.html in browser
2. Zoom to desired size (Ctrl + or Cmd +)
3. Right-click diagram → "Save Image As..."
4. Save as PNG (for Word) or SVG (for LaTeX, if supported)
```

#### **Method B: Browser DevTools (High Quality)**
```
1. Open diagram.html in Chrome
2. Press F12 to open DevTools
3. Right-click the <svg> element
4. Select "Copy" → "Copy element"
5. Paste into text editor
6. Save as .svg file
7. Convert to PDF/PNG using Inkscape or online converter
```

#### **Method C: Copy to draw.io** (For Editing)
```
1. Open diagram.html in browser
2. Right-click diagram → "Inspect Element"
3. Copy the <svg>...</svg> code
4. Open draw.io (https://app.diagrams.net/)
5. File → Import from → SVG
6. Paste the SVG code
7. Edit and export as needed
```

### **Option 3: Recreate in draw.io** (Most Professional)
```
1. Use the diagram.html as a blueprint
2. Open draw.io
3. Recreate the diagram using draw.io tools
4. Benefits:
   - Fully editable
   - Professional quality
   - Easy to modify
   - Multiple export formats (PDF, PNG, SVG)
```

---

## 📋 **For LaTeX Integration**

### **In Your .tex File**:

```latex
\begin{figure}[h]
\centering
\includegraphics[width=\columnwidth]{figures/system-architecture.pdf}
\caption{USOD System Architecture showing multi-platform clients, 
         backend services, and data storage layers with real-time 
         event streaming capabilities.}
\label{fig:system-architecture}
\end{figure}
```

### **Reference in Text**:

```latex
As shown in Figure~\ref{fig:system-architecture}, the USOD 
architecture consists of four main layers...
```

### **Figure Naming Convention**:

Each diagram in the HTML has a label like `(fig:system-architecture)`. Use these labels for consistency:

```
diagram.html label          →  LaTeX figure file name
==================          ======================
fig:system-architecture     →  system-architecture.pdf
fig:multi-platform          →  multi-platform.pdf
fig:security-pipeline       →  security-pipeline.pdf
fig:ai-architecture         →  ai-architecture.pdf
fig:blockchain-flow         →  blockchain-flow.pdf
fig:cloud-deployment        →  cloud-deployment.pdf
fig:performance-comparison  →  performance-comparison.pdf
fig:detection-accuracy      →  detection-accuracy.pdf
fig:realtime-flow           →  realtime-flow.pdf
fig:ml-pipeline             →  ml-pipeline.pdf
```

---

## 🎨 **Diagram Color Scheme**

The diagrams use a consistent color palette:

| Component Type | Color | Hex Code |
|---------------|-------|----------|
| Web Platform | Blue | #3498db |
| Desktop Platform | Purple | #9b59b6 |
| Mobile Platform | Orange | #e67e22 |
| Backend Services | Green | #2ecc71 |
| Database | Yellow/Orange | #f39c12 |
| Blockchain | Red | #e74c3c |
| AI/ML Services | Teal | #1abc9c |
| Cloud/Infrastructure | Gray | #95a5a6 |
| Security Components | Dark Red | #c0392b |

This consistent color coding helps readers quickly identify component types across all diagrams.

---

## ✏️ **Customization Tips**

### **To Change Colors**:
Edit the CSS classes in the `<style>` section:
```css
.platform-web { fill: #3498db; }     /* Change to your preferred blue */
.backend { fill: #2ecc71; }          /* Change to your preferred green */
```

### **To Add New Diagrams**:
1. Copy an existing `diagram-container` div
2. Update the figure number and label
3. Modify the SVG content
4. Update the description and notes

### **To Resize**:
Modify the `viewBox` attribute in the `<svg>` tag:
```xml
<svg viewBox="0 0 800 600">  <!-- Width 800, Height 600 -->
```

---

## 🔧 **Completing the Journal Paper Diagrams**

### **Step-by-Step Guide**:

1. **Open Both Files**:
   - `papers/technical/figures/diagram.html` (source)
   - `papers/journal/figures/diagram.html` (destination)

2. **For Each Diagram to Add**:
   ```html
   <!-- Copy this structure from technical paper -->
   <div class="diagram-container">
       <div class="diagram-label">Figure X: Title (fig:label)</div>
       <div class="diagram-description">Description...</div>
       <svg class="diagram" viewBox="0 0 900 600">
           <!-- SVG content -->
       </svg>
       <div class="notes">
           <strong>Key Points:</strong> Explanation...
       </div>
   </div>
   ```

3. **Enhance for Journal**:
   - Add more detail to the SVG components
   - Include more metrics and labels
   - Expand the notes section
   - Add section markers to group related diagrams

4. **Update Figure Numbers**:
   - Journal paper has different figure numbering
   - Update both the label and internal references

5. **Add Section Markers**:
   ```html
   <div class="section-marker">SECTION: Your Section Name</div>
   ```

---

## 📊 **Recommended Additions for Journal Paper**

Beyond the technical paper diagrams, consider adding:

1. **UI/UX Screenshots**:
   - Web dashboard (annotated)
   - Desktop application (annotated)
   - Mobile app screens (annotated)
   - Security laboratory interface

2. **Detailed Sequence Diagrams**:
   - Login flow with JWT
   - Threat detection → Response
   - Real-time event → Client update
   - Blockchain logging sequence

3. **Data Flow Diagrams**:
   - Event lifecycle (creation → storage → retrieval)
   - ML inference flow (input → prediction → action)
   - Backup/restore workflow

4. **Performance Charts**:
   - Response time distribution (histogram)
   - Throughput vs. concurrent users (line graph)
   - Resource usage over time (area chart)
   - Scalability curves (multi-line)

5. **Comparison Visualizations**:
   - Feature matrix (USOD vs. competitors)
   - Performance benchmarks (grouped bar charts)
   - Cost analysis (stacked bars)

---

## 🎯 **Quick Export Workflow**

For rapid export of all diagrams:

```bash
# 1. Open diagram.html in Chrome
# 2. Open DevTools (F12)
# 3. For each diagram, run in Console:

// This will download all diagrams as PNG
document.querySelectorAll('.diagram').forEach((svg, i) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const data = (new XMLSerializer()).serializeToString(svg);
    const DOMURL = window.URL || window.webkitURL || window;
    const img = new Image();
    const svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    const url = DOMURL.createObjectURL(svgBlob);
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(function(blob) {
            const link = document.createElement('a');
            link.download = `diagram-${i+1}.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
        });
        DOMURL.revokeObjectURL(url);
    };
    img.src = url;
});
```

---

## 💡 **Pro Tips**

1. **For Print**: Export at 2x or 3x size for crisp printing
2. **For Presentations**: Save as SVG for scalability
3. **For Word**: PNG format works best
4. **For LaTeX**: PDF format is ideal (convert SVG→PDF using Inkscape)

### **Converting SVG to PDF**:

**Using Inkscape (Free)**:
```bash
inkscape diagram.svg --export-filename=diagram.pdf
```

**Using Online Tool**:
- CloudConvert: https://cloudconvert.com/svg-to-pdf
- Online-Convert: https://www.online-convert.com/

**Using Browser**:
1. Open SVG in Chrome
2. Print (Ctrl+P)
3. Save as PDF

---

## ✅ **Next Steps**

### **For Technical Paper**:
1. ✅ Diagrams are complete!
2. Export needed diagrams to PDF/PNG
3. Add to your LaTeX paper
4. Reference in text

### **For Journal Paper**:
1. Complete the remaining 13+ diagrams
2. Follow the pattern established
3. Enhance with more detail than technical paper
4. Export and integrate into journal paper

---

## 🆘 **Need Help?**

### **Diagram Tools**:
- draw.io: https://app.diagrams.net/
- Inkscape: https://inkscape.org/ (SVG editor)
- GIMP: https://www.gimp.org/ (image editing)

### **Learning Resources**:
- SVG Tutorial: https://www.w3schools.com/graphics/svg_intro.asp
- draw.io Guide: https://www.diagrams.net/doc/
- LaTeX Graphics: https://www.overleaf.com/learn/latex/Inserting_Images

---

**Great work on your diagrams! You now have professional, publication-ready visualizations for both papers! 🎨📊🚀**

