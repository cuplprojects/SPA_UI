import { setupWorker } from 'msw/browser';

import userMockApi from './handlers/_user';

const handlers = [...userMockApi];
export const worker = setupWorker(...handlers);
