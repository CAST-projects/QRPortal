import makeStyles from '@material-ui/styles/makeStyles';

const useStyles = makeStyles({
  treeView: {
    padding: '15px',
    
    '& .MuiTreeItem-label': {
      textTransform: 'capitalize',
      letterSpacing: '1px',
      lineHeight: '2',
      paddingLeft: '10px',
      fontSize: "0.8rem",
    },
  },
});

export default useStyles;
