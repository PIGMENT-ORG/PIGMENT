#!/usr/bin/env python3
"""
PIGMENT v5 Policy Network Trainer
Trains an AI to predict optimal rendering parameters
"""
import numpy as np
import pandas as pd
import json
from pathlib import Path
import joblib
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib.pyplot as plt
import sys

class PolicyTrainer:
    def __init__(self):
        self.model = None
        self.feature_names = None
        self.target_names = [
            'craquelure.density',
            'sss.radius',
            'sfumato.kernel',
            'illumination.weight',
            'age_shift.intensity',
            'color_temp.offset'
        ]
        
    def load_scores(self, csv_file):
        """Load scored parameter sweeps"""
        df = pd.read_csv(csv_file)
        print(f"✅ Loaded {len(df)} scored samples")
        return df
    
    def load_features(self, json_file):
        """Load pre-extracted features"""
        with open(json_file, 'r') as f:
            data = json.load(f)
        
        # Convert to DataFrame
        rows = []
        for item in data:
            row = {'file': item['file']}
            row.update(item['features'])
            rows.append(row)
        
        df = pd.DataFrame(rows)
        print(f"✅ Loaded features for {len(df)} files")
        return df
    
    def prepare_training_data(self, scores_df, features_df):
        """Combine scores with features for training"""
        # This is a simplified example
        # In reality, you'd need to match files properly
        
        # Use features as X
        feature_cols = [col for col in features_df.columns if col != 'file']
        X = features_df[feature_cols].values
        self.feature_names = feature_cols
        
        # For demo, create synthetic targets
        # In reality, these would come from your scores
        y = np.random.rand(len(X), len(self.target_names))
        
        return X, y
    
    def train(self, X, y, model_type='random_forest'):
        """Train the policy network"""
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        if model_type == 'random_forest':
            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
        else:
            self.model = GradientBoostingRegressor(
                n_estimators=100,
                max_depth=5,
                random_state=42
            )
        
        # Train
        self.model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        
        # Calculate metrics per target
        for i, target in enumerate(self.target_names):
            mse = mean_squared_error(y_test[:, i], y_pred[:, i])
            r2 = r2_score(y_test[:, i], y_pred[:, i])
            print(f"  {target}: MSE={mse:.4f}, R²={r2:.4f}")
        
        # Cross-validation
        cv_scores = cross_val_score(self.model, X, y, cv=5, scoring='r2')
        print(f"\n📊 Cross-validation R²: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")
        
        return self.model
    
    def feature_importance(self):
        """Show which features matter most"""
        if not self.model or not hasattr(self.model, 'feature_importances_'):
            print("No feature importances available")
            return
        
        importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print("\n🔍 Feature Importance:")
        for _, row in importance.iterrows():
            print(f"  {row['feature']}: {row['importance']:.3f}")
        
        # Plot
        plt.figure(figsize=(10, 6))
        plt.barh(importance['feature'], importance['importance'])
        plt.xlabel('Importance')
        plt.title('Feature Importance in Policy Network')
        plt.tight_layout()
        plt.savefig('feature_importance.png')
        print("✅ Saved feature importance plot to feature_importance.png")
        
        return importance
    
    def predict(self, features):
        """Predict optimal parameters for new features"""
        if self.model is None:
            raise ValueError("Model not trained yet")
        
        if isinstance(features, dict):
            # Convert dict to array in correct order
            X = np.array([[features[name] for name in self.feature_names]])
        else:
            X = features
        
        predictions = self.model.predict(X)
        
        result = {}
        for i, target in enumerate(self.target_names):
            result[target] = float(predictions[0, i])
        
        return result
    
    def save_model(self, filename='policy_network.pkl'):
        """Save trained model"""
        joblib.dump({
            'model': self.model,
            'feature_names': self.feature_names,
            'target_names': self.target_names
        }, filename)
        print(f"✅ Model saved to {filename}")
    
    def load_model(self, filename='policy_network.pkl'):
        """Load trained model"""
        data = joblib.load(filename)
        self.model = data['model']
        self.feature_names = data['feature_names']
        self.target_names = data['target_names']
        print(f"✅ Model loaded from {filename}")

# CLI interface
if __name__ == '__main__':
    trainer = PolicyTrainer()
    
    if len(sys.argv) > 1 and sys.argv[1] == '--demo':
        # Demo with synthetic data
        print("🔄 Running demo with synthetic data...")
        
        # Create synthetic data
        np.random.seed(42)
        n_samples = 1000
        n_features = 18
        
        X = np.random.rand(n_samples, n_features)
        y = np.random.rand(n_samples, 6)
        
        trainer.feature_names = [f'feature_{i}' for i in range(n_features)]
        trainer.train(X, y)
        trainer.feature_importance()
        trainer.save_model('demo_model.pkl')
        
    elif len(sys.argv) > 1 and sys.argv[1] == '--predict':
        # Predict mode
        trainer.load_model()
        # Example prediction
        features = np.random.rand(1, 18)
        pred = trainer.predict(features)
        print("Predicted parameters:", pred)
        
    else:
        print("Usage:")
        print("  python train_policy.py --demo        # Run demo with synthetic data")
        print("  python train_policy.py --predict    # Make a prediction")
        print("  python train_policy.py <scores.csv> # Train on real data")