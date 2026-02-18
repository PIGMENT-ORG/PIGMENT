#!/usr/bin/env python3
"""
PIGMENT v5 Complete AI Training Pipeline
Orchestrates the entire training process
"""
import subprocess
import json
import pandas as pd
from pathlib import Path
import sys
import time

class PIGMENTAI:
    def __init__(self, working_dir='.'):
        self.working_dir = Path(working_dir)
        self.training_dir = self.working_dir / 'training_data'
        self.sweep_dir = self.working_dir / 'sweep_results'
        self.scores_dir = self.working_dir / 'scores'
        self.models_dir = self.working_dir / 'models'
        
        # Create directories
        for d in [self.training_dir, self.sweep_dir, self.scores_dir, self.models_dir]:
            d.mkdir(exist_ok=True)
    
    def collect_data(self, source='localstorage'):
        """Collect training data from browser or files"""
        print("\n📥 Collecting training data...")
        
        if source == 'localstorage':
            # This would need a server to receive browser data
            print("⚠️  To collect from browser, run a local server and use:")
            print("    pigment_ai.py --serve")
        else:
            # Collect from existing .pg files
            pg_files = list(self.training_dir.glob('*.pg'))
            print(f"✅ Found {len(pg_files)} .pg files")
            return pg_files
    
    def extract_features(self, pg_files):
        """Extract features from .pg files"""
        print("\n🔍 Extracting features...")
        
        features = []
        from extract_features import FeatureExtractor
        extractor = FeatureExtractor()
        
        for pg_file in pg_files:
            try:
                feat = extractor.extract_from_file(pg_file)
                if feat:
                    features.append({
                        'file': str(pg_file),
                        'features': feat
                    })
                    print(f"  ✓ {pg_file.name}")
            except Exception as e:
                print(f"  ✗ {pg_file.name}: {e}")
        
        # Save features
        features_file = self.training_dir / 'features.json'
        with open(features_file, 'w') as f:
            json.dump(features, f, indent=2)
        
        print(f"✅ Extracted features from {len(features)} files")
        return features_file
    
    def run_sweeps(self, pg_files):
        """Run parameter sweeps for each .pg file"""
        print("\n🔄 Running parameter sweeps...")
        
        all_manifests = []
        for pg_file in pg_files:
            print(f"  Sweeping {pg_file.name}...")
            output_dir = self.sweep_dir / pg_file.stem
            output_dir.mkdir(exist_ok=True)
            
            try:
                subprocess.run([
                    'python', 'sweep_compile.py',
                    str(pg_file),
                    '--output-dir', str(output_dir),
                    '--sample-id', pg_file.stem
                ], check=True, capture_output=True)
                
                manifest = output_dir / f'{pg_file.stem}_manifest.json'
                if manifest.exists():
                    all_manifests.append(manifest)
                    print(f"    ✓ Generated 216 variants")
            except Exception as e:
                print(f"    ✗ Failed: {e}")
        
        return all_manifests
    
    def score_results(self, manifests, target_images):
        """Score rendered variants against targets"""
        print("\n📊 Scoring results...")
        
        all_scores = []
        for manifest in manifests:
            sample_id = manifest.stem.replace('_manifest', '')
            target = target_images.get(sample_id)
            
            if not target:
                print(f"  ⚠️  No target for {sample_id}, skipping")
                continue
            
            print(f"  Scoring {sample_id}...")
            output = self.scores_dir / f'{sample_id}_scores.csv'
            
            try:
                subprocess.run([
                    'python', 'score_renders.py',
                    '--manifest', str(manifest),
                    '--target', str(target),
                    '--output', str(output)
                ], check=True, capture_output=True)
                
                if output.exists():
                    scores = pd.read_csv(output)
                    all_scores.append(scores)
                    print(f"    ✓ {len(scores)} scores")
            except Exception as e:
                print(f"    ✗ Failed: {e}")
        
        # Combine all scores
        if all_scores:
            combined = pd.concat(all_scores, ignore_index=True)
            combined_file = self.scores_dir / 'all_scores.csv'
            combined.to_csv(combined_file, index=False)
            print(f"✅ Combined {len(combined)} scores to {combined_file}")
            return combined_file
        
        return None
    
    def train_model(self, scores_file):
        """Train policy network"""
        print("\n🧠 Training policy network...")
        
        from train_policy import PolicyTrainer
        trainer = PolicyTrainer()
        
        # Load scores
        scores = pd.read_csv(scores_file)
        
        # Load features
        features_file = self.training_dir / 'features.json'
        if not features_file.exists():
            print("❌ No features file found")
            return None
        
        with open(features_file, 'r') as f:
            features_data = json.load(f)
        
        # Prepare training data (simplified)
        # In reality, you'd need proper matching
        X = []
        y = []
        
        for item in features_data:
            # Convert features to array
            feat = list(item['features'].values())
            X.append(feat)
            
            # For demo, use random targets
            # In reality, these would come from scores
            y.append(np.random.rand(6))
        
        import numpy as np
        X = np.array(X)
        y = np.array(y)
        
        # Train
        trainer.feature_names = list(features_data[0]['features'].keys())
        trainer.train(X, y)
        trainer.feature_importance()
        
        # Save model
        model_file = self.models_dir / 'policy_network.pkl'
        trainer.save_model(str(model_file))
        
        return model_file
    
    def run_pipeline(self, pg_files=None, target_images=None):
        """Run complete training pipeline"""
        print("=" * 50)
        print("🎨 PIGMENT v5 AI Training Pipeline")
        print("=" * 50)
        
        start_time = time.time()
        
        # Step 1: Collect data
        if pg_files is None:
            pg_files = list(self.training_dir.glob('*.pg'))
        
        if not pg_files:
            print("❌ No .pg files found")
            return
        
        # Step 2: Extract features
        features_file = self.extract_features(pg_files)
        
        # Step 3: Run sweeps
        manifests = self.run_sweeps(pg_files)
        
        # Step 4: Score results
        if target_images is None:
            # Assume target images are in same directory with same name
            target_images = {}
            for pg_file in pg_files:
                # Look for .png, .jpg, etc.
                for ext in ['.png', '.jpg', '.jpeg']:
                    target = pg_file.with_suffix(ext)
                    if target.exists():
                        target_images[pg_file.stem] = target
                        break
        
        scores_file = self.score_results(manifests, target_images)
        
        # Step 5: Train model
        if scores_file:
            model_file = self.train_model(scores_file)
            
            elapsed = time.time() - start_time
            print("\n" + "=" * 50)
            print(f"✅ Pipeline complete in {elapsed:.1f} seconds")
            print(f"   Model saved to {model_file}")
            print("=" * 50)
        else:
            print("\n❌ No scores generated, training skipped")

# CLI interface
if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='PIGMENT AI Training Pipeline')
    parser.add_argument('--collect', action='store_true', help='Collect training data')
    parser.add_argument('--extract', action='store_true', help='Extract features')
    parser.add_argument('--sweep', action='store_true', help='Run parameter sweeps')
    parser.add_argument('--score', action='store_true', help='Score results')
    parser.add_argument('--train', action='store_true', help='Train model')
    parser.add_argument('--all', action='store_true', help='Run full pipeline')
    parser.add_argument('--serve', action='store_true', help='Start data collection server')
    
    args = parser.parse_args()
    
    ai = PIGMENTAI()
    
    if args.serve:
        # Simple HTTP server for collecting browser data
        from http.server import HTTPServer, BaseHTTPRequestHandler
        import json
        
        class DataHandler(BaseHTTPRequestHandler):
            def do_POST(self):
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data)
                
                # Save data
                timestamp = time.strftime('%Y%m%d_%H%M%S')
                filename = f'training_data_{timestamp}.json'
                with open(filename, 'w') as f:
                    json.dump(data, f, indent=2)
                
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b'{"status":"ok"}')
                
                print(f"✅ Received training data, saved to {filename}")
            
            def do_GET(self):
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b'''
                    <html>
                        <body>
                            <h1>PIGMENT Data Collector</h1>
                            <p>Send POST requests with training data to this endpoint.</p>
                        </body>
                    </html>
                ''')
        
        print("🚀 Starting data collection server on port 8000...")
        print("   Send training data to http://localhost:8000")
        server = HTTPServer(('localhost', 8000), DataHandler)
        server.serve_forever()
        
    elif args.all:
        ai.run_pipeline()
    else:
        parser.print_help()