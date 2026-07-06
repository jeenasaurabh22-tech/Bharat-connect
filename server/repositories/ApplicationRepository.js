import BaseRepository from './BaseRepository.js';
import Application from '../models/Application.model.js';
class ApplicationRepository extends BaseRepository {
  constructor() {
    super(Application);
  }
  async findByCitizenId(citizenId, populate = 'scheme') {
    return this.find({ citizen: citizenId }, populate, { createdAt: -1 });
  }
  async findBySchemeId(schemeId, populate = 'citizen') {
    return this.find({ scheme: schemeId }, populate, { createdAt: -1 });
  }
  async getPaginatedApplications(filter = {}, populate = 'citizen scheme', limit = 10, skip = 0) {
    const applications = await this.find(filter, populate, { createdAt: -1 }, limit, skip);
    const total = await this.count(filter);
    return { applications, total };
  }
}
export default new ApplicationRepository();