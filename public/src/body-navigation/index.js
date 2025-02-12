import { connect } from 'react-redux';
import BodyNavigation from './bn-model';
import { fetchNavigationData } from './bn-actions';
import { setListCount, showContentView } from '../body/body-actions';
import { fetchWebData, fetchApiData, clearListData } from '../body-rules-list/brl-actions';
import { clearDetailsData } from '../details-section/ds-actions';
import { fetchStandardsListData, clearStandardsListData } from '../body-standards-list/bsl-actions';
import { appendToHeaderPath } from '../path-navigation/nv-actions';
import { SECTIONS } from './bn-constants';
import { setSelectedItem } from '../menu-navigation/mn-actions';
import { historyPushState } from '../common';

const mapDispatchToProps = (dispatch) => {
  return {
    tileClick: (link, currentTitle) => {
      switch (currentTitle.toLowerCase()) {
        case SECTIONS.technologies:
          historyPushState();
          dispatch(setListCount(1));
          dispatch(showContentView());
          dispatch(fetchApiData(link.href));
          break;
        case SECTIONS.standards:
          dispatch(fetchNavigationData(link.name, link.href, link.icon));
          break;
        case SECTIONS.cisq:
        case SECTIONS.owasp:
        case SECTIONS.cwe:
        case SECTIONS.pci:
        case SECTIONS.pciv4:
        case SECTIONS.stig:
        case SECTIONS.stigv5:
        case SECTIONS.stigv6:
        case SECTIONS.nist:
        case SECTIONS.nist53:
        case SECTIONS.omg:
        case SECTIONS.cpp:
        case SECTIONS.iso:
        case SECTIONS.aipStructuralFlaw:
          historyPushState();
          dispatch(setListCount(2));
          dispatch(showContentView());
          dispatch(clearListData());
          dispatch(fetchStandardsListData(link.href));
          break;
        case SECTIONS.extensions:
          fetch(link.href)
            .then(res => res.json())
            .then(data => {
              historyPushState();
              dispatch(setListCount(1));
              dispatch(showContentView());
              dispatch(fetchWebData(data[0].href));
              dispatch(appendToHeaderPath(data));
            });
          break;
        default:
          historyPushState();
          dispatch(clearStandardsListData());
          dispatch(setListCount(1));
          dispatch(showContentView());
          dispatch(fetchWebData(link.href));
          break;
      }
      dispatch(appendToHeaderPath(link));
      dispatch(clearDetailsData());
      dispatch(setSelectedItem());
    }
  };
};

const mapStateToProps = (state) => {
  return {
    loading: state.navTile.loading,
    title: state.navTile.title,
    navContent: state.navTile.data,
    icon: state.navTile.icon
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BodyNavigation);