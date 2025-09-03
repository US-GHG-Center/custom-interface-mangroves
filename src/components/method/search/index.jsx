import { useState, useRef, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { TrieSearch } from './helper/trieSearch';

export function Search({ items, onChange }) {
  const ids = items?.map((item) => {
    const id = item?.itemId;
    // const name = id?.split('-').pop()
    // let withSpaces = name.replace(/([A-Z])/g, ' $1');
    // return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).trim();
    return id;
  });

  const trieSearch = useRef(null);
  const [searchOptions, setSearchOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [value, setValue] = useState(null);

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
   * Handle input text changes for search
   */
  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);

    if (newInputValue) {
      const searchResults = handleSearch(newInputValue);
      setSearchOptions(searchResults);
    } else {
      setSearchOptions([]);
    }
  };

  const clearInputAfterSelection = () => {
    setInputValue('');
    setValue(null);
  }

  /**
   * Handle option selection
   */
  const handleChange = (event, newValue) => {
    setValue(newValue);
    setInputValue(newValue)
    if (newValue) {
      onChange(newValue, clearInputAfterSelection);
      // Clear the input after selection

    }
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
      options={ids || []}
      style={{ width: '100%' }}
      value={value}
      inputValue={inputValue}
      onChange={handleChange}
      onInputChange={handleInputChange}
      renderInput={(params) => (
        <TextField
          {...params}
          id='outlined-basic'
          label='Search by country'
          variant='outlined'
          style={{ width: '100%', backgroundColor: '#EEEEEE' }}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  <InputAdornment position='end'>
                    <SearchIcon />
                  </InputAdornment>
                  {params.InputProps.endAdornment}
                </>
              ),
            },
            inputLabel: {
              style: { color: 'grey !important' },
            }
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "grey !important"
              },
              "&:hover fieldset": {
                borderColor: "grey !important"
              },
              "&.Mui-focused fieldset": {
                borderColor: "grey !important",
              }
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#808080 !important",
            }
          }}
        />
      )}
    />
  );
}