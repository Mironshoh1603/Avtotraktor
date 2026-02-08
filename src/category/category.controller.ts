import { Controller, Get } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Category } from '../entities/category.entity';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Get()
    @ApiOperation({ summary: 'Get all categories' })
    @ApiResponse({
        status: 200,
        description: 'Returns all categories',
        type: [Category],
    })
    async findAll(): Promise<Category[]> {
        return this.categoryService.findAll();
    }
}
