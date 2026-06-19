import express from "express";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 3001;
const databaseUrl = process.env.DATABASE_URL;

// Database connection client (Neon)
let sql: any = null;
let isUsingLocalFallback = false;

if (databaseUrl) {
  try {
    sql = neon(databaseUrl);
    console.log("Connected to Neon PostgreSQL Database successfully!");
  } catch (err) {
    console.error("Failed to initialize Neon connection. Falling back to local database.", err);
    isUsingLocalFallback = true;
  }
} else {
  console.warn("WARNING: DATABASE_URL is not set. Falling back to local file database (db.json).");
  isUsingLocalFallback = true;
}

// Local File Database Fallback implementation
const DB_FILE = path.join(process.cwd(), "db.json");

function getLocalData() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      accounts: {},
      levels: [],
      objects: [],
      game_assets: [
        { id: 1, emoji: "🗝️", category: "stickers" },
        { id: 2, emoji: "🔑", category: "stickers" },
        { id: 3, emoji: "⭐", category: "stickers" },
        { id: 4, emoji: "🐱", category: "stickers" },
        { id: 5, emoji: "🐶", category: "stickers" },
        { id: 6, emoji: "🐰", category: "stickers" },
        { id: 7, emoji: "🦊", category: "stickers" },
        { id: 8, emoji: "🍏", category: "stickers" },
        { id: 9, emoji: "🍎", category: "stickers" },
        { id: 10, emoji: "🍓", category: "stickers" },
        { id: 11, emoji: "🍒", category: "stickers" },
        { id: 12, emoji: "🍄", category: "stickers" },
        { id: 13, emoji: "🍀", category: "stickers" },
        { id: 14, emoji: "💎", category: "stickers" },
        { id: 15, emoji: "🏆", category: "stickers" },
        { id: 16, emoji: "🧸", category: "stickers" },
        { id: 17, emoji: "🎈", category: "stickers" },
        { id: 18, emoji: "🕶️", category: "stickers" },
        { id: 19, emoji: "🎒", category: "stickers" },
        { id: 20, emoji: "👒", category: "stickers" },
        { id: 21, emoji: "👑", category: "stickers" },
        { id: 22, emoji: "🕷️", category: "stickers" },
        { id: 23, emoji: "🐛", category: "stickers" },
        { id: 24, emoji: "🦋", category: "stickers" },
        { id: 25, emoji: "🐝", category: "stickers" },
        { id: 26, emoji: "🐠", category: "stickers" },
        { id: 27, emoji: "🦀", category: "stickers" },
        { id: 28, emoji: "🐙", category: "stickers" },
        { id: 29, emoji: "🧭", category: "stickers" },
        { id: 30, emoji: "🍕", category: "stickers" },
        { id: 31, emoji: "🍩", category: "stickers" },
        { id: 32, emoji: "🍪", category: "stickers" },
        { id: 33, emoji: "🍭", category: "stickers" },
        { id: 34, emoji: "🍫", category: "stickers" },
        { id: 35, emoji: "🔋", category: "stickers" },
        { id: 36, emoji: "🍿", category: "stickers" },
        { id: 37, emoji: "🧪", category: "stickers" },
        { id: 38, emoji: "🔮", category: "stickers" },
        { id: 39, emoji: "🪄", category: "stickers" },
        { id: 40, emoji: "🕯️", category: "stickers" },
        { id: 41, emoji: "🎨", category: "stickers" },
        { id: 42, emoji: "⚽", category: "stickers" }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function saveLocalData(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Database Schema Initialization (Neon)
async function initDatabase() {
  if (isUsingLocalFallback) return;

  try {
    // Accounts Table
    await sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        avatar VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Levels Table
    await sql`
      CREATE TABLE IF NOT EXISTS levels (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        creator VARCHAR(100) NOT NULL,
        background_image_url TEXT NOT NULL,
        difficulty VARCHAR(20) NOT NULL,
        game_mode VARCHAR(20) DEFAULT 'objects',
        is_custom BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Objects Table
    await sql`
      CREATE TABLE IF NOT EXISTS objects (
        id VARCHAR(100) PRIMARY KEY,
        level_id VARCHAR(100) REFERENCES levels(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        x DOUBLE PRECISION NOT NULL,
        y DOUBLE PRECISION NOT NULL,
        radius DOUBLE PRECISION NOT NULL,
        emoji VARCHAR(10),
        scale DOUBLE PRECISION DEFAULT 1,
        rotation DOUBLE PRECISION DEFAULT 0,
        opacity DOUBLE PRECISION DEFAULT 1,
        hint TEXT
      )
    `;

    // Game Assets / Stickers Table
    await sql`
      CREATE TABLE IF NOT EXISTS game_assets (
        id SERIAL PRIMARY KEY,
        emoji VARCHAR(10) NOT NULL,
        category VARCHAR(50) DEFAULT 'stickers'
      )
    `;

    // Perform schema check and migrations for older Neon DB instances
    try {
      await sql`ALTER TABLE levels ADD COLUMN IF NOT EXISTS game_mode VARCHAR(20) DEFAULT 'objects'`;
      await sql`ALTER TABLE levels ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT TRUE`;
    } catch (e) {
      console.warn("Alter table levels failed or column already exists:", e);
    }

    try {
      await sql`ALTER TABLE objects ADD COLUMN IF NOT EXISTS scale DOUBLE PRECISION DEFAULT 1`;
      await sql`ALTER TABLE objects ADD COLUMN IF NOT EXISTS rotation DOUBLE PRECISION DEFAULT 0`;
      await sql`ALTER TABLE objects ADD COLUMN IF NOT EXISTS opacity DOUBLE PRECISION DEFAULT 1`;
      await sql`ALTER TABLE objects ADD COLUMN IF NOT EXISTS hint TEXT`;
    } catch (e) {
      console.warn("Alter table objects failed or column already exists:", e);
    }

    // Populate initial stickers if table is empty
    const assetsCount = await sql`SELECT count(*) FROM game_assets`;
    if (parseInt(assetsCount[0].count) === 0) {
      const stickers = [
        "🗝️", "🔑", "⭐", "🐱", "🐶", "🐰", "🦊", "🍏", "🍎", "🍓", "🍒", "🍄", "🍀", "💎", 
        "🏆", "🧸", "🎈", "🕶️", "🎒", "👒", "👑", "🕷️", "🐛", "🦋", "🐝", "🐠", "🦀", "🐙",
        "🧭", "🍕", "🍩", "🍪", "🍭", "🍫", "🔋", "🍿", "🧪", "🔮", "🪄", "🕯️", "🎨", "⚽"
      ];
      for (const emoji of stickers) {
        await sql`INSERT INTO game_assets (emoji, category) VALUES (${emoji}, 'stickers')`;
      }
    }
  } catch (err) {
    console.error("Database schema initialization failed. Switching to Local file fallback.", err);
    isUsingLocalFallback = true;
  }
}

initDatabase();

// --- API ROUTES ---

// 1. Get Accounts Profile
app.get("/api/accounts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (isUsingLocalFallback) {
      const data = getLocalData();
      const account = data.accounts[id] || null;
      return res.json(account);
    } else {
      const result = await sql`SELECT * FROM accounts WHERE id = ${id}`;
      return res.json(result[0] || null);
    }
  } catch (err) {
    res.status(500).json({ error: "Error fetching account" });
  }
});

// 2. Save / Update Account Profile
app.post("/api/accounts", async (req, res) => {
  const { id, name, avatar } = req.body;
  if (!id || !name || !avatar) {
    return res.status(400).json({ error: "id, name, and avatar are required." });
  }

  try {
    if (isUsingLocalFallback) {
      const data = getLocalData();
      data.accounts[id] = { id, name, avatar, created_at: new Date().toISOString() };
      saveLocalData(data);
      return res.json(data.accounts[id]);
    } else {
      await sql`
        INSERT INTO accounts (id, name, avatar)
        VALUES (${id}, ${name}, ${avatar})
        ON CONFLICT (id) 
        DO UPDATE SET name = ${name}, avatar = ${avatar}
      `;
      return res.json({ id, name, avatar });
    }
  } catch (err) {
    res.status(500).json({ error: "Error saving account" });
  }
});

// 3. Get All Levels (and their objects)
app.get("/api/levels", async (req, res) => {
  try {
    if (isUsingLocalFallback) {
      const data = getLocalData();
      const levelsWithObj = data.levels.map((lvl: any) => {
        return {
          ...lvl,
          objects: data.objects.filter((obj: any) => obj.level_id === lvl.id)
        };
      });
      return res.json(levelsWithObj);
    } else {
      const dbLevels = await sql`SELECT * FROM levels ORDER BY created_at DESC`;
      const dbObjects = await sql`SELECT * FROM objects`;

      const levelsWithObj = dbLevels.map((lvl: any) => {
        return {
          id: lvl.id,
          name: lvl.name,
          creator: lvl.creator,
          isCustom: lvl.is_custom,
          backgroundImageUrl: lvl.background_image_url,
          difficulty: lvl.difficulty,
          gameMode: lvl.game_mode,
          objects: dbObjects.filter((obj: any) => obj.level_id === lvl.id)
        };
      });
      return res.json(levelsWithObj);
    }
  } catch (err) {
    console.error("Error fetching levels:", err);
    res.status(500).json({ error: "Error fetching levels" });
  }
});

// 4. Create / Update a Level
app.post("/api/levels", async (req, res) => {
  const { id, name, creator, backgroundImageUrl, difficulty, gameMode, objects } = req.body;
  if (!id || !name || !creator || !backgroundImageUrl || !difficulty || !objects) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    if (isUsingLocalFallback) {
      const data = getLocalData();
      
      // Remove level and its objects if already exists to overwrite it
      data.levels = data.levels.filter((l: any) => l.id !== id);
      data.objects = data.objects.filter((o: any) => o.level_id !== id);
      
      const newLvl = { id, name, creator, backgroundImageUrl, difficulty, gameMode, isCustom: true, created_at: new Date().toISOString() };
      data.levels.push(newLvl);

      for (const obj of objects) {
        data.objects.push({
          id: obj.id,
          level_id: id,
          name: obj.name,
          x: obj.x,
          y: obj.y,
          radius: obj.radius,
          emoji: obj.emoji,
          scale: obj.scale || 1,
          rotation: obj.rotation || 0,
          opacity: obj.opacity !== undefined ? obj.opacity : 1,
          hint: obj.hint
        });
      }

      saveLocalData(data);
      return res.json({ success: true, level: newLvl });
    } else {
      // Save Level using UPSERT
      await sql`
        INSERT INTO levels (id, name, creator, background_image_url, difficulty, game_mode)
        VALUES (${id}, ${name}, ${creator}, ${backgroundImageUrl}, ${difficulty}, ${gameMode || 'objects'})
        ON CONFLICT (id)
        DO UPDATE SET name = ${name}, creator = ${creator}, background_image_url = ${backgroundImageUrl}, difficulty = ${difficulty}, game_mode = ${gameMode || 'objects'}
      `;

      // Clear existing objects for this level first to avoid duplicates or orphaned elements
      await sql`DELETE FROM objects WHERE level_id = ${id}`;

      // Save Objects
      for (const obj of objects) {
        await sql`
          INSERT INTO objects (id, level_id, name, x, y, radius, emoji, scale, rotation, opacity, hint)
          VALUES (${obj.id}, ${id}, ${obj.name}, ${obj.x}, ${obj.y}, ${obj.radius}, ${obj.emoji || null}, ${obj.scale || 1}, ${obj.rotation || 0}, ${obj.opacity !== undefined ? obj.opacity : 1}, ${obj.hint || null})
        `;
      }

      return res.json({ success: true });
    }
  } catch (err) {
    console.error("Error saving level:", err);
    res.status(500).json({ error: "Error saving level" });
  }
});

// 5. Get Available Stickers/Assets
app.get("/api/assets", async (req, res) => {
  try {
    if (isUsingLocalFallback) {
      const data = getLocalData();
      return res.json(data.game_assets);
    } else {
      const result = await sql`SELECT emoji FROM game_assets WHERE category = 'stickers'`;
      return res.json(result);
    }
  } catch (err) {
    res.status(500).json({ error: "Error fetching assets" });
  }
});

// 6. Delete custom created level helper
app.delete("/api/levels/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (isUsingLocalFallback) {
      const data = getLocalData();
      data.levels = data.levels.filter((l: any) => l.id !== id);
      data.objects = data.objects.filter((o: any) => o.level_id !== id);
      saveLocalData(data);
      return res.json({ success: true });
    } else {
      await sql`DELETE FROM levels WHERE id = ${id}`;
      return res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: "Error deleting level" });
  }
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Express API Server listening on http://localhost:${PORT}`);
  });
}

export default app;
