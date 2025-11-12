import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import dotenv from 'dotenv';
import { db, initializeDatabase } from './database.js';

dotenv.config();

interface Question {
  question_number: number;
  image_url?: string;
  choices: string[];
  answer: number;
}

interface Answer {
  question_number: number;
  selected_answer: number;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

// 업로드 디렉토리 생성
const uploadsDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer 설정 (이미지 업로드)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다 (jpeg, jpg, png, gif)'));
    }
  }
});

// 데이터베이스 초기화
initializeDatabase();

// 미들웨어
app.use(cors());
app.use(express.json());

// 정적 파일 제공 (업로드된 이미지)
app.use('/uploads', express.static(uploadsDir));

// ============ 관리자 API ============

// 관리자 로그인
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  const stmt = db.prepare('SELECT * FROM admins WHERE username = ? AND password = ?');
  const admin = stmt.get(username, password);

  if (admin) {
    res.json({ success: true, message: '로그인 성공' });
  } else {
    res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다' });
  }
});

// 이미지 업로드
app.post('/api/admin/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: '이미지 파일이 없습니다' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, imageUrl });
});

// 시험지 생성/수정
app.post('/api/admin/test-papers', (req, res) => {
  const { grade, semester, questions } = req.body;

  // 유효성 검사
  if (!grade || !semester || !questions || questions.length === 0) {
    return res.status(400).json({ success: false, message: '잘못된 요청입니다' });
  }

  try {
    // 기존 시험지 확인
    const existing = db.prepare('SELECT id FROM test_papers WHERE grade = ? AND semester = ?').get(grade, semester);

    if (existing) {
      // 업데이트
      const stmt = db.prepare('UPDATE test_papers SET questions = ?, created_at = CURRENT_TIMESTAMP WHERE grade = ? AND semester = ?');
      stmt.run(JSON.stringify(questions), grade, semester);
      res.json({ success: true, message: '시험지가 수정되었습니다', id: existing.id });
    } else {
      // 새로 생성
      const stmt = db.prepare('INSERT INTO test_papers (grade, semester, questions) VALUES (?, ?, ?)');
      const result = stmt.run(grade, semester, JSON.stringify(questions));
      res.json({ success: true, message: '시험지가 생성되었습니다', id: result.lastInsertRowid });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '시험지 저장에 실패했습니다' });
  }
});

// 시험지 조회 (특정 학년/학기)
app.get('/api/admin/test-papers/:grade/:semester', (req, res) => {
  const { grade, semester } = req.params;

  const stmt = db.prepare('SELECT * FROM test_papers WHERE grade = ? AND semester = ?');
  const paper = stmt.get(grade, semester);

  if (paper) {
    res.json({ success: true, data: { ...paper, questions: JSON.parse(paper.questions as string) } });
  } else {
    res.status(404).json({ success: false, message: '시험지가 없습니다' });
  }
});

// 모든 시험지 목록
app.get('/api/admin/test-papers', (req, res) => {
  const stmt = db.prepare('SELECT id, grade, semester, created_at FROM test_papers ORDER BY grade, semester');
  const papers = stmt.all();
  res.json({ success: true, data: papers });
});

// 학생 결과 목록 조회
app.get('/api/admin/results', (req, res) => {
  const { search, grade, semester } = req.query;

  let query = 'SELECT * FROM test_results';
  const conditions: string[] = [];
  const params: any[] = [];

  if (search) {
    conditions.push('(student_name LIKE ? OR student_phone LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (grade) {
    conditions.push('grade = ?');
    params.push(grade);
  }

  if (semester) {
    conditions.push('semester = ?');
    params.push(semester);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY taken_at DESC';

  const stmt = db.prepare(query);
  const results = stmt.all(...params);

  res.json({ success: true, data: results });
});

// 특정 학생의 응시 이력
app.get('/api/admin/results/student/:name/:phone', (req, res) => {
  const { name, phone } = req.params;

  const stmt = db.prepare('SELECT * FROM test_results WHERE student_name = ? AND student_phone = ? ORDER BY taken_at DESC');
  const results = stmt.all(name, phone);

  res.json({ success: true, data: results });
});

// 특정 응시 결과 상세 조회
app.get('/api/admin/results/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare(`
    SELECT tr.*, tp.questions
    FROM test_results tr
    JOIN test_papers tp ON tr.test_paper_id = tp.id
    WHERE tr.id = ?
  `);
  const result: any = stmt.get(id);

  if (result) {
    res.json({
      success: true,
      data: {
        ...result,
        answers: JSON.parse(result.answers),
        questions: JSON.parse(result.questions)
      }
    });
  } else {
    res.status(404).json({ success: false, message: '결과를 찾을 수 없습니다' });
  }
});

// ============ 학생 API ============

// 시험지 확인 및 조회
app.get('/api/test-papers/:grade/:semester', (req, res) => {
  const { grade, semester } = req.params;

  const stmt = db.prepare('SELECT * FROM test_papers WHERE grade = ? AND semester = ?');
  const paper = stmt.get(grade, semester);

  if (paper) {
    // 학생에게는 정답을 제외한 문제만 제공
    const questions: Question[] = JSON.parse(paper.questions as string);
    const questionsWithoutAnswers = questions.map(q => ({
      question_number: q.question_number,
      image_url: q.image_url,
      choices: q.choices
    }));

    res.json({
      success: true,
      data: {
        id: paper.id,
        grade: paper.grade,
        semester: paper.semester,
        questions: questionsWithoutAnswers
      }
    });
  } else {
    res.status(404).json({ success: false, message: '해당 학년/학기의 시험지가 없습니다. 관리자에게 문의해주세요.' });
  }
});

// 테스트 제출 및 채점
app.post('/api/submit-test', (req, res) => {
  const { student_name, student_phone, grade, semester, test_paper_id, answers } = req.body;

  // 유효성 검사
  if (!student_name || !student_phone || !grade || !semester || !test_paper_id || !answers) {
    return res.status(400).json({ success: false, message: '잘못된 요청입니다' });
  }

  try {
    // 시험지 조회
    const stmt = db.prepare('SELECT questions FROM test_papers WHERE id = ?');
    const paper: any = stmt.get(test_paper_id);

    if (!paper) {
      return res.status(404).json({ success: false, message: '시험지를 찾을 수 없습니다' });
    }

    // 채점
    const questions: Question[] = JSON.parse(paper.questions);
    const totalQuestions = questions.length;
    let correct_count = 0;

    answers.forEach((answer: Answer) => {
      const question = questions.find(q => q.question_number === answer.question_number);
      if (question && question.answer === answer.selected_answer) {
        correct_count++;
      }
    });

    // 동적 배점 계산 (100점 만점)
    const score = Math.round((correct_count / totalQuestions) * 100);

    // 결과 저장
    const insertStmt = db.prepare(`
      INSERT INTO test_results (student_name, student_phone, grade, semester, test_paper_id, answers, score, correct_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = insertStmt.run(
      student_name,
      student_phone,
      grade,
      semester,
      test_paper_id,
      JSON.stringify(answers),
      score,
      correct_count
    );

    res.json({
      success: true,
      data: {
        id: result.lastInsertRowid,
        score,
        correct_count,
        total: totalQuestions
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '채점에 실패했습니다' });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
