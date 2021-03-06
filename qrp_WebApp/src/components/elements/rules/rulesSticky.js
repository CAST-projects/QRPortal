import React from 'react';
import { RulesBody, LOADRULESLIST, RETURNTOSTART, Radio, UNSELECTME, UpdateURL, lOADDETAILS, LOADRULESLISTSANDDETAILS} from '../../index';


const localClassName = ['rulesList-container', 'static-overlay'],
  visibleClass = 'visible',
  sp = ' ';

export default class Rules extends React.Component{
  constructor(){
    super();

    this.state = {};

    Radio.listen( LOADRULESLIST, this.LoadRuleList.bind(this));
    Radio.listen( RETURNTOSTART, this.hideRuleList.bind(this));
    Radio.listen( LOADRULESLISTSANDDETAILS, this.loadLists.bind(this));
  }

  loadLists( rulesListUrl, nextRuleList, name ){
    this.setState({
      rulesVisible: true,
      title: name,
      rulesHref: rulesListUrl,
      rulesHref2: nextRuleList
    });
  }

  hideRuleList(){
    this.setState({
      rulesVisible: false,
      rulesHref: undefined,
      rulesHref2: undefined,
      title: undefined
    });
    history.pushState(null, null, '/rules');
    Radio.emit(UNSELECTME);
  }

  LoadRuleList( url, name ){
    if( url === this.state.rulesHref && name === this.state.title ) return;
    this.setState({
      rulesVisible: true,
      title: name,
      rulesHref: url,
    });
    Radio.emit(lOADDETAILS);
    UpdateURL(url);
  }

  render(){
    return (
      <RulesBody visible={this.state.rulesVisible} 
        icon={this.state.title} 
        title={this.state.title}
        href={this.state.rulesHref}
        href2={this.state.rulesHref2}/>
    );
  }

  getContainerClass( props ){
    return ((props && props.visible) ? localClassName.concat( visibleClass ).join( sp ) : localClassName.join( sp ));
  }
}