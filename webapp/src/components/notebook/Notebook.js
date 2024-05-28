import React, { useState, useEffect } from 'react';
import { Button, Tooltip } from '@mui/material';
import NotebookToolbar from './NotebookToolbar';
import NotebookCell from './NotebookCell';
import { updateNotebook, renameNotebook } from '../../api';

function Notebook({ jupyterBaseUrl, 
    showNotebook, 
    notebook,
    notebookState,
    setNotebookState,
    isNotebookModified,
    setIsNotebookModified,
    handleDeleteNotebook }) {

    const baseUrl = `${jupyterBaseUrl}/api/contents/`
    const [isNameEditing, setIsNameEditing] = useState(false);
    const [currentName, setCurrentName] = useState(notebook.name);

    useEffect(() => {
        if (notebook && notebook.content) {
            setNotebookState(notebook);
            setCurrentName(notebook.name);
        }
    }, [notebook]);

    // useEffect(() => {
    //     const handleBeforeUnload = (event) => {
    //       if (isNotebookModified) {
    //         event.preventDefault();
    //         event.returnValue = '';
    //       }
    //     };
      
    //     window.addEventListener('beforeunload', handleBeforeUnload);
      
    //     return () => {
    //       window.removeEventListener('beforeunload', handleBeforeUnload);
    //     };
    //   }, [isNotebookModified]);

    const handleClickNotebookName = () => {
        setIsNameEditing(true);
    }

    const handleChangeNotebookName = (event) => {
        setCurrentName(event.target.value);
    }

    const handleSaveNotebookName = () => {
        console.log('Saving notebook name:', currentName);
        setIsNameEditing(false);
        setCurrentName(currentName);
        renameNotebook(baseUrl, notebook.path, currentName).then((data) => {
            console.log('Notebook name saved:', data);
        }).catch((error) => {
            console.error('Failed to save notebook name:', error);
        });
    }

    const handleUpdateNotebook = () => {
        updateNotebook(baseUrl + notebook.path, notebookState.content).then((data) => {
            setIsNotebookModified(false)
        }).catch((error) => {
            console.error('Failed to save notebook:', error);
        });
    }

    const handleChangeCell = (newValue, cellIndex) => {
        setIsNotebookModified(true);
        setNotebookState(prevState => {
            const newState = {...prevState};
            newState.content.cells[cellIndex].source = newValue;
            return newState;
    });}

    const handleCreateCell = (type = 'code', index) => {
        const newCell = {
            cell_type: type,
            metadata: {},
            source: "",
        };

        if (type === 'code') {
            newCell.execution_count = null;
            newCell.outputs = [];
        }

        setIsNotebookModified(true);
        setNotebookState(prevState => {
            const cells = [...prevState.content.cells];
            cells.splice(index, 0, newCell);
            return {
                ...prevState,
                content: {
                    ...prevState.content,
                    cells: cells,
                }
            };
        });
    }

    const handleDeleteCell = (cellIndex) => {
        setIsNotebookModified(true);
        setNotebookState(prevState => {
            const newState = {...prevState};
            newState.content.cells.splice(cellIndex, 1);
            return newState;
        });
    }

    const handleChangeCellType = (cellIndex, newCellType) => {
        setIsNotebookModified(true);
        setNotebookState(prevState => {
            const newState = {...prevState};
            newState.content.cells[cellIndex].cell_type = newCellType;
            return newState;
        });
    }

    const handleMoveCell = (fromIndex, toIndex) => {
        if (!notebookState.content.cells || toIndex < 0 || toIndex >= notebookState.content.cells.length) return;

        setIsNotebookModified(true);
        const cellsCopy = [...notebookState.content.cells];
        const cellToMove = cellsCopy.splice(fromIndex, 1)[0];
        cellsCopy.splice(toIndex, 0, cellToMove);

        setNotebookState({
            ...notebookState,
            content: {
                ...notebookState.content,
                cells: cellsCopy
            }
        });
    }

    return (
        <div style={{ paddingLeft: 20, paddingRight: 0, marginLeft: 200 }}> {/* Adjust marginLeft based on your sidebar width */}
            {showNotebook && (
                <div>
                    {notebookState.name && 
                        <NotebookToolbar 
                            notebook={notebookState} 
                            isNameEditing={isNameEditing}
                            currentName={currentName}
                            isNotebookModified={isNotebookModified}
                            handleClickNotebookName={handleClickNotebookName}
                            handleChangeNotebookName={handleChangeNotebookName}
                            handleSaveNotebookName={handleSaveNotebookName}
                            saveNotebook={handleUpdateNotebook}
                            deleteNotebook={handleDeleteNotebook} />
                    }
                    {notebookState.content && 
                        notebookState.content.cells && 
                        notebookState.content.cells.map((cell, index) => (
                        <div style={{ position: 'relative' }}>
                            <NotebookCell
                                cell={cell}
                                index={index}
                                notebookState={notebookState}
                                handleChangeCell={handleChangeCell}
                                handleDeleteCell={handleDeleteCell} 
                                handleChangeCellType={handleChangeCellType}
                                handleMoveCell={handleMoveCell}/>
                            <div 
                                style={{ 
                                    display: 'flex',
                                    justifyContent: 'center'}}>
                                <Tooltip title="Add Code Cell" 
                                    sx={{fontSize: 11,
                                    color: "grey"}}>
                                    <Button onClick={() => handleCreateCell('code', index + 1)}>
                                        + Code
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Add Code Cell"
                                    sx={{fontSize: 11,
                                    color: "grey"}}>
                                    <Button onClick={() => handleCreateCell('markdown', index + 1)}>
                                        + Markdown
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Notebook;
