"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseQuery = parseQuery;
function parseQuery(req, searchableFields = []) {
    const _a = req.query, { page = 1, limit = 20, search } = _a, filters = __rest(_a, ["page", "limit", "search"]);
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 20, 1);
    const skip = (pageNum - 1) * limitNum;
    let filter = Object.assign({}, filters);
    // Convert filter values to correct types (e.g., boolean, number)
    Object.keys(filter).forEach((key) => {
        if (filter[key] === 'true')
            filter[key] = true;
        else if (filter[key] === 'false')
            filter[key] = false;
        else if (!isNaN(Number(filter[key])))
            filter[key] = Number(filter[key]);
    });
    // Ensure search is string or undefined
    const searchStr = typeof search === 'string' ? search : undefined;
    // If search is present, build $or for text search
    if (searchStr && searchableFields.length > 0) {
        filter.$or = searchableFields.map((field) => ({ [field]: { $regex: searchStr, $options: 'i' } }));
    }
    return { filter, search: searchStr, page: pageNum, limit: limitNum, skip };
}
