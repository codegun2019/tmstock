/**
 * Branch Scope Guard Example
 * Example: Guard for enforcing branch-level access control
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class BranchScopeGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // ⭐ Admin can access all branches
    if (user.is_admin) {
      return true;
    }

    // ⭐ Get branch_id from request (body, params, or query)
    const branchId =
      request.body?.branch_id ||
      request.params?.branch_id ||
      request.query?.branch_id;

    // ⭐ If no branch_id specified, allow (will be set by service)
    if (!branchId) {
      return true;
    }

    // ⭐ Check if user has access to this branch
    if (user.branch_id !== parseInt(branchId)) {
      throw new ForbiddenException(
        'You do not have access to this branch',
      );
    }

    return true;
  }
}

