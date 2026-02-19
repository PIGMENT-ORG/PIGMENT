#!/usr/bin/env python3
"""
PIGMENT v5 Training Data Collector
Listens to your HTML evolution and saves training pairs
"""
import json
import time
import os
from datetime import datetime
from pathlib import Path

class TrainingCollector:
    def __init__(self, output_dir='training_data'):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.training_data = []
        self.session_id = datetime.now().strftime('%Y%m%d_%H%M%S')
        
    def save_snapshot(self, genome, fitness, params=None):
        """Save one training example"""
        data = {
            'timestamp': datetime.now().isoformat(),
            'session_id': self.session_id,
            'genome': genome,
            'fitness': fitness,
            'parameters': params or {},
            'generation': self._extract_generation(genome)
        }
        self.training_data.append(data)
        
        # Auto-save every 100 examples
        if len(self.training_data) % 100 == 0:
            self.export_dataset()
    
    def _extract_generation(self, genome):
        """Extract generation number from .pg header"""
        for line in genome.split('\n'):
            if '-- Gen:' in line:
                try:
                    return int(line.split('Gen:')[1].split()[0].replace(',', ''))
                except:
                    pass
        return 0
    
    def export_dataset(self, filename=None):
        """Save collected data to JSON file"""
        if not filename:
            filename = self.output_dir / f'training_{self.session_id}.json'
        
        with open(filename, 'w') as f:
            json.dump({
                'session_id': self.session_id,
                'total_samples': len(self.training_data),
                'data': self.training_data[-1000:]  # Keep last 1000
            }, f, indent=2)
        
        print(f"✅ Saved {len(self.training_data)} training examples to {filename}")
        return filename
    
    def load_from_localstorage(self, json_data):
        """Load data saved from browser localStorage"""
        try:
            data = json.loads(json_data)
            if isinstance(data, list):
                self.training_data.extend(data)
            print(f"✅ Loaded {len(data)} examples from browser")
        except Exception as e:
            print(f"❌ Failed to load data: {e}")

# CLI interface
if __name__ == '__main__':
    import sys
    collector = TrainingCollector()
    
    if len(sys.argv) > 1 and sys.argv[1].endswith('.json'):
        with open(sys.argv[1], 'r') as f:
            collector.load_from_localstorage(f.read())
        collector.export_dataset()
    else:
        print("Usage: python collect_training_data.py <data.json>")
        print("Or import and use in your own scripts")