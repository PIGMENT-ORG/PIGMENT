# 🎨 PIGMENT — Evolutionary Painter

**PIGMENT** is a browser-based evolutionary art system that uses genetic algorithms to recreate images using transparent polygons. It includes visual intelligence for face detection, symmetry analysis, skin tone detection, and edge-importance weighting, plus a full Supabase ML backend for reinforcement learning and semantic search.

---

## 🚀 Quick Start

Just open `index.html` in a modern browser. No build step required.

1. Drop any image onto the **TARGET** drop zone
2. Press **▶ START**
3. Watch polygons evolve to match your image!

**Live Demo:** [https://pigment-org.github.io/PIGMENT](https://pigment-org.github.io/PIGMENT)
**Learning Dashboard:** [https://pigment-org.github.io/PIGMENT/dashboard.html](https://pigment-org.github.io/PIGMENT/dashboard.html)

---

## 📁 File Structure

```

PIGMENT/
├── index.html                    # Main application
├── dashboard.html                # ML Learning Dashboard
├── css/
│   └── style.css                 # All styles
├── js/
│   ├── core/
│   │   ├── pigment.js            # Master controller
│   │   ├── canvas-manager.js     # Canvas rendering
│   │   └── evolution-engine.js   # Core GA loop with RL
│   ├── intelligence/
│   │   ├── visual-intelligence.js # Master intelligence
│   │   ├── face-detector.js      # Face detection
│   │   ├── symmetry-analyzer.js  # Bilateral symmetry
│   │   ├── skin-tone-detector.js # Skin tone detection
│   │   ├── edge-importance.js    # Edge weighting
│   │   └── composition-rules.js  # Rule of thirds / golden ratio
│   ├── mutations/
│   │   ├── base-mutation.js      # Base class
│   │   ├── translate-mutation.js # Move polygon
│   │   ├── scale-mutation.js     # Resize polygon
│   │   ├── rotate-mutation.js    # Rotate polygon
│   │   ├── color-mutation.js     # Change color
│   │   ├── opacity-mutation.js   # Change opacity
│   │   ├── intelligent-mutation.js # AI-guided
│   │   └── index.js              # Registry
│   ├── fitness/
│   │   ├── pixel-fitness.js      # Pixel error
│   │   ├── structural-fitness.js # Polygon quality
│   │   ├── semantic-fitness.js   # Semantic scoring
│   │   └── multi-objective.js    # Combined fitness
│   ├── export/
│   │   ├── pg-exporter.js        # Export .pg genomes
│   │   ├── pg-parser.js          # Import .pg genomes
│   │   └── image-exporter.js     # PNG/JPG/SVG export
│   ├── ui/
│   │   ├── controls.js           # Button/tab handlers
│   │   ├── stats-display.js      # Real-time stats
│   │   ├── progress-bar.js       # Progress visualization
│   │   ├── fitness-curve.js      # Chart drawing
│   │   └── alert-system.js       # Notifications
│   ├── utils/
│   │   ├── geometry.js           # Polygon math
│   │   ├── color-utils.js        # RGB/HSV conversion
│   │   ├── image-utils.js        # Image loading
│   │   └── performance.js        # Throttling/memoize
│   └── supabase-client.js        # Supabase ML integration
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql # Database schema
│   └── functions/
│       ├── generate-embedding/
│       │   └── index.ts           # Embedding generation
│       ├── select-mutation/
│       │   └── index.ts           # RL mutation selector
│       ├── learn-from-evolution/
│       │   └── index.ts           # Training data collector
│       ├── semantic-search/
│       │   └── index.ts           # Similarity search
│       └── aesthetic-predictor/
│           └── index.ts           # Aesthetic scoring
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions deploy
└── tests/                          # Test files

```

---

## 🧠 Intelligence Features

| Feature | Description |
|---------|-------------|
| Face Detection | Oval/eye/nose/mouth region analysis |
| Symmetry Analysis | Bilateral symmetry scoring and improvement |
| Skin Tone Detection | Multi-tone HSV detection with palette generation |
| Edge Importance | Eye 3×, mouth 2.5×, nose 2× weighted regions |
| Composition | Rule of thirds + golden ratio optimization |

---

## 📤 Export Options

| Format | Description |
|--------|-------------|
| `.pg` | Genome file — reload and continue evolution later |
| PNG | Lossless, 1×–16× resolution |
| JPG | Compressed, 1×–16× resolution |
| SVG | Scalable vector, any size |

---

## ⚡ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+V` | Paste .pg genome directly |
| `Space` | Pause/Resume (coming soon) |

---

## 🗄️ Supabase ML Backend (Live)

This project uses Supabase for cross-session machine learning. The backend is live with **2,286+ training samples** already collected:

- **Project URL:** `https://slfxwkvhomomdcqpkfqp.supabase.co`
- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZnh3a3Zob21vbWRjcXBrZnFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzQxNzQsImV4cCI6MjA4Njk1MDE3NH0.ThDVJzCPooZCwFt68Aw608t9Dmnt-cWgxlYy9nPRhpY`

### Database Schema

The Supabase backend includes:

```sql
- evolution_runs     # Metadata for each evolution session
- image_embeddings   # 384-dim vector embeddings with pgvector
- training_data      # RL training examples (2,286+ records)
- rl_q_table         # Q-learning state-action values
- user_feedback      # Aesthetic ratings from users
- model_checkpoints  # ML model versioning
```

Edge Functions

Five Edge Functions handle ML inference:

Function Purpose
generate-embedding Convert images to vector embeddings
select-mutation Q-learning mutation selection
learn-from-evolution Store training data
semantic-search Find similar past evolutions
aesthetic-predictor Predict user preference scores

ML Capabilities

The ML backend enables:

· Reinforcement learning — Q-table learns best mutations per image type
· Semantic search — Find similar evolutions via vector similarity
· Aesthetic predictor — Learn from user ratings (5-star system)
· Cross-session memory — Improvements persist between sessions
· Style clustering — Automatically group images by visual style

Current Learning Stats (Live)

Based on 2,286 training samples, the AI has discovered:

Mutation Success Rate Verdict
scale 63.0% ⭐ BEST - Use most often
opacity 56.4% ⭐ Great for fine-tuning
color 53.1% ⭐ Good for mid/late stages
rotate 37.7% 🟡 Moderate effectiveness
translate 24.7% 🔴 Least effective
intelligent 0.0% 🟣 Still learning

---

📊 Learning Dashboard

Monitor your AI's learning in real-time:

https://pigment-org.github.io/PIGMENT/dashboard.html

The dashboard shows:

· 📈 Training samples collected
· 🎯 Mutation success rates
· 🔮 Q-learning progress
· ⚡ Stage-based strategies
· 🤖 Real-time AI insights

---

🔬 Algorithm Details

Evolution Strategies

· Hill Climbing: Single-objective pixel error minimization
· Multi-Objective (default): 40% pixel + 25% structural + 25% semantic + 10% edge
· Novelty Search: Explore diverse polygon configurations

Mutation Rates

Type Probability Effect
Translate 35% Move polygon ±10% canvas
Scale 25% Resize 0.5–2.0×
Rotate 20% Rotate ±45°
Color 15% Change RGB ±40 per channel
Opacity 5% Change alpha ±30
Intelligent 10% AI-guided (when ML enabled)

Adaptive Behavior

· Mutation rate increases during plateaus (×1.001 per rejection)
· Mutation rate decreases on improvement (×0.998 per acceptance)
· Innovation protection: Morphological changes get 50-generation grace period

---

📊 Stats Explained

Stat Meaning
GENERATIONS Total evolution steps
PIXEL Pixel similarity to target (%)
STRUCTURE Polygon quality score (0–100)
IMPROVEMENTS Accepted mutations count
SPEED Generations per second
TIME Elapsed time
ETA Estimated time to 99.5%
PEAK All-time best fitness

---

🚀 Deployment

GitHub Pages

This project is configured for GitHub Pages deployment:

1. Fork this repository
2. Go to Settings → Pages
3. Select main branch as source
4. Your site will be live at https://[username].github.io/PIGMENT

GitHub Actions

The included workflow (.github/workflows/deploy.yml) automatically:

· Deploys Edge Functions to Supabase on push
· Builds and deploys to GitHub Pages
· Manages environment secrets

Required Secrets

Add these to your GitHub repository Settings → Secrets and variables → Actions:

```
SUPABASE_URL=https://slfxwkvhomomdcqpkfqp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=[get from Supabase dashboard]
```

---

🔧 Local Development

1. Clone the repository
2. Open index.html in your browser
3. For ML features, create a .env file:
   ```
   SUPABASE_URL=https://slfxwkvhomomdcqpkfqp.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Install Supabase CLI (optional, for Edge Function development):
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref slfxwkvhomomdcqpkfqp
   ```

---

📄 .pg Genome Format

```pg
-- PIGMENT Genome
-- Generated: [date]
-- Generations: 50000
-- Fitness: 92.50%
-- Polygons: 50

canvas {
  width: 200
  height: 200
}

polygons {
  poly-0 {
    points: 45.2,78.1 120.5,34.8 89.3,145.2
    color: rgba(210,145,100,0.75)
  }
  ...
}
```

---

🌐 Browser Compatibility

· Chrome 90+ ✅
· Firefox 88+ ✅
· Safari 15+ ✅
· Edge 90+ ✅
· Mobile browsers (iOS/Android) ✅

---

📈 Performance

Image Size Generations to 99% Time
100×100 ~25,000 2-3 minutes
200×200 ~50,000 5-8 minutes
300×300 ~100,000 15-20 minutes

With ML enabled, convergence is 2-3× faster after 1000+ evolutions. Current training data: 2,286 samples

---

🤝 Contributing

Contributions welcome! Areas for improvement:

· Additional shape primitives (circles, bezier curves)
· More mutation operators
· Enhanced visual intelligence models
· WebAssembly core for 10× speedup
· Mobile app wrapper

---

📚 Research References

· Roger Alsing's original 2008 algorithm
· GECCO 2026: Hybrid ML + EC for creativity
· GenerativeGI 2024: Grammar-based evolution
· ACM C&C 2021: Multi-objective fitness

---

📄 License

MIT License — Use freely for any purpose!

---

🙏 Acknowledgments

· Roger Alsing for the original concept
· Supabase for the amazing backend platform
· All contributors and testers

---

⭐ Live Demo: https://pigment-org.github.io/PIGMENT
📊 Learning Dashboard: https://pigment-org.github.io/PIGMENT/dashboard.html

Built with ❤️ using vanilla JavaScript, Canvas 2D API, and evolutionary computation.