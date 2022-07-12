/* eslint-disable no-underscore-dangle */
import {
  UserModel, userModel, UserInfo, UserData,
} from '../db/models/user-model';
import { validation } from '../utils/validation';

class UserService {
  userModel: UserModel;

  constructor(userModelArg: UserModel) {
    this.userModel = userModelArg;
  }

  async addUser(userInfo: UserInfo): Promise<UserData> {
    const { githubEmail } = userInfo;

    validation.addUser(userInfo);

    const user = await this.userModel.findByEmail(githubEmail);
    if (user) {
      const error = new Error('이 이메일은 현재 사용중입니다. 다른 이름을 입력해 주세요.');
      error.name = 'Conflict';
      throw error;
    }

    const createdNewUser = await this.userModel.create(userInfo);
    return createdNewUser;
  }

  async getUserByEmail(githubEmail: string): Promise<UserData | null> {
    const user = await this.userModel.findByEmail(githubEmail);
    return user;
  }

  async getUserById(_id: string): Promise<UserData> {
    const user = await this.userModel.findById(_id);
    return user;
  }

  async setUser(_id: string, update: Partial<UserInfo>): Promise<UserData> {
    const updatedUser = await this.userModel.update(_id, update);
    return updatedUser;
  }

  async deleteUser(_id: string): Promise<UserData> {
    const deletedUser = await this.userModel.deleteById(_id);
    return deletedUser;
  }
}

export const userService = new UserService(userModel);
