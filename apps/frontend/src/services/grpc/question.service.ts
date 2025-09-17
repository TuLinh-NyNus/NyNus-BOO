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

// TODO: Re-enable when protobuf files are generated
// import { GRPC_WEB_HOST, getAuthMetadata } from './client';

// Generated protobuf messages and client
// TODO: Temporarily disabled due to missing question_pb.js file
// These imports need proper protobuf generation to work
/*
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
*/
// Pagination struct is included within v1 responses; common may not export TS impl here
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { PaginationRequest as PbPaginationRequest } from '@/generated/common/common_pb';

// TODO: Temporarily disabled - need proper protobuf generation
/*
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

*/

// Temporary stub implementation for QuestionService
export class QuestionService {
  static async createQuestion(_dto: CreateQuestionRequestDTO): Promise<CreateQuestionResponseDTO> {
    // TODO: Implement with proper gRPC when protobuf files are generated
    console.warn('QuestionService.createQuestion is stubbed - need protobuf generation');
    return Promise.resolve({
      success: false,
      message: 'Service temporarily unavailable',
      errors: ['Protobuf files not generated'],
      question: undefined
    });
  }

  static async getQuestion(_dto: GetQuestionRequestDTO): Promise<GetQuestionResponseDTO> {
    console.warn('QuestionService.getQuestion is stubbed - need protobuf generation');
    return Promise.resolve({
      success: false,
      message: 'Service temporarily unavailable',
      errors: ['Protobuf files not generated'],
      question: undefined
    });
  }

  static async updateQuestion(_dto: UpdateQuestionRequestDTO): Promise<UpdateQuestionResponseDTO> {
    console.warn('QuestionService.updateQuestion is stubbed - need protobuf generation');
    return Promise.resolve({
      success: false,
      message: 'Service temporarily unavailable',
      errors: ['Protobuf files not generated'],
      question: undefined
    });
  }

  static async deleteQuestion(_dto: DeleteQuestionRequestDTO): Promise<DeleteQuestionResponseDTO> {
    console.warn('QuestionService.deleteQuestion is stubbed - need protobuf generation');
    return Promise.resolve({
      success: false,
      message: 'Service temporarily unavailable',
      errors: ['Protobuf files not generated']
    });
  }

  static async listQuestions(_dto: ListQuestionsRequestDTO = {}): Promise<ListQuestionsResponseDTO> {
    console.warn('QuestionService.listQuestions is stubbed - need protobuf generation');
    return Promise.resolve({
      success: false,
      message: 'Service temporarily unavailable',
      errors: ['Protobuf files not generated'],
      questions: [],
      pagination: undefined
    });
  }

  static async importQuestions(_dto: ImportQuestionsRequestDTO): Promise<ImportQuestionsResponseDTO> {
    console.warn('QuestionService.importQuestions is stubbed - need protobuf generation');
    return Promise.resolve({
      success: false,
      message: 'Service temporarily unavailable',
      total_processed: 0,
      created_count: 0,
      updated_count: 0,
      error_count: 0,
      errors: [],
      summary: 'Protobuf files not generated'
    } as any);
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
