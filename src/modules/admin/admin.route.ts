import passport from 'passport';

import { NextFunction, Request, Response, Router } from 'express';

import { AdminController } from './admin.controller';
import { NotFoundException } from '../../exceptions/not-found-exception';

const adminController = new AdminController();

/**
 * Admin Route
 */
export class AdminRoute {
  public path = '/admins';
  public router = Router();

  adminJwt = passport.authenticate('admin-jwt', { session: false });
  adminLocal = passport.authenticate('admin-local', {
    session: false
  });

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, [this.adminJwt], this.getAll);

    this.router.get(`${this.path}/:adminId`, [this.adminJwt], this.getById);

    this.router.patch(`${this.path}/:adminId`, [this.adminJwt], this.update);

    this.router.delete(`${this.path}/:adminId`, [this.adminJwt], this.delete);
  }

  async getAll(request: Request, response: Response, next: NextFunction) {
    const admins = await adminController.getAll();
    response.status(200).json({
      success: true,
      data: admins,
      message: null
    });
  }

  async getById(request: Request, response: Response, next: NextFunction) {
    const admin = await adminController.getById(request.params.adminId);
    if (admin == null) {
      next(
        new NotFoundException(
          `Admin by the id of ${request.params.adminId} was not found`
        )
      );
    } else {
      response.status(200).json({
        success: true,
        data: admin,
        message: null
      });
    }
  }

  async update(request: Request, response: Response, next: NextFunction) {
    const admin = await adminController.getById(request.params.adminId);
    if (admin == null) {
      next(
        new NotFoundException(
          `Admin by the id of ${request.params.adminId} was not found`
        )
      );
    } else {
      const updatedAdmin = await adminController.update(
        request.params.adminId,
        request.body
      );
      response.status(200).json({
        success: true,
        data: updatedAdmin,
        message: null
      });
    }
  }

  async delete(request: Request, response: Response, next: NextFunction) {
    const admin = await adminController.getById(request.params.adminId);
    if (admin == null) {
      next(
        new NotFoundException(
          `Admin by the id of ${request.params.adminId} was not found`
        )
      );
    } else {
      const message = await adminController.delete(request.params.adminId);
      response.status(200).json({
        success: true,
        data: {},
        message: message
      });
    }
  }
}
