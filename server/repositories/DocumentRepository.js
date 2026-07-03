import BaseRepository from './BaseRepository.js';
import Document from '../models/Document.model.js';

class DocumentRepository extends BaseRepository {
  constructor() {
    super(Document);
  }

  async findActiveByCitizenId(citizenId) {
    return this.find({ citizen: citizenId, isActive: true }, '', { createdAt: -1 });
  }

  async findCitizenDocumentByType(citizenId, documentType) {
    return this.findOne({ citizen: citizenId, documentType, isActive: true });
  }
}

export default new DocumentRepository();
