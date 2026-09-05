import React from 'react';
import TableAreaView from './TableAreaView';
import './GameView.scss'; // Pour conserver les styles nécessaires

const TableView = (props) => {
    return (
        <div className="table-view-only-container">
            <TableAreaView {...props} />
        </div>
    );
};

export default TableView;
