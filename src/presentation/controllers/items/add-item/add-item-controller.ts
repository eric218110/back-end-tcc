import {
  Controller,
  HttpRequest,
  HttpResponse,
  AddItem
} from './add-items-controller-protocols'
import { serverError } from '@presentation/helper/http/http-helper'

export class AddItemController implements Controller {
  constructor (
    private readonly addItem: AddItem
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { image, title } = httpRequest.body
      await this.addItem.add({ image, title })
      return null
    } catch (error) {
      return serverError(error)
    }
  }
}
