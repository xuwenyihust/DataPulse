import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@mui/material';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/theme-github';
import ReactMarkdown from 'react-markdown';
import CellHeader from './header/CellHeader';
import CellSideButtons from './CellSideButtons';
import { CellType } from './CellType';
import { OutputType } from './result/OutputType';
import CodeEditor from './content/CodeEditor';
import MarkdownEditor from './content/MarkdownEditor';
import TextResult from './result/TextResult';
import ErrorResult from './result/ErrorResult';
import CodeResult from './result/CodeResult';


function Cell({ 
    cell, 
    index, 
    notebookState, 
    cellStatus,
    setCellStatus,
    cellExecutedStatus,
    setCellExecutedStatus,
    handleChangeCell, 
    handleDeleteCell, 
    handleChangeCellType, 
    handleMoveCell, 
    handleRunCodeCell,
    handleCopyCell,
    handelRunAllAboveCells
  }) {
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const textEditorLineHeight = 20; // adjust this to match your actual line height
    const textEditorLines = cell.source && typeof cell.source === 'string' ? 
      cell.source.split('\n').length : 1;
    const textEditorHeight = `${Math.max(textEditorLines, 1) * textEditorLineHeight}px`;

    useEffect(() => {
      if (cell.cell_type === CellType.CODE) {
        setCellExecutedStatus(false);
      } else if (cell.cell_type === CellType.MARKDOWN) {
        setCellExecutedStatus(true);
      }
    }, [notebookState.path])
    
    const handleDoubleClickMarkdownCell = (cellIndex) => {
      notebookState.content.cells[cellIndex].isExecuted = false;
      setCellExecutedStatus(false);
      console.log('Double clicked markdown cell:', cell.source, cell.isExecuted);
    }

    const handleRunMarkdownCell = (cellIndex) => {
      setCellExecutedStatus(true);
      notebookState.content.cells[cellIndex].isExecuted = true;
    }

    const handleRunCell = (cell, cellIndex) => {
      if (cell.cell_type === CellType.CODE) {
        handleRunCodeCell(cell, cellStatus, setCellStatus);
      } else {
        handleRunMarkdownCell(cellIndex);
      }
    }

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}>
          <Card key={index} 
              elevation={0}
              sx={{ 
                  width: '85%',
                  marginTop: 1,
                  marginBottom: 1,
                  marginLeft: 10,
                  marginRight: 1,
                  border: isFocused ? 1.0 : 0.5,
                  borderColor: isFocused ? 'black' : 'lightgrey',
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
              }}>
              <CellHeader 
                cell={cell} 
                index={index} 
                cellStatus={cellStatus} 
                handleRunCell={handleRunCell} 
                handleChangeCellType={handleChangeCellType}
                handleCopyCell={handleCopyCell}
                handelRunAllAboveCells={handelRunAllAboveCells}/>
              <CardContent>
                {cell.cell_type === CellType.CODE ? (
                  <CodeEditor 
                    cell={cell} 
                    cellIndex={index}
                    textEditorHeight={textEditorHeight}
                    handleChangeCell={handleChangeCell}
                    setIsFocused={setIsFocused} />
                ) : ( 
                  cellExecutedStatus ? 
                  <div onDoubleClick={() => handleDoubleClickMarkdownCell(index)}>
                    <ReactMarkdown>
                      {cell.source}
                    </ReactMarkdown>
                  </div> :
                  <MarkdownEditor 
                    cell={cell} 
                    cellIndex={index}
                    textEditorHeight={textEditorHeight}
                    handleChangeCell={handleChangeCell}
                    setIsFocused={setIsFocused} />)}
              </CardContent>
          </Card>   

          {(isFocused || isHovered) && (
            CellSideButtons(
              notebookState,
              index,
              handleDeleteCell,
              handleMoveCell
            )
          )}
        </div>      

        {cell.outputs && cell.outputs.length > 0 && cell.outputs.map((output, index) => 
          output.output_type === OutputType.EXECUTE_RESULT ? 
            TextResult(output) :
              (output.output_type === OutputType.ERROR ? (
                ErrorResult(index, isFocused, output)
              ) : (output.output_type === OutputType.STREAM ? (
                CodeResult(index, output)
              ) : null)
            )
        )}
      </div>
    )
}

export default Cell;