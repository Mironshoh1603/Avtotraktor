import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }

    async findAll(): Promise<Category[]> {
        return this.categoryRepository.find({
            where: { status: 1 }, // Only return active categories
            order: { id: 'ASC' },
        });
    }

    async findAllForAdmin(): Promise<Category[]> {
        const categories = await this.categoryRepository
            .createQueryBuilder('category')
            .leftJoinAndSelect('category.questions', 'question')
            .orderBy('category.id', 'ASC')
            .getMany();

        // Har bir kategoriya uchun savollar sonini hisoblash
        return categories.map(category => ({
            ...category,
            questionsCount: category.questions ? category.questions.length : 0,
            questions: undefined // Questions ma'lumotlarini response'dan olib tashlash
        }));
    }

    async create(categoryData: Partial<Category>): Promise<Category> {
        const category = this.categoryRepository.create({
            name: categoryData.name,
            description: categoryData.description || null,
            status: categoryData.status !== undefined ? categoryData.status : 1
        });
        return this.categoryRepository.save(category);
    }

    async update(id: number, categoryData: Partial<Category>): Promise<Category> {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new NotFoundException('Kategoriya topilmadi');
        }

        // Update fields
        if (categoryData.name !== undefined) category.name = categoryData.name;
        if (categoryData.description !== undefined) category.description = categoryData.description;
        if (categoryData.status !== undefined) category.status = categoryData.status;

        return this.categoryRepository.save(category);
    }

    async remove(id: number): Promise<void> {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new NotFoundException('Kategoriya topilmadi');
        }

        await this.categoryRepository.remove(category);
    }
}
