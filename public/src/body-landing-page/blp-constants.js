import { Imgs } from '../view-navigation/vn-constants';
import { isEcho } from '../common';

export const SECTIONSQUERY = 'aip/web-navigation';
export const QUERYFAILED = {
  value: 'ERROR: Failed to retrieve navigation data, please try again later.',
  href: '#'
};

export const CLASSES = {
  container: 'qrp_lpCntr',
  SubContainer: 'qrp_lpSCntr',
  iconContainer: 'qrp_lpiCntr',
  welcomeText: 'qrp_lpwtxtCntr',
  navigation: 'qrp_lpnav',
  link: 'qrp_lpslink',
  linkBlock: 'qrp_lpslinkBlk',
  linkContainer: 'qrp_lpslinkCntr',
  linkBlockTitle: 'qrp_lpslinkBlkTlt',
  linkIcon: 'qrp_lpslinkIcon',
  separator: 'qrp_lpSsep',
  title: 'qrp_lptitleCntr',
  logoContainer: 'qrp_lplogoCntr',
  castLogo: 'qrp_lpcastlogo',
  extraInfoContainer: 'qrp_lpsecInfoCntr',
  sectionInfo: 'qrp_lpsecInfo',
  hideOpacity: 'qrp_lpOpa0'
};

export const _oIconStyle = {
  backgroundImage: 'url(' + (isEcho() ? Imgs.carllogo.reflect : Imgs.logo.reflect) + ')',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'top center',
  backgroundSize: (isEcho() ? '250px' : '80%'),
  width: (isEcho() ? '250px' : '150px')
};

export const WELCOMETEXT = (isEcho() ? 'Welcome to CARL Best Practices documentation, start browsing or searching' : 'Welcome to CAST Rules documentation, start browsing or searching');
export const TITLE = (isEcho() ? 'Best Practices' : 'CAST Rules Documentation');
