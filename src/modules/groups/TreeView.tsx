import React, {Fragment, useEffect, useState} from 'react';
import SortableTree, {
    addNodeUnderParent,
    changeNodeAtPath,
    ExtendedNodeData,
    getFlatDataFromTree,
    getTreeFromFlatData,
    removeNodeAtPath,
    TreeItem,
    TreeNode,
    TreePath
} from 'react-sortable-tree';
import {createNode} from "./treeData";
import Details from "./Details";
import {GroupPrivacy, IGroup, IStats} from "./types";
import {del, get, handleError, post, put} from "../../utils/ajax";
import {remoteRoutes} from "../../data/constants";
import {Typography} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import InfoIcon from '@material-ui/icons/InfoOutlined';

const getNodeKey = ({node}: any) => node.id

type Weird = TreeNode & TreePath & { lowerSiblingsCounts: number[] } & { rootKey: string | null }


const createTreeData = (initialData: any[]) => {
    const flatData = initialData.map(node => {
        const item: Weird = {...node}
        return item;
    })
    let key = 'rootKey'
    return getTreeFromFlatData({
        flatData: flatData,
        getKey: (node: any) => node.id,
        getParentKey: (node: any) => node.parent,
        [key]: null
    })
}

const createFlatData = (treeData: any[]): IGroup[] => {
    return getFlatDataFromTree({
        treeData: treeData,
        getNodeKey: getNodeKey,
        ignoreCollapsed: false,
    }).map(({node, path}) => {
        const {children, ...rest} = node
        return {
            ...rest,
            id: node.id,
            name: node.name,
            isComplete: node.isComplete,
            privacy: GroupPrivacy.Public,
            parent: path.length > 1 ? path[path.length - 2] : null,
        }
    })
}

const TreeView: React.FC = () => {
    const [query, setQuery] = useState<any>("");
    const [searchFocusIndex, setSearchFocusIndex] = useState<any>(0);
    const [searchFoundCount, setSearchFoundCount] = useState<any>(null);
    const [treeData, setTreeData] = useState<TreeItem[]>([]);
    const [flatData, setFlatData] = useState<IGroup[]>([]);
    const [nodeData, setNodeData] = useState<any | null>(null);

    useEffect(() => {
        get(remoteRoutes.groups, data => {
            const newTreeData = createTreeData(data);
            setTreeData(newTreeData)
            setFlatData(data)
        })
    }, [query])


    const addNew = ({node, path}: any) => () => {
        const newNode = createNode(node.id);
        post(remoteRoutes.groups, newNode, data => {
            const newData = addNodeUnderParent({
                treeData: treeData,
                parentKey: path[path.length - 1],
                expandParent: true,
                getNodeKey: getNodeKey,
                newNode: data,
            })
            setTreeData(newData.treeData)
            setFlatData(createFlatData(newData.treeData))
        })
    }

    const showDetails = (nodeData: any) => () => {
        setNodeData(nodeData)
    }

    const getStats = (node: IGroup): IStats => {
        const childTasks: IGroup[] = flatData.filter(it => it.parent === node.id)
        const childCount = childTasks.length
        let isComplete = false
        let percentage = 0

        return {
            childCount,
            isComplete,
            percentage
        }
    }

    const removeNode = ({node, path}: any) => () => {
        console.log({node, path})
        const url = `${remoteRoutes.groups}/${node.id}`
        del(url, data => {
            console.log("deleted data", data)
            const newData = removeNodeAtPath({
                treeData: treeData,
                path,
                getNodeKey: getNodeKey,
            })
            setTreeData(newData)
            setFlatData(createFlatData(newData))
        })

    }

    const handleClose = () => {
        setNodeData(null)
    }

    function handleChange({nodeChanges, node, path}: any) {
        const newData = changeNodeAtPath({
            treeData: treeData,
            path,
            getNodeKey: getNodeKey,
            newNode: {...node, ...nodeChanges},
        })
        setTreeData(newData)
        setFlatData(createFlatData(newData))
    }

    function handleTreeChange(newTreeData: TreeItem[]) {
        setTreeData(newTreeData)
        setFlatData(createFlatData(newTreeData))
    }

    function onMoveNode(state: any) {
        const {nextParentNode, node, prevPath} = state
        const {children, ...nodeProps} = node
        const updates = {
            ...nodeProps,
            parent: nextParentNode.id
        }
        put(remoteRoutes.groups, updates, updatedData => {
            // Leave node As Updated
        }, (err, res) => {
            handleError(err, res)
            // show error on dode and tree
        })
        console.log("On move node", state)
    }

    return (
        <Fragment>
            <div className='fill'>
                <div style={{width: "70%", height: "500px", display: 'inline-block'}}>
                    <SortableTree
                        treeData={treeData}
                        onChange={handleTreeChange}
                        getNodeKey={getNodeKey}
                        generateNodeProps={(nodeData: ExtendedNodeData) => {
                            const {node, path} = nodeData
                            const stats = getStats(node as IGroup)
                            return {
                                title: (
                                    <Box display='flex'>
                                        <Box width="100%">
                                            <Typography>{node.name}</Typography>
                                        </Box>
                                        <Box pl={3}>
                                            <Chip size="small" label={`${stats.childCount} Subs`}/>
                                        </Box>
                                    </Box>
                                ),
                                buttons: [
                                    <IconButton
                                        color="default"
                                        size='small'
                                        onClick={showDetails({node, path})}
                                    >
                                        <InfoIcon/>
                                    </IconButton>,
                                    <IconButton
                                        color="default"
                                        size='small'
                                        onClick={addNew({node, path})}
                                    >
                                        <AddIcon/>
                                    </IconButton>,
                                    <IconButton
                                        color="default"
                                        size='small'
                                        onClick={removeNode({node, path})}
                                    >
                                        <ClearIcon/>
                                    </IconButton>
                                ],
                            }
                        }}
                        onMoveNode={onMoveNode}
                    />
                </div>
                <div style={{width: "30%", height: "100%", float: 'right'}}>
                    <pre className='fill' style={{overflow: "auto"}}>
                        {JSON.stringify(flatData, null, 2)}
                    </pre>
                </div>
            </div>
            {
                !!nodeData &&
                <Details
                    open={true}
                    handleClose={handleClose}
                    nodeData={nodeData}
                    handleChange={handleChange}
                />
            }
        </Fragment>
    );
}

export default TreeView;
