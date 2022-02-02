import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';

import { useFormik } from 'formik';
import * as yup from 'yup';
import { makeStyles } from '@material-ui/core/styles';

import { EXTEND_REGISTER_URL } from 'app/crd-app-constants';

const validationSchema = yup.object({
  email: yup
    .string('Enter your email')
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string('Enter your password')
    .required('Password is required'),
});

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
  },
  formContent: {
    paddingTop: '0 !important',
    paddingBottom: 0,
  },
  dialogActions: {
    padding: '16px',
    paddingRight: '24px',
  },
  dialogContentText: {
    paddingLeft: '24px',
    paddingTop: '8px',
    color: 'black',
  },
  extendIcon: {
    height: 100,
    width: 100,
  },
  description: {
    textAlign: "center",
    width: "80%",
  },
  extendIconWrapper: {
    width: '1em',
    height: '1em',
    fontSize: '1em',
  },
}));

const Login = (props = {}) => {
  const {
    handleLogin,
    handleLogout,
    isLoggedIn,
    loginErrorMessage,
    resetLoginErrorMessage,
    isAuthRequestOngoing,
  } = props;

  const [open, setOpen] = useState(false);

  // Imperatively close the dialog when authentication request is successful
  useEffect(() => {
    if (!isAuthRequestOngoing && isLoggedIn && open) {
      setOpen(false);
      location.reload();
    }
  }, [isAuthRequestOngoing, isLoggedIn]);

  const classes = useStyles();

  const handleLogOutClick = () => {
    handleLogout();
    location.reload();
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const labels = {
    login: 'Login',
    logout: 'Log out',
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      resetLoginErrorMessage();
      handleLogin(values.email, values.password);
    },
  });

  return (
    <div>
      {isLoggedIn
        ? <Button color='inherit' variant='outlined' onClick={handleLogOutClick}>{labels.logout}</Button>
        : <Button color='inherit' variant='outlined' onClick={handleClickOpen}>{labels.login}</Button>}
      <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
        <Grid container alignItems='center' justify='center' direction="column">
          <Grid item alignItems='center' xs={12} justify='center' direction="column">
            <DialogTitle id='form-dialog-title'>Sign In</DialogTitle>
          </Grid>
          <DialogContentText className={classes.description} variant='body2'>Using your CAST Extend will allow you to gain access to additional rule information</DialogContentText>
          <Grid item alignItems='center' xs={12} justify='center' direction="row">
              <img className={classes.extendIcon} src='assets/img/com.castsoftware.aip.extendservice.png'/>
          </Grid>
          <Grid item xs={5}>
            <div />
          </Grid>
        </Grid>
        <div>
          <form onSubmit={formik.handleSubmit}>
            <DialogContent className={classes.formContent}>
              <TextField
                autoFocus
                margin='dense'
                fullWidth
                id='email'
                name='email'
                label='Email'
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
              <TextField
                margin='dense'
                fullWidth
                id='password'
                name='password'
                label='Password'
                type='password'
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
              />
              <Typography variant='body1' color='error'>
                {loginErrorMessage}
              </Typography>
            </DialogContent>
            <DialogContentText className={classes.dialogContentText}>
              Not yet on Extend? <a href={EXTEND_REGISTER_URL} target='_blank' rel='noreferrer'>Register</a>
            </DialogContentText>
            <DialogActions className={classes.dialogActions}>
              <Button onClick={handleClose} color='primary'>
            Cancel
              </Button>
              <Button variant='contained' color='primary' type='submit' disabled={isAuthRequestOngoing}>
            Submit
              </Button>
            </DialogActions>
          </form>
        </div>
      </Dialog>
    </div>
  );
};

Login.propTypes = {
  handleLogin: PropTypes.func,
  handleLogout: PropTypes.func,
  resetLoginErrorMessage: PropTypes.func,
  isLoggedIn: PropTypes.bool,
  isAuthRequestOngoing: PropTypes.bool,
  loginErrorMessage: PropTypes.string,
};

export default Login;
