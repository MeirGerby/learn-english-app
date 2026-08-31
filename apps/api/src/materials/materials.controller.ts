import { Controller, Get, Param, Query, Res, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { MaterialsService, MaterialNotFoundError } from './materials.service.js';
import type { JwtPayload } from '../auth/trpc-context.js';

// A plain REST endpoint, not a tRPC procedure - browsers don't attach the
// localStorage-held JWT to a bare <a href>/<iframe src> navigation the way
// the tRPC client attaches it as an Authorization header, so the token is
// passed as a query param here instead and verified manually. Matches
// CoursePage's own security level for course video/image URLs (login
// required to view, no per-request admin check) rather than inventing a
// stricter model just because this happens to be a new endpoint.
@Controller('materials')
export class MaterialsController {
  constructor(
    private readonly materialsService: MaterialsService,
    private readonly jwtService: JwtService,
  ) {}

  @Get(':id/file')
  async getFile(@Param('id') id: string, @Query('token') token: string | undefined, @Res() res: Response) {
    if (!token) {
      throw new UnauthorizedException('Missing token.');
    }
    try {
      this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    try {
      const { filename, buffer } = await this.materialsService.getFileForDownload(id);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': buffer.length.toString(),
      });
      res.send(buffer);
    } catch (error) {
      if (error instanceof MaterialNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
