class BaseRepository {
  constructor(model) {
    this.model = model;
  }
  async findById(id, populate = '', select = '') {
    return this.model.findById(id).select(select).populate(populate).exec();
  }
  async findOne(filter, populate = '', select = '') {
    return this.model.findOne(filter).select(select).populate(populate).exec();
  }
  async find(filter = {}, populate = '', sort = {}, limit = null, skip = null, select = '') {
    let query = this.model.find(filter).select(select).populate(populate).sort(sort);
    if (skip !== null) query = query.skip(skip);
    if (limit !== null) query = query.limit(limit);
    return query.exec();
  }
  async create(data) {
    return this.model.create(data);
  }
  async update(id, data) {
    return this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).exec();
  }
  async delete(id) {
    return this.model.findByIdAndDelete(id).exec();
  }
  async count(filter = {}) {
    return this.model.countDocuments(filter).exec();
  }
}
export default BaseRepository;