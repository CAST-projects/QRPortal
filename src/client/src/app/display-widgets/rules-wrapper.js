import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import RuleList from '../rule-list/crd-rule-list-component';
import RuleDetails from '../rule-details/crd-rule-details-component';

const RulesWrapper = (props) => {
  const { rulesListInfo, getRuleDetails, ruleDetailsInfo, selectedRuleId, heightCalc } = props;

  return (
    <Grid container={true} justifyContent='center'>
      <Grid item={true} xs={6}>
        <RuleList
          qualityRulesList={rulesListInfo}
          getRuleDetails={getRuleDetails}
          selectedRuleId={selectedRuleId}
          heightCalc={heightCalc}
        />
      </Grid>
      <Grid item={true} xs={6}>
        <Grid container />
        <RuleDetails ruleDetails={ruleDetailsInfo} heightCalc={heightCalc}/>
      </Grid>
    </Grid>
  );
};

RulesWrapper.propTypes = {
  getRuleDetails: PropTypes.func,
  rulesListInfo: PropTypes.any,
  ruleDetailsInfo: PropTypes.any,
  selectedRuleId: PropTypes.string,
};

export default RulesWrapper;
