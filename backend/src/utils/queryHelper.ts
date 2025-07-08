import { Request } from 'express';

export interface QueryOptions {
  filter: Record<string, any>;
  search?: string;
  page: number;
  limit: number;
  skip: number;
}

export function parseQuery(req: Request, searchableFields: string[] = []): QueryOptions {
  const { page = 1, limit = 20, search, ...filters } = req.query;
  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.max(Number(limit) || 20, 1);
  const skip = (pageNum - 1) * limitNum;

  let filter: Record<string, any> = { ...filters };

  // Convert filter values to correct types (e.g., boolean, number)
  Object.keys(filter).forEach((key) => {
    if (filter[key] === 'true') filter[key] = true;
    else if (filter[key] === 'false') filter[key] = false;
    else if (!isNaN(Number(filter[key]))) filter[key] = Number(filter[key]);
  });

  // Ensure search is string or undefined
  const searchStr = typeof search === 'string' ? search : undefined;

  // If search is present, build $or for text search
  if (searchStr && searchableFields.length > 0) {
    filter.$or = searchableFields.map((field) => ({ [field]: { $regex: searchStr, $options: 'i' } }));
  }

  return { filter, search: searchStr, page: pageNum, limit: limitNum, skip };
} 