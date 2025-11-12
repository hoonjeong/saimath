import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 데이터 디렉토리 생성
const dataDir = path.join(__dirname, '..', process.env.DB_PATH?.replace('./data/', 'data') || 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 데이터베이스 파일 경로
const dbPath = path.join(dataDir, 'saimath.db');

// 데이터베이스 연결
export const db = new Database(dbPath, { verbose: console.log });

// 데이터베이스 초기화
export function initializeDatabase() {
  // 시험지 테이블 생성
  db.exec(`
    CREATE TABLE IF NOT EXISTS test_papers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      grade INTEGER NOT NULL CHECK(grade BETWEEN 1 AND 6),
      semester INTEGER NOT NULL CHECK(semester IN (1, 2)),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      questions TEXT NOT NULL,
      UNIQUE(grade, semester)
    )
  `);

  // 응시 결과 테이블 생성
  db.exec(`
    CREATE TABLE IF NOT EXISTS test_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_name TEXT NOT NULL,
      student_phone TEXT NOT NULL,
      grade INTEGER NOT NULL,
      semester INTEGER NOT NULL,
      test_paper_id INTEGER NOT NULL,
      taken_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      answers TEXT NOT NULL,
      score INTEGER NOT NULL,
      correct_count INTEGER NOT NULL,
      FOREIGN KEY (test_paper_id) REFERENCES test_papers(id)
    )
  `);

  // 관리자 테이블 생성 (간단한 인증용)
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 기본 관리자 계정 생성
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const stmt = db.prepare('INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)');
  stmt.run(adminUsername, adminPassword); // 실제로는 bcrypt로 해시해야 하지만 MVP에서는 단순화

  console.log('Database initialized successfully');
}

// 데이터베이스 타입 정의
export interface TestPaper {
  id: number;
  grade: number;
  semester: number;
  created_at: string;
  questions: string; // JSON string
}

export interface Question {
  question_number: number;
  image_url?: string;
  choices: string[];
  answer: number; // 1-4
}

export interface TestResult {
  id: number;
  student_name: string;
  student_phone: string;
  grade: number;
  semester: number;
  test_paper_id: number;
  taken_at: string;
  answers: string; // JSON string
  score: number;
  correct_count: number;
}

export interface Answer {
  question_number: number;
  selected_answer: number;
}
