import { connect } from 'react-redux';
import { navigateTo } from './nv-actions';
import NavHeader from './nv-model';
import { showNavigationView, showLandingPage} from 'body/body-actions';
import { fetchNavigationData } from 'body-navigation/bn-actions';
import { fetchDetailsData, clearDetailsData } from 'details-section/ds-actions';
import { hideSearchResults } from 'global-search/gs-actions';
import { fetchWebData } from 'body-rules-list/brl-actions';
import { enableComparing, disableComparing, fetchExtensionComparisonData, clearCompareList, showComparisonTable, setParams } from 'compare/cmp-actions';
import { nullifyHistory, historyReplaceState } from '../common';

const mapDispatchToProps = ( dispatch ) => {
  return {
    gotoLocation: (props) => {
      if( !props.isExtension && (props.separator || ( props.index === 0 ))){
        nullifyHistory();
        dispatch(navigateTo(props, props.index));
        dispatch(clearCompareList());
        dispatch(showNavigationView());
        dispatch(fetchNavigationData(props.name, props.href, props.icon));
      } else if ( props.isExtension ){
        dispatch(setParams(props.ext[0],props.params.vtc));
        switch (props.compareEnabled) {
        case true:
          dispatch(fetchExtensionComparisonData(props.id, props.ext[0].name, props.params.vtc.name));
          break;
        case false:
          dispatch(fetchWebData(props.ext[0].href));
          dispatch(clearDetailsData());
          break;
        }
      }
    },
    closeSearchResults: (props) => {
      const lastViewedRuleBeforeSearch = props.rules ? props.rules.find( e => e.selected === true ) : undefined;
      dispatch(hideSearchResults());
      if ( props.path.length > 0 ){
        historyReplaceState();
        if( /\/quality-rules/i.test(props.path[props.path.length -1].href) === false && props.path.length < 3 ){
          dispatch(showNavigationView());
        } else {
          if(props.isComparing){
            dispatch(showComparisonTable());
            if(props.cmpSelected) dispatch(fetchDetailsData(props.cmpSelected.href));
          }
          if( lastViewedRuleBeforeSearch ) {
            dispatch(fetchDetailsData( lastViewedRuleBeforeSearch.href ) );
          } else {
            dispatch(clearDetailsData());
          }
        }
      } else if ( props.path.length === 0 ){
        dispatch(showLandingPage());
        nullifyHistory();
      }
    },
    selectorChange: ( item, props ) => {
      if( JSON.stringify(item) !== JSON.stringify(props.params[0]) ){
        dispatch(setParams(item));
        dispatch(fetchWebData(item.href));
        dispatch(clearDetailsData());
      }
    },
    onCompare: (extId, ver1, ver2) => {
      dispatch(setParams(ver1, ver2));
      dispatch(fetchExtensionComparisonData(extId, ver1.name, ver2.name));
    },
    onToggleCompare: ( isComparing ) => {
      switch (isComparing) {
      case true:
        dispatch(disableComparing());
        dispatch(clearDetailsData());
        break;
      case false:
        dispatch(enableComparing());
        dispatch(clearDetailsData());
        break;
      }
    }
  };
};

const mapStateToProps = (state) => {
  return {
    path: state.path.path,
    viewType: state.viewType.viewType,
    searchVisible: state.search.resultsVisible,
    rules: state.rulesList.data,
    searchQuery: state.search.query,
    compareEnabled: state.compare.isComparing,
    cmpParams: state.compare.params,
    cmpSelected: state.compare.data.find( i => i.selected)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NavHeader);