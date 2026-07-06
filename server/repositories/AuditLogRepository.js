import BaseRepository from './BaseRepository.js';
import AuditLog from '../models/AuditLog.model.js';
class AuditLogRepository extends BaseRepository {
  constructor() {
    super(AuditLog);
  }
  async getRecentLogs(limit = 50, skip = 0) {
    const logs = await this.find({}, 'actor', { timestamp: -1 }, limit, skip);
    const total = await this.count();
    return { logs, total };
  }
  async getLogsByActorId(actorId, limit = 20) {
    return this.find({ actor: actorId }, '', { timestamp: -1 }, limit);
  }
}
export default new AuditLogRepository();