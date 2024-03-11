import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { UsersService } from './users.service';
import { IUserRepository } from '@users-domain/users.interface';
import { IIdentifierAdapter } from '@users-service/adapter/identifier.adapter';
import { IImpressionService } from '@users-domain/impression-event.interface';
import { UsersModel } from '@users-domain/users.model';
import { AuthenticateException } from '@users-domain/errors/authenticate.exception';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockProxy<IUserRepository>;
  let identifier: MockProxy<IIdentifierAdapter>;
  let eventService: MockProxy<IImpressionService>;

  beforeEach(async () => {
    const USER_REPOSITORY_TOKEN = 'USER_REPOSITORY';
    const IDENTIFIER_TOKEN = 'IDENTIFIER';
    const EVENT_SERVICE_TOKEN = 'EVENT_SERVICE';
    userRepository = mock<IUserRepository>();
    identifier = mock<IIdentifierAdapter>();
    eventService = mock<IImpressionService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: userRepository
        },
        {
          provide: IDENTIFIER_TOKEN,
          useValue: identifier,
        },
        {
          provide: EVENT_SERVICE_TOKEN,
          useValue: eventService,
        },
        {
          provide: UsersService,
          inject: [USER_REPOSITORY_TOKEN, IDENTIFIER_TOKEN, EVENT_SERVICE_TOKEN],
          useFactory: (
            userRepository: IUserRepository,
            identifier: IIdentifierAdapter,
            eventService: IImpressionService,
          ) => new UsersService(userRepository, identifier, eventService),
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe(`add`, () => {
    it(`Should error add new user`, async () => {
      const userIn = new UsersModel({
        name: 'test',
        email: 'test@example.com',
        password: 'this-is-my-password',
        avatars: [],
        bio: 'This is my bio',
        location: {lat: 0, long: 0},
      });
      const addErrOut = new Error('fail to register');
      const addErrExpect = addErrOut;
      userRepository.add.mockResolvedValue([addErrOut]);

      const [error, result] = await service.add(userIn);

      expect(userRepository.add).toHaveBeenCalled();
      expect(error).toEqual(addErrExpect);
      expect(result).toBeUndefined()
    })

    it(`Should successfully add new user`, async () => {
      const userIn = new UsersModel({
        name: 'test',
        email: 'test@example.com',
        password: 'this-is-my-password',
        avatars: [],
        bio: 'This is my bio',
        location: {lat: 0, long: 0},
      });
      const addOut = userIn.clone();
      addOut.id = '00000000-0000-0000-0000-000000000000';
      userRepository.add.mockResolvedValue([null, addOut]);

      const [error, result] = await service.add(userIn);

      expect(userRepository.add).toHaveBeenCalled();
      expect(error).toBeNull();
      expect(result).toEqual(addOut)
    })
  })

  describe(`login`, () => {
    const salt = '$2b$04$tpk/BYfX95E3fo9Ydtlpn.'
    const password = 'this-is-my-password';

    it(`Should error login user`, async () => {
      const usernameIn = 'test@example.com'
      const passwordIn = password;
      const getAllErrOut = new Error('fail to register');
      const getAllErrExpect = getAllErrOut;
      userRepository.getAll.mockResolvedValue([getAllErrOut]);

      const [error, result] = await service.login(usernameIn, passwordIn);

      expect(userRepository.getAll).toHaveBeenCalled();
      expect(error).toEqual(getAllErrExpect);
      expect(result).toBeUndefined()
    })

    it(`Should error login user when user list is empty`, async () => {
      const usernameIn = 'test@example.com'
      const passwordIn = 'this-is-my-password';
      const getAllErrExpect = new AuthenticateException();
      userRepository.getAll.mockResolvedValue([null, [], 0]);

      const [error, result] = await service.login(usernameIn, passwordIn);

      expect(userRepository.getAll).toHaveBeenCalled();
      expect(error).toEqual(getAllErrExpect);
      expect(result).toBeUndefined()
    })

    it(`Should error login user when password not match`, async () => {
      const usernameIn = 'test@example.com'
      const passwordIn = 'this-is-my-password';
      const getAllOut = new UsersModel({
        id: '00000000-0000-0000-0000-000000000000',
        name: 'test',
        email: 'test@example.com',
        password: 'not-match',
        salt,
        avatars: [],
        bio: 'This is my bio',
        location: {lat: 0, long: 0},
      });
      const getAllErrExpect = new AuthenticateException();
      userRepository.getAll.mockResolvedValue([null, [getAllOut], 1]);

      const [error, result] = await service.login(usernameIn, passwordIn);

      expect(userRepository.getAll).toHaveBeenCalled();
      expect(error).toEqual(getAllErrExpect);
      expect(result).toBeUndefined()
    })

    it(`Should successfully login user`, async () => {
      const usernameIn = 'test@example.com'
      const passwordIn = password;
      const getAllOut = new UsersModel({
        id: '00000000-0000-0000-0000-000000000000',
        name: 'test',
        email: 'test@example.com',
        password: await bcrypt.hash(password, salt),
        salt,
        avatars: [],
        bio: 'This is my bio',
        location: {lat: 0, long: 0},
      });
      userRepository.getAll.mockResolvedValue([null, [getAllOut], 1]);

      const [error, result] = await service.login(usernameIn, passwordIn);

      expect(userRepository.getAll).toHaveBeenCalled();
      expect(error).toBeNull();
      expect(result).toEqual(getAllOut.id)
    })
  })

  describe(`getById`, () => {
    it(`Should error get user by id`, async () => {
      const idIn = '00000000-0000-0000-0000-000000000000';
      const getByIdErrOut = new Error('fail to register');
      const getByIdErrExpect = getByIdErrOut;
      userRepository.getById.mockResolvedValue([getByIdErrOut]);

      const [error, result] = await service.getById(idIn);

      expect(userRepository.getById).toHaveBeenCalled();
      expect(userRepository.getById).toHaveBeenCalledWith(idIn);
      expect(error).toEqual(getByIdErrExpect);
      expect(result).toBeUndefined()
    })

    it(`Should successfully get user by id`, async () => {
      const idIn = '00000000-0000-0000-0000-000000000000';
      const getByIdOut = new UsersModel({
        id: '00000000-0000-0000-0000-000000000000',
        name: 'test',
        email: 'test@example.com',
        password: 'this-is-my-password',
        avatars: [],
        bio: 'This is my bio',
        location: {lat: 0, long: 0},
      });
      userRepository.getById.mockResolvedValue([null, getByIdOut]);

      const [error, result] = await service.getById(idIn);

      expect(userRepository.getById).toHaveBeenCalled();
      expect(userRepository.getById).toHaveBeenCalledWith(idIn);
      expect(error).toBeNull();
      expect(result).toEqual(getByIdOut)
    })
  })
});
