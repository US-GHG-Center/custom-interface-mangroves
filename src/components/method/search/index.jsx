import { useState, useRef, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { TrieSearch } from './helper/trieSearch';

export function Search({ items, onChange }) {
  const ids = items?.map((item) => {
    const id = item?.itemId;
    const name = id?.split('-').pop();
    let withSpaces = name.replace(/([A-Z])/g, ' $1');
    const displayName = withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).trim();
    return {
      id: id,
      displayName: displayName,
    };
  });

  const trieSearch = useRef(null);
  const [searchOptions, setSearchOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [value, setValue] = useState(null);

  /**
   * Performs prefix search using trie.
   * @param {string} prefix - User input
   * @returns {Object[]} Array of matching entries
   */
  const handleSearch = (prefix) => {
    const searchResult = trieSearch.current.getRecommendations(prefix);
    // Return the full objects that match the search
    return ids?.filter(item => searchResult.includes(item.id)) || [];
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
  };

  /**
   * Handle option selection
   */
  const handleChange = (event, newValue) => {
    if (newValue && typeof newValue === 'object') {
      setValue(newValue);
      setInputValue(newValue.displayName);
      onChange(newValue?.id, clearInputAfterSelection);
    }
  };

  useEffect(() => {
    trieSearch.current = new TrieSearch();
    // id in ids are expected to be _ separated for better search result.
    const itemIds = ids?.map((item) => item?.id);
    if (itemIds && itemIds.length) trieSearch.current.addItems(itemIds);
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
      getOptionLabel={(option) => {
        // Handle both string (when freeSolo) and object cases
        if (typeof option === 'string') {
          return option;
        }
        return option?.displayName || '';
      }}
      isOptionEqualToValue={(option, value) => {
        return option?.id === value?.id;
      }}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          {option.displayName}
        </li>
      )}
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