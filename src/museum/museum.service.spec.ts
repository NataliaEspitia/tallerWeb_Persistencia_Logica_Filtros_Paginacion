import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MuseumService } from './museum.service';
import { MuseumEntity } from './museum.entity';

describe('MuseumService', () => {
  let service: MuseumService;

  const queryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const museumRepositoryMock = {
    createQueryBuilder: jest.fn(() => queryBuilder),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MuseumService,
        {
          provide: getRepositoryToken(MuseumEntity),
          useValue: museumRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<MuseumService>(MuseumService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should use default pagination when page and limit are not provided', async () => {
    queryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);

    const result = await service.findAll({});

    expect(museumRepositoryMock.createQueryBuilder).toHaveBeenCalledWith(
      'museum',
    );

    expect(queryBuilder.skip).toHaveBeenCalledWith(0);
    expect(queryBuilder.take).toHaveBeenCalledWith(10);

    expect(result).toEqual({
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    });
  });

  it('should apply pagination using page and limit', async () => {
    queryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);

    await service.findAll({
      page: 2,
      limit: 5,
    });

    expect(queryBuilder.skip).toHaveBeenCalledWith(5);
    expect(queryBuilder.take).toHaveBeenCalledWith(5);
  });

  it('should filter museums by city', async () => {
    queryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);

    await service.findAll({
      city: 'Bogota',
    });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'LOWER(museum.city) LIKE LOWER(:city)',
      {
        city: '%Bogota%',
      },
    );
  });

  it('should filter museums by name', async () => {
    queryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);

    await service.findAll({
      name: 'oro',
    });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'LOWER(museum.name) LIKE LOWER(:name)',
      {
        name: '%oro%',
      },
    );
  });

  it('should filter museums founded before a given year', async () => {
    queryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);

    await service.findAll({
      foundedBefore: 1900,
    });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'museum.foundedBefore < :foundedBefore',
      {
        foundedBefore: 1900,
      },
    );
  });

  it('should combine name, city, foundedBefore and pagination filters', async () => {
    const museums = [
      {
        id: '1',
        name: 'Museo del Oro',
        city: 'Bogota',
        foundedBefore: 1823,
      },
    ];

    queryBuilder.getManyAndCount.mockResolvedValueOnce([museums, 1]);

    const result = await service.findAll({
      name: 'oro',
      city: 'Bogota',
      foundedBefore: 1900,
      page: 1,
      limit: 10,
    });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'LOWER(museum.city) LIKE LOWER(:city)',
      {
        city: '%Bogota%',
      },
    );

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'LOWER(museum.name) LIKE LOWER(:name)',
      {
        name: '%oro%',
      },
    );

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'museum.foundedBefore < :foundedBefore',
      {
        foundedBefore: 1900,
      },
    );

    expect(queryBuilder.skip).toHaveBeenCalledWith(0);
    expect(queryBuilder.take).toHaveBeenCalledWith(10);

    expect(result).toEqual({
      data: museums,
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  });

  it('should calculate totalPages correctly', async () => {
    queryBuilder.getManyAndCount.mockResolvedValueOnce([[], 22]);

    const result = await service.findAll({
      page: 1,
      limit: 10,
    });

    expect(result.meta.total).toBe(22);
    expect(result.meta.totalPages).toBe(3);
  });
});
