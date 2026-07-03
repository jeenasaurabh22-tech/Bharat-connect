import BaseRepository from './BaseRepository.js';
import Scheme from '../models/Scheme.model.js';

class SchemeRepository extends BaseRepository {
  constructor() {
    super(Scheme);
  }

  // Text-search based query with pagination
  async searchSchemes(queryText, filters = {}, sort = {}, limit = 10, skip = 0) {
    const finalFilter = { ...filters };

    // Text search if query text exists
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

  // Retrieve scheme with its embedding for vector searches
  async findWithEmbedding(id) {
    return this.model.findById(id).select('+embedding').exec();
  }

  // Fetch all scheme embeddings to compute local manual cosine similarities
  async getAllEmbeddings() {
    return this.model.find({}, 'title category embedding').select('+embedding').exec();
  }
}

export default new SchemeRepository();
