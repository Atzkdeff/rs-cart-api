import { AppRequest } from '../models';

const TEST_USER_ID = "f508fa06-9f19-4850-bec5-8a7ad72850dc";
/**
 * @param {AppRequest} request
 * @returns {string}
 */
export function getUserIdFromRequest(request: AppRequest): string {
  return (request.user && request.user.id) ?? TEST_USER_ID;
}
