import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import _isEmpty from 'lodash/isEmpty';
import CardContent from '@material-ui/core/CardContent';
import RulesListTable from './crd-rule-list-table-component';

const useStyles = makeStyles({
  table: {
    minWidth: 650,

    '& .MuiTableCell-head': {
      fontWeight: '1000',
    },
  },
  tableHead: {
    fontWeight: '1000',
  },
  empty: {
    textAlign: 'center',
    margin: '50px',
    letterSpacing: '5px',
    fontSize: '30px',
    color: 'silver',
  },
});

const RulesList = (props) => {
  const { qualityRulesList, getRuleDetails, selectedRuleId, heightCalc } = props;
  const classes = useStyles();

  const renderTable = () => (
    <CardContent>
      <RulesListTable
        data={qualityRulesList}
        getRuleDetails={getRuleDetails}
        selectedRuleId={selectedRuleId}
        heightCalc={heightCalc}
      />
    </CardContent>
  );

  const renderEmptyList = () => (
    <div className={classes.empty}>No results found</div>
  );

  return (
    !_isEmpty(qualityRulesList)
      ? renderTable()
      : renderEmptyList()
  );
};

export default RulesList;
