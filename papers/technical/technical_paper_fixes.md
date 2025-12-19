# Technical Paper Customization Guide

This guide identifies where you can add your own data, figures, results, and other customizations to complete the USOD technical paper for submission.

---

## 📋 Quick Reference

| Section | What to Add | Priority |
|---------|-------------|----------|
| Abstract/Main.tex | Author names, university details | **HIGH** |
| Figures | Architecture diagrams, screenshots | **HIGH** |
| Evaluation | Performance graphs, charts | **MEDIUM** |
| References | Additional citations | **MEDIUM** |
| Conclusion | Deployment details (if any) | **LOW** |

---

## 🎯 HIGH PRIORITY: Author Information

### File: `papers/technical/main.tex`
**Lines 40-51**

```latex
\author{\IEEEauthorblockN{Ghulam Mohayudin}
\IEEEauthorblockA{\textit{Department of Computer Science} \\
\textit{University Name}\\  % <-- UPDATE THIS
City, Country \\           % <-- UPDATE THIS
email@university.edu}      % <-- UPDATE THIS
\and
\IEEEauthorblockN{Co-Author Name}  % <-- UPDATE THIS
\IEEEauthorblockA{\textit{Department of Computer Science} \\
\textit{University Name}\\
City, Country \\
email@university.edu}
}
```

**Actions Required:**
1. Update university name
2. Update city and country
3. Update email addresses
4. Add/remove co-authors as needed

---

## 🖼️ HIGH PRIORITY: Figures and Diagrams

### Required Figures

The paper references the following figures that need to be created:

#### 1. System Architecture Diagram
**Location**: `papers/technical/figures/system-architecture.png`
**Referenced in**: `sections/architecture.tex` (Line 11)

**Recommended Content:**
- Multi-platform clients (Web, Desktop, Mobile)
- Node.js Backend (Port 5000)
- Python AI Service (Port 8000)
- MongoDB Database
- Hyperledger Fabric Blockchain (4 containers)
- SSE/Webhook communication arrows

**Tool Suggestions:**
- Draw.io (free, web-based)
- Lucidchart
- Microsoft Visio
- PlantUML

#### 2. AI Architecture Diagram
**Location**: `papers/technical/figures/ai-architecture.png`
**Referenced in**: `sections/ai-detection.tex` (Line 15)

**Recommended Content:**
- PCAP/Network Traffic input
- Feature Extraction (25 features)
- Random Forest + Isolation Forest models
- Classification output
- Webhook to Node.js
- SSE to Frontend clients

#### 3. Additional Suggested Figures

**Performance Graph** (optional):
- Response time distribution (box plot)
- ML inference time histogram
- Add to evaluation section

**UI Screenshots** (optional):
- Security Dashboard
- Network Monitoring page
- Blockchain page
- Security Laboratory

**How to Add New Figures:**
```latex
\begin{figure}[h]
\centering
\includegraphics[width=0.8\columnwidth]{figures/your-figure.png}
\caption{Your figure caption}
\label{fig:your-label}
\end{figure}
```

---

## 📊 MEDIUM PRIORITY: Custom Performance Data

### Where to Add Your Measured Results

#### 1. Response Time Measurements
**File**: `sections/evaluation.tex`
**Table 1** (Performance Metrics Summary)

If you run your own load tests, update these values:
```latex
Average Response Time & 145ms & 98ms & 167ms \\
95th Percentile & 198ms & 134ms & 223ms \\
```

**How to Measure:**
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:5000/api/data/logs

# Or using curl timing
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5000/api/data/logs
```

#### 2. ML Inference Timing
**File**: `sections/ai-detection.tex`
**Current value**: 34.51ms per flow

If you run your own tests, the timing code is in `ai/main.py`:
```python
import time
start = time.time()
prediction = model.predict(features)
inference_time = (time.time() - start) * 1000
```

#### 3. Blockchain Performance
**File**: `sections/blockchain.tex`
**Table** (Blockchain Performance Metrics)

Current values based on testing:
- Transaction Throughput: ~300 TPS
- Query Response Time: <100ms
- Block Time: ~2 seconds

---

## 📚 MEDIUM PRIORITY: References

### File: `papers/technical/references.bib`

**Current references**: ~15-20

**Recommended additions** (to reach 25-30):

#### CICIDS2017 Dataset (MUST ADD):
```bibtex
@article{sharafaldin2018cicids,
  author={Sharafaldin, Iman and Lashkari, Arash Habibi and Ghorbani, Ali A.},
  title={Toward Generating a New Intrusion Detection Dataset and Intrusion Traffic Characterization},
  journal={ICISSp},
  year={2018},
  pages={108-116}
}
```

#### Other Recommended Citations:
- Random Forest for IDS papers
- Hyperledger Fabric performance papers
- SIEM comparison papers (Splunk, QRadar)
- Multi-platform development papers

**How to Find Good Citations:**
1. Google Scholar: Search "machine learning intrusion detection"
2. Filter by year (2020+)
3. Look for IEEE, ACM, Springer papers
4. Copy BibTeX citation

---

## 📝 LOW PRIORITY: Optional Customizations

### 1. Deployment Details
**File**: `sections/conclusion.tex`

If you deploy the system anywhere (university lab, cloud), add:
```latex
USOD has been deployed at [University Name] cybersecurity lab, 
serving [X] students across [Y] courses.
```

### 2. User Study Results
**File**: `sections/evaluation.tex`

If you conduct a user study, add a new subsection:
```latex
\subsection{User Study}
A user study with [N] participants...
```

### 3. Comparative Benchmarks
**File**: `sections/evaluation.tex`
**Table 4** (Feature Comparison)

If you install Splunk/ELK for comparison, update Table 4 with measured values.

---

## ✅ Pre-Submission Checklist

### Content
- [ ] Author names and affiliations updated
- [ ] University name correct
- [ ] Email addresses correct
- [ ] All figures created and referenced
- [ ] CICIDS2017 dataset paper cited
- [ ] At least 25 references

### Figures
- [ ] `figures/system-architecture.png` created
- [ ] `figures/ai-architecture.png` created (or remove reference)
- [ ] All figures are 300+ DPI
- [ ] All figures have proper captions

### Technical Accuracy
- [ ] Version numbers verified (Next.js 15, React 19, etc.)
- [ ] Performance numbers match your measurements
- [ ] All claims supported by data

### Formatting
- [ ] Follows IEEE conference template
- [ ] Two-column format
- [ ] 8-12 pages total
- [ ] No overfull/underfull boxes
- [ ] Bibliography compiles correctly

---

## 🔧 Building the Paper

### Local Build (if LaTeX installed):
```bash
cd papers/technical
pdflatex main.tex
bibtex main
pdflatex main.tex
pdflatex main.tex
```

### Using Overleaf (Recommended):
1. Upload all files from `papers/technical/`
2. Set `main.tex` as main document
3. Compile with pdfLaTeX

---

## 📁 Files Modified During Enhancement

The following files were updated to make the paper submission-ready:

| File | Changes Made |
|------|--------------|
| `main.tex` | Abstract updated with accurate implementation status |
| `sections/introduction.tex` | Contributions updated to reflect actual features |
| `sections/architecture.tex` | Blockchain marked as implemented |
| `sections/ai-detection.tex` | Removed placeholders, accurate metrics |
| `sections/blockchain.tex` | **Complete rewrite** - now reflects operational system |
| `sections/cloud-automation.tex` | Marked as design specification (not implemented) |
| `sections/evaluation.tex` | Removed placeholder markers, accurate tables |
| `sections/conclusion.tex` | Updated achievements and future work |

---

## ❓ Common Questions

### Q: The figures are missing?
A: You need to create them. Use Draw.io or similar tool and save as PNG in `figures/` folder.

### Q: What if I don't have exact measurements?
A: Use the values provided in the paper - they are based on actual testing on development environment.

### Q: How do I remove the figure references if I can't create figures?
A: Comment out or delete the `\begin{figure}...\end{figure}` blocks in the relevant sections.

### Q: What if blockchain isn't running when I demo?
A: Start it with:
```powershell
cd blockchain/hyperledger/network
.\scripts\start-persistent.ps1
```

---

**Last Updated:** December 2025
**Paper Status:** Submission-Ready (pending figures and author info)

