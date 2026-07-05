import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Category } from '../entities/category.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Get()
    @ApiOperation({ summary: 'Get all active categories' })
    @ApiResponse({
        status: 200,
        description: 'Returns all active categories',
        type: [Category],
    })
    async findAll(): Promise<Category[]> {
        return this.categoryService.findAll();
    }

    @Get('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all categories for admin (Admin only)' })
    @ApiResponse({
        status: 200,
        description: 'Returns all categories including inactive ones',
        type: [Category],
    })
    async findAllForAdmin(): Promise<Category[]> {
        return this.categoryService.findAllForAdmin();
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create new category (Admin only)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Category name' },
                description: { type: 'string', description: 'Category description' },
                status: { type: 'number', description: 'Category status (1=active, 0=inactive)' }
            },
            required: ['name']
        }
    })
    async create(@Body() categoryData: Partial<Category>): Promise<Category> {
        return this.categoryService.create(categoryData);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update category (Admin only)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Category name' },
                description: { type: 'string', description: 'Category description' },
                status: { type: 'number', description: 'Category status (1=active, 0=inactive)' }
            }
        }
    })
    async update(@Param('id') id: number, @Body() categoryData: Partial<Category>): Promise<Category> {
        return this.categoryService.update(id, categoryData);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete category (Admin only)' })
    async remove(@Param('id') id: number): Promise<void> {
        return this.categoryService.remove(id);
    }
}
