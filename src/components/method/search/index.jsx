import { useState, useRef, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { TrieSearch } from './helper/trieSearch';



export function Search({ items, onChange }) {
  const ids = items?.map((item) => {
    const id = item?.itemId;
    return id
    
  });


  const trieSearch = useRef(null);
  const [searchOptions, setSearchOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  /**
   * Performs prefix search using trie.
   * @param {string} prefix - User input
   * @returns {string[]} Array of matching entries
   */
  const handleSearch = (prefix) => {
    const searchResult = trieSearch.current.getRecommendations(prefix);
    return searchResult;
  };
  /**
   * When a user selects a search suggestion, notify parent with corresponding plume ID.
   */
  const handleOnInputTextChange = (event) => {
    const text = event.target.value;
    /**
     * Reset the search when the input text is cleared
     */
    const searchResults = handleSearch(text);
    setSearchOptions(searchResults);
  };

  const handleOnOptionClicked = (event, clickedValue) => {
    if (!clickedValue) return;
    setSelectedOption(null); // reset to allow re-selection
    setSelectedOption(clickedValue);
    onChange(clickedValue);
    setSelectedOption(null);
  };

  useEffect(() => {
    trieSearch.current = new TrieSearch();
    // id in ids are expected to be _ separated for better search result.
    if (ids && ids.length) trieSearch.current.addItems(ids);
  }, [ids]);

  return (
    <Autocomplete
      freeSolo
      id='free-solo-2-demo'
      disableClearable
      options={ids}
      style={{ width: '100%' }}
      renderInput={(params) => (
        <TextField
          {...params}
          id='outlined-basic'
          label='Search by country'
          variant='outlined'
          style={{ width: '100%', backgroundColor: '#EEEEEE' }}
          onChange={handleOnInputTextChange}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                <InputAdornment position='end'>
                  <SearchIcon />
                </InputAdornment>
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      onChange={handleOnOptionClicked}
      value={selectedOption}
    />
  );
}

