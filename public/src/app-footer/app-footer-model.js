import React from 'react';
import { CLASSES, CONTACTUS, COMPAREVERSIONS, swagger, versionKey, TITLE, CASTSOFTWARE, PRIVACYPOLICY, COPY_RIGHT } from './app-footer-constants';
import { COMMON_CLASSES, createClassName, setLocalStorage, readLocalStorage } from '../common/';
import About from 'about/';
import './style.css';

export default class AppFooter extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      infoVisible: false,
      licenseVisible: false
    };

    this.toggleOverlay = this.toggleOverlay.bind(this);
  }

  componentDidMount() {
    fetch('/about')
      .then(res => res.json())
      .then(data => {
        const lastViewedVersion = readLocalStorage(versionKey);
        setLocalStorage(versionKey, data.version);
        this.setState({
          _version: lastViewedVersion,
          currentVersion: data.version,
          loading: false,
          info: data,
          infoVisible: false,
          licenseVisible: false
        });
      })
      .catch(() => {
        setLocalStorage(versionKey, undefined);
      });
  }

  toggleNewsLicense() {
    this.setState(_state => {
      return {
        ..._state,
        licenseVisible: !_state.licenseVisible
      };
    });
  }

  toggleOverlay() {
    return this.setState(_state => {
      return {
        MAILTO: _state.MAILTO,
        _version: _state._version,
        currentVersion: _state.currentVersion,
        loading: false,
        info: _state.info,
        infoVisible: !_state.infoVisible,
        licenseVisible: false
      };
    });
  }

  render() {
    const info = this.state.info;
    return (
      <React.Fragment>
        <div className={CLASSES.floatingFooter}>
          <div className={createClassName(COMMON_CLASSES.flexRow, CLASSES.links)}>
            <div onClick={this.toggleOverlay} className={CLASSES.whatisnew}>What's New?</div>
            <a href={swagger} className={CLASSES.contactus}>API</a>
            <a href={COMPAREVERSIONS} className={CLASSES.contactus}>Compare</a>
            <a href={CONTACTUS} className={CLASSES.contactus}>Contact Us</a>
            <a href={PRIVACYPOLICY} className={CLASSES.contactus}>Privacy policy</a>
          </div>
          <div className={CLASSES.copyRight}>{COPY_RIGHT}</div>
          <div className={CLASSES.logoContainer}>
            <a href={CASTSOFTWARE} className={CLASSES.logoAnchor}><div className={CLASSES.castLogo}></div></a>
          </div>
        </div>
        {this.state.loading ?
          undefined
          : <About
            title={TITLE}
            version={info.version}
            licence={info.licence}
            onMouseClickOut={this.toggleOverlay}
            isVisible={this.state.infoVisible}
            news={info.news}
            showLicense={this.state.licenseVisible}
            onLicenceClick={this.toggleNewsLicense.bind(this)} />}
      </React.Fragment>
    );
  }
}
