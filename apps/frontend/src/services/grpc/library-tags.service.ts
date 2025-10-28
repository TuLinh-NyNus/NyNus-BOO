/**
 * Library Tags Service
 * Handles all tag-related API operations
 */

import { LibraryServiceClient } from '@/generated/v1/LibraryServiceClientPb';
import {
  CreateTagRequest,
  GetTagRequest,
  ListTagsRequest,
  UpdateTagRequest,
  DeleteTagRequest,
  GetPopularTagsRequest,
  Tag,
} from '@/generated/v1/library_pb';
import { BoolValue } from 'google-protobuf/google/protobuf/wrappers_pb';

const client = new LibraryServiceClient(
  process.env.NEXT_PUBLIC_GRPC_URL || 'http://localhost:8080',
  null,
  null
);

export interface TagData {
  id?: string;
  name: string;
  description?: string;
  color?: string;
  isTrending?: boolean;
  usageCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ListTagsParams {
  search?: string;
  isTrending?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Create a new tag
 */
export async function createTag(data: TagData): Promise<Tag.AsObject> {
  const request = new CreateTagRequest();
  request.setName(data.name);
  if (data.description) request.setDescription(data.description);
  if (data.color) request.setColor(data.color);
  if (data.isTrending !== undefined) request.setIsTrending(data.isTrending);

  const response = await client.createTag(request, {});
  const tag = response.getTag();
  
  if (!tag) {
    throw new Error('No tag returned from server');
  }

  return tag.toObject();
}

/**
 * Get a tag by ID
 */
export async function getTag(tagId: string): Promise<Tag.AsObject> {
  const request = new GetTagRequest();
  request.setId(tagId);

  const response = await client.getTag(request, {});
  const tag = response.getTag();

  if (!tag) {
    throw new Error('Tag not found');
  }

  return tag.toObject();
}

/**
 * List tags with filters
 */
export async function listTags(params: ListTagsParams = {}): Promise<{
  tags: Tag.AsObject[];
  total: number;
}> {
  const request = new ListTagsRequest();
  
  if (params.search) request.setSearch(params.search);
  if (params.isTrending !== undefined) {
    const boolValue = new BoolValue();
    boolValue.setValue(params.isTrending);
    request.setIsTrending(boolValue);
  }
  if (params.limit) request.setLimit(params.limit);
  if (params.offset) request.setOffset(params.offset);

  const response = await client.listTags(request, {});
  
  return {
    tags: response.getTagsList().map(tag => tag.toObject()),
    total: response.getTotal(),
  };
}

/**
 * Update a tag
 */
export async function updateTag(tagId: string, data: Partial<TagData>): Promise<Tag.AsObject> {
  const request = new UpdateTagRequest();
  request.setId(tagId);
  
  if (data.name) request.setName(data.name);
  if (data.description) request.setDescription(data.description);
  if (data.color) request.setColor(data.color);
  if (data.isTrending !== undefined) request.setIsTrending(data.isTrending);

  const response = await client.updateTag(request, {});
  const tag = response.getTag();

  if (!tag) {
    throw new Error('No tag returned from server');
  }

  return tag.toObject();
}

/**
 * Delete a tag
 */
export async function deleteTag(tagId: string): Promise<void> {
  const request = new DeleteTagRequest();
  request.setId(tagId);

  await client.deleteTag(request, {});
}

/**
 * Get popular tags
 */
export async function getPopularTags(limit: number = 20): Promise<Tag.AsObject[]> {
  const request = new GetPopularTagsRequest();
  request.setLimit(limit);

  const response = await client.getPopularTags(request, {});
  
  return response.getTagsList().map(tag => tag.toObject());
}

/**
 * Toggle trending status of a tag (admin only)
 */
export async function toggleTrending(tagId: string, isTrending: boolean): Promise<Tag.AsObject> {
  return updateTag(tagId, { isTrending });
}

