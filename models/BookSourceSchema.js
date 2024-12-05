export const BookSourceSchema = {
  name: 'BookSource',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    baseUrl: 'string',
    loginUrl: 'string?',
    header: 'string?',
    enabled: { type: 'bool', default: true },
    weight: { type: 'int', default: 0 },
    lastUpdateTime: 'date',
    
    // 规则配置
    searchUrl: 'string',
    categoriesUrl: 'string?',
    ruleCategories: 'string?', // JSON string
    ruleSearch: 'string',      // JSON string
    ruleBookInfo: 'string',    // JSON string
    ruleToc: 'string',         // JSON string
    ruleContent: 'string',     // JSON string
  }
}; 