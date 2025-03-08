import React, { useEffect, useState } from 'react';

import './App.css';

const fetchLists = async () => {
  const response = await fetch('https://apis.ccbp.in/list-creation/lists');

  if (!response.ok) throw new Error('Failed to fetch lists');

  return await response.json();
};

const AllLists = () => {
  const [lists, setLists] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);

  const [selectedLists, setSelectedLists] = useState([]);

  const [isCreateMode, setIsCreateMode] = useState(false);

  const [tempLists, setTempLists] = useState({});

  const [newListNumber, setNewListNumber] = useState(1);

  useEffect(() => {
    fetchLists()
      .then(response => {
        const groupedLists = response.lists.reduce((acc, item) => {
          if (!acc[item.list_number]) acc[item.list_number] = [];

          acc[item.list_number].push(item);

          return acc;
        }, {});

        setLists(groupedLists);

        setNewListNumber(Object.keys(groupedLists).length + 1);

        setIsLoading(false);
      })

      .catch(() => {
        setError('Failed to fetch lists');

        setIsLoading(false);
      });
  }, []);

  const handleListSelect = listNumber => {
    setSelectedLists(prev =>
      prev.includes(listNumber)
        ? prev.filter(num => num !== listNumber)
        : [...prev, listNumber]
    );
  };

  const handleCreateNewList = () => {
    if (selectedLists.length !== 2) {
      alert('You should select exactly 2 lists to create a new list');
    } else {
      setIsCreateMode(true);

      setTempLists({
        [selectedLists[0]]: [...lists[selectedLists[0]]],

        [selectedLists[1]]: [...lists[selectedLists[1]]],

        [`New List ${newListNumber}`]: [],
      });
    }
  };

  const handleMoveItem = (fromList, toList, item) => {
    setTempLists(prevLists => {
      const newLists = { ...prevLists };

      newLists[fromList] = newLists[fromList].filter(i => i.id !== item.id);

      if (toList === `New List ${newListNumber}`) {
        newLists[toList] = [
          ...newLists[toList],
          { ...item, sourceList: fromList },
        ];
      } else {
        const updatedItem = { ...item };

        delete updatedItem.sourceList;

        newLists[toList] = [...newLists[toList], updatedItem];
      }

      return newLists;
    });
  };

  const handleCancel = () => {
    setIsCreateMode(false);

    setTempLists({});

    setSelectedLists([]);
  };

  const handleUpdate = () => {
    setLists(tempLists);

    setNewListNumber(newListNumber + 1);

    setIsCreateMode(false);

    setTempLists({});

    setSelectedLists([]);
  };

  const handleRetry = () => {
    setIsLoading(true);

    setError(null);

    fetchLists()
      .then(response => {
        const groupedLists = response.lists.reduce((acc, item) => {
          if (!acc[item.list_number]) acc[item.list_number] = [];

          acc[item.list_number].push(item);

          return acc;
        }, {});

        setLists(groupedLists);

        setNewListNumber(Object.keys(groupedLists).length + 1);

        setIsLoading(false);
      })

      .catch(() => {
        setError('Failed to fetch lists');

        setIsLoading(false);
      });
  };

  const renderLists = listNumber => {
    return tempLists[listNumber]?.map(item => (
      <li key={item.id} className='list-item'>
        <h3>{item.name}</h3>

        <p>{item.description}</p>

        {listNumber === selectedLists[0] && (
          <button
            onClick={() =>
              handleMoveItem(
                selectedLists[0],
                `New List ${newListNumber}`,
                item
              )
            }
            className='arrow-btn'
          >
            ➡
          </button>
        )}

        {listNumber === selectedLists[1] && (
          <button
            onClick={() =>
              handleMoveItem(
                selectedLists[1],
                `New List ${newListNumber}`,
                item
              )
            }
            className='arrow-btn'
          >
            ⬅
          </button>
        )}

        {listNumber === `New List ${newListNumber}` &&
          item.sourceList === selectedLists[0] && (
            <button
              onClick={() =>
                handleMoveItem(
                  `New List ${newListNumber}`,
                  selectedLists[0],
                  item
                )
              }
              className='arrow-btn'
            >
              ⬅
            </button>
          )}

        {listNumber === `New List ${newListNumber}` &&
          item.sourceList === selectedLists[1] && (
            <button
              onClick={() =>
                handleMoveItem(
                  `New List ${newListNumber}`,
                  selectedLists[1],
                  item
                )
              }
              className='arrow-btn'
            >
              ➡
            </button>
          )}
      </li>
    ));
  };

  if (isLoading) {
    return <div className='loading'>Loading...</div>;
  }

  if (error) {
    return (
      <div className='error-view'>
        <h2>Something went wrong</h2>

        <button className='action-button' onClick={handleRetry}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className='main-container'>
      <h1>List Creation</h1>

      {isCreateMode ? (
        <div className='create-list-view'>
          <div className='buttons-container'>
            <button className='action-button' onClick={handleCancel}>
              Cancel
            </button>

            <button className='action-button' onClick={handleUpdate}>
              Update
            </button>
          </div>

          <div className='lists-wrapper create-mode'>
            <div className='list-container'>
              <h2>List {selectedLists[0]}</h2>

              <ul className='scrollable-list'>
                {renderLists(selectedLists[0])}
              </ul>
            </div>

            <div className='new-list-container'>
              <h2>New List {newListNumber}</h2>

              <ul className='scrollable-list'>
                {renderLists(`New List ${newListNumber}`)}
              </ul>
            </div>

            <div className='list-container'>
              <h2>List {selectedLists[1]}</h2>

              <ul className='scrollable-list'>
                {renderLists(selectedLists[1])}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className='lists-container'>
          <div className='buttons-container'>
            <button className='action-button' onClick={handleCreateNewList}>
              Create a New List
            </button>
          </div>

          <div className='lists-wrapper'>
            {Object.keys(lists).map(listNumber => (
              <div key={listNumber} className='list-container'>
                {listNumber !== `New List ${newListNumber}` ? (
                  <h2>
                    <input
                      type='checkbox'
                      checked={selectedLists.includes(parseInt(listNumber))}
                      onChange={() => handleListSelect(parseInt(listNumber))}
                    />
                    List {listNumber}
                  </h2>
                ) : (
                  <h2>New List {newListNumber}</h2>
                )}

                <ul className='scrollable-list'>
                  {lists[listNumber]?.map(item => (
                    <li key={item.id} className='list-item'>
                      <h3>{item.name}</h3>

                      <p>{item.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllLists;
