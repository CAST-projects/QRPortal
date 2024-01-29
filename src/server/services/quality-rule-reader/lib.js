/**
 * @param {string|Array<string>} query 
 */
function parseQuery(query) {
    const _query = [];

    if (Array.isArray(query)) {
        for (const term of query) {
            const splitTerms = term.split(" ");

            if (query.length > 1) {
                for (const splitTerm of splitTerms) {
                    if (splitTerm.length > 2) {
                        _query.push(splitTerm.toLowerCase());
                    }
                }
            } else {
                _query.push(...splitTerms);
            }
        }
    } else {
        const splitTerms = query.split(" ");
        if (splitTerms.length > 1) {
            for (const splitTerm of splitTerms) {
                if (splitTerm.length > 2) {
                    _query.push(splitTerm.toLowerCase());
                }
            }
        } else {
            _query.push(...splitTerms);
        }
    }

    return _query;
}

module.exports = {
    parseQuery,
}