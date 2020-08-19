import { MongoHelper } from '../helpers/mongo-helper'
import { AccountMongoRepository } from './account-mongo-repository'
import { Collection } from 'mongodb'
import { AddAccountModel } from '@domain/usecases/add-account'
import { AccountModel } from '@domain/models/account'

let accountCollection: Collection<AddAccountModel | AccountModelWithToken>

const makeFakeAddAccountModel = (): AddAccountModel => ({
  name: 'any_name',
  email: 'any_email@mail.com',
  password: 'any_password'
})

type SutTypes = {
  sut: AccountMongoRepository
  fakeAddAccountModel: AddAccountModel
}

interface AccountModelWithToken extends AccountModel {
  accessToken: string
}

const makeFakeAccountResultMongoDb = (): AccountModelWithToken => ({
  id: 'any_id',
  name: 'any_name',
  email: 'any_email@mail.com',
  password: 'any_password',
  accessToken: 'any_token'
})

beforeAll(async () => {
  await MongoHelper.connect(process.env.MONGO_URL)
})
afterAll(async () => {
  await MongoHelper.disconnect()
})
beforeEach(async () => {
  accountCollection = await MongoHelper.getCollection('account')
  await accountCollection.deleteMany({})
})

const makeSut = (): SutTypes => {
  const fakeAddAccountModel = makeFakeAddAccountModel()
  const sut = new AccountMongoRepository()
  return {
    sut,
    fakeAddAccountModel
  }
}

describe('Account Mongo Repository', () => {
  describe('add()', () => {
    test('should return an account on add sucess', async () => {
      const { sut, fakeAddAccountModel } = makeSut()
      const account = await sut.add(fakeAddAccountModel)
      expect(account).toBeTruthy()
      expect(account.id).toBeTruthy()
      expect(account.name).toBe('any_name')
      expect(account.email).toBe('any_email@mail.com')
      expect(account.password).toBe('any_password')
    })
  })

  describe('loadByEmail()', () => {
    test('should return an account on loadByEmail sucess', async () => {
      const { sut, fakeAddAccountModel } = makeSut()
      await accountCollection.insertOne(fakeAddAccountModel)
      const account = await sut.loadWithEmail(fakeAddAccountModel.email)
      expect(account).toBeTruthy()
      expect(account.id).toBeTruthy()
      expect(account.name).toBe(fakeAddAccountModel.name)
      expect(account.email).toBe(fakeAddAccountModel.email)
      expect(account.password).toBe(fakeAddAccountModel.password)
    })

    test('should return null if loadByEmail fails', async () => {
      const { sut, fakeAddAccountModel } = makeSut()
      const account = await sut.loadWithEmail(fakeAddAccountModel.email)
      expect(account).toBeFalsy()
    })
  })

  describe('UpdateAccessToken()', () => {
    test('should update the account accessToken on UpdateAccessToken success', async () => {
      const { sut, fakeAddAccountModel } = makeSut()
      const fakeAccount = MongoHelper
        .collectionWithoutId<AccountModelWithToken>(
        (await accountCollection.insertOne(fakeAddAccountModel)).ops[0]
      )
      expect(fakeAccount.accessToken).toBeFalsy()
      await sut.updateAccessToken(fakeAccount.id, 'valid_token')
      const account = await accountCollection.findOne<AccountModelWithToken>({
        _id: fakeAccount.id
      })
      expect(account.accessToken).toBe('valid_token')
    })
  })

  describe('loadByToken()', () => {
    test('should return an account on loadByToken sucess', async () => {
      const { sut, fakeAddAccountModel } = makeSut()
      const fakeAccount = makeFakeAccountResultMongoDb()
      await accountCollection.insertOne(fakeAccount)
      const account = await sut.loadByToken(fakeAccount.accessToken)
      expect(account).toBeTruthy()
      expect(account.id).toBeTruthy()
      expect(account.name).toBe(fakeAddAccountModel.name)
      expect(account.email).toBe(fakeAddAccountModel.email)
      expect(account.password).toBe(fakeAddAccountModel.password)
    })
  })
})
