import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { MuseumEntity } from './museum.entity';
import { MuseumDto } from './dto/museum.dto';

@Injectable()
export class MuseumService {
  constructor(
    @InjectRepository(MuseumEntity)
    private readonly museumRepository: Repository<MuseumEntity>,
  ) {}

  async create(museum: DeepPartial<MuseumEntity>): Promise<MuseumEntity> {
    const newMuseum = this.museumRepository.create(museum);
    return await this.museumRepository.save(newMuseum);
  }

  async findAll(query: MuseumDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.museumRepository.createQueryBuilder('museum');

    if (query.city) {
      queryBuilder.andWhere('LOWER(museum.city) LIKE LOWER(:city)', {
        city: `%${query.city}%`,
      });
    }

    if (query.name) {
      queryBuilder.andWhere('LOWER(museum.name) LIKE LOWER(:name)', {
        name: `%${query.name}%`,
      });
    }

    if (query.foundedBefore) {
      queryBuilder.andWhere('museum.foundedBefore < :foundedBefore', {
        foundedBefore: query.foundedBefore,
      });
    }

    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<MuseumEntity> {
    const museum = await this.museumRepository.findOne({
      where: { id },
      relations: ['exhibitions'],
    });

    if (!museum) {
      throw new NotFoundException(`Museum with id ${id} was not found`);
    }

    return museum;
  }

  async update(
    id: string,
    museum: DeepPartial<MuseumEntity>,
  ): Promise<MuseumEntity> {
    const existingMuseum = await this.findOne(id);

    const updatedMuseum = {
      ...existingMuseum,
      ...museum,
    };

    return await this.museumRepository.save(updatedMuseum);
  }

  async delete(id: string): Promise<void> {
    const museum = await this.findOne(id);
    await this.museumRepository.remove(museum);
  }
}
