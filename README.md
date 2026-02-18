# 🎨 PIGMENT — Evolutionary Painter

**PIGMENT** is a browser-based evolutionary art system that uses genetic algorithms to recreate images using transparent polygons. It includes visual intelligence for face detection, symmetry analysis, skin tone detection, and edge-importance weighting, plus a full Supabase ML backend for reinforcement learning and semantic search.

---

## 🚀 Quick Start

Just open `index.html` in a modern browser. No build step required.

1. Drop any image onto the **TARGET** drop zone
2. Press **▶ START**
3. Watch polygons evolve to match your image!

---

## 📁 File Structure

```
PIGMENT/
├── index.html                    # Main application (open this!)
├── css/style.css                 # All styles
├── js/
│   ├── core/
│   │   ├── pigment.js            # Master controller
│   │   ├── canvas-manager.js     # Canvas rendering
│   │   └── evolution-engine.js   # Core GA loop
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
│   └── utils/
│       ├── geometry.js           # Polygon math
│       ├── color-utils.js        # RGB/HSV conversion
│       ├── image-utils.js        # Image loading
│       └── performance.js        # Throttling/memoize
├── data/
│   ├── face-models/              # Face detection data
│   └── art-rules/                # Composition rules
├── workers/
│   ├── evolution-worker.js       # Web Worker
│   └── fitness-worker.js         # Fitness Worker
├── lib/
│   ├── sobel.js                  # Edge detection
│   └── color-convert.js          # Color library
├── supabase/
│   ├── migrations/               # Database schema
│   └── functions/                # Edge Functions (TypeScript)
│       ├── generate-embedding/
│       ├── semantic-search/
│       ├── select-mutation/
│       └── learn-from-evolution/
└── tests/                        # Test files
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
| Space (soon) | Pause/Resume |

---

## 🗄️ Supabase ML Backend (Optional)

For cross-session learning, set up Supabase:

1. Create project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql`
3. Deploy Edge Functions:
   ```bash
   supabase functions deploy generate-embedding
   supabase functions deploy select-mutation
   supabase functions deploy learn-from-evolution
   ```
4. Add env vars to your project:
   ```
   SUPABASE_URL=your-project-url
   SUPABASE_ANON_KEY=your-anon-key
   ```

The ML backend enables:
- **Reinforcement learning** — Q-table learns best mutations per image type
- **Semantic search** — Find similar past evolutions
- **Aesthetic predictor** — Learn from user ratings
- **Cross-session memory** — Improvements persist between sessions

---

## 🔬 Algorithm Details

- **Hill Climbing**: Single-objective pixel error minimization
- **Multi-Objective** (default): 40% pixel + 25% structural + 25% semantic + 10% edge
- **Novelty Search**: Explore diverse polygon configurations

**Mutation Rates:**
- Translate: 35% probability, ±10% canvas
- Scale: 25% probability, 0.5–2.0×
- Rotate: 20% probability, ±45°
- Color: 15% probability, ±40 per channel
- Opacity: 5% probability, ±30 alpha
- Intelligent: 10% probability, AI-guided

**Adaptive Behavior:**
- Mutation rate increases during plateaus (÷0.998 per rejection)
- Mutation rate decreases on improvement (×1.001 per acceptance)
- Innovation protection: morphological changes get 50-generation grace period

---

## 📊 Stats Explained

| Stat | Meaning |
|------|---------|
| GENERATIONS | Total evolution steps |
| PIXEL | Pixel similarity to target (%) |
| STRUCTURE | Polygon quality score (0–100) |
| IMPROVEMENTS | Accepted mutations count |
| SPEED | Generations per second |
| TIME | Elapsed time |
| ETA | Estimated time to 99.5% |
| PEAK | All-time best fitness |

---

## 🌐 Browser Compatibility

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 15+ ✅
- Edge 90+ ✅

---

## 📄 .pg Genome Format

```
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

*Built with vanilla JavaScript, Canvas 2D API, and evolutionary computation.*  
*MIT License — Use freely!*
