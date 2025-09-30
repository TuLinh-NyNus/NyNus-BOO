/**
 * Question Service Client (gRPC-Web)
 * ======================
 * Uses gRPC-Web generated stubs for question management
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { QuestionServiceClient } from '@/generated/v1/QuestionServiceClientPb';
import {
  CreateQuestionRequest,
  GetQuestionRequest,
  UpdateQuestionRequest,
  DeleteQuestionRequest,
  ListQuestionsRequest,
  ImportQuestionsRequest,
  AnswerList,
  Answer,
  CorrectAnswer,
  SingleAnswer,
  MultipleAnswers,
  TextAnswer,
  Question,
} from '@/generated/v1/question_pb';
import { PaginationRequest } from '@/generated/common/common_pb';
import { RpcError } from 'grpc-web';

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

import { getGrpcUrl } from '@/lib/config/endpoints';

// gRPC client configuration
const GRPC_ENDPOINT = getGrpcUrl();
const questionServiceClient = new QuestionServiceClient(GRPC_ENDPOINT);

// Helper to get auth metadata
function getAuthMetadata(): { [key: string]: string } {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nynus-auth-token');
    if (token) {
      return { 'authorization': `Bearer ${token}` };
    }
  }
  return {};
}

// Handle gRPC errors
function handleGrpcError(error: RpcError): string {
  console.error('gRPC Error:', error);
  switch (error.code) {
    case 3: return error.message || 'Invalid input provided';
    case 7: return 'Permission denied';
    case 14: return 'Service temporarily unavailable';
    case 16: return 'Authentication required';
    default: return error.message || 'An unexpected error occurred';
  }
}

// Map Answer to protobuf
function mapAnswerToPb(a: any): Answer {
  const answer = new Answer();
  answer.setId(a.id);
  answer.setContent(a.content);
  answer.setIsCorrect(!!a.is_correct);
  if (a.explanation) answer.setExplanation(a.explanation);
  return answer;
}

// Map CorrectAnswer to protobuf
function mapCorrectToPb(c: any): CorrectAnswer | undefined {
  if (!c) return undefined;
  const correct = new CorrectAnswer();
  if (c.single) {
    const single = new SingleAnswer();
    single.setAnswerId(c.single.answer_id);
    correct.setSingle(single);
  }
  if (c.multiple) {
    const multiple = new MultipleAnswers();
    multiple.setAnswerIdsList(c.multiple.answer_ids);
    correct.setMultiple(multiple);
  }
  if (c.text) {
    const text = new TextAnswer();
    text.setText(c.text.text);
    correct.setText(text);
  }
  return correct;
}

// Map Question from protobuf
function mapQuestionFromPb(q: Question): any {
  const result: any = {
    id: q.getId(),
    raw_content: q.getRawContent(),
    content: q.getContent(),
    subcount: q.getSubcount(),
    type: q.getType(),
    source: q.getSource(),
    solution: q.getSolution(),
    tag: q.getTagList(),
    usage_count: q.getUsageCount(),
    creator: q.getCreator(),
    status: q.getStatus(),
    feedback: q.getFeedback(),
    difficulty: q.getDifficulty(),
    question_code_id: q.getQuestionCodeId(),
    created_at: q.getCreatedAt(),
    updated_at: q.getUpdatedAt(),
  };

  const structuredAnswers = q.getStructuredAnswers();
  if (structuredAnswers) {
    result.structured_answers = structuredAnswers.getAnswersList().map((a: Answer) => ({
      id: a.getId(),
      content: a.getContent(),
      is_correct: a.getIsCorrect(),
      explanation: a.getExplanation() || undefined,
    }));
  }

  const jsonAnswers = q.getJsonAnswers();
  if (jsonAnswers) {
    result.json_answers = jsonAnswers;
  }

  const structuredCorrect = q.getStructuredCorrect();
  if (structuredCorrect) {
    const correct: any = {};
    const single = structuredCorrect.getSingle();
    const multiple = structuredCorrect.getMultiple();
    const text = structuredCorrect.getText();
    
    if (single) correct.single = { answer_id: single.getAnswerId() };
    if (multiple) correct.multiple = { answer_ids: multiple.getAnswerIdsList() };
    if (text) correct.text = { text: text.getText() };
    result.structured_correct = correct;
  }

  const jsonCorrect = q.getJsonCorrectAnswer();
  if (jsonCorrect) {
    result.json_correct_answer = jsonCorrect;
  }

  return result;
}

export class QuestionService {
  static async createQuestion(dto: any): Promise<any> {
    try {
      const request = new CreateQuestionRequest();
      request.setRawContent(dto.raw_content);
      request.setContent(dto.content);
      request.setSubcount(dto.subcount);
      request.setType(dto.type);
      request.setSource(dto.source);
      
      if (dto.structured_answers && dto.structured_answers.length > 0) {
        const answerList = new AnswerList();
        answerList.setAnswersList(dto.structured_answers.map(mapAnswerToPb));
        request.setStructuredAnswers(answerList);
      }
      
      if (dto.json_answers) {
        request.setJsonAnswers(dto.json_answers);
      }
      
      const correct = mapCorrectToPb(dto.structured_correct);
      if (correct) {
        request.setStructuredCorrect(correct);
      }
      
      if (dto.json_correct_answer) {
        request.setJsonCorrectAnswer(dto.json_correct_answer);
      }
      
      if (dto.solution) request.setSolution(dto.solution);
      if (dto.tag) request.setTagList(dto.tag);
      request.setQuestionCodeId(dto.question_code_id || '');
      request.setStatus(dto.status || 0);
      request.setDifficulty(dto.difficulty || 0);
      request.setCreator(dto.creator || '');

      const response = await questionServiceClient.createQuestion(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        question: responseObj.question ? mapQuestionFromPb(response.getQuestion()!) : undefined
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        question: undefined
      };
    }
  }

  static async getQuestion(dto: any): Promise<any> {
    try {
      const request = new GetQuestionRequest();
      request.setId(dto.id);

      const response = await questionServiceClient.getQuestion(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        question: responseObj.question ? mapQuestionFromPb(response.getQuestion()!) : undefined
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        question: undefined
      };
    }
  }

  static async updateQuestion(dto: any): Promise<any> {
    try {
      const request = new UpdateQuestionRequest();
      request.setId(dto.id);
      request.setRawContent(dto.raw_content);
      request.setContent(dto.content);
      request.setSubcount(dto.subcount);
      request.setType(dto.type);
      request.setSource(dto.source);
      
      if (dto.structured_answers && dto.structured_answers.length > 0) {
        const answerList = new AnswerList();
        answerList.setAnswersList(dto.structured_answers.map(mapAnswerToPb));
        request.setStructuredAnswers(answerList);
      }
      
      if (dto.json_answers) {
        request.setJsonAnswers(dto.json_answers);
      }
      
      const correct = mapCorrectToPb(dto.structured_correct);
      if (correct) {
        request.setStructuredCorrect(correct);
      }
      
      if (dto.json_correct_answer) {
        request.setJsonCorrectAnswer(dto.json_correct_answer);
      }
      
      if (dto.solution) request.setSolution(dto.solution);
      if (dto.tag) request.setTagList(dto.tag);
      request.setQuestionCodeId(dto.question_code_id || '');
      request.setStatus(dto.status || 0);
      request.setDifficulty(dto.difficulty || 0);

      const response = await questionServiceClient.updateQuestion(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        question: responseObj.question ? mapQuestionFromPb(response.getQuestion()!) : undefined
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        question: undefined
      };
    }
  }

  static async deleteQuestion(dto: any): Promise<any> {
    try {
      const request = new DeleteQuestionRequest();
      request.setId(dto.id);

      const response = await questionServiceClient.deleteQuestion(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || []
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage]
      };
    }
  }

  static async listQuestions(dto: any = {}): Promise<any> {
    try {
      const request = new ListQuestionsRequest();
      
      if (dto.pagination) {
        const pagination = new PaginationRequest();
        pagination.setPage(dto.pagination.page || 1);
        pagination.setLimit(dto.pagination.limit || 10);
        request.setPagination(pagination);
      }

      const response = await questionServiceClient.listQuestions(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        errors: responseObj.response?.errorsList || [],
        questions: response.getQuestionsList().map(mapQuestionFromPb),
        pagination: responseObj.pagination
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage],
        questions: [],
        pagination: undefined
      };
    }
  }

  static async importQuestions(dto: any): Promise<any> {
    try {
      const request = new ImportQuestionsRequest();
      request.setCsvDataBase64(dto.csv_data_base64);
      request.setUpsertMode(dto.upsert_mode || false);

      const response = await questionServiceClient.importQuestions(request, getAuthMetadata());
      const responseObj = response.toObject();
      
      return {
        success: responseObj.response?.success || false,
        message: responseObj.response?.message || '',
        total_processed: responseObj.totalProcessed || 0,
        created_count: responseObj.createdCount || 0,
        updated_count: responseObj.updatedCount || 0,
        error_count: responseObj.errorCount || 0,
        errors: responseObj.errorsList || [],
        summary: responseObj.summary || ''
      };
    } catch (error) {
      const errorMessage = handleGrpcError(error as RpcError);
      return {
        success: false,
        message: errorMessage,
        total_processed: 0,
        created_count: 0,
        updated_count: 0,
        error_count: 0,
        errors: [errorMessage],
        summary: errorMessage
      };
    }
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
