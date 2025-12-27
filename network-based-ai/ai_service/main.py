"""
Network Threat Detection AI Service
FastAPI service for PCAP analysis using NFStream model
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
import uvicorn
import os
import tempfile
import uuid
from pathlib import Path
from datetime import datetime

# Import our modules
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.analyzer import NetworkThreatAnalyzer

app = FastAPI(
    title="Network Threat Detection API",
    description="AI-powered network threat detection service",
    version="1.0.0"
)

# CORS configuration (adjust for your frontend domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize analyzer (warm start)
print("Loading AI analyzer...")
try:
    analyzer = NetworkThreatAnalyzer()
    print("SUCCESS: AI analyzer loaded successfully")
except Exception as e:
    print(f"ERROR: Failed to load analyzer: {e}")
    analyzer = None


# Response models
class AnalysisResponse(BaseModel):
    status: str
    total_flows: int
    threats_detected: bool
    summary: Dict[str, Any]  # Mixed types: int counts, float percentages, dict breakdowns
    results_url: Optional[str] = None
    analysis_id: Optional[str] = None
    processing_time: Optional[float] = None




class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    extractor_available: bool
    timestamp: str


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        model_loaded=analyzer is not None and analyzer.predictor.nfstream_model is not None,
        extractor_available=analyzer is not None and analyzer.extractor.nfstream_available,
        timestamp=datetime.utcnow().isoformat()
    )


@app.post("/api/v1/analyze-pcap", response_model=AnalysisResponse)
async def analyze_pcap(
    file: UploadFile = File(...),
    model_type: str = "nfstream",
    max_flows: Optional[int] = None,
    batch_size: int = 5000,
    background_tasks: BackgroundTasks = None
):
    """
    Analyze PCAP file for network threats using NFStream model.
    
    Args:
        file: PCAP file to analyze
        model_type: 'nfstream' (default, binary: BENIGN vs DDoS)
        max_flows: Maximum number of flows to analyze (None = all)
        batch_size: Number of flows per batch for breakdown (default 5000)
    
    Returns:
        Analysis results with threat summary and batch breakdown
    """
    if analyzer is None:
        raise HTTPException(status_code=503, detail="AI analyzer not loaded")
    
    start_time = datetime.utcnow()
    analysis_id = str(uuid.uuid4())
    tmp_path = None
    
    try:
        # Validate file type
        if not file.filename.endswith(('.pcap', '.pcapng', '.cap')):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Expected .pcap, .pcapng, or .cap"
            )
        
        # Save uploaded file temporarily (stream to avoid memory issues)
        tmp_path = Path(tempfile.gettempdir()) / f"{analysis_id}_{file.filename}"
        
        # Stream file in chunks to avoid MemoryError for large files
        file_size = 0
        chunk_size = 1024 * 1024  # 1MB chunks
        
        print(f"Receiving PCAP file: {file.filename}...")
        with open(tmp_path, "wb") as f:
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                f.write(chunk)
                file_size += len(chunk)
        
        file_size_mb = file_size / (1024**2)
        print(f"Processing PCAP: {file.filename} ({file_size_mb:.2f} MB)")
        
        # Use analyzer to process PCAP with batch breakdown
        results = analyzer.analyze_pcap(
            tmp_path,
            model_type='nfstream',  # Use NFStream model (binary detection)
            max_flows=max_flows,
            batch_size=batch_size,  # For batch breakdown
            save_results=False  # We'll handle saving if needed
        )

        
        if results['status'] != 'success':
            raise HTTPException(status_code=400, detail=results.get('message', 'Analysis failed'))
        
        # Calculate processing time
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        # Save results (optional)
        results_url = None
        if os.getenv("SAVE_RESULTS", "false").lower() == "true":
            results_url = await _save_results(results['dataframe'], analysis_id)
        
        # Cleanup temp file
        if tmp_path and tmp_path.exists():
            background_tasks.add_task(lambda: tmp_path.unlink() if tmp_path.exists() else None)
        
        return AnalysisResponse(
            status="success",
            total_flows=results['total_flows'],
            threats_detected=results['threat_detected'],
            summary=results['summary'],
            results_url=results_url,
            analysis_id=analysis_id,
            processing_time=processing_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        # Cleanup on error
        if tmp_path and tmp_path.exists():
            try:
                tmp_path.unlink()
            except:
                pass
        
        print(f"Error analyzing PCAP: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze PCAP: {str(e)}"
        )




async def _save_results(df, analysis_id: str) -> str:
    """Save results to storage (S3 or local)."""
    import pandas as pd
    # For AWS S3:
    # import boto3
    # s3 = boto3.client('s3')
    # key = f"results/{analysis_id}.csv"
    # s3.put_object(Bucket='your-bucket', Key=key, Body=df.to_csv(index=False))
    # return f"s3://your-bucket/{key}"
    
    # For local storage (development):
    results_dir = Path("/tmp/results")
    results_dir.mkdir(exist_ok=True)
    results_file = results_dir / f"{analysis_id}.csv"
    if isinstance(df, pd.DataFrame):
        df.to_csv(results_file, index=False)
    return str(results_file)


@app.get("/api/v1/stats")
async def get_stats():
    """Get service statistics."""
    return {
        "analyzer_loaded": analyzer is not None,
        "model_loaded": analyzer is not None and analyzer.predictor.nfstream_model is not None,
        "extractor_available": analyzer is not None and analyzer.extractor.nfstream_available,
        "supported_formats": [".pcap", ".pcapng", ".cap"],
        "model_type": "NFStream Binary (BENIGN vs DDoS)",
        "model_accuracy": "83.39% DDoS detection"
    }


@app.get("/api/v1/interfaces")
async def get_interfaces():
    """Get available network interfaces for real-time capture."""
    try:
        import psutil
        interfaces = []
        net_if_addrs = psutil.net_if_addrs()
        
        for interface_name, addrs in net_if_addrs.items():
            has_ipv4 = any(addr.family == 2 for addr in addrs)
            if has_ipv4 and interface_name not in ['Loopback Pseudo-Interface 1']:
                # Get IP address
                ip_addr = None
                for addr in addrs:
                    if addr.family == 2:  # IPv4
                        ip_addr = addr.address
                        break
                
                interfaces.append({
                    "name": interface_name,
                    "ip": ip_addr,
                    "status": "active"
                })
        
        return {
            "interfaces": interfaces,
            "count": len(interfaces)
        }
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="psutil not installed. Install with: pip install psutil"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get interfaces: {str(e)}"
        )


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)



