import { Body, Delete, Get, Patch, Path, Route, Security, Tags } from 'tsoa';

import { IAdmin } from './interfaces/admin.interface';
import { AdminModel } from './schemas/admin.schema';

import { UpdateAdminDto } from './dtos/updateAdmin.dto';

/**
 * Admin Controller
 */
@Route('admins')
@Tags('Admin')
export class AdminController {
  // GET ALL ADMINS
  @Get('/')
  @Security('bearerAuth')
  public async getAll(): Promise<IAdmin[]> {
    return await AdminModel.find().select('-password');
  }

  // GET ADMIN BY ID
  @Get('/:adminId')
  @Security('bearerAuth')
  public async getById(
    @Path() adminId: string
  ): Promise<{ data: IAdmin } | any> {
    return await AdminModel.findById(adminId).select('-password');
  }

  // Find one
  public async findOne(query: any): Promise<IAdmin> {
    return await AdminModel.findOne(query).select('-password');
  }

  // Update ADMIN BY ID
  @Patch('/:adminId')
  @Security('bearerAuth')
  public async update(
    @Path() adminId: string,
    @Body() updateAdminDto: UpdateAdminDto
  ): Promise<IAdmin> {
    await AdminModel.findByIdAndUpdate(adminId, updateAdminDto);
    return await this.getById(adminId);
  }

  // DELETE ADMIN BY ID
  @Delete('/:adminId')
  @Security('bearerAuth')
  public async delete(@Path() adminId: string): Promise<String> {
    await AdminModel.findByIdAndDelete(adminId);
    return await `Admin by the id of ${adminId} is deleted.`;
  }
}
