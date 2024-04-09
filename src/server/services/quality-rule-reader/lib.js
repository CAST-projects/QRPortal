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
                _query.push(...splitTerms.map(_ => _.toLowerCase()));
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
            _query.push(...splitTerms.map(_ => _.toLowerCase()));
        }
    }

    return _query;
}

function getSearchLabel(criteria = "") {
    switch (criteria.toLowerCase()) {
        case "id":
            return "Id";
        case "name":
            return "Name";
        case "rationale":
            return "Rationale";
        case "technologies":
            return "Technologies";
        case "severity":
            return "Severity";
        case "critical":
            return "Critical";
        case "max-weight":
            return "Max Weight";
        case "associated-value-name":
            return "Associated Value Name";
        case "output":
            return "Output";
        case "remediation":
            return "Remediation";
        case "sample":
            return "Sample";
        case "total":
            return "Total";
        case "alternative-name":
            return "Alternative Name";
        case "technical-criteria":
            return "Technical Criteria";
        case "business-criteria":
            return "Business Criteria";
        case "quality-standards":
            return "Quality Standards";
        default:
            return;
    }
}

module.exports = {
    parseQuery,
    getSearchLabel,
}