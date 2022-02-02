import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter, useLocation } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import _isEmpty from 'lodash/isEmpty';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Tree from '../tree';
import AppRoutes from '../crd-app-routes-component';
import Login from '../login/crd-login-component';
import Search from '../global-search/crd-search-component';

const drawerWidth = 350;

const useStyles = makeStyles(theme => ({
  root: {
    padding: 0,
    // display: 'flex',
  },
  contentGrid: {
    flexWrap: 'nowrap',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: '#1f2444',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: '#e1e7f0',
  },
  drawerContainer: {
    overflow: 'auto',
    scrollbarWidth: "thin",
  },
  content: {
    flexGrow: 1,
    padding: '5px',
  },
  homeIcon: {
    width: '25px',
    height: '25px',
    backgroundImage: 'url(/assets/img/LogoStructuralRules.svg)',
    marginRight: '15px',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  toolbarBranding: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  navbarWidgets: {
    display: 'flex',
    flexDirection: 'row',
  },
  searchDetails: {
    marginLeft: '14px',
    marginTop: 10,
    display: 'flex',
    flexDirection: 'row',
    '& button': {
      marginLeft: '32px',
    },
  },
}));

const Home = (props) => {
  const {
    mainMenu,
    getMainMenu,
    login,
    logout,
    isLoggedIn,
    loginErrorMessage,
    resetLoginErrorMessage,
    isAuthRequestOngoing,
    searchCriterion,
    searchTerm,
    resetSearch,
    history,
  } = props;

  const classes = useStyles();
  const { pathname } = useLocation();
  const mainPath = pathname.split('/').slice(1);

  useEffect(() => {
    if (mainPath[0] === 'search_term') {
      getMainMenu('aip');
    } else if (mainPath[0] === '') {
      history.push('/aip');
      getMainMenu('aip');
    } else {
      getMainMenu(mainPath[0]);
    }
  }, []);

  const onResetSearch = () => {
    resetSearch();
    history.push('/');
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position='fixed' className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <div className={classes.toolbarBranding}>
            <div className={classes.homeIcon} />
            <Typography noWrap style={{ letterSpacing: '2.5px', fontWeight: 'bold', marginRight: '10px' }}>CAST</Typography>
            <Typography noWrap style={{ letterSpacing: '2.5px' }}>Rules Documentation</Typography>
          </div>
          <div className={classes.navbarWidgets}>
            <Search
              isLoggedIn={isLoggedIn}
              searchTerm={searchTerm}
              searchCriterion={searchCriterion}
            />
            <Login
              isLoggedIn={isLoggedIn}
              handleLogin={login}
              handleLogout={logout}
              loginErrorMessage={loginErrorMessage}
              resetLoginErrorMessage={resetLoginErrorMessage}
              isAuthRequestOngoing={isAuthRequestOngoing}
            />
          </div>
        </Toolbar>
      </AppBar>
      <Grid container item direction='row' className={classes.contentGrid}>
        <Drawer
          className={classes.drawer}
          variant='permanent'
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <Toolbar />
          <div className={classes.drawerContainer}>
            {!_isEmpty(mainMenu) && <Tree mainMenu={mainMenu} />}
          </div>
          <Toolbar />
        </Drawer>
        <main className={classes.content}>
          <Toolbar />
          {searchTerm && (<div className={classes.searchDetails}>
            <Typography variant='h6'>
              <>Displaying results for search term <b>"{decodeURIComponent(searchTerm)}"</b></>
              {searchCriterion && <> in the criterion <b>"{searchCriterion}"</b>.</>}
            </Typography>
            <Button color='primary' variant='outlined' size='small' onClick={onResetSearch}>
              Reset search
            </Button>
          </div>)}
          <AppRoutes />
          <Toolbar />
        </main>
      </Grid>
    </div>
  );
};

Home.propTypes = {
  login: PropTypes.func,
  logout: PropTypes.func,
  resetLoginErrorMessage: PropTypes.func,
  resetSearch: PropTypes.func,
  isLoggedIn: PropTypes.bool,
  isAuthRequestOngoing: PropTypes.bool,
  loginErrorMessage: PropTypes.string,
  searchCriterion: PropTypes.string,
  searchTerm: PropTypes.string,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
};

export default withRouter(Home);
