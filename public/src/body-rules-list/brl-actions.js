import * as ACTIONTYPES from './brl-actions-type';
import * as resources from './brl-resources';
import { historyReplaceState } from '../common';

export const setFetchingState = ( query ) => {
  return {
    type: ACTIONTYPES.FETCH_LIST_DATA,
    payload: {
      query
    }
  };
};

export const endLoadingState = () => {
  return {
    type: ACTIONTYPES.STOP_LIST_LOADING_STATE
  };
};

const fetchError = ( query, err ) =>{
  return {
    type: ACTIONTYPES.FAILED_TO_FETCH_LIST_DATA,
    payload: {
      query,
      err
    }
  };
};

const setListData = ( query, data ) => {
  return {
    type: ACTIONTYPES.SET_LIST_DATA,
    payload: {
      query,
      data
    }
  };
};

export const setCustomMessage = ( msg ) =>{
  return {
    type: ACTIONTYPES.SET_CUSTOM_MESSAGE_RULES_LIST,
    payload: {
      msg
    }
  };
};

export const setSelected = ( itemRef ) => {
  return {
    type: ACTIONTYPES.SET_SELECTED_RULE_LIST_ITEM,
    payload: {
      itemRef
    }
  };
};

export const clearListData = () => {
  return {
    type: ACTIONTYPES.CLEAR_LIST_DATA,
  };
};

export const fetchListData = ( query, fetchfunc ) => {
  return (dispatch) => {
    dispatch(setFetchingState( query ));
    return fetchfunc( query ).then(
      data => dispatch(setListData( query, data )),
      err => dispatch(fetchError(query, err))
    ).then(()=>historyReplaceState());
  };
};

export const fetchApiData = ( query ) => fetchListData( query, resources.fetchData );
// export const fetchTechnologiesData = ( query ) => fetchListData( query, resources.fetchTechnologiesList );
// export const fetchExtensionsList = ( query ) => fetchListData( query, resources.fetchExtensionsList );
export const fetchWebData = ( query ) => fetchListData( query, resources.fetchWebData );