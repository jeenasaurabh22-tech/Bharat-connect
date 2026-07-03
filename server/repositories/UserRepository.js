import BaseRepository from './BaseRepository.js';
import User from '../models/User.model.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email, selectFields = '') {
    return this.model.findOne({ email }).select(selectFields).exec();
  }

  async findByRefreshToken(token) {
    return this.model.findOne({ refreshToken: token }).select('+refreshToken').exec();
  }

  async updateRefreshToken(userId, token) {
    return this.model.findByIdAndUpdate(userId, { refreshToken: token }, { new: true }).exec();
  }
}

export default new UserRepository();
