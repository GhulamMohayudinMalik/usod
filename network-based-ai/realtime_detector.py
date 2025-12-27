"""
Real-Time Network Threat Detector

Captures live network traffic and detects threats in real-time using NFStream.
Uses the NFStream Robust Binary model (77.10% accuracy, 6.38% FPR).

Detects: BENIGN vs ATTACK
"""

if __name__ == '__main__':
    import sys
    import time
    import signal
    import os
    import warnings
    from pathlib import Path
    from datetime import datetime
    from collections import defaultdict
    import threading
    
    # Suppress all warnings
    warnings.filterwarnings('ignore')
    os.environ['JOBLIB_VERBOSITY'] = '0'
    
    # Add project root to path
    project_root = Path(__file__).parent
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))
    
    from src.predictor import NetworkThreatPredictor
    from src.feature_extractor import NFSTREAM_ATTRIBUTES
    import pandas as pd
    import numpy as np
    
    print("="*70)
    print("REAL-TIME NETWORK THREAT DETECTOR")
    print("="*70)
    print("Model: NFStream Robust Binary (BENIGN vs ATTACK)")
    print()
    
    # Initialize predictor
    print("[1/3] Loading AI model...")
    try:
        predictor = NetworkThreatPredictor()
        if predictor.nfstream_model is None:
            print("ERROR: Model not loaded!")
            sys.exit(1)
        print(f"  ✓ Model loaded: {predictor.class_names_nfstream}")
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
    
    # Get network interfaces
    print("\n[2/3] Finding network interfaces...")
    try:
        from nfstream import NFStreamer
        import psutil
        
        interfaces = []
        
        # Try Windows NPF device format
        try:
            import winreg
            reg_path = r"SYSTEM\CurrentControlSet\Control\Network\{4D36E972-E325-11CE-BFC1-08002BE10318}"
            reg_key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, reg_path)
            i = 0
            while True:
                try:
                    guid = winreg.EnumKey(reg_key, i)
                    conn_path = f"{reg_path}\\{guid}\\Connection"
                    try:
                        conn_key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, conn_path)
                        name = winreg.QueryValueEx(conn_key, "Name")[0]
                        npf_name = f"\\Device\\NPF_{guid}"
                        
                        # Test if interface works
                        try:
                            test = NFStreamer(source=npf_name, statistical_analysis=True)
                            interfaces.append({'name': npf_name, 'display': name})
                            del test
                        except:
                            pass
                        winreg.CloseKey(conn_key)
                    except:
                        pass
                    i += 1
                except OSError:
                    break
            winreg.CloseKey(reg_key)
        except:
            pass
        
        if not interfaces:
            print("  No interfaces found. Try running as Administrator.")
            sys.exit(1)
        
        print(f"  ✓ Found {len(interfaces)} interface(s):")
        for i, iface in enumerate(interfaces, 1):
            print(f"    {i}. {iface['display']}")
        
        # Auto-select Wi-Fi or Ethernet (preferred interfaces)
        selected = None
        selected_name = None
        for iface in interfaces:
            if 'Wi-Fi' in iface['display'] or 'WiFi' in iface['display']:
                selected = iface['name']
                selected_name = iface['display']
                break
            elif 'Ethernet' in iface['display'] and not selected:
                selected = iface['name']
                selected_name = iface['display']
        
        # Fallback to first interface if no Wi-Fi/Ethernet
        if not selected:
            selected = interfaces[0]['name']
            selected_name = interfaces[0]['display']
        
        print(f"\n  Auto-selected: {selected_name}")
        
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
    
    # Configuration
    print("\n[3/3] Configuration:")
    BATCH_SIZE = 10          # Analyze every 10 flows
    STATS_INTERVAL = 10      # Print stats every 10 seconds
    IDLE_TIMEOUT = 15        # Faster flow expiration
    ACTIVE_TIMEOUT = 30      # Faster active timeout
    
    print(f"  Batch size: {BATCH_SIZE} flows")
    print(f"  Flow timeout: {ACTIVE_TIMEOUT}s active, {IDLE_TIMEOUT}s idle")
    print()
    
    # Statistics
    stats = {
        'total': 0,
        'benign': 0,
        'attacks': 0,
        'start': time.time()
    }
    lock = threading.Lock()
    
    def update_stats(predictions):
        with lock:
            for p in predictions:
                stats['total'] += 1
                if p == 'BENIGN':
                    stats['benign'] += 1
                else:
                    stats['attacks'] += 1
    
    def print_stats():
        elapsed = time.time() - stats['start']
        with lock:
            total = stats['total']
            benign = stats['benign']
            attacks = stats['attacks']
        
        print(f"\n{'='*60}")
        print(f"STATISTICS - {datetime.now().strftime('%H:%M:%S')}")
        print(f"{'='*60}")
        print(f"Total flows analyzed: {total:,}")
        if total > 0:
            print(f"  ✓ BENIGN:  {benign:,} ({benign/total*100:.1f}%)")
            print(f"  ⚠ ATTACKS: {attacks:,} ({attacks/total*100:.1f}%)")
        print(f"Rate: {total/elapsed:.1f} flows/sec")
        print(f"Uptime: {elapsed:.0f}s")
        print(f"{'='*60}")
    
    # Shutdown handler
    running = True
    def shutdown(sig, frame):
        global running
        print("\n\nShutting down...")
        running = False
    signal.signal(signal.SIGINT, shutdown)
    
    # Start capture
    print("="*60)
    print("STARTING REAL-TIME DETECTION")
    print("="*60)
    print(f"Interface: {selected_name}")
    print("Press Ctrl+C to stop\n")
    
    try:
        streamer = NFStreamer(
            source=selected,
            statistical_analysis=True,
            active_timeout=ACTIVE_TIMEOUT,
            idle_timeout=IDLE_TIMEOUT,
            splt_analysis=0,
            n_dissections=0,
        )
        print("✓ Capture started. Waiting for traffic...\n")
        
        batch = []
        last_stats = time.time()
        first_flow = True
        
        for flow in streamer:
            if not running:
                break
            
            if first_flow:
                print(f"✓ First flow: {flow.src_ip}:{flow.src_port} → {flow.dst_ip}:{flow.dst_port}")
                first_flow = False
            
            # Extract features
            flow_data = {}
            for attr in NFSTREAM_ATTRIBUTES:
                try:
                    val = getattr(flow, attr, 0)
                    flow_data[attr] = 0 if val is None else val
                except:
                    flow_data[attr] = 0
            
            batch.append(flow_data)
            
            # Process batch
            if len(batch) >= BATCH_SIZE:
                try:
                    df = pd.DataFrame(batch)
                    df = df.replace([np.inf, -np.inf], np.nan).fillna(0)
                    predictions = predictor.predict_nfstream(df)
                    
                    update_stats(predictions)
                    
                    # Alert on attacks
                    attack_count = sum(1 for p in predictions if p != 'BENIGN')
                    if attack_count > 0:
                        print(f"⚠️  ALERT: {attack_count} attack(s) detected!")
                    
                    batch = []
                except Exception as e:
                    print(f"Error: {e}")
                    batch = []
            
            # Periodic stats
            if time.time() - last_stats >= STATS_INTERVAL:
                print_stats()
                last_stats = time.time()
        
    except Exception as e:
        print(f"Error: {e}")
    
    # Final stats
    print_stats()
    print("\nDetection stopped.")
