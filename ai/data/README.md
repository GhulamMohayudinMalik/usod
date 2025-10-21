# CICIDS2017 Dataset Structure

## Directory Layout

```
data/
├── raw/                    # Original CICIDS2017 dataset files (CSV format)
│   ├── Monday-WorkingHours.pcap_ISCX.csv          (168.73 MB)
│   ├── Tuesday-WorkingHours.pcap_ISCX.csv         (128.82 MB)
│   ├── Wednesday-workingHours.pcap_ISCX.csv       (214.74 MB)
│   ├── Thursday-WorkingHours-Morning-WebAttacks.pcap_ISCX.csv (49.61 MB)
│   ├── Thursday-WorkingHours-Afternoon-Infilteration.pcap_ISCX.csv (79.25 MB)
│   ├── Friday-WorkingHours-Morning.pcap_ISCX.csv  (55.62 MB)
│   ├── Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv (73.55 MB)
│   └── Friday-WorkingHours-Afternoon-PortScan.pcap_ISCX.csv (73.34 MB)
├── processed/              # Preprocessed datasets for ML training
│   ├── train_features.csv
│   ├── train_labels.csv
│   ├── test_features.csv
│   ├── test_labels.csv
│   ├── validation_features.csv
│   └── validation_labels.csv
├── pcap/                   # Sample PCAP files for testing
│   └── sample_flows.pcap
└── README.md              # This file
```

## Dataset Information

**CICIDS2017** - Canadian Institute for Cybersecurity Intrusion Detection System 2017

- **Total Size**: ~843 MB (8 CSV files)
- **Format**: CSV files with pre-labeled network flows (no PCAP files)
- **Attack Types**: DDoS, PortScan, Web Attacks, Infiltration, BruteForce
- **Time Period**: 5 days of network traffic (Monday-Friday)
- **Features**: 78 network flow features per record

## Usage

1. **Raw Data**: Place original CICIDS2017 files in `raw/` directory
2. **Processing**: Run preprocessing scripts to generate files in `processed/`
3. **Testing**: Use sample PCAP files in `pcap/` for testing

## File Naming Convention

- **CSV Files**: `[Day]-WorkingHours[AttackType].pcap_ISCX.csv`
- **Attack Types**: DDoS, PortScan, WebAttacks, Infilteration
- **Processed**: `[split]_[type].csv` (e.g., `train_features.csv`)

## Dataset Breakdown

- **Monday**: Normal traffic (168.73 MB)
- **Tuesday**: Normal traffic (128.82 MB) 
- **Wednesday**: Normal traffic (214.74 MB)
- **Thursday Morning**: Web Attacks (49.61 MB)
- **Thursday Afternoon**: Infiltration (79.25 MB)
- **Friday Morning**: Normal traffic (55.62 MB)
- **Friday Afternoon**: DDoS attacks (73.55 MB)
- **Friday Afternoon**: Port Scan attacks (73.34 MB)
