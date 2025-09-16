/**
 * Question Service Client (gRPC-Web)
 * ======================
 * Replace HTTP calls with gRPC-Web generated stubs
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  CreateQuestionRequest as CreateQuestionRequestDTO,
  CreateQuestionResponse as CreateQuestionResponseDTO,
  GetQuestionRequest as GetQuestionRequestDTO,
  GetQuestionResponse as GetQuestionResponseDTO,
  UpdateQuestionRequest as UpdateQuestionRequestDTO,
  UpdateQuestionResponse as UpdateQuestionResponseDTO,
  DeleteQuestionRequest as DeleteQuestionRequestDTO,
  DeleteQuestionResponse as DeleteQuestionResponseDTO,
  ListQuestionsRequest as ListQuestionsRequestDTO,
  ListQuestionsResponse as ListQuestionsResponseDTO,
  ImportQuestionsRequest as ImportQuestionsRequestDTO,
  ImportQuestionsResponse as ImportQuestionsResponseDTO,
} from '@/types/question.types';

import { GRPC_WEB_HOST, getAuthMetadata } from './client';

// Generated protobuf messages and client
import {
  CreateQuestionRequest,
  CreateQuestionResponse,
  GetQuestionRequest,
  GetQuestionResponse,
  UpdateQuestionRequest,
  UpdateQuestionResponse,
  DeleteQuestionRequest,
  DeleteQuestionResponse,
  ListQuestionsRequest,
  ListQuestionsResponse,
  ImportQuestionsRequest,
  ImportQuestionsResponse,
  AnswerList,
  Answer,
  CorrectAnswer,
  SingleAnswer,
  MultipleAnswers,
  TextAnswer,
} from '@/generated/v1/question_pb';
import { QuestionServiceClient } from '@/generated/v1/question_pb_service';
// Pagination struct is included within v1 responses; common may not export TS impl here
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { PaginationRequest as PbPaginationRequest } from '@/generated/common/common_pb';

const client = new QuestionServiceClient(GRPC_WEB_HOST);

function mapAnswerFromPb(a: import('@/generated/v1/question_pb').Answer) {
  return {
    id: a.getId(),
    content: a.getContent(),
    is_correct: a.getIsCorrect(),
    explanation: a.getExplanation() || undefined,
  } as any;
}

function mapCorrectFromPb(c?: import('@/generated/v1/question_pb').CorrectAnswer | undefined) {
  if (!c) return undefined;
  const o: any = {};
  const single = c.getSingle?.();
  const multiple = c.getMultiple?.();
  const text = c.getText?.();
  if (single) o.single = { answer_id: single.getAnswerId() };
  if (multiple) o.multiple = { answer_ids: multiple.getAnswerIdsList() };
  if (text) o.text = { text: text.getText() };
  return o;
}

function mapQuestionFromPb(q: import('@/generated/v1/question_pb').Question) {
  return {
    id: q.getId(),
    raw_content: q.getRawContent(),
    content: q.getContent(),
    subcount: q.getSubcount(),
    type: q.getType(),
    source: q.getSource(),
    structured_answers: q.getStructuredAnswers()?.getAnswersList().map(mapAnswerFromPb),
    json_answers: q.getJsonAnswers() || undefined,
    structured_correct: mapCorrectFromPb(q.getStructuredCorrect?.()),
    json_correct_answer: q.getJsonCorrectAnswer() || undefined,
    solution: q.getSolution() || undefined,
    tag: q.getTagList(),
    usage_count: q.getUsageCount(),
    creator: q.getCreator(),
    status: q.getStatus(),
    feedback: q.getFeedback(),
    difficulty: q.getDifficulty(),
    question_code_id: q.getQuestionCodeId(),
    created_at: q.getCreatedAt(),
    updated_at: q.getUpdatedAt(),
  } as any;
}

function toCreateReq(dto: CreateQuestionRequestDTO): CreateQuestionRequest {
  const req = new CreateQuestionRequest();
  req.setRawContent(dto.raw_content);
  req.setContent(dto.content);
  req.setSubcount(dto.subcount);
  req.setType(dto.type as any);
  req.setSource(dto.source);
  if (dto.structured_answers && dto.structured_answers.length > 0) {
    const al = new AnswerList();
    const answers = dto.structured_answers.map(a => {
      const pa = new Answer();
      pa.setId(a.id);
      pa.setContent(a.content);
      pa.setIsCorrect(!!a.is_correct);
      if (a.explanation) pa.setExplanation(a.explanation);
      return pa;
    });
    al.setAnswersList(answers);
    // generated type might not have TS types for oneofs in some setups
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    req.setStructuredAnswers(al);
  }
  if (dto.json_answers) req.setJsonAnswers(dto.json_answers);
  if (dto.structured_correct) {
    const c = new CorrectAnswer();
    if (dto.structured_correct.single) {
      const s = new SingleAnswer();
      s.setAnswerId(dto.structured_correct.single.answer_id);
      c.setSingle(s);
    }
    if (dto.structured_correct.multiple) {
      const m = new MultipleAnswers();
      m.setAnswerIdsList(dto.structured_correct.multiple.answer_ids);
      c.setMultiple(m);
    }
    if (dto.structured_correct.text) {
      const t = new TextAnswer();
      t.setText(dto.structured_correct.text.text);
      c.setText(t);
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    req.setStructuredCorrect(c);
  }
  if (dto.json_correct_answer) req.setJsonCorrectAnswer(dto.json_correct_answer);
  if (dto.solution) req.setSolution(dto.solution);
  req.setTagList(dto.tag || []);
  req.setQuestionCodeId(dto.question_code_id);
  req.setStatus(dto.status as any);
  req.setDifficulty(dto.difficulty as any);
  req.setCreator(dto.creator);
  return req;
}

function toUpdateReq(dto: UpdateQuestionRequestDTO): UpdateQuestionRequest {
  const req = new UpdateQuestionRequest();
  req.setId(dto.id);
  req.setRawContent(dto.raw_content);
  req.setContent(dto.content);
  req.setSubcount(dto.subcount);
  req.setType(dto.type as any);
  req.setSource(dto.source);
  if (dto.json_answers) req.setJsonAnswers(dto.json_answers);
  if (dto.json_correct_answer) req.setJsonCorrectAnswer(dto.json_correct_answer);
  if (dto.solution) req.setSolution(dto.solution);
  req.setTagList(dto.tag || []);
  req.setQuestionCodeId(dto.question_code_id);
  req.setStatus(dto.status as any);
  req.setDifficulty(dto.difficulty as any);
  return req;
}

export class QuestionService {
  static async createQuestion(dto: CreateQuestionRequestDTO): Promise<CreateQuestionResponseDTO> {
    const req = toCreateReq(dto);
    return new Promise((resolve, reject) => {
      client.createQuestion(req, getAuthMetadata(), (err, res) => {
        if (err) return reject(err);
        const msg = res as CreateQuestionResponse;
        resolve({
          success: msg.getResponse()?.getSuccess?.() ?? true,
          message: msg.getResponse()?.getMessage?.() ?? '',
          errors: msg.getResponse()?.getErrorsList?.() ?? [],
          question: msg.getQuestion()?.toObject() as any,
        });
      });
    });
  }

  static async getQuestion(dto: GetQuestionRequestDTO): Promise<GetQuestionResponseDTO> {
    const req = new GetQuestionRequest();
    req.setId(dto.id);
    return new Promise((resolve, reject) => {
      client.getQuestion(req, getAuthMetadata(), (err, res) => {
        if (err) return reject(err);
        const msg = res as GetQuestionResponse;
        const q = msg.getQuestion();
        resolve({
          success: msg.getResponse()?.getSuccess?.() ?? true,
          message: msg.getResponse()?.getMessage?.() ?? '',
          errors: msg.getResponse()?.getErrorsList?.() ?? [],
          question: q ? mapQuestionFromPb(q) : undefined,
        });
      });
    });
  }

  static async updateQuestion(dto: UpdateQuestionRequestDTO): Promise<UpdateQuestionResponseDTO> {
    const req = toUpdateReq(dto);
    return new Promise((resolve, reject) => {
      client.updateQuestion(req, getAuthMetadata(), (err, res) => {
        if (err) return reject(err);
        const msg = res as UpdateQuestionResponse;
        const q = msg.getQuestion();
        resolve({
          success: msg.getResponse()?.getSuccess?.() ?? true,
          message: msg.getResponse()?.getMessage?.() ?? '',
          errors: msg.getResponse()?.getErrorsList?.() ?? [],
          question: q ? mapQuestionFromPb(q) : undefined,
        });
      });
    });
  }

  static async deleteQuestion(dto: DeleteQuestionRequestDTO): Promise<DeleteQuestionResponseDTO> {
    const req = new DeleteQuestionRequest();
    req.setId(dto.id);
    return new Promise((resolve, reject) => {
      client.deleteQuestion(req, getAuthMetadata(), (err, res) => {
        if (err) return reject(err);
        const msg = res as DeleteQuestionResponse;
        resolve({
          success: msg.getResponse()?.getSuccess?.() ?? true,
          message: msg.getResponse()?.getMessage?.() ?? '',
          errors: msg.getResponse()?.getErrorsList?.() ?? [],
        });
      });
    });
  }

  static async listQuestions(dto: ListQuestionsRequestDTO = {}): Promise<ListQuestionsResponseDTO> {
    const req = new ListQuestionsRequest();
    if (dto.pagination) {
      // In current generated output, PaginationRequest class might not be emitted.
      // Fallback: rely on server defaults if constructor not present.
      // If in future it exists, you can attach it here similarly.
    }
    return new Promise((resolve, reject) => {
      client.listQuestions(req, getAuthMetadata(), (err, res) => {
        if (err) return reject(err);
        const msg = res as ListQuestionsResponse;
        const pg = msg.getPagination();
        resolve({
          success: msg.getResponse()?.getSuccess?.() ?? true,
          message: msg.getResponse()?.getMessage?.() ?? '',
          errors: msg.getResponse()?.getErrorsList?.() ?? [],
          questions: msg.getQuestionsList().map(mapQuestionFromPb),
          pagination: pg ? {
            page: pg.getPage(),
            limit: pg.getLimit(),
            total_count: pg.getTotalCount(),
            total_pages: pg.getTotalPages(),
          } : undefined,
        });
      });
    });
  }

  static async importQuestions(dto: ImportQuestionsRequestDTO): Promise<ImportQuestionsResponseDTO> {
    const req = new ImportQuestionsRequest();
    req.setCsvDataBase64(dto.csv_data_base64);
    req.setUpsertMode(dto.upsert_mode);
    return new Promise((resolve, reject) => {
      client.importQuestions(req, getAuthMetadata(), (err, res) => {
        if (err) return reject(err);
        const msg = res as ImportQuestionsResponse;
        resolve({
          success: msg.getResponse()?.getSuccess?.() ?? true,
          message: msg.getResponse()?.getMessage?.() ?? '',
          total_processed: msg.getTotalProcessed(),
          created_count: msg.getCreatedCount(),
          updated_count: msg.getUpdatedCount(),
          error_count: msg.getErrorCount(),
          errors: msg.getErrorsList().map(e => e.toObject() as any),
          summary: msg.getSummary(),
        } as any);
      });
    });
  }
}

export class QuestionHelpers {
  static getTypeDisplayName(type: string): string {
    switch (type) {
      case 'MC': return 'Trắc nghiệm';
      case 'TF': return 'Đúng/Sai';
      case 'SA': return 'Trả lời ngắn';
      case 'ES': return 'Tự luận';
      case 'MA': return 'Trắc nghiệm nhiều đáp án';
      default: return type;
    }
  }
  static getDifficultyDisplayName(difficulty: string): string {
    switch (difficulty) {
      case 'EASY': return 'Dễ';
      case 'MEDIUM': return 'Trung bình';
      case 'HARD': return 'Khó';
      default: return difficulty;
    }
  }
  static getStatusDisplayName(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'Hoạt động';
      case 'PENDING': return 'Đang chờ';
      case 'INACTIVE': return 'Không hoạt động';
      case 'ARCHIVED': return 'Đã lưu trữ';
      default: return status;
    }
  }
  static getTypeOptions() {
    return [
      { value: 'MC', label: 'Trắc nghiệm' },
      { value: 'TF', label: 'Đúng/Sai' },
      { value: 'SA', label: 'Trả lời ngắn' },
      { value: 'ES', label: 'Tự luận' },
      { value: 'MA', label: 'Trắc nghiệm nhiều đáp án' },
    ];
  }
  static getDifficultyOptions() {
    return [
      { value: 'EASY', label: 'Dễ' },
      { value: 'MEDIUM', label: 'Trung bình' },
      { value: 'HARD', label: 'Khó' },
    ];
  }
  static getStatusOptions() {
    return [
      { value: 'ACTIVE', label: 'Hoạt động' },
      { value: 'PENDING', label: 'Đang chờ' },
      { value: 'INACTIVE', label: 'Không hoạt động' },
      { value: 'ARCHIVED', label: 'Đã lưu trữ' },
    ];
  }
}
