#!/usr/bin/env python3
"""
PIGMENT v5 Feature Extractor
Converts .pg files to numerical feature vectors for training
"""
import re
import json
import numpy as np
from pathlib import Path
import sys

class FeatureExtractor:
    def __init__(self):
        self.feature_names = [
            'polygon_count',
            'color_r_mean', 'color_g_mean', 'color_b_mean',
            'color_r_std', 'color_g_std', 'color_b_std',
            'opacity_mean', 'opacity_std',
            'area_mean', 'area_std',
            'aspect_ratio_mean', 'aspect_ratio_std',
            'x_mean', 'y_mean',
            'x_std', 'y_std',
            'edge_density'
        ]
    
    def extract_from_file(self, pg_file):
        """Extract features from a .pg file"""
        with open(pg_file, 'r') as f:
            content = f.read()
        return self.extract_from_string(content)
    
    def extract_from_string(self, content):
        """Extract features from .pg content string"""
        # Parse polygons
        polygons = self._parse_polygons(content)
        
        if not polygons:
            return None
        
        # Extract features
        features = {}
        features['polygon_count'] = len(polygons)
        
        # Color statistics
        colors = np.array([[p['r'], p['g'], p['b']] for p in polygons])
        features['color_r_mean'] = float(np.mean(colors[:, 0]))
        features['color_g_mean'] = float(np.mean(colors[:, 1]))
        features['color_b_mean'] = float(np.mean(colors[:, 2]))
        features['color_r_std'] = float(np.std(colors[:, 0]))
        features['color_g_std'] = float(np.std(colors[:, 1]))
        features['color_b_std'] = float(np.std(colors[:, 2]))
        
        # Opacity
        opacities = np.array([p['a'] for p in polygons])
        features['opacity_mean'] = float(np.mean(opacities))
        features['opacity_std'] = float(np.std(opacities))
        
        # Areas
        areas = np.array([self._polygon_area(p['pts']) for p in polygons])
        features['area_mean'] = float(np.mean(areas))
        features['area_std'] = float(np.std(areas))
        
        # Aspect ratios
        aspect_ratios = np.array([self._aspect_ratio(p['pts']) for p in polygons])
        features['aspect_ratio_mean'] = float(np.mean(aspect_ratios))
        features['aspect_ratio_std'] = float(np.std(aspect_ratios))
        
        # Positions
        centers = np.array([self._polygon_center(p['pts']) for p in polygons])
        features['x_mean'] = float(np.mean(centers[:, 0]))
        features['y_mean'] = float(np.mean(centers[:, 1]))
        features['x_std'] = float(np.std(centers[:, 0]))
        features['y_std'] = float(np.std(centers[:, 1]))
        
        # Edge density (simplified)
        features['edge_density'] = self._calculate_edge_density(polygons)
        
        return features
    
    def _parse_polygons(self, content):
        """Extract polygon data from .pg content"""
        polygons = []
        
        # Find all polygon blocks
        pattern = r'poly-\d+\s*{\s*points:\s*([^}]+?)\s*color:\s*rgba\(([^)]+)\)\s*}'
        matches = re.findall(pattern, content, re.DOTALL)
        
        for points_str, color_str in matches:
            # Parse points
            points = []
            for coord in points_str.strip().split():
                if ',' in coord:
                    x, y = map(float, coord.split(','))
                    points.append([x, y])
            
            # Parse color
            r, g, b, a = map(float, color_str.split(','))
            
            polygons.append({
                'pts': points,
                'r': r,
                'g': g,
                'b': b,
                'a': a
            })
        
        return polygons
    
    def _polygon_area(self, pts):
        """Calculate area of a polygon (shoelace formula)"""
        if len(pts) < 3:
            return 0
        area = 0
        for i in range(len(pts)):
            j = (i + 1) % len(pts)
            area += pts[i][0] * pts[j][1]
            area -= pts[j][0] * pts[i][1]
        return abs(area) / 2
    
    def _aspect_ratio(self, pts):
        """Calculate aspect ratio of polygon's bounding box"""
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        width = max(xs) - min(xs)
        height = max(ys) - min(ys)
        if height == 0:
            return 1
        return width / height
    
    def _polygon_center(self, pts):
        """Calculate centroid of polygon"""
        x = sum(p[0] for p in pts) / len(pts)
        y = sum(p[1] for p in pts) / len(pts)
        return [x, y]
    
    def _calculate_edge_density(self, polygons):
        """Simplified edge density calculation"""
        # Count edges (3 per triangle)
        return len(polygons) * 3
    
    def features_to_vector(self, features):
        """Convert features dict to numpy array"""
        return np.array([features[name] for name in self.feature_names])
    
    def batch_extract(self, pg_files):
        """Extract features from multiple .pg files"""
        results = []
        for pg_file in pg_files:
            features = self.extract_from_file(pg_file)
            if features:
                results.append({
                    'file': str(pg_file),
                    'features': features
                })
        return results

# CLI interface
if __name__ == '__main__':
    extractor = FeatureExtractor()
    
    if len(sys.argv) < 2:
        print("Usage: python extract_features.py <file.pg> [file2.pg ...]")
        sys.exit(1)
    
    results = []
    for arg in sys.argv[1:]:
        if Path(arg).exists():
            features = extractor.extract_from_file(arg)
            if features:
                results.append({
                    'file': arg,
                    'features': features
                })
                print(f"✅ Extracted features from {arg}")
    
    # Save to JSON
    if results:
        output = 'features.json'
        with open(output, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\n✅ Saved features to {output}")