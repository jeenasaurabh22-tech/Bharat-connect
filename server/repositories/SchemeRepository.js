import BaseRepository from './BaseRepository.js';
import Scheme from '../models/Scheme.model.js';
class SchemeRepository extends BaseRepository {
  constructor() {
    super(Scheme);
  }
  async searchSchemes(queryText, filters = {}, sort = {}, limit = 10, skip = 0) {
    const finalFilter = { ...filters };
    if (queryText) {
      finalFilter.$text = { $search: queryText };
    }
    const schemes = await this.model
      .find(finalFilter)
      .sort(queryText ? { score: { $meta: 'textScore' } } : sort)
      .skip(skip)
      .limit(limit)
      .exec();
    const total = await this.model.countDocuments(finalFilter).exec();
    return { schemes, total };
  }
  async findWithEmbedding(id) {
    return this.model.findById(id).select('+embedding').exec();
  }
  async getAllEmbeddings() {
    return this.model.find({}, 'title category embedding').select('+embedding').exec();
  }
}
export default new SchemeRepository();