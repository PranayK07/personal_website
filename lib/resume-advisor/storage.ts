'use client';

import { openDB } from 'idb';
import {
  GeneratePreviewResponse,
  JobDescriptionAnalysis,
  LLMConfig,
  MergeRankResponse,
  ResumeParseResult,
} from '@/lib/resume-advisor/types';

const DB_NAME = 'resume-advisor-db';
const DB_VERSION = 1;

export interface AdvisorSessionRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  jdText: string;
  llmConfig?: LLMConfig;
  jdAnalysis?: JobDescriptionAnalysis;
  resumeParseResult?: ResumeParseResult;
  mergeRankResult?: MergeRankResponse;
  previewResult?: GeneratePreviewResponse;
}

interface BlobRecord {
  id: string;
  sessionId: string;
  type: 'resumePdf' | 'exportPdf' | 'exportDocx';
  blob: Blob;
  createdAt: string;
}

async function db() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('sessions')) {
        database.createObjectStore('sessions', { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains('blobs')) {
        const store = database.createObjectStore('blobs', { keyPath: 'id' });
        store.createIndex('sessionId', 'sessionId');
        store.createIndex('type', 'type');
      }
    },
  });
}

export async function saveSession(session: AdvisorSessionRecord): Promise<void> {
  const database = await db();
  await database.put('sessions', session);
}

export async function getSession(id: string): Promise<AdvisorSessionRecord | undefined> {
  const database = await db();
  return database.get('sessions', id);
}

export async function listSessions(): Promise<AdvisorSessionRecord[]> {
  const database = await db();
  const sessions = await database.getAll('sessions');

  return sessions.sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export async function saveBlob(sessionId: string, type: BlobRecord['type'], blob: Blob): Promise<string> {
  const database = await db();
  const id = `${sessionId}-${type}-${Date.now()}`;

  const record: BlobRecord = {
    id,
    sessionId,
    type,
    blob,
    createdAt: new Date().toISOString(),
  };

  await database.put('blobs', record);
  return id;
}

export async function getLatestBlobForSession(sessionId: string, type: BlobRecord['type']): Promise<Blob | undefined> {
  const database = await db();
  const all = await database.getAllFromIndex('blobs', 'sessionId', sessionId);

  const filtered = (all as BlobRecord[])
    .filter((record) => record.type === type)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return filtered[0]?.blob;
}
