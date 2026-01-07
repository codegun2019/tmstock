/**
 * Permission Guard Example
 * Example: Guard for checking user permissions
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from '../services/PermissionService';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ⭐ Get required permission from decorator
    const requiredPermission = this.reflector.get<string>(
      'permission',
      context.getHandler(),
    );

    // ⭐ If no permission required, allow
    if (!requiredPermission) {
      return true;
    }

    // ⭐ Get user from request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // ⭐ Check permission
    const hasPermission = await this.permissionService.hasPermission(
      user.id,
      requiredPermission,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Permission denied: ${requiredPermission}`,
      );
    }

    return true;
  }
}

/**
 * Decorator for requiring permission
 */
import { SetMetadata } from '@nestjs/common';

export const RequirePermission = (permission: string) =>
  SetMetadata('permission', permission);

