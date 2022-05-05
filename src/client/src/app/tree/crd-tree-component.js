import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { TreeView, TreeItem } from '@mui/lab';
// import { StyledEngineProvider } from '@mui/material/styles';
import { StylesProvider, createGenerateClassName } from '@mui/styles';
import useStyles from './crd-tree-styles';

const generateClassName = createGenerateClassName({
  productionPrefix: 'rules-documentation-prod',
});

const Tree = (props) => {
  const classes = useStyles();
  const { mainMenu, treeData, getTreeData, searchTerm, resetSearch, resetTreeData } = props;
  const { pathname } = useLocation();
  const history = useHistory();
  const splittedUrls = pathname.toLowerCase().split('/');
  const mainUrl = splittedUrls[2]
    ? `${splittedUrls[1]}/${splittedUrls[2]}`
    : `${splittedUrls[1]}`;
  const subUrl = splittedUrls[3] && `${mainUrl}/${splittedUrls[3]}`;

  const getDefaultTreeInfo = () => {
    const _defaultTreeInfo = {
      defaultExpanded: [mainUrl],
      defaultSelected: subUrl ? subUrl : mainUrl,
    };

    return _defaultTreeInfo;
  };

  const [treeDataInfo, setTreeDataInfo] = useState([]);
  const [defaultTreeInfo, setDefaultTreeInfo] = useState(getDefaultTreeInfo());

  const findIndex = (nodeId) => {
    const indexUrl = nodeId.split('/', 2).join('/').toLowerCase();

    return mainMenu.items.findIndex(item => item.href === indexUrl);
  };

  const reverseNodeSearch = (nodeId, index, tree) => {
    /** @type {Array<string>} */
    const nodeSplit = nodeId.split("/");
    const nodeLength = nodeSplit.length;
    const maxDepth = [2, 2, 5, 2];

    if (tree[index][nodeId]) {
      return true;
    } else if (nodeLength <= maxDepth[index]) {
      return false;
    } else {
      return reverseNodeSearch(nodeSplit.slice(0, nodeLength - 1).join("/"), index, tree);
    }
  }

  const onNodeSelect = (event, nodeId) => {
    const idx = findIndex(nodeId);

    if (!reverseNodeSearch(nodeId, idx, treeDataInfo)) {
      getTreeData(nodeId, idx);
    }
    resetSearch();
  };

  const renderNeededData = href => treeDataInfo[findIndex(href)];

  const renderLabelIcon = iconUrl => (
    <IconButton aria-label='' size='small'>
      <img src={iconUrl} alt='' width='26' height='26'
        onError={(e) => (e.target.onerror = null, e.target.src = '/assets/img/placeholder.svg')}
      />
    </IconButton>
  );

  const isCountNotValid = node => node.hasOwnProperty('count') && node.count === 0;

  const renderTooltipDescription = description => (
    <Typography
      variant='caption'
      align='justify'
      paragraph={true}
      gutterBottom
      style={{ letterSpacing: '0.75px', padding: '3px', fontSize: '10px' }}
    >
      {description}
    </Typography>
  );

  const renderTitle = title => (
    <Typography
      variant='caption'
      align='justify'
      gutterBottom
      style={{ letterSpacing: '0.75px', padding: '3px', fontSize: '10px' }}
    >
      {title}
    </Typography>
  );

  const renderTooltipMessage = (title, description) => (
    <span>
      <div>
        {
          description
            ? <Typography variant='overline' gutterBottom style={{ fontWeight: 'bold', fontSize: '11px', color: '#bebdb6' }}>
              {title}
            </Typography>
            : renderTitle(title)
        }
      </div>
      {description && renderTooltipDescription(description)}
    </span>
  );

  const renderLabel = (title, description) => (
    <Tooltip
      title={renderTooltipMessage(title, description)}
      placement='right'
      arrow={true}
    >
      <div className='label-ellipsis'>{title}</div>
    </Tooltip>
  );

  const handleNavigate = (urlFragment) =>
    () => {
      history.replace(urlFragment);
    }

  const renderTreeItem = nodes => (
    nodes.map(node => (
      // <Link className='link-element'
      //   key={node.name}
      //   to={(!isCountNotValid(node)) ? `/${node.href}` : '#'}
      // >
      <TreeItem
        key={node.name}
        disabled={isCountNotValid(node)}
        nodeId={node.href.toLowerCase()}
        label={renderLabel((node.displayName || node.name), node.description)}
        icon={node.iconUrl && renderLabelIcon(node.iconUrl)}
        onClick={handleNavigate(!isCountNotValid(node) ? `/${node.href}` : '#')}
      >
        {
          Array.isArray(renderNeededData(node.href)[node.href.toLowerCase()])
            ? renderTreeItem(renderNeededData(node.href)[node.href.toLowerCase()])
            : [<div key={"void-element"} />]
        }
      </TreeItem>
      // </Link>
    )));

  const renderedTree = useMemo(() => (renderTreeItem(treeDataInfo)), [JSON.stringify(treeDataInfo)]);

  const isReloadValid = () => mainUrl && !_isEmpty(mainUrl) && !_isEmpty(mainMenu) && !searchTerm;

  useEffect(() => {
    if (isReloadValid()) {
      getTreeData(mainUrl, findIndex(mainUrl));
    }
  }, []);

  useEffect(() => {
    if (searchTerm) {
      resetTreeData();
    }
  }, [searchTerm]);

  useEffect(() => {
    setTreeDataInfo(treeData);
  }, [JSON.stringify(treeData)]);

  return (
    // <StyledEngineProvider injectFirst>
    <StylesProvider generateClassName={generateClassName}>
      <TreeView
        className={classes.treeView}
        onNodeSelect={onNodeSelect}
        defaultExpanded={_get(defaultTreeInfo, 'defaultExpanded')}
        defaultSelected={_get(defaultTreeInfo, 'defaultSelected')}
      >
        {renderedTree}
      </TreeView>
    </StylesProvider>
    // </StyledEngineProvider>
  );
};

Tree.propTypes = {
  treeData: PropTypes.array,
  getTreeData: PropTypes.func,
};

export default Tree;
