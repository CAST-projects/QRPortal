import React, { useState, useEffect } from 'react';
import { useRouteMatch, useLocation, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

import RulesWrapper from '../display-widgets/rules-wrapper';

const SearchContent = (props) => {
  const {
    rulesList = [],
    ruleDetails,
    getRuleDetails: dispatchGetRuleDetails,
    isLoggedIn,
    searchResult = {},
    searchQuery,
  } = props;
  
  const { url } = useRouteMatch();
  const { pathname } = useLocation();

  const urlParams = useParams();

  const { searchTerm: urlSearchTerm, searchCriterion: urlSearchCriterion = '' } = urlParams;
  
  const { qualityRules: searchResultQualityRules = [] } = searchResult;

  const [rulesListInfo, setRulesListInfo] = useState(rulesList);
  const [ruleDetailsInfo, setRulesDetailsInfo] = useState(ruleDetails);
  const [selectedRuleId, setSelectedRuleId] = useState('');

  const getRuleDetails = ruleId => dispatchGetRuleDetails(ruleId, isLoggedIn);

  // run query if search term is set
  useEffect(() => {
    if (urlSearchTerm) {
      searchQuery(urlSearchCriterion, urlSearchTerm);
    }
  }, [urlSearchTerm]);

  // if search results exist in store, set them as rules list
  useEffect(() => {
    if (searchResultQualityRules.length > 0) {
      setRulesListInfo(searchResultQualityRules);
    }
  }, [searchResultQualityRules]);

  // set rule details based on url parameters
  useEffect(() => {
    if (url) {
      const selectedRuleIdUrl = pathname.split('details/')[1];

      if (selectedRuleIdUrl) {
        getRuleDetails(selectedRuleIdUrl);
        setSelectedRuleId(selectedRuleIdUrl);
      } else {
        getRuleDetails('');
        setRulesDetailsInfo([]);
        setSelectedRuleId('');
      }
    }
  }, [url]);

  useEffect(() => {
    setRulesDetailsInfo(ruleDetails);
  }, [ruleDetails]);
  
  return (
    <RulesWrapper
      rulesListInfo={rulesListInfo}
      getRuleDetails={getRuleDetails}
      ruleDetailsInfo={ruleDetailsInfo}
      selectedRuleId={selectedRuleId}
    />
  );
};

SearchContent.propTypes = {
  rulesList: PropTypes.array,
  ruleDetails: PropTypes.object,
  isLoggedIn: PropTypes.bool,
  getRulesList: PropTypes.func,
  getRuleDetails: PropTypes.func,
  resetSearch: PropTypes.func,
  searchQuery: PropTypes.func,
  searchResult: PropTypes.object,
  searchTerm: PropTypes.string,
};

export default SearchContent;
