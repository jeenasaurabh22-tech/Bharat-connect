import schemeRepository from '../repositories/SchemeRepository.js';
import geminiService from '../services/gemini.service.js';
import cacheService from '../services/cache.service.js';
import ApiError from '../utils/ApiError.js';
import auditLogRepository from '../repositories/AuditLogRepository.js';
const buildMongoQuery = (params) => {
  const conditions = [];
  if (params.state) {
    conditions.push({ state: params.state });
  }
  if (params.category) {
    conditions.push({ category: params.category });
  }
  if (params.income) {
    const incVal = parseInt(params.income, 10);
    conditions.push({
      $or: [
        { 'eligibilityRules.maxIncome': { $gte: incVal } },
        { 'eligibilityRules.maxIncome': null },
      ],
    });
  }
  if (params.age) {
    const ageVal = parseInt(params.age, 10);
    conditions.push({
      $and: [
        { $or: [{ 'eligibilityRules.minAge': { $lte: ageVal } }, { 'eligibilityRules.minAge': null }] },
        { $or: [{ 'eligibilityRules.maxAge': { $gte: ageVal } }, { 'eligibilityRules.maxAge': null }] },
      ],
    });
  }
  if (params.gender) {
    conditions.push({
      'eligibilityRules.genders': { $in: [params.gender, 'All', ''] },
    });
  }
  if (params.casteCategory) {
    conditions.push({
      'eligibilityRules.categories': { $in: [params.casteCategory, 'All', ''] },
    });
  }
  if (params.occupation) {
    conditions.push({
      'eligibilityRules.occupations': { $in: [params.occupation, 'All', ''] },
    });
  }
  if (params.disability !== undefined) {
    const isDis = params.disability === 'true';
    conditions.push({
      'eligibilityRules.disabilityRequired': isDis,
    });
  }
  return conditions.length > 0 ? { $and: conditions } : {};
};
export const getSchemes = async (req, res, next) => {
  try {
    const {
      search,
      searchType = 'keyword',
      state,
      category,
      income,
      age,
      gender,
      casteCategory,
      occupation,
      disability,
      sortBy = 'createdAt',
      order = 'desc',
      limit = '10',
      page = '1',
    } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skipNum = (pageNum - 1) * limitNum;
    const queryHash = Buffer.from(JSON.stringify(req.query)).toString('base64');
    const cacheKey = `schemes:search:${queryHash}`;
    if (searchType !== 'semantic') {
      const cachedResult = await cacheService.get(cacheKey);
      if (cachedResult) {
        return res.status(200).json(cachedResult);
      }
    }
    const filters = buildMongoQuery({
      state,
      category,
      income,
      age,
      gender,
      casteCategory,
      occupation,
      disability,
    });
    let schemes = [];
    let total = 0;
    if (search && searchType === 'semantic') {
      const queryEmbedding = await geminiService.generateEmbedding(search);
      const matchedFilterSchemes = await schemeRepository.find(filters, '', {}, null, null, '+embedding');
      const scoredSchemes = matchedFilterSchemes.map((scheme) => {
        const score = scheme.embedding
          ? geminiService.cosineSimilarity(queryEmbedding, scheme.embedding)
          : 0;
        const schemeObj = scheme.toObject();
        delete schemeObj.embedding;
        return {
          ...schemeObj,
          similarityScore: score,
        };
      });
      scoredSchemes.sort((a, b) => b.similarityScore - a.similarityScore);
      total = scoredSchemes.length;
      schemes = scoredSchemes.slice(skipNum, skipNum + limitNum);
    } else {
      const sortOrder = order === 'asc' ? 1 : -1;
      const sortConfig = { [sortBy]: sortOrder };
      const result = await schemeRepository.searchSchemes(
        search,
        filters,
        sortConfig,
        limitNum,
        skipNum
      );
      schemes = result.schemes;
      total = result.total;
    }
    const responseData = {
      schemes,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
    // Cache regular query results for 10 minutes
    if (searchType !== 'semantic') {
      await cacheService.set(cacheKey, responseData, 600);
    }
    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};
export const getSchemeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `scheme:${id}`;
    // Read from Redis
    const cachedScheme = await cacheService.get(cacheKey);
    if (cachedScheme) {
      return res.status(200).json({ scheme: cachedScheme });
    }
    const scheme = await schemeRepository.findById(id);
    if (!scheme) {
      return next(new ApiError(404, 'Scheme not found'));
    }
    // Save in Redis for 1 hour
    await cacheService.set(cacheKey, scheme, 3600);
    res.status(200).json({ scheme });
  } catch (error) {
    next(error);
  }
};
export const createScheme = async (req, res, next) => {
  try {
    // Requires Admin Role
    const schemeData = req.body;
    // Generate text for embedding
    const textToEmbed = `${schemeData.title}. ${schemeData.description}. Category: ${schemeData.category}. Tags: ${schemeData.tags?.join(', ')}`;
    const embedding = await geminiService.generateEmbedding(textToEmbed);
    const scheme = await schemeRepository.create({
      ...schemeData,
      embedding,
    });
    // Invalidate search caches
    await cacheService.clearPrefix('schemes:search:');
    // Audit log
    await auditLogRepository.create({
      action: 'SCHEME_CREATE',
      actor: req.user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { schemeId: scheme._id, title: scheme.title },
    });
    res.status(201).json({
      message: 'Scheme created successfully',
      scheme,
    });
  } catch (error) {
    next(error);
  }
};
export const updateScheme = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    // Check if title or details changed to regenerate embedding
    const oldScheme = await schemeRepository.findById(id);
    if (!oldScheme) {
      return next(new ApiError(404, 'Scheme not found'));
    }
    if (updates.title || updates.description || updates.category || updates.tags) {
      const title = updates.title || oldScheme.title;
      const description = updates.description || oldScheme.description;
      const category = updates.category || oldScheme.category;
      const tags = updates.tags || oldScheme.tags;
      const textToEmbed = `${title}. ${description}. Category: ${category}. Tags: ${tags.join(', ')}`;
      updates.embedding = await geminiService.generateEmbedding(textToEmbed);
    }
    const scheme = await schemeRepository.update(id, updates);
    // Invalidate caches
    await cacheService.del(`scheme:${id}`);
    await cacheService.clearPrefix('schemes:search:');
    // Audit log
    await auditLogRepository.create({
      action: 'SCHEME_UPDATE',
      actor: req.user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { schemeId: id, updates: Object.keys(updates) },
    });
    res.status(200).json({
      message: 'Scheme updated successfully',
      scheme,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteScheme = async (req, res, next) => {
  try {
    const { id } = req.params;
    const scheme = await schemeRepository.findById(id);
    if (!scheme) {
      return next(new ApiError(404, 'Scheme not found'));
    }
    await schemeRepository.delete(id);
    // Invalidate caches
    await cacheService.del(`scheme:${id}`);
    await cacheService.clearPrefix('schemes:search:');
    // Audit log
    await auditLogRepository.create({
      action: 'SCHEME_DELETE',
      actor: req.user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { schemeId: id, title: scheme.title },
    });
    res.status(200).json({ message: 'Scheme deleted successfully' });
  } catch (error) {
    next(error);
  }
};