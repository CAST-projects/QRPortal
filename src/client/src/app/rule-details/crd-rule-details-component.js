import React, { useMemo } from 'react';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import { makeStyles } from '@material-ui/core/styles';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import { Link, SvgIcon } from '@material-ui/core';
import classNames from 'classnames';

function parseLinks( text ){
  if (!text) return text;
  const reg = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&\/=]*)/g,
    matches = text.match(reg), ml = matches ? matches.length : 0;
  let idxStart = 0, idxEnd = 0;

  let str = [];

  for (let i = 0; i < ml; i++) {
    const url = matches[i];
    idxStart = text.indexOf(url, idxEnd);
    const node = (<span key={'node-'+i}>{text.substring(idxEnd, idxStart)}</span>),
      ahrefBlock = (<a key={'anchor-'+i} href={url}>{url}</a>),
      block = <div>{node}{ahrefBlock}</div>
    str.push(block);
    idxEnd = idxStart + url.length;
  }
  return ml > 0 ? str : text;
}

const useStyles = (heightCalc = 318) => makeStyles((theme) => ({
  empty: {
    textAlign: 'center',
    margin: '50px',
    letterSpacing: '5px',
    fontSize: '30px',
    color: 'silver',
  },
  ruleDetailsContainer: {
    padding: '0 24px 0 24px',
    marginTop: 24,
    maxHeight: `calc(100vh - ${heightCalc - 148}px)`,
    overflow: 'hidden auto',
    scrollbarWidth: "thin",
  },
  ruleDetailsContent: {
    paddingTop: 24,
  },
  marginBottom20: {
    marginBottom: 20,
  },
  marginBottom5: {    
    marginBottom: 5,
  },
  marginTop20: {
    marginTop: 20,
  },
  downloadTag: {
    color: "#fff",
    backgroundColor: "#1f2444",
    borderRadius: 10,
    maxWidth: "52%",
    padding: 8,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center"
  },
  downloadLinkContainer: {
    color: "#fff",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",

    "& :visited": {
      color: "#fff",
    }
  },
  downloadIcon: {
    filter: "invert(100%) sepia(100%) saturate(0%) hue-rotate(81deg) brightness(101%) contrast(102%)",
    paddingRight: 8
  },
  downloadLink: {
    display: "inline-block"
  },
  code: {
    whiteSpace: "pre-wrap",
  },
  chipRoot: {
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
}));

const RuleDetailsContent = (props) => {
  const { ruleDetails, heightCalc } = props;
  const classes = useStyles(heightCalc)();

  const isDataValid = data => data && !_isEmpty(data);

  const renderItemInfo = (title, description) => (
    <div>
      <Typography gutterBottom variant='h6' component='h2'>
        {title}
      </Typography>
      <Typography variant='body2' color='textSecondary'>
        {description}
      </Typography>
    </div>
  );
  
  const defaultValueSetter = (item) => item.name;
  const renderChipsInfo = (title, content, valueSetter = defaultValueSetter) => (
    <div className={classes.marginBottom5}>
      <Typography gutterBottom variant='button' component='h2'>
        {title}
      </Typography>
      <div className={classes.chipRoot}>
        {
          content.map(item => (
            <span key={item.id}>
              <Chip size='small' label={<Typography variant='caption'>{valueSetter(item)}</Typography>} />
            </span>
          ))
        }
      </div>
    </div>
  );

  const downloadLink = useMemo(() => {
    return _get(ruleDetails, "download");
  }, [ ruleDetails ]);

  return (
    !_isEmpty(ruleDetails)
      ? (<div className={classes.ruleDetailsContainer}>
        <Typography gutterBottom variant='h5' component='h2'>
          {_get(ruleDetails, 'name')}
        </Typography>
        <div className={classes.ruleDetailsContent}>
          <div className={classes.marginBottom20}>
            {isDataValid(_get(ruleDetails, 'businessCriteria')) && renderChipsInfo('Business Criteria', _get(ruleDetails, 'businessCriteria'))}
            {isDataValid(_get(ruleDetails, 'qualityStandards')) && renderChipsInfo('Quality Standards', _get(ruleDetails, 'qualityStandards'), (item) => `${item.id} - ${item.name}`)}
            {isDataValid(_get(ruleDetails, 'technologies')) && renderChipsInfo('Technologies', _get(ruleDetails, 'technologies'))}
            {isDataValid(_get(ruleDetails, 'technicalCriteria')) && renderChipsInfo('Technical Criteria', _get(ruleDetails, 'technicalCriteria'))}
          </div>
          <div>
            {_get(ruleDetails, 'description') && renderItemInfo('Description', _get(ruleDetails, 'description'))}
            {_get(ruleDetails, 'rationale') && renderItemInfo('Rationale', _get(ruleDetails, 'rationale'))}
            {_get(ruleDetails, 'remediation') && renderItemInfo('Remediation', _get(ruleDetails, 'remediation'))}
            {_get(ruleDetails, 'sample') && renderItemInfo('Sample', (<pre className={classes.code}><code>{_get(ruleDetails, 'sample')}</code></pre>))}
            {_get(ruleDetails, 'remediationSample') && renderItemInfo('Remediation Sample', (<pre className={classes.code}><code>{_get(ruleDetails, 'remediationSample')}</code></pre>))}
            {_get(ruleDetails, 'reference') && renderItemInfo('References', parseLinks(_get(ruleDetails, 'reference')))}
          </div>
          {downloadLink && <div className={classNames(classes.marginTop20, classes.downloadTag)}>
            <Link href={downloadLink} className={classes.downloadLinkContainer}>
              <img src='assets/img/placeholder-template.svg' className={classes.downloadIcon}/>
              <Typography className={classes.downloadLink} variant="body2">Download Template for CAST Architecture Studio</Typography>
            </Link>
          </div>}
        </div>
      </div>)
      : <div className={classes.empty}>No results found</div>
  );
};

export default RuleDetailsContent;
